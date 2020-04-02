'use strict';

const extend = require('gextend');
const defaults = {
    autoinitialize: true,
    logger: extend.shim(console)
};

class MemoryStore {
    /**
     * Storage to keep track of Status instances.
     * For production use the redis store.
     * 
     * @param {Object} [config={}] Configuration object
     * @param {Boolean} [config.autoinitialize=true] Run init function
     * @param {Object} [config.logger=console] Logger
     */
    constructor(config = {}) {
        config = extend({}, this.constructor.defaults, config);

        if (config.autoinitialize) {
            this.init(config);
        }
    }

    /**
     * Initialization routine.
     * 
     * This will extend the instance with attributes
     * passed through the config object.
     * 
     * @param {Object} config Configuration object
     */
    init(config = {}) {
        if (this.initialized) return;
        this.initialized = true;

        extend(this, config);
        extend.unshim(this);

        this.name = this.constructor.ID;

        this.clear();
    }

    /**
     * Store a new status instance
     * 
     * @param {String} eventId Event ID
     * @param {String} statusId Status ID
     * @param {CommandStatus} status Status instance
     * 
     * @returns {CommandStatus}
     */
    add(eventId, statusId, status) {
        this._eventToStatus[eventId] = statusId;
        this._statusToEvent[statusId] = eventId;

        this._status[eventId] = status;

        return status;
    }

    /**
     * Update a stored status instance.
     * 
     * @param {String} eventId Event ID
     * @param {String} statusId Status ID
     * @param {CommandStatus} status Status instance
     * 
     * @returns {CommandStatus}
     */
    update(eventId, statusId, status) {
        return this.add(eventId, statusId, status);
    }

    /**
     * Get a status instance by `eventId`.
     * 
     * @param {String} eventId Event ID
     * @returns {CommandStatus}
     */
    getByEventId(eventId) {
        return this._status[eventId];
    }

    /**
     * Get a status instance by `statusId`.
     * 
     * @param {String} statusId Status ID
     * @returns {CommandStatus}
     */
    getByStatusId(statusId) {
        let eventId = this._statusToEvent[statusId];
        return this.getByEventId(eventId);
    }

    /**
     * Remove all stored status instances
     * as well as all mappings.
     */
    clear() {
        this._status = {};
        this._eventToStatus = {};
        this._statusToEvent = {};
    }
}

MemoryStore.ID = 'memory';
MemoryStore.defaults = defaults;

module.exports = MemoryStore;
