const { DDLogger } = require('../lib/ddlogger.js');
import chai from 'chai';
const should = chai.should();
const sinon = require('sinon');

describe('tagToStr', function() {
  it('should convert tags to string', function() {
    const cases = [
      [{}, ''],
      [{ single: 1 }, 'single:1'],
      [{ field1: '1', field2: '2' }, 'field1:1,field2:2'],
      [null, ''],
    ];
    const sut = new DDLogger();
    cases.map(([obj, tag]) => {
      should.equal(sut.tagToStr(obj), tag);
    });
  });
});

describe('log', function() {
  let clock;

  beforeEach(function () {
      clock = sinon.useFakeTimers();
  });

  afterEach(function() {
      clock.restore();
  });

  it('should log with tags', function() {
    const sut = new DDLogger({hostname: 'localhost'});
    const mock = sinon.mock(sut.logger);
    mock.expects('log').once().withArgs('debug', {
      msg1: 'meow',
      msg2: 'bow',
      ddsource: 'nodejs',
      service: 'appium',
      hostname: 'localhost',
      ddtags: 't1:1',
      timestamp: 0,
    });
    sut.log('debug', { msg1: 'meow', msg2: 'bow'}, { t1: 1 });
  });
});
