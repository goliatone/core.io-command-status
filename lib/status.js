'use strict';

const extend = require('gextend');
const defaults = {
    autoinitialize: true,
    logger: extend.shim(console),
    serializableAttributtes: [
        'id',
        'commandId',
        'state',
        'event',
        'error',
        'result',
        'message',
        'startAt',
        'endAt',
    ]
};


class CommandStatus {
    /**
     * Create a new instance.
     * 
     * CommandStatus provides a way to serialize
     * and deserialize so it can be persisted in 
     * the data store.
     * 
     * It also provides state management.
     * @param {Object} [config={}] Configuration object 
     */
    constructor(config = {}) {
        config = extend({}, this.constructor.defaults, config);
        if (config.autoinitialize) {
            this.init(config);
        }
    }

    init(config = {}) {
        if (this.initialized) return;
        this.initialized = true;

        /**
         * Generate the id before we extend.
         * If we pass an id in the `config` or
         * `config.data` then we will use that.
         */
        this.id = _getUid();

        extend(this, config);
        extend.unshim(this);

        if (config.data) this.fromJSON(data);
    }

    /**
     * Set current `state` to **START**.
     * It will also record the current timestamp
     * in the `startAt` attribute.
     * 
     * @returns {void}
     */
    start() {
        this.state = CommandStatus.START;
        this.startAt = _timestamp();
    }

    complete(data) {
        this.endAt = _timestamp();
        this.state = CommandStatus.COMPLETE;
        if (data) extend(this, data);
    }

    fail(error, message = 'Command failed') {
        this.endAt = _timestamp();
        this.error = error;
        this.isError = true;
        this.message = message;
        this.state = CommandStatus.FAIL;
    }

    fromJSON(data) {
        let json = {};
        this.serializableAttributtes.map(attr => {
            if (data.hasOwnProperty(attr)) json[attr] = data[attr];
        });
        extend(this, json);
    }

    toJSON() {
        let out = {};
        this.serializableAttributtes.map(attr => {
            if (this.hasOwnProperty(attr)) out[attr] = this[attr];
        });

        return out;
    }

    serialize() {
        let out = this.toJSON();
        return JSON.stringify(out);
    }

    deserialize(data) {
        let json = JSON.parse(data);
        this.fromJSON(json);
    }
}

function _timestamp() {
    return Math.round((new Date()).getTime() / 1000);
}

/**
 * Generate an unique identifier in 
 * the form or:
 * "jce1t9gu-sg69zzohk7"
 * 
 * @param {Number} len Output length
 * @return {String}
 */
function _getUid(len = 20) {
    const timestamp = (new Date()).getTime().toString(36);

    const randomString = (len) => [...Array(len)].map(() => Math.random().toString(36)[3]).join('');

    len = len - (timestamp.length + 1);

    return `${timestamp}-${randomString(len)}`;
}

CommandStatus.defaults = defaults;

CommandStatus.START = 'start';
CommandStatus.COMPLETE = 'complete';
CommandStatus.FAIL = 'fail';

module.exports = CommandStatus;
