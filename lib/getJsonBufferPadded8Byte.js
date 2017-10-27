'use strict';
var Cesium = require('cesium');

var defaultValue = Cesium.defaultValue;
var defined = Cesium.defined;

module.exports = getJsonBufferPadded;

/**
 * Convert the JSON object to a padded buffer.
 *
 * Pad the JSON with extra whitespace to fit the next 8-byte boundary. This ensures proper alignment
 * for the section that follows (for example, batch table binary or feature table binary).
 * Padding is not required by the 3D Tiles spec but is important when using Typed Arrays in JavaScript.
 *
 * @param {Object} [json] The JSON object.
 * @param {Number} [byteOffset=0] The byte offset on which the buffer starts.
 * @returns {Buffer} The padded JSON buffer.
 *
 * @private
 */
function getJsonBufferPadded(json, byteOffset) {
    // Check for undefined or empty
    if (!defined(json) || Object.keys(json).length === 0) {
        return Buffer.alloc(0);
    }

    byteOffset = defaultValue(byteOffset, 0);
    var string = JSON.stringify(json);

    var boundary = 8;
    var byteLength = Buffer.byteLength(string);
    var remainder = (byteOffset + byteLength) % boundary;
    var padding = (remainder === 0) ? 0 : boundary - remainder;
    var whitespace = '';
    for (var i = 0; i < padding; ++i) {
        whitespace += ' ';
    }
    string += whitespace;

    return Buffer.from(string);
}
