'use strict';

const extend = require('gextend');
const defaults = {
    autoinitialize: true,
    logger: extend.shim(console)
};

/**
 * Storage to keep track of Status instances.
 * For production use the redis store.
 */
class MemoryStore {
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

        this.name = this.constructor.ID;

        this._status = {};
        this._eventToStatus = {};
        this._statusToEvent = {};
    }

    /**
     * Store a new status instance
     * @param {String} eventId Event ID
     * @param {String} statusId Status ID
     * @param {Status} status Status instance
     * 
     * @returns {Status}
     */
    add(eventId, statusId, status) {
        this._eventToStatus[eventId] = statusId;
        this._statusToEvent[statusId] = eventId;

        this._status[eventId] = status;

        return status;
    }

    update(eventId, statusId, status) {
        return this.add(eventId, statusId, status);
    }

    /**
     * Get a status instance by eventId.
     * @param {String} eventId Event ID
     * @returns {Status}
     */
    getByEventId(eventId) {
        return this._status[eventId];
    }

    getByStatusId(statusId) {
        let eventId = this._statusToEvent[statusId];
        return this.getByEventId(eventId);
    }

    clear() {
        this._status = {};
        this._eventToStatus = {};
        this._statusToEvent = {};
    }
}

MemoryStore.ID = 'memory';
MemoryStore.defaults = defaults;

module.exports = MemoryStore;
