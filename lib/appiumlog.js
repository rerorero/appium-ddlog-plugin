import { logger } from 'appium/support';

// logger for normal plugin.
const log = logger.getLogger('DatadogLogPlugin');

// global npmlog.
const gLog = log.unwrap();

const npmToWinstonLevels = {
  silly: 'debug',
  verbose: 'debug',
  debug: 'debug',
  info: 'info',
  http: 'info',
  warn: 'warn',
  error: 'error',
};

function hookGlobalLog(ddLog) {
  if (!gLog) {
    log.error('global npmlog not found.');
    return;
  }

  // Capture logs emitted via npmlog and pass them through winston
  gLog.on('log', (logObj) => {
    const winstonLevel = npmToWinstonLevels[logObj.level] || 'info';
    ddLog.log(winstonLevel, {
      component: logObj.prefix,
      message: logObj.message,
    });
  });

  log.info('start exporting Appium application logs.');
}

export { log, hookGlobalLog };
