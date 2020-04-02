'use strict';
const test = require('tape');

const MemoryStore = require('..').MemoryStore;

test('MemoryStore initialize', t => {

    let status = new MemoryStore();
    t.ok(status.id, 'Status should initialize with a default id');
    t.end();
});
