const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;
const filterOutErrors = format(info => (info.level === 'error' ? false : info));

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), timestamp(), logFormat)
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({
      filename: 'logs/combined.log',
      // ⬇️ error는 제외
      format: combine(filterOutErrors(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    }),
  ],
});

module.exports = logger;

