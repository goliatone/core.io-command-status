'use strict';
const test = require('tape');

const Redis = require('ioredis-mock');
const RedisStore = require('..').RedisStore;

test('RedisStore initialize', t => {
    const store = new RedisStore({
        client: new Redis({ data: {} })
    });
    t.equals(store.name, RedisStore.ID, 'Instance should have name');
    t.end();
});

test('RedisStore should call init if autoinitialize false', t => {
    const store = new RedisStore({ autoinitialize: false });

    t.equals(!!store.initialized, false, 'Instance should have name');
    t.end();
});

test('RedisStore "add" method stores a status by event id and status id', async t => {

    const expected = {
        eventid: 'eventid',
        statusid: 'statusid',
        status: { id: 'id1' }
    };

    const store = new RedisStore({
        client: new Redis({ data: {} })
    });

    let status = await store.add(expected.eventid, expected.statusid, expected.status);
    t.ok(status);
    t.equals(status.id, expected.status.id, 'Should return status');

    t.end();
});

test('RedisStore "update" method stores a status by event id and status id', async t => {

    const expected = {
        eventid: 'eventid',
        statusid: 'statusid',
        status: { id: 'id1' }
    };

    const updated = { id: 'id1', updated: true };

    const store = new RedisStore({
        client: new Redis({ data: {} })
    });
    let status = await store.add(expected.eventid, expected.statusid, expected.status);

    await store.update(expected.eventid, expected.statusid, updated);

    let found = await store.getByEventId(expected.eventid);

    t.deepEquals(found, updated, 'Should return expected status');


    t.end();
});

test('RedisStore should return status by event id', async t => {

    const expected = {
        eventid: 'eventid',
        statusid: 'statusid',
        status: { id: 'id1' }
    };

    const store = new RedisStore({
        client: new Redis({ data: {} })
    });
    let status = await store.add(expected.eventid, expected.statusid, expected.status);

    let found = await store.getByEventId(expected.eventid);

    t.deepEquals(found, expected.status, 'Should return expected status');

    t.end();
});

test('RedisStore should return status by status id', async t => {

    const expected = {
        eventid: 'eventid',
        statusid: 'statusid',
        status: { id: 'id1' }
    };

    const store = new RedisStore({
        client: new Redis({ data: {} })
    });
    let status = await store.add(expected.eventid, expected.statusid, expected.status);

    let found = await store.getByStatusId(expected.statusid);

    t.deepEquals(found, expected.status, 'Should return expected status');

    t.end();
});

test('RedisStore should clear all status references', async t => {
    const store = new RedisStore({
        client: new Redis({ data: {} })
    });

    await store.add('eventid1', 'statusid1', { id: 'id1' });
    await store.add('eventid2', 'statusid2', { id: 'id2' });
    await store.add('eventid3', 'statusid3', { id: 'id3' });

    await store.clear();

    let found = await store.getByStatusId('statusid1');
    t.not(found, undefined, 'Should not find statusid1');

    found = await store.getByStatusId('statusid2');
    t.not(found, undefined, 'Should not find statusid2');

    found = await store.getByStatusId('statusid3');
    t.not(found, undefined, 'Should not find statusid3');

    t.end();
});
