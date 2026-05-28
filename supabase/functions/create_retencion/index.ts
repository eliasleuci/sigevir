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

    const nroExpediente = await generarNroExpediente();
    const qrUrl = await generarQRDataUrl(nroExpediente);

    const { data: retencion, error: errInsert } = await supabase
      .from('retenciones')
      .insert({
        nro_expediente: nroExpediente,
        ...body,
        qr_url: null,
        pdf_url: null,
      })
      .select()
      .single();
    
    if (errInsert) throw errInsert;

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
