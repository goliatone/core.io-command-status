'use strict';
const test = require('tape');

const MemoryStore = require('..').MemoryStore;

test('MemoryStore initialize', t => {
    const store = new MemoryStore();
    t.equals(store.name, MemoryStore.ID, 'Instance should have name');
    t.end();
});

test('MemoryStore should call init if autoinitialize false', t => {
    const store = new MemoryStore({ autoinitialize: false });

    t.equals(!!store.initialized, false, 'Instance should have name');
    t.end();
});

test('MemoryStore "add" method stores a status by event id and status id', async t => {

    const expected = {
        eventid: 'eventid',
        statusid: 'statusid',
        status: { id: 'id1' }
    };

    const store = new MemoryStore();
    let status = await store.add(expected.eventid, expected.statusid, expected.status);

    t.equals(status.id, expected.status.id, 'Should return status');
    t.equal(store._eventToStatus[expected.eventid], expected.statusid, 'Should map event id to status id');
    t.equal(store._statusToEvent[expected.statusid], expected.eventid, 'Should map status id to event id');

    t.end();
});

test('MemoryStore "update" method stores a status by event id and status id', async t => {

    const expected = {
        eventid: 'eventid',
        statusid: 'statusid',
        status: { id: 'id1' }
    };

    const updated = { id: 'id1', updated: true };

    const store = new MemoryStore();
    let status = await store.add(expected.eventid, expected.statusid, expected.status);

    await store.update(expected.eventid, expected.statusid, updated);

    let found = await store.getByEventId(expected.eventid);

    t.deepEquals(found, updated, 'Should return expected status');


    t.end();
});

test('MemoryStore should return status by event id', async t => {

    const expected = {
        eventid: 'eventid',
        statusid: 'statusid',
        status: { id: 'id1' }
    };

    const store = new MemoryStore();
    let status = await store.add(expected.eventid, expected.statusid, expected.status);

    let found = await store.getByEventId(expected.eventid);

    t.deepEquals(found, expected.status, 'Should return expected status');

    t.end();
});

test('MemoryStore should return status by status id', async t => {

    const expected = {
        eventid: 'eventid',
        statusid: 'statusid',
        status: { id: 'id1' }
    };

    const store = new MemoryStore();
    let status = await store.add(expected.eventid, expected.statusid, expected.status);

    let found = await store.getByStatusId(expected.statusid);

    t.deepEquals(found, expected.status, 'Should return expected status');

    t.end();
});

test('MemoryStore should clear all status references', async t => {

    const expected = {
        eventid: 'eventid',
        statusid: 'statusid',
        status: { id: 'id1' }
    };

    const store = new MemoryStore();
    let status = await store.add(expected.eventid, expected.statusid, expected.status);

    await store.clear();

    t.isEquivalent(store._status, {}, 'remve all status');
    t.isEquivalent(store._statusToEvent, {}, 'remove all status to event mappings');
    t.isEquivalent(store._eventToStatus, {}, 'remove all event to status mappings');


    t.end();
});
