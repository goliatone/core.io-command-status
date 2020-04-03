'use strict';
const test = require('tape');
const sinon = require('sinon');

const MemoryStore = require('..').MemoryStore;
const Manager = require('..').CommandStatusManager;

test('Manager initialize', async t => {
    const manager = new Manager();

    t.equals(manager.storeId, MemoryStore.ID, 'Should use memory store by default');

    t.end();
});

test('Manager "add"', async t => {

    const expected = {
        id: 'statusid',
        commandId: 'commandid',
        event: { id: 'eventid' },
    };

    const manager = new Manager();

    const status = await manager.add(expected.commandId, expected.event, expected.id);

    t.equals(status.id, expected.id, 'Should return status with right id');

    // Object.keys(expected).map(key => {
    //     t.isEquivalent(expected[key], status[key], 'Should be equivalent');
    // });
    // t.ok(status.startAt, 'Should have start at');
    // t.equals(status.state, 'start', 'Should have start at');

    t.end();
});


test('Manager "check" using status id', async t => {

    const expected = {
        id: 'statusid',
        commandId: 'commandid',
        event: { id: 'eventid' },
    };

    const manager = new Manager();

    const status = await manager.add(expected.commandId, expected.event, expected.id);

    const checked = await manager.check(status.id);

    t.equals(status.id, expected.id, 'Should return status with right id');
    t.equals(checked.id, expected.id, 'Should return status with right id');

    t.end();
});

test('Manager "checkByEventId" using event id', async t => {

    const expected = {
        id: 'statusid',
        commandId: 'commandid',
        event: { id: 'eventid' },
    };

    const manager = new Manager();

    const status = await manager.add(expected.commandId, expected.event, expected.id);

    const found = await manager.checkByEventId(expected.event.id);

    t.equals(status.id, expected.id, 'Updated should match status id');
    t.equals(found.id, expected.id, 'Found should match expected id');

    t.end();
});

test('Manager "complete"', async t => {

    const expected = {
        id: 'statusid',
        commandId: 'commandid',
        event: { id: 'eventid' },
    };

    const response = { count: 1, success: true };

    const manager = new Manager();

    const status = await manager.add(expected.commandId, expected.event, expected.id);

    const updated = await manager.complete(expected.event.id, response);

    const found = await manager.check(status.id);

    t.deepEquals(response, updated.response, 'Should include response');
    t.equals(status.id, updated.id, 'Updated should match status id');
    t.equals(found.id, expected.id, 'Found should match expected id');

    t.end();
});


test('Manager "fail"', async t => {

    const expected = {
        id: 'statusid',
        commandId: 'commandid',
        event: { id: 'eventid' },
    };

    const error = { code: 1, message: 'Womb womb' };

    const manager = new Manager();

    const status = await manager.add(expected.commandId, expected.event, expected.id);

    const updated = await manager.fail(expected.event.id, error, 'This failed');

    const found = await manager.check(status.id);

    t.deepEquals(error, updated.error, 'Should include error');
    t.equals(status.id, updated.id, 'Updated should match status id');
    t.equals(found.id, expected.id, 'Found should match expected id');

    t.end();
});
