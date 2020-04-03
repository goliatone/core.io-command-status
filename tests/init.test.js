'use strict';
const test = require('tape');
const extend = require('gextend');
const Redis = require('ioredis-mock');

const init = require('..').init;
const CommandStatusManager = require('..').CommandStatusManager;
const RedisStore = require('..').RedisStore;
const MemoryStore = require('..').MemoryStore;

const CoreMock = mixin => {
    return extend({
        getLogger: function(id) {
            const logger = {};
            const methods = [
                'debug',
                'info',
                'warn',
                'error',
                'critical',
                'alert',
                'emergency',
                'notice',
                'verbose',
                'fatal'
            ];
            /**
             * Expose methods.
             */
            methods.forEach(function(method) {
                logger[method] = function() {};
            });
            return logger;
        },
        resolve: function(deps) {
            return Promise.resolve();
        },
        getCacheClient: _ => {}
    }, mixin);
};

test('Module initializer function', async t => {
    const config = {};

    let out = await init(CoreMock(), config);
    t.ok(out instanceof CommandStatusManager, 'Init should return a CommandStatusManager instance');
    t.ok(out._store instanceof MemoryStore, 'Init should return manager with a MemoryStore instance');
    t.end();
});

test('Module initializer should reject on error', async t => {
    const config = {};

    const mock = CoreMock({
        resolve: _ => Promise.reject(new Error('Error initializing'))
    });

    try {
        await init(mock, config);
    } catch (error) {
        t.ok(error instanceof Error, 'Init should return an error');
        t.end();
    }
});

test('Module initializer with redis store', async t => {
    const config = {
        storeId: RedisStore.ID
    };

    let out = await init(CoreMock({
        getCacheClient: _ => new Redis({})
    }), config);
    t.ok(out instanceof CommandStatusManager, 'Init should return a CommandStatusManager instance');
    t.end();
});

test('Module initializer should throw if no getCacheClient function', async t => {
    const config = {
        storeId: RedisStore.ID
    };

    try {
        await init(CoreMock({
            getCacheClient: undefined
        }), config);
    } catch (error) {
        t.ok(error instanceof Error, 'Init should return an error');
        t.end();
    }
});
