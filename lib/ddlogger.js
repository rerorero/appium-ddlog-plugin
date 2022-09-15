const { createLogger, format, transports } = require('winston');
const os = require('os');

export class DDLogger {
  constructor({
    level = 'info',
    ddHost = 'http-intake.logs.datadoghq.com',
    apiKey = '',
    tags = {},
    hostname = os.hostname(),
    ddsource = 'nodejs',
    service = 'appium',
    batchInterval = 5000,
    batchCount = 30,
  } = {}) {
    const httpTransportOptions = {
      host: ddHost,
      path: '/api/v2/logs',
      headers: {
        'DD-API-KEY': apiKey,
        'Accept': 'application/json',
      },
      ssl: true,
      batch: true,
      batchInterval,
      batchCount,
    };

    // TODO: gzip
    const logger = createLogger({
      level,
      exitOnError: false,
      format: format.json(),
      transports: [
        new transports.Http(httpTransportOptions),
      ],
    });

    this.logger = logger;
    this.tags = tags;
    this.fields = {
      ddsource,
      service,
      hostname,
    };
  }

  tagToStr(tags) {
    if (!tags) {
      return '';
    }
    return Object.keys(tags).reduce((acc, key) => {
      const value = tags[key];
      acc.push(`${key}:${value}`);
      return acc;
    }, []).join(',');
  }

  log(level, msg = {}, tags = {}) {
    const allTags = Object.assign(
      {},
      tags,
      this.tags,
    );
    const fields = Object.assign(
      {},
      msg,
      this.fields,
      {
        ddtags: this.tagToStr(allTags),
        timestamp: Date.now(),
      }
    );
    this.logger.log(level, fields);
  }
}
