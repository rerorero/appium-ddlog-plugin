const { log } = require('./appiumlog.js');
const os = require('os');

function load(name, defaults) {
  return process.env[name] ?? defaults;
};

function strToTag(s) {
  if (!s) {
    return {};
  }
  return s.split(',')
    .map((e) => e.split(':'))
    .reduce((acc, [k, v]) => {
      if (k && v) {
        acc[k] = v;
      } else {
        log.error(`invalid DD_TAGS format: ${s}`);
      }
      return acc;
    }, {});
}

export class Config {

  constructor() {
    this.loglevel = load('DD_LOG_LEVEL', 'info');
    this.tags = strToTag(load('DD_TAGS', ''));
    this.service = load('DD_SERVICE', 'appium');
    this.ddLogHost = load('DD_LOG_HOST', 'http-intake.logs.datadoghq.com');
    this.apiKey = load('DD_API_KEY', null);
    this.hostname = load('DD_HOSTNAME', os.hostname());
    this.ddsource = load('DD_SOURCE', 'nodejs');

    this.batchInterval = parseInt(load('DD_BATCH_INTERVAL', '5000'), 10);
    this.batchCount = parseInt(load('DD_BATCH_COUNT', '30'), 10);

    this.exportApplicationLogs = load('EXPORT_APPLICATION_LOGS', 'false').toLowerCase() === 'true';
    this.exportCommandLogs = load('EXPORT_COMMAND_LOGS', 'true').toLowerCase() === 'true';

    this.capTags = load('DD_CAP_TAGS', '').split(',');
    this.capTagPrefix = load('DD_CAP_TAG_PREFIX', '');
    this.capMessages = load('DD_CAP_MESSAGES', '').split(',');
    this.capMessagePrefix = load('DD_CAP_MESSAGE_PREFIX', '');
    this.showSessionIdInMessage = load('SHOW_SESSION_ID_IN_MESSAGE', 'false').toLowerCase() === 'true';

    if (!this.apiKey) {
      log.error(`DD_API_KEY is missing`);
    }
  }
}

export const config = new Config();
