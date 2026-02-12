/**
 * Servicio de Logger para el Sistema de Cotizaciones
 * Registra todas las acciones y errores en consola
 */

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  // Colores de texto
  fgBlack: '\x1b[30m',
  fgRed: '\x1b[31m',
  fgGreen: '\x1b[32m',
  fgYellow: '\x1b[33m',
  fgBlue: '\x1b[34m',
  fgMagenta: '\x1b[35m',
  fgCyan: '\x1b[36m',
  fgWhite: '\x1b[37m',
  
  // Colores de fondo
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Formato de fecha y hora
const getTimestamp = () => {
  const now = new Date();
  const date = now.toLocaleDateString('es-CO');
  const time = now.toLocaleTimeString('es-CO', { hour12: false });
  return `[${date} ${time}]`;
};

// Prefijos según el tipo de log
const prefixes = {
  INFO: { icon: 'ℹ️', color: colors.fgCyan },
  SUCCESS: { icon: '✅', color: colors.fgGreen },
  ERROR: { icon: '❌', color: colors.fgRed },
  WARNING: { icon: '⚠️', color: colors.fgYellow },
  DEBUG: { icon: '🔍', color: colors.fgBlue },
  API: { icon: '🌐', color: colors.fgMagenta },
  AUTH: { icon: '🔐', color: colors.fgYellow },
  COTIZACION: { icon: '📄', color: colors.fgGreen },
  EMAIL: { icon: '✉️', color: colors.fgCyan },
  USER: { icon: '👤', color: colors.fgBlue },
  CRM: { icon: '🏢', color: colors.fgBlue },
  DB: { icon: '🗄️', color: colors.fgYellow },
  SYSTEM: { icon: '⚙️', color: colors.fgGray || colors.fgWhite }
};

/**
 * Logger principal
 */
export const logger = {
  /**
   * Log de información general
   */
  info: (message, details = '') => {
    const timestamp = getTimestamp();
    const prefix = prefixes.INFO;
    const userInfo = logger.getUserInfo();
    console.log(
      `${timestamp} ${prefix.color}${prefix.icon}${colors.reset} ${prefix.color}INFO${colors.reset} | ${userInfo} | ${message} ${details ? `| ${details}` : ''}`
    );
  },

  /**
   * Log de éxito
   */
  success: (message, details = '') => {
    const timestamp = getTimestamp();
    const prefix = prefixes.SUCCESS;
    const userInfo = logger.getUserInfo();
    console.log(
      `${timestamp} ${prefix.color}${prefix.icon}${colors.reset} ${prefix.color}SUCCESS${colors.reset} | ${userInfo} | ${message} ${details ? `| ${details}` : ''}`
    );
  },

  /**
   * Log de error
   */
  error: (message, error = '') => {
    const timestamp = getTimestamp();
    const prefix = prefixes.ERROR;
    const userInfo = logger.getUserInfo();
    const errorDetails = error instanceof Error ? `\n${colors.fgRed}${error.stack || error.message}${colors.reset}` : error;
    console.log(
      `${timestamp} ${prefix.color}${prefix.icon}${colors.reset} ${prefix.color}ERROR${colors.reset} | ${userInfo} | ${message}${errorDetails ? `\n${errorDetails}` : ''}`
    );
  },

  /**
   * Log de advertencia
   */
  warn: (message, details = '') => {
    const timestamp = getTimestamp();
    const prefix = prefixes.WARNING;
    const userInfo = logger.getUserInfo();
    console.log(
      `${timestamp} ${prefix.color}${prefix.icon}${colors.reset} ${prefix.color}WARNING${colors.reset} | ${userInfo} | ${message} ${details ? `| ${details}` : ''}`
    );
  },

  /**
   * Log de API
   */
  api: (method, url, status, duration, user = 'Anonimo') => {
    const timestamp = getTimestamp();
    const prefix = prefixes.API;
    const statusColor = status >= 200 && status < 300 ? colors.fgGreen : 
                        status >= 400 && status < 500 ? colors.fgYellow : colors.fgRed;
    console.log(
      `${timestamp} ${prefix.color}${prefix.icon}${colors.reset} ${prefix.color}API${colors.reset} | ${user} | ${method} ${url} | ${statusColor}Status: ${status}${colors.reset} | ${colors.fgMagenta}Time: ${duration}ms${colors.reset}`
    );
  },

  /**
   * Log de autenticación
   */
  auth: (action, email, success, details = '') => {
    const timestamp = getTimestamp();
    const prefix = prefixes.AUTH;
    const statusIcon = success ? '✅' : '❌';
    console.log(
      `${timestamp} ${prefix.color}${prefix.icon}${colors.reset} ${prefix.color}AUTH${colors.reset} | ${statusIcon} ${action} | Email: ${email}${details ? ` | ${details}` : ''}`
    );
  },

  /**
   * Log de cotizaciones
   */
  cotizacion: (action, numero, cliente = '', usuario = '') => {
    const timestamp = getTimestamp();
    const prefix = prefixes.COTIZACION;
    const userInfo = usuario || logger.getUserInfo();
    console.log(
      `${timestamp} ${prefix.color}${prefix.icon}${colors.reset} ${prefix.color}COTIZACION${colors.reset} | ${userInfo} | ${action} | #${numero} | Cliente: ${cliente}`
    );
  },

  /**
   * Log de emails
   */
  email: (action, destinatario, cotizacion = '', usuario = '') => {
    const timestamp = getTimestamp();
    const prefix = prefixes.EMAIL;
    const userInfo = usuario || logger.getUserInfo();
    console.log(
      `${timestamp} ${prefix.color}${prefix.icon}${colors.reset} ${prefix.color}EMAIL${colors.reset} | ${userInfo} | ${action} | Para: ${destinatario}${cotizacion ? ` | Cotización: #${cotizacion}` : ''}`
    );
  },

  /**
   * Log de CRM (Clientes)
   */
  crm: (action, cliente, nit = '', usuario = '') => {
    const timestamp = getTimestamp();
    const prefix = prefixes.CRM;
    const userInfo = usuario || logger.getUserInfo();
    console.log(
      `${timestamp} ${prefix.color}${prefix.icon}${colors.reset} ${prefix.color}CRM${colors.reset} | ${userInfo} | ${action} | Cliente: ${cliente}${nit ? ` | NIT: ${nit}` : ''}`
    );
  },

  /**
   * Log de usuarios
   */
  user: (action, email, detalles = '') => {
    const timestamp = getTimestamp();
    const prefix = prefixes.USER;
    console.log(
      `${timestamp} ${prefix.color}${prefix.icon}${colors.reset} ${prefix.color}USER${colors.reset} | ${action} | Email: ${email}${detalles ? ` | ${detalles}` : ''}`
    );
  },

  /**
   * Log de base de datos
   */
  db: (operation, table, details = '') => {
    const timestamp = getTimestamp();
    const prefix = prefixes.DB;
    console.log(
      `${timestamp} ${prefix.color}${prefix.icon}${colors.reset} ${prefix.color}DB${colors.reset} | ${operation} | Tabla: ${table}${details ? ` | ${details}` : ''}`
    );
  },

  /**
   * Log del sistema
   */
  system: (message, details = '') => {
    const timestamp = getTimestamp();
    const prefix = prefixes.SYSTEM;
    console.log(
      `${timestamp} ${prefix.color}${prefix.icon}${colors.reset} ${prefix.color}SYSTEM${colors.reset} | ${message}${details ? ` | ${details}` : ''}`
    );
  },

  /**
   * Log de división (para separar secciones)
   */
  divider: (title = '') => {
    const line = '─'.repeat(60);
    console.log(`\n${colors.fgMagenta}${line}${colors.reset}`);
    if (title) {
      console.log(`${colors.fgMagenta}  ${title}${colors.reset}`);
    }
    console.log(`${colors.fgMagenta}${line}${colors.reset}\n`);
  },

  /**
   * Obtener información del usuario actual
   */
  getUserInfo: () => {
    // Esta función será sobrescrita por el middleware de contexto
    return global.currentUser ? `User: ${global.currentUser.email} (${global.currentUser.rol})` : 'System';
  },

  /**
   * Establecer usuario actual
   */
  setUser: (user) => {
    global.currentUser = user;
  },

  /**
   * Limpiar usuario actual
   */
  clearUser: () => {
    global.currentUser = null;
  }
};

export default logger;
