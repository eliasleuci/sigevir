import { createClient } from "npm:@supabase/supabase-js";
import QRCode from "npm:qrcode";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function generarNroExpediente() {
  const { count, error } = await supabase
    .from('retenciones')
    .select('id', { count: 'exact', head: true });
  if (error) throw error;
  const numero = (count ?? 0) + 1;
  const padded = String(numero).padStart(6, '0');
  return `RET-${new Date().getFullYear()}-${padded}`;
}

async function generarQRDataUrl(text: string) {
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 300,
    margin: 1,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Separar personas_involucradas del body principal
    const { personas_involucradas, ...retencionBody } = body;

    const nroExpediente = await generarNroExpediente();
    const qrUrl = await generarQRDataUrl(nroExpediente);

    const { data: retencion, error: errInsert } = await supabase
      .from('retenciones')
      .insert({
        nro_expediente: nroExpediente,
        ...retencionBody,
        qr_url: null,
        pdf_url: null,
      })
      .select()
      .single();
    
    if (errInsert) throw errInsert;

    // Insertar personas involucradas si existen
    if (Array.isArray(personas_involucradas) && personas_involucradas.length > 0) {
      const personasConRetencion = personas_involucradas.map((p: any) => ({
        ...p,
        retencion_id: retencion.id,
      }));
      const { error: errPersonas } = await supabase
        .from('personas_involucradas')
        .insert(personasConRetencion);
      if (errPersonas) {
        console.error('Error insertando personas_involucradas:', errPersonas);
        // No tiramos error para no romper la retención ya creada
      }
    }

    const qrBase64 = qrUrl.split(",")[1];
    
    // Uint8Array for Deno
    const byteCharacters = atob(qrBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const qrBuffer = new Uint8Array(byteNumbers);

    const filePath = `${retencion.id}/qr.png`;
    const { error: errUpload } = await supabase.storage
      .from('actas')
      .upload(filePath, qrBuffer, {
        contentType: 'image/png',
        upsert: true,
      });
      
    if (errUpload) throw errUpload;
    
    const { data: publicUrl } = supabase.storage
      .from('actas')
      .getPublicUrl(filePath);

    const { error: errUpdate } = await supabase
      .from('retenciones')
      .update({ qr_url: publicUrl.publicUrl })
      .eq('id', retencion.id);
      
    if (errUpdate) throw errUpdate;

    // Registrar en audit_logs
    await supabase.from('audit_logs').insert({
      accion: 'RETENCION_CREADA',
      entidad: 'retencion',
      entidad_id: retencion.id,
      usuario_email: body.agente_email || 'contacto@sigevir.com.ar',
      usuario_nombre: body.agente_nombre || 'Agente de Campo',
      origen: 'web',
      detalle: {
        nro_expediente: nroExpediente,
        dominio: body.dominio
      }
    });

    // Disparar notificacion interna si hay deposito elegido
    if (retencionBody.deposito_institucion_id) {
      const expressApiUrl = Deno.env.get("EXPRESS_INTERNAL_API_URL") || 'http://host.docker.internal:3001/api/internal';
      const internalSecret = Deno.env.get("INTERNAL_API_SECRET");
      
      if (internalSecret) {
        try {
          await fetch(`${expressApiUrl}/notificar-vehiculo-en-camino`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${internalSecret}`
            },
            body: JSON.stringify({
              retencion_id: retencion.id,
              deposito_institucion_id: retencionBody.deposito_institucion_id,
              agente_nombre: body.agente_nombre || 'Agente de Campo'
            })
          });
        } catch (e) {
          console.error("Error disparando notificacion al Express Backend", e);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Retención creada',
        retencion_id: retencion.id,
        nro_expediente: nroExpediente,
        qr_url: publicUrl.publicUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err: any) {
    console.error('Error en create_retencion:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Error interno' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
