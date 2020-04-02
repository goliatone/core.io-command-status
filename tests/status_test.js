'use strict';
const test = require('tape');

const CommandStatus = require('../lib/status');

test('CommandStatus initialize', async t => {

    let status = new CommandStatus();
    t.ok(status.id);
    t.end();
});

test('CommandStatus constructor configuration', async t => {

    let config = {
        id: 'my-id',
        commandId: 'cmd-id',
        state: 'start',
        event: { test: 1 }
    };

    let status = new CommandStatus(config);
    t.deepEquals(status.toJSON(), config);
    t.end();
});

test('CommandStatus start state', async t => {

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

test('CommandStatus complete state', async t => {

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

test('CommandStatus complete state with data', async t => {

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


test('CommandStatus serialization', async t => {

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

test('CommandStatus deserialization', async t => {

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
