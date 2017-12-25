'use strict';
var Cesium = require('cesium');

var getJsonBufferPadded = require('./getJsonBufferPadded8Byte');
var getBufferPadded = require('./getBufferPadded8Byte');

var defined = Cesium.defined;

module.exports = createI3dm;


/**
 * 
 * @param {Object} options An object contains following properties:
 * @param {Object} options.featureTableJson The feature table JSON.
 * @param {Buffer} options.featureTableBinary The feature table binary.
 * @param {Object} [options.batchTableJson] Batch table JSON.
 * @param {Buffer} [options.batchTableBianry] The batch table binary.
 * @param {Buffer} [options.glb] The binary glTF buffer.
 * @param {String} [options.url] Url to an external glTF model when options.glb is not specified.
 * @returns {Buffer} I3dm buffer.
 */
function createI3dm(options) {
    var featureTableJson = getJsonBufferPadded(options.featureTableJson);
    var featureTableBinary = getBufferPadded(options.featureTableBinary);
    var batchTableJson = getJsonBufferPadded(options.batchTableJson);
    var batchTableBianry = getBufferPadded(options.batchTableBianry);

    var gltfFormat = defined(options.glb) ? 1 : 0;
    var gltfBuffer = defined(options.glb) ? options.glb : getGltfUrlBuffer(options.url);

    var verison = 1;
    var headerByteLength = 32;
    var featureTableJsonByteLength = featureTableJson.length;
    var featureTableBinaryByteLength = featureTableBinary.length;
    var batchTableJsonByteLength = batchTableJson.length;
    var batchTableBianryByteLength = batchTableBianry.length;
    var gltfByteLength = gltfBuffer.length;
    var byteLength = headerByteLength + featureTableJsonByteLength + featureTableBinaryByteLength + batchTableJsonByteLength + batchTableBianryByteLength + gltfByteLength;

    var header = Buffer.alloc(headerByteLength);
    header.write('i3dm', 0);
    header.writeUInt32LE(verison, 4);
    header.writeUInt32LE(byteLength, 8);
    header.writeUInt32LE(featureTableJsonByteLength, 12);
    header.writeUInt32LE(featureTableBinaryByteLength, 16);
    header.writeUInt32LE(batchTableJsonByteLength, 20);
    header.writeUInt32LE(batchTableBianryByteLength, 24);
    header.writeUInt32LE(gltfFormat, 28);

    return Buffer.concat([header, featureTableJson, featureTableBinary, batchTableJson, batchTableBianry, gltfBuffer]);
}

function getGltfUrlBuffer(url) {
    url = url.replace(/\\/g, '/');
    return Buffer.from(url);
}
