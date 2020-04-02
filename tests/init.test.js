'use strict';
const test = require('tape');

const init = require('..').init;

const CoreMock = {
    getLogger: function(id) {
        return {
            info: function() {},
            error: function() {}
        };
    },
    resolve: function(deps) {},
    getCacheClient: function() {}
};

test('Module initializer function', async t => {


    // t.equals(manager.storeId, MemoryStore.ID, 'Should use memory store by default');
    t.end();
});
