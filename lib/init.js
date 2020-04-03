'use strict';
const extend = require('gextend');
const CommandStatusManager = require('./manager');
const REDIS_ID = require('./cache/redis').ID;

module.exports = function(context, config) {
    const logger = context.getLogger(config.moduleid);

    if (!config.logger) config.logger = logger;

    return new Promise(async(resolve, reject) => {
        try {
            await context.resolve(config.dependencies);
            logger.info('Initialize Command Status Manager...');

            /**
             * If we don't provide a client for our redis
             * store let's try to get it from context.
             */
            if (config.storeId === REDIS_ID && _noClient(config)) {

                if (typeof context.getCacheClient !== 'function') {
                    throw new Error('Missing cache method');
                }

                config.storeOptions = extend({}, {
                    client: context.getCacheClient()
                }, config.storeOptions);
            }

            const manager = new CommandStatusManager(config);

            resolve(manager);

        } catch (error) {
            logger.error('Error initializing Command Manager...');
            logger.error(error);
            reject(error);
        }
    });
};

function _noClient(options) {
    return !(options.storeOptions && options.storeOptions.client);
}
/**
 * Configuration file will match this alias:
 * ./src/config/commandstatus.js
 */
// module.exports.alias = 'commandstatus';
