const { BasePlugin } = require('appium/plugin');
const { hookGlobalLog } = require('./appiumlog.js');
const { config } = require('./config.js');
const { DDLogger } = require('./ddlogger.js');

const ddLog = new DDLogger({
  level: config.loglevel,
  ddHost: config.ddLogHost,
  apiKey: config.apiKey,
  tags: config.tags,
  hostname: config.hostname,
  ddsource: config.ddsource,
  service: config.service,
  batchInterval: config.batchInterval,
  batchCount: config.batchCount,
});

if (config.exportApplicationLogs) {
  hookGlobalLog(ddLog);
}

class DatadogLogPlugin extends BasePlugin {

  SESSION_ID_KEY = 'session_id';
  COMMAND_NAME_KEY = 'command';
  MESSAGE_KEY = 'message';
  ARGS_KEY = 'arguments';
  RESPONSE_KEY = 'response';
  ERROR_KEY = 'error';

  constructor(pluginName) {
    super(pluginName);
    this.ddLog = ddLog;
    this.exportCommandLogs = config.exportCommandLogs;
    this.capTags = config.capTags;
    this.capTagPrefix = config.capTagPrefix;
    this.capMessages = config.capMessages;
    this.capMessagePrefix = config.capMessagePrefix;
    this.sessionId = null;
    this.caps = null;
    this.showSessionId = config.showSessionIdInMessage;
  }

  toSnakeCase(s) {
    return s && s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      .map((x) => x.toLowerCase())
      .join('_');
  }

  capabilitiesToObject(targets, prefix) {
    if (!this.caps || !targets) {
      return {};
    }
    return targets.reduce((acc, v) => {
      if (this.caps[v]) {
        const key = `${prefix}${this.toSnakeCase(v)}`;
        acc[key] = this.caps[v];
      }
      return acc;
    }, {});
  }

  async createSession(next, driver, ...args) {
    const cmdName = 'createSession';
    this.logCommandReceived(cmdName, args);
    return await next()
      .then((res) => {
        if (res && res.value && res.value.length >= 2) {
          // First element of the value field is a session ID and 2nd is capabilitiles.
          // https://github.com/appium/appium/blob/12cdbb7fdd7b280a5d0f32d690fb49c9744aa73d/packages/appium/lib/appium.js#L382-L385
          this.sessionId = res.value[0];
          this.caps = res.value[1];
        }

        this.logCommandSucceed(cmdName, res);

        return res;
      }).catch((err) => {
        this.logCommandFailed(cmdName, err);
        return err;
      });
  }

  async handle(next, driver, cmdName, ...args) {
    this.logCommandReceived(cmdName, args);
    return await next()
      .then((res) => {
        this.logCommandSucceed(cmdName, res);
        return res;
      }).catch((err) => {
        this.logCommandFailed(cmdName, err);
        return err;
      });
  }

  logCommandReceived(cmdName, args) {
    if (!this.exportCommandLogs) {
      return;
    }
    const [msg, tags] = this.commonField(cmdName);
    msg[this.MESSAGE_KEY] = this.message('received the command');
    msg[this.ARGS_KEY] = args;
    this.ddLog.log('info', msg, tags);
  }

  logCommandSucceed(cmdName, response) {
    if (!this.exportCommandLogs) {
      return;
    }
    const [msg, tags] = this.commonField(cmdName);
    msg[this.MESSAGE_KEY] = this.message('command has completed successfully');
    msg[this.RESPONSE_KEY] = response;
    this.ddLog.log('info', msg, tags);
  }

  logCommandFailed(cmdName, error) {
    if (!this.exportCommandLogs) {
      return;
    }
    const [msg, tags] = this.commonField(cmdName);
    msg[this.MESSAGE_KEY] = this.message('command failed');
    msg[this.ERROR] = error;
    this.ddLog.log('error', msg, tags);
  }

  commonField(cmdName) {
    const capsInMessage = this.capabilitiesToObject(this.capMessages, this.capMessagePrefix);
    const msg = {
      [this.SESSION_ID_KEY]: this.sessionId,
      [this.COMMAND_NAME_KEY]: cmdName,
      ...capsInMessage,
    };
    const capsInTags = this.capabilitiesToObject(this.capTags, this.capTagPrefix);
    const tags = {
      [this.SESSION_ID_KEY]: this.sessionId,
      [this.COMMAND_NAME_KEY]: cmdName,
      ...capsInTags,
    };
    return [msg, tags];
  }

  message(s) {
    if (this.showSessionId && this.sessionId) {
      return `[${this.sessionId}] ${s}`;
    }
    return s;
  }
}

export { DatadogLogPlugin };
export default DatadogLogPlugin;
