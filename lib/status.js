'use strict';

const extend = require('gextend');
const _getUid = require('./getuid');

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
     * 
     * It will also record the current timestamp
     * in the `startAt` attribute.
     * 
     * @returns {void}
     */
    start() {
        this.state = CommandStatus.START;
        this.startAt = _timestamp();
    }

    /**
     * Set current `state` to **COMPLETE**.
     * 
     * It will also record the current timestamp
     * in the `endAt` attribute.
     * 
     * If `data` is defined we update our 
     * instance with this payload.
     *  
     * @param {Object} data Update object
     * @returns {void}
     */
    complete(data) {
        this.endAt = _timestamp();
        this.state = CommandStatus.COMPLETE;
        if (data) extend(this, data);
    }

    /**
     * Set current `state` to **FAIL**.
     * 
     * It will also record the current timestamp
     * in the `endAt` attribute.
     * 
     * If one is given it will add the `error`
     * object.
     * 
     * If no `message` is given the default 
     * is _Command failed_.
     *  
     * @param {Object} data Update object
     * @returns {void}
     */
    fail(error, message = 'Command failed') {
        this.endAt = _timestamp();
        if (error) this.error = error;
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

CommandStatus.defaults = defaults;

CommandStatus.START = 'start';
CommandStatus.COMPLETE = 'complete';
CommandStatus.FAIL = 'fail';

module.exports = CommandStatus;
