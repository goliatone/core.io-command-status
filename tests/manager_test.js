'use strict';
const test = require('tape');

const Manager = require('../lib/manager');
const MemoryStore = require('../lib/cache/memory');

test('Manager initialize', async t => {

    let manager = new Manager();
    t.equals(manager.storeId, MemoryStore.ID, 'Should use memory store by default');
    t.end();
});
