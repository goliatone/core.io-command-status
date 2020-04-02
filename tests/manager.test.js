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

    const e = {
        commandId: 'commandid',
        statusId: 'statusid',
        event: { id: 'eventid' },
    };

    const manager = new Manager();

    const statusId = await manager.add(e.commandId, e.event, e.statusId);

    t.equals(statusId, e.statusId, 'Should return status with right id');

    t.end();
});
