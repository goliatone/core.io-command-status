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

test('CommandStatus start state', t => {

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

test('CommandStatus complete state', t => {

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

test('CommandStatus complete state with data', t => {

    let config = {
        id: 'my-id',
        commandId: 'cmd-id',
        event: { test: 1 }
    };

    let data = { result: { count: 23 } };

    let status = new CommandStatus(config);
    status.complete(data);
    t.equals(status.state, CommandStatus.COMPLETE, 'State should be COMPLETE');
    t.ok(status.endAt, 'Should have endAt timestamp');
    t.deepEquals(status.result, data.result, 'Should include result object');
    t.end();
});


test('CommandStatus serialization', t => {

    let config = {
        id: 'my-id',
        commandId: 'cmd-id',
        event: { test: 1 },
        result: { count: 23 }
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
        result: { count: 23 }
    };

    let source = new CommandStatus(config);
    let data = source.serialize();

    let status = new CommandStatus();
    status.deserialize(data);

    t.deepEquals(config, status.toJSON(), 'Should include result object');
    t.end();
});
