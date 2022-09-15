const { Config } = require('../lib/config.js');
import chai from 'chai';
const { assert } = chai;

describe('config', function() {
  let env;

  before(function () {
    env = process.env;
  });

  it('DD_TAGS should be parsed', function() {
    const cases = [
      ['', {}],
      ['single:1', { single: '1' }],
      ['field1:1,field2:2', { field1: '1', field2: '2' }],
      ['invalid', {}],
    ];
    cases.map(([envval, tag]) => {
      process.env.DD_TAGS = envval;
      process.env.DD_API_KEY = 'dummy';
      const sut = new Config();
      assert.deepEqual(tag, sut.tags);
    });
  });

  after(function () {
    process.env = env;
  });

});
