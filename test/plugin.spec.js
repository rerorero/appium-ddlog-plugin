const { DatadogLogPlugin } = require('../lib/plugin.js');
import chai from 'chai';
const { assert } = chai;
const sinon = require('sinon');

describe('capabilitiesToObject', function() {
  it('should convert to object', function() {
    const caps = {
      cap1: '1',
      cap2: '2',
      cap3: '3',
    };
    const cases = [
      [[], {}],
      [['cap1'], { p_cap1: '1' }],
      [['cap1', 'cap2'], { p_cap1: '1', p_cap2: '2' }],
      [['invalid', 'cap3'], { p_cap3: '3' }],
      ['', {}],
    ];
    cases.map(([arg, expect]) => {
      const plugin = new DatadogLogPlugin();
      plugin.caps = caps;
      const actual = plugin.capabilitiesToObject(arg, 'p_');
      assert.deepEqual(actual, expect);
    });
  });
});

describe('createSession', function() {
  it('should output log', async function() {
    const res = { value: ['deadbeef', { platform: 'foo' }] };
    // eslint-disable-next-line require-await
    const next = async function() {
      return res;
    };
    const plugin = new DatadogLogPlugin();
    const stub = sinon.stub(plugin.ddLog, 'log');

    const result = await plugin.createSession(next, null, 'arg1', 'arg2');

    assert.deepEqual(result, res);
    assert.deepEqual(stub.getCall(0).args, ['info', {
      session_id: null,
      command: 'createSession',
      message: 'received the command',
      arguments: ['arg1', 'arg2']
    }, {
        session_id: null,
        command: 'createSession',
      }]);
    assert.deepEqual(stub.getCall(1).args, ['info', {
      session_id: 'deadbeef',
      command: 'createSession',
      message: 'command has completed successfully',
      response: res,
    }, {
        session_id: 'deadbeef',
        command: 'createSession',
      }]);
    assert.equal('deadbeef', plugin.sessionId);
  });

  it('should include capbilities', async function() {
    const res = { value: ['deadbeef', { cap1: 'foo', cap2: 'bar', cap3: 'buz' }] };
    // eslint-disable-next-line require-await
    const next = async function() {
      return res;
    };
    const plugin = new DatadogLogPlugin();
    plugin.capTags = ['cap1', 'cap2'];
    plugin.capTagPrefix = 'awesome_';
    plugin.capMessages = ['cap3'];
    plugin.capMessagePrefix = 'nice_';
    plugin.showSessionId = true;
    const stub = sinon.stub(plugin.ddLog, 'log');

    await plugin.createSession(next, null, 'arg1', 'arg2');

    assert.deepEqual(stub.getCall(1).args, ['info', {
      nice_cap3: 'buz',
      session_id: 'deadbeef',
      command: 'createSession',
      message: '[deadbeef] command has completed successfully',
      response: res,
    }, {
        awesome_cap1: 'foo',
        awesome_cap2: 'bar',
        session_id: 'deadbeef',
        command: 'createSession',
      }]);
    assert.equal('deadbeef', plugin.sessionId);
  });
});

describe('handle', function() {
  // eslint-disable-next-line require-await
  const next = async function() {
    return 'fine';
  };

  it('should output logs', async function() {
    const plugin = new DatadogLogPlugin();
    plugin.sessionId = 'deadbeef';
    const stub = sinon.stub(plugin.ddLog, 'log');

    const result = await plugin.handle(next, null, 'doSomething', 'arg1', 'arg2');

    assert.deepEqual(result, 'fine');
    assert.deepEqual(stub.getCall(0).args, ['info', {
      session_id: 'deadbeef',
      command: 'doSomething',
      message: 'received the command',
      arguments: ['arg1', 'arg2']
    }, {
        session_id: 'deadbeef',
        command: 'doSomething',
      }]);
    assert.deepEqual(stub.getCall(1).args, ['info', {
      session_id: 'deadbeef',
      command: 'doSomething',
      message: 'command has completed successfully',
      response: 'fine',
    }, {
        session_id: 'deadbeef',
        command: 'doSomething',
      }]);
  });

  it('should not output if exportCommandLogs is false', async function() {
    const plugin = new DatadogLogPlugin();
    plugin.exportCommandLogs = false;
    const mock = sinon.mock(plugin.ddLog);
    mock.expects('log').never();

    const result = await plugin.handle(next, null, 'doSomething', 'arg1', 'arg2');

    assert.deepEqual(result, 'fine');
  });
});

