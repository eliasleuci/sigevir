import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import emailService from './src/services/emailService.js';

// Supabase client using service_role (secure, never sent to front)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();
app.use(cors());
app.use(express.json());

// Middleware: verify JWT and that the user has rol 'admin' in perfiles
app.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  const { data: profile, error } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (error || profile?.rol !== 'admin')
    return res.status(403).json({ error: 'Not authorized' });

  req.adminId = user.id;
  next();
});

// Approve endpoint – updates tipo_personal_id, rol and activates the user
app.post('/approve', async (req, res) => {
  const { userId, tipo_personal_id, rol } = req.body;
  console.log('Aprobar usuario:', { userId, tipo_personal_id, rol });
  
  // Obtener el email y nombre del usuario antes de aprobarlo para enviarle correo
  const { data: userData } = await supabase
    .from('perfiles')
    .select('email, nombre_completo')
    .eq('id', userId)
    .single();

  const { error } = await supabase
    .from('perfiles')
    .update({ tipo_personal_id, rol, activo: true })
    .eq('id', userId);

  if (error) {
    console.error('Error aprobando usuario:', error);
    return res.status(400).json({ error: error.message });
  }

  // Send approval email
  if (userData?.email) {
    await emailService.sendAccountApproved(userData.email, userData.nombre_completo, rol)
      .catch(err => console.error('Error enviando email de aprobación:', err));
  }

  res.json({ success: true });
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log(`✅ Approve API listening on ${PORT}`));
