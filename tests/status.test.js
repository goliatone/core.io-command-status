'use strict';
const test = require('tape');

const CommandStatus = require('..').CommandStatus;

test('CommandStatus initialize', t => {

    let status = new CommandStatus();
    t.ok(status.id, 'Status should initialize with a default id');
    t.end();
});

test('CommandStatus constructor configuration', t => {
    let config = {
        id: 'my-id',
        commandId: 'cmd-id',
        state: 'start',
        event: { test: 1 }
    };

    let status = new CommandStatus(config);
    t.deepEquals(status.toJSON(), config, 'Status should accept constructor configuration');
    t.end();
});

test('CommandStatus can be constructed from object', t => {

    let config = {
        id: 'my-id',
        commandId: 'cmd-id',
        state: 'start',
        event: { test: 1 }
    };

    let status = new CommandStatus();
    status.fromJSON(config);

    t.deepEquals(status.toJSON(), config, 'Status should accept an object in fromJSON');
    t.end();
});

test('CommandStatus toJSON should only expose "serializableAttributtes"', t => {

    let config = {
        id: 'my-id',
        commandId: 'cmd-id',
        state: 'start',
        event: { test: 1 },
        ignoreMe: true
    };

    let status = new CommandStatus(config);
    let output = status.toJSON();
    t.ok(status.ignoreMe, 'should be present');
    t.ok(Object.keys(output).indexOf('ignoreMe') === -1);
    // t.deepEquals(, 'Status should accept an object in fromJSON');
    t.end();
});

test('CommandStatus "start" state', t => {

    let config = {
        id: 'my-id',
        commandId: 'cmd-id',
        event: { test: 1 }
    };

    let status = new CommandStatus(config);
    status.start();
    t.equals(status.state, CommandStatus.START, 'State should be START');
    t.ok(status.startAt, 'Should have startAt timestamp');
    t.end();
});

test('CommandStatus "complete" state', t => {

    let config = {
        id: 'my-id',
        commandId: 'cmd-id',
        event: { test: 1 }
    };

    let status = new CommandStatus(config);
    status.complete();

    t.equals(status.state, CommandStatus.COMPLETE, 'State should be COMPLETE');
    t.ok(status.endAt, 'Should have endAt timestamp');
    t.end();
});

test('CommandStatus "complete" state with data', t => {

    let config = {
        id: 'my-id',
        commandId: 'cmd-id',
        event: { test: 1 }
    };

    let data = { response: { count: 23 } };

    let status = new CommandStatus(config);
    status.complete(data);

    t.equals(status.state, CommandStatus.COMPLETE, 'State should be COMPLETE');
    t.ok(status.endAt, 'Should have endAt timestamp');
    t.deepEquals(status.response, data.response, 'Should include result object');

    t.end();
});

test('CommandStatus "fail" state', t => {

    let config = {
        id: 'my-id',
        commandId: 'cmd-id',
        event: { test: 1 }
    };

    let error = { code: 23, message: 'My message' };

    let status = new CommandStatus(config);
    status.fail(error, 'My custom message');

    t.equals(status.state, CommandStatus.FAIL, 'State should be FAIL');
    t.ok(status.endAt, 'Should have endAt timestamp');
    t.deepEquals(status.error, error, 'Should include result object');

    t.end();
});

test('CommandStatus serialization', t => {

    let config = {
        id: 'my-id',
        commandId: 'cmd-id',
        event: { test: 1 },
        response: { count: 23 }
    };

    let status = new CommandStatus(config);
    t.equals(JSON.stringify(config), status.serialize(), 'Should serialize object');
    t.end();
});

test('CommandStatus deserialization', t => {

    let config = {
        id: 'my-id',
        commandId: 'cmd-id',
        event: { test: 1 },
        response: { count: 23 }
    };

    let source = new CommandStatus(config);
    let data = source.serialize();

    let status = new CommandStatus();
    status.deserialize(data);

    t.deepEquals(config, status.toJSON(), 'Should include result object');
    t.end();
});
