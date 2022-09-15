# appium-ddlog-plugin

Appium plugin to stream command result logs to Datadog without Datadog Agent.

#### Command Logs

The plugin sends two logs per a command, one at the start of the command execution and at its completion.
The former contains information about the arguments of the command and the latter contains the result of the command.
Logs can contain information such as command name, session ID, command name, and capacities as tags as well.

#### Appium Logs (disabled by default)

If you set `EXPORT_APPLICATION_LOGS=true`, the plugin sends all logs of Appium to Datadog.
However, these logs cannot include session id or capabilities information as tags.

## Run

```
# install plubin
appium plugin install --source=npm appium-ddlog-plugin

# run appium with the plugin
export DD_API_KEY="Put your API key here"
appium server --use-plugins=appium-ddlog-plugin
```

## Configuration

You can configure the plugin with environment variables.

| Env                        | Default                        | Desciption                                                                                                          |
| -------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| DD_API_KEY                 |                                | Datadog API key. This is required.                                                                                  |
| DD_LOG_HOST                | http-intake.logs.datadoghq.com | Datadog Logs API endpoint.                                                                                          |
| DD_LOG_LEVEL               | info                           | Log level.                                                                                                          |
| DD_TAGS                    |                                | Tags to be added to the log. e.g. `env:development,region:us-east-1`                                                |
| DD_SERVICE                 | appium                         | Service name sent with log.                                                                                         |
| DD_HOSTNAME                | os.hostname()                  | Host name sent with log.                                                                                            |
| DD_SOURCE                  | nodejs                         | Source name sent with log.                                                                                          |
| DD_BATCH_INTERVAL          | 5000                           | The number of milliseconds to wait before sending the HTTP request to Datadog.                                      |
| DD_BATCH_COUNT             | 30                             | The number of logs to cumulate before sending the HTTP request to Datadog.                                          |
| EXPORT_COMMAND_LOGS        | true                           | Whether to send command execution logs.                                                                             |
| EXPORT_APPLICATION_LOGS    | false                          | If true, the plugin hooks the logger used by Appium and sends all logs Datadog.                                     |
| DD_CAP_TAGS                |                                | If the keys specified by DD_CAP_TAGS exist in the capabilities, they are sent as tags. e.g. `platformName,app,udid` |
| DD_CAP_TAG_PREFIX          |                                | Prefix for tags specified by DD_CAP_TAGS.                                                                           |
| DD_CAP_MESSAGES            |                                | If the keys specified by DD_CAP_MESSAGES exist in the capabilities, they are sent as fields in a log.               |
| DD_CAP_MESSAGE_PREFIX      |                                | Prefix for field names specified by DD_CAP_MESSAGES.                                                                |
| SHOW_SESSION_ID_IN_MESSAGE | false                          | Whether to include session id in a log message.                                                                     |
