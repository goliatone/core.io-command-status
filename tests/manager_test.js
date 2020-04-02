'use strict';
const test = require('tape');

const MemoryStore = require('..').MemoryStore;
const Manager = require('..').CommandStatusManager;

test('Manager initialize', async t => {

    let manager = new Manager();
    t.equals(manager.storeId, MemoryStore.ID, 'Should use memory store by default');
    t.end();
});
