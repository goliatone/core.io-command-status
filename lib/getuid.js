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

module.exports = _getUid;
