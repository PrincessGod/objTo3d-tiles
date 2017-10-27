'use strict';
var Cesium = require('cesium');
var getBufferPadded = require('./getBufferPadded8Byte');
var getJsonBufferPadded = require('./getJsonBufferPadded8Byte');

var defaultValue = Cesium.defaultValue;

module.exports = createB3dm;

/**
 * Create a Batched 3D Model (b3dm) tile from a binary glTF and per-feature metadata.
 *
 * @param {Object} options An object with the following properties:
 * @param {Buffer} options.glb The binary glTF buffer.
 * @param {Object} [options.featureTableJson] Feature table JSON.
 * @param {Buffer} [options.featureTableBinary] Feature table binary.
 * @param {Object} [options.batchTableJson] Batch table describing the per-feature metadata.
 * @param {Buffer} [options.batchTableBinary] The batch table binary.
 * @param {Boolean} [options.deprecated1=false] Save the b3dm with the deprecated 20-byte header.
 * @param {Boolean} [options.deprecated2=false] Save the b3dm with the deprecated 24-byte header.
 * @returns {Buffer} The generated b3dm tile buffer.
 */
function createB3dm(options) {
    var glb = options.glb;
    var defaultFeatureTable = {
        BATCH_LENGTH : 0
    };
    var featureTableJson = defaultValue(options.featureTableJson, defaultFeatureTable);
    var batchLength = featureTableJson.BATCH_LENGTH;

    var headerByteLength = 28;
    var featureTableJsonBuffer = getJsonBufferPadded(featureTableJson, headerByteLength);
    var featureTableBinary = getBufferPadded(options.featureTableBinary);
    var batchTableJsonBuffer = getJsonBufferPadded(options.batchTableJson);
    var batchTableBinary = getBufferPadded(options.batchTableBinary);

    var deprecated1 = defaultValue(options.deprecated1, false);
    var deprecated2 = defaultValue(options.deprecated2, false);

    if (deprecated1) {
        return createB3dmDeprecated1(glb, batchLength, batchTableJsonBuffer);
    } else if (deprecated2) {
        return createB3dmDeprecated2(glb, batchLength, batchTableJsonBuffer, batchTableBinary);
    }

    return createB3dmCurrent(glb, featureTableJsonBuffer, featureTableBinary, batchTableJsonBuffer, batchTableBinary);
}

function createB3dmCurrent(glb, featureTableJson, featureTableBinary, batchTableJson, batchTableBinary) {
    var version = 1;
    var headerByteLength = 28;
    var featureTableJsonByteLength = featureTableJson.length;
    var featureTableBinaryByteLength = featureTableBinary.length;
    var batchTableJsonByteLength = batchTableJson.length;
    var batchTableBinaryByteLength = batchTableBinary.length;
    var gltfByteLength = glb.length;
    var byteLength = headerByteLength + featureTableJsonByteLength + featureTableBinaryByteLength + batchTableJsonByteLength + batchTableBinaryByteLength + gltfByteLength;

    var header = Buffer.alloc(headerByteLength);
    header.write('b3dm', 0);
    header.writeUInt32LE(version, 4);
    header.writeUInt32LE(byteLength, 8);
    header.writeUInt32LE(featureTableJsonByteLength, 12);
    header.writeUInt32LE(featureTableBinaryByteLength, 16);
    header.writeUInt32LE(batchTableJsonByteLength, 20);
    header.writeUInt32LE(batchTableBinaryByteLength, 24);

    return Buffer.concat([header, featureTableJson, featureTableBinary, batchTableJson, batchTableBinary, glb]);
}

function createB3dmDeprecated1(glb, batchLength, batchTableJson) {
    var version = 1;
    var headerByteLength = 20;
    var batchTableJsonByteLength = batchTableJson.length;
    var gltfByteLength = glb.length;
    var byteLength = headerByteLength + batchTableJsonByteLength + gltfByteLength;

    var header = Buffer.alloc(headerByteLength);
    header.write('b3dm', 0);
    header.writeUInt32LE(version, 4);
    header.writeUInt32LE(byteLength, 8);
    header.writeUInt32LE(batchLength, 12);
    header.writeUInt32LE(batchTableJsonByteLength, 16);

    return Buffer.concat([header, batchTableJson, glb]);
}

function createB3dmDeprecated2(glb, batchLength, batchTableJson, batchTableBinary) {
    var version = 1;
    var headerByteLength = 24;
    var batchTableJsonByteLength = batchTableJson.length;
    var batchTableBinaryByteLength = batchTableBinary.length;
    var gltfByteLength = glb.length;
    var byteLength = headerByteLength + batchTableJsonByteLength + batchTableBinaryByteLength + gltfByteLength;

    var header = Buffer.alloc(headerByteLength);
    header.write('b3dm', 0);
    header.writeUInt32LE(version, 4);
    header.writeUInt32LE(byteLength, 8);
    header.writeUInt32LE(batchTableJsonByteLength, 12);
    header.writeUInt32LE(batchTableBinaryByteLength, 16);
    header.writeUInt32LE(batchLength, 20);

    return Buffer.concat([header, batchTableJson, batchTableBinary, glb]);
}
