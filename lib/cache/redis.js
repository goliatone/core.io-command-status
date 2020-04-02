'use strict';

const extend = require('gextend');

const REDIS_TTL_MILLIS = 'PX';
const REDIS_TTL_SECONDS = 'EX';
const REDIS_KEEP_TTL = 'KEEPTTL';
const REDIS_ONLY_IF_EXISTS = 'XX';
const REDIS_ONLY_IF_NOT_EXISTS = 'NX';

const defaults = {
    autoinitialize: true,
    logger: extend.shim(console),
    /**
     * Set TTL to 2 hours by default
     */
    ttl: 2 * 60 * 60 * 1000,
    /**
     * EX seconds
     * PX milliseconds
     * NX-- Only set the key if it does not already exist
     * XX-- Only set the key if it already exists
     * KEEPTTTL Retain the time to live associated with the key
     */
    ttlModeString: REDIS_TTL_MILLIS,
    /**
     * We can only use this in redis > 6
     */
    useKeepTTL: false
};

class RedisStore {
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

        if (!this.client) throw new Error('Missing Redis client');
    }

    /**
     * Store a new status instance.
     * 
     * If our instance was already stored this
     * operation will be ignored, you should use `update`
     * instead.
     * 
     * @param {String} eventId Event ID
     * @param {String} statusId Status ID
     * @param {Status} status Status instance
     */
    async add(eventId, statusId, status) {
        return this._set(eventId, statusId, status, REDIS_ONLY_IF_NOT_EXISTS);
    }

    /**
     * Store a new status instance.
     * 
     * If our instance was already stored this
     * operation will be ignored, you should use `update`
     * instead.
     * 
     * Note that `update` is more expensive that `add`
     * as it has to perform an extra check.
     * 
     * @param {String} eventId Event ID
     * @param {String} statusId Status ID
     * @param {Status} status Status instance
     */
    async update(eventId, statusId, status) {
        let behavior = this.useKeepTTL ? REDIS_KEEP_TTL : REDIS_ONLY_IF_EXISTS;
        return this._set(eventId, statusId, status, behavior);
    }

    /**
     * Set a key with our status instance.
     * 
     * If we have `behavior` **NX** we only set the key if it 
     * does not exist already.
     * 
     * If we have `behavior` **KEEPTTL** we udpate our key value
     * and keep the same TTL we have before the update.
     * 
     * @param {String} eventId Event identifier
     * @param {String} statusId Status identifier
     * @param {Object} status Status instance
     * @param {String} behavior Either NX o KEEPTTL
     */
    async _set(eventId, statusId, status, behavior) {
        let statusSerialized = status.toJSON ? status.toJSON() : JSON.stringify(status);

        const ttl = this.ttl;
        const ttlMode = this.ttlModeString;

        const eid = `cmd-status:eid:${eventId}`;
        const sid = `cmd-status:sid:${statusId}`;

        function _isUpdate(behavior) {
            return behavior === REDIS_KEEP_TTL;
        }

        /**
         * This is an update so we only want to update
         * if the status already exists, so we need 
         */
        if (_isUpdate(behavior)) {
            let exists = await this.client.get(eid);
            if (!exists) return Promise.resolve(undefined);
            this.logger.info('Update status key...');
        }

        const tx = this.client.multi();

        let arg1 = _isUpdate(behavior) ? [eid, statusSerialized, behavior] : [eid, statusSerialized, ttlMode, ttl];
        tx.set.call(tx, arg1);

        this.logger.info('set key %s ttl %s', `cmd-status:eid:${eventId}`, behavior);
        this.logger.info(arg1);

        let arg2 = _isUpdate(behavior) ? [sid, statusSerialized, behavior] : [sid, statusSerialized, ttlMode, ttl];
        tx.set.call(tx, arg2);

        this.logger.info('set key %s ttl %s', `cmd-status:sid:${statusId}`, behavior);
        this.logger.info(arg2);

        let result = await tx.exec();

        this.logger.info('Result', result);

        return result;
    }

    /**
     * Get a status instance by eventId.
     * @param {String} eventId Event ID
     * @returns {Status}
     */
    async getByEventId(eventId) {
        const key = `cmd-status:eid:${eventId}`;
        let value = await this.client.get(key);
        return value ? JSON.parse(value) : value;
    }

    async getByStatusId(statusId) {
        const key = `cmd-status:sid:${statusId}`;
        let value = await this.client.get(key);
        return value ? JSON.parse(value) : value;
    }

    async clear() {
        throw new Error('Implement')
    }
}

RedisStore.defaults = defaults;
RedisStore.ID = 'redis';

module.exports = RedisStore;
