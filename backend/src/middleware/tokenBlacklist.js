/**
 * Simple in-memory token blacklist para propósitos de desarrollo o fallback.
 * En producción real distribuida (varios nodos), se debería usar Redis.
 */
class TokenBlacklist {
  constructor() {
    this.blacklist = new Map();
    
    // Limpieza periódica de tokens expirados (cada 1 hora)
    setInterval(() => this.cleanup(), 1000 * 60 * 60);
  }

  /**
   * Añade un token a la lista negra
   * @param {string} token - El JWT a invalidar
   * @param {number} expiresIn - Segundos que le quedan de vida útil al token (opcional)
   */
  add(token, expiresIn = 7 * 24 * 60 * 60) {
    // Almacena el token junto con el timestamp de cuándo debería expirar de la memoria
    const expiresAt = Date.now() + (expiresIn * 1000);
    this.blacklist.set(token, expiresAt);
  }

  /**
   * Comprueba si un token está en la lista negra
   * @param {string} token 
   * @returns {boolean}
   */
  isBlacklisted(token) {
    if (!this.blacklist.has(token)) return false;
    
    // Si ya expiró en el tiempo natural, lo limpiamos de paso
    if (Date.now() > this.blacklist.get(token)) {
      this.blacklist.delete(token);
      return false;
    }
    
    return true;
  }

  /**
   * Limpia los tokens que ya superaron su tiempo de vida máximo
   */
  cleanup() {
    const now = Date.now();
    for (const [token, expiresAt] of this.blacklist.entries()) {
      if (now > expiresAt) {
        this.blacklist.delete(token);
      }
    }
  }
}

// Singleton instance
const tokenBlacklist = new TokenBlacklist();

export default tokenBlacklist;
