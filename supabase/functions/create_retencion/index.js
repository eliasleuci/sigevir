// supabase/functions/create_retencion/index.js
// Edge Function – crea una retención, genera número de expediente, QR y guarda en bucket "actas"

const { createClient } = require('@supabase/supabase-js');
const QRCode = require('qrcode');

// Las variables de entorno se configuran en Supabase → Settings → Environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

/**
 * Genera un número de expediente único.
 * Simplemente cuenta las retenciones existentes y le suma 1.
 * En producción se recomienda una secuencia más robusta (ej. usando una tabla de secuencias).
 */
async function generarNroExpediente() {
  const { count, error } = await supabase
    .from('retenciones')
    .select('id', { count: 'exact', head: true });
  if (error) throw error;
  const numero = (count ?? 0) + 1;
  const padded = String(numero).padStart(6, '0');
  return `RET-${new Date().getFullYear()}-${padded}`;
}

/**
 * Genera un QR con la URL que apunta al acta (por ahora usamos la propia URL del QR).
 */
async function generarQRDataUrl(text) {
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 300,
    margin: 1,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

exports.handler = async (event, context) => {
  try {
    // 1️⃣ Parse body (esperamos JSON)
    const body = JSON.parse(event.body);

    // 2️⃣ Generar número de expediente y QR
    const nroExpediente = await generarNroExpediente();
    const qrUrl = await generarQRDataUrl(nroExpediente);

    // 3️⃣ Insertar registro de retención (los campos que llegan en body)
    const { data: retencion, error: errInsert } = await supabase
      .from('retenciones')
      .insert({
        nro_expediente: nroExpediente,
        ...body, // incluye dominio, tipo_vehiculo, marca, modelo, etc.
        qr_url: null, // lo completaremos después de subir el QR
        pdf_url: null,
      })
      .single();
    if (errInsert) throw errInsert;

    // 4️⃣ Subir QR al bucket "actas" (como PNG)
    const qrBase64 = qrUrl.split(",")[1]; // elimina el prefix data:image/png;base64,
    const qrBuffer = Buffer.from(qrBase64, 'base64');
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

    // 5️⃣ Actualizar la fila con la URL del QR (y, más adelante, del PDF)
    const { error: errUpdate } = await supabase
      .from('retenciones')
      .update({ qr_url: publicUrl.publicUrl })
      .eq('id', retencion.id);
    if (errUpdate) throw errUpdate;

    // 6️⃣ Respuesta
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Retención creada',
        retencion_id: retencion.id,
        nro_expediente: nroExpediente,
        qr_url: publicUrl.publicUrl,
      }),
    };
  } catch (err) {
    console.error('Error en create_retencion:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Error interno' }),
    };
  }
};
