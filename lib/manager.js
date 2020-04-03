'use strict';

const extend = require('gextend');

const RedisStore = require('./cache/redis');
const MemoryStore = require('./cache/memory');
const CommandStatus = require('./status');

const defaults = {
    autoinitialize: true,
    logger: extend.shim(console),
    storeId: 'memory',
    storeOptions: {},
    getUid: require('./getuid')
};

class CommandStatusManager {
    constructor(config = {}) {
        config = extend({}, this.constructor.defaults, config);
        if (config.autoinitialize) {
            this.init(config);
        }
    }

    init(config = {}) {
        if (this.initialized) return;
        this.initialized = true;
        extend(this, config);
        extend.unshim(this);

        const storeId = config.storeId;
        const storeOptions = config.storeOptions;
        this._store = this.makeCacheStore(storeOptions, storeId);
    }

    /**
     * Add a new command to keep track of it.
     * 
     * TODO: Do we really want to take an external statusID?
     * TODO: Should we check to see if we already have a given statusId?
     * TODO: Should we check to see if we already have a commandId + event.id?
     * TODO: Should we return String or Object!
     * 
     * @param {String} commandId Command identifier
     * @param {Object} event Event payload
     * @returns {CommandStatus}
     */
    async add(commandId, event = {}, statusId = this.getUid()) {

        if (event.id) event.id = this.getUid();

        let status = new CommandStatus({
            id: statusId,
            commandId,
            event
        });
        status.start();

        await this._store.add(event.id, status.id, status.toJSON());

        return status;
    }

    /**
     * Once our command has finished we call
     * this method to update it's state.
     * 
     * @param {String} eventId Event ID
     * @param {Object} response Anything we want to return
     * @returns {CommandStatus}
     */
    async complete(eventId, response) {
        //access cache
        let status = await this._store.getByEventId(eventId);
        if (!status) return false;

        status = new CommandStatus(status);
        if (response) response = { response };
        status.complete(response);

        return await this._store.update(eventId, status.id, status.toJSON());
    }

    async fail(eventId, error, message = 'Command failed') {
        let status = await this._store.getByEventId(eventId);
        if (!status) return false;

        status = new CommandStatus(status);
        status.fail(error, message);

        return await this._store.update(eventId, status.id, status.toJSON());
    }

    /**
     *
     * TODO: Do we want to mark as visited?
     * @param {String} eventId Event Id
     * @returns {CommandStatus}
     */
    checkByEventId(eventId) {
        return this._store.getByEventId(eventId);
    }

    /**
     * TODO: Do we want to mark as visited?
     * @param {String} statusId Status Id
     * @returns {CommandStatus}
     */
    async check(statusId) {
        //Access cache
        return this._store.getByStatusId(statusId);
    }

    makeCacheStore(options, storeId = 'memory') {
        if (storeId === RedisStore.ID) return new RedisStore(options);
        return new MemoryStore(options);
    }
}

CommandStatusManager.defaults = defaults;

module.exports = CommandStatusManager;
