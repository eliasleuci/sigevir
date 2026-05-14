import { Router } from 'express';
import authController from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginSchema, googleLoginSchema, googleSigninSchema, refreshTokenSchema } from '../schemas/auth.schemas.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Autenticación tradicional (email + password)
 * @access  Public
 */
router.post('/login', validateRequest(loginSchema), authController.login);

/**
 * @route   POST /api/auth/google
 * @desc    Autenticación con Google OAuth (legacy)
 * @access  Public
 */
router.post('/google', validateRequest(googleLoginSchema), authController.googleLogin);

/**
 * @route   POST /api/auth/google/signin
 * @desc    Autenticación con Google (nuevo flujo, idToken desde frontend)
 * @access  Public
 */
router.post('/google/signin', validateRequest(googleSigninSchema), authController.googleSignin);

/**
 * @route   GET /api/auth/google/url
 * @desc    Obtener URL de autorización de Google (redirect flow)
 * @access  Public
 */
router.get('/google/url', authController.getGoogleAuthUrl);

/**
 * @route   POST /api/auth/google/callback
 * @desc    Intercambiar código de autorización (redirect flow)
 * @access  Public
 */
router.post('/google/callback', authController.googleCallback);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar el access token usando refresh token
 * @access  Public
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión e invalidar tokens
 * @access  Private (Requiere estar logueado)
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/auth/recover-password
 * @desc    Solicitar recuperación de contraseña
 * @access  Public
 */
router.post('/recover-password', authController.sendPasswordRecovery);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Restablecer contraseña con token
 * @access  Public
 */
router.post('/reset-password/:token', authController.resetPassword);

export default router;
