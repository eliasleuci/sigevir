-- ============================================================================
-- SCRIPT PARA LIMPIAR TODOS LOS DATOS OPERATIVOS (RETENCIONES)
-- ADVERTENCIA: ESTO BORRARÁ TODOS LOS VEHÍCULOS, CAUSAS, FOTOS Y MOVIMIENTOS
-- PERO CONSERVARÁ USUARIOS, INSTITUCIONES Y DEPÓSITOS.
-- ============================================================================

TRUNCATE TABLE 
  retenciones, 
  fotos_retenciones, 
  personas_involucradas, 
  resoluciones_judiciales, 
  historial_movimientos, 
  vehicle_status_log,
  notificaciones
CASCADE;
