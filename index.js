/*jshint esversion:6, node:true*/
'use strict';

/*
 * Default initializer for the module.
 *
 * You can always override this and make
 * a custom initializer.
 */
module.exports.init = require('./lib/init');


module.exports.CommandStatusManager = require('./lib/manager');

module.exports.CommandStatus = require('./lib/status');

module.exports.RedisStore = require('./lib/cache/redis');

module.exports.MemoryStore = require('./lib/cache/memory');
