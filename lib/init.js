'use strict';
const extend = require('gextend');
const CommandStatusManager = require('./manager');
const REDIS_ID = require('./cache/redis').ID;

module.exports = function(context, config) {
    const logger = context.getLogger(config.moduleid);

    if (!config.logger) config.logger = logger;

    return new Promise((resolve, reject) => {
        context.resolve(config.dependencies).then(_ => {

            logger.info('Initialize Command Status Manager...');

            let options = extend({}, {

            }, config);

            /**
             * If we don't provide a client for our redis
             * store let's try to get it from context.
             */
            if (config.storeId === REDIS_ID && !options.storeOptions.client) {

                if (typeof context.getCacheClient !== 'function') {
                    throw new Error('Missing cache method');
                }

                options.storeOptions = extend({}, {
                    client: context.getCacheClient()
                }, options.storeOptions);
            }

            const manager = new CommandStatusManager(options);

            resolve(manager);

        }).catch(error => {
            logger.error('Error initializing Command Manager...');
            logger.error(error);
            reject(error);
        });
    });
};

/**
 * Configuration file will match this alias:
 * ./src/config/commandstatus.js
 */
// module.exports.alias = 'commandstatus';
