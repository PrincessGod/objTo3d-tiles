'use strict';
var fsExtra = require('fs-extra');
var createB3dm = require('./createB3dm');
var obj2gltf = require('./obj2gltf');

module.exports = obj2B3dm;

/**
 * Convert obj model to b3dm file.
 * 
 * @param {String} objPath The obj model file path. 
 * @param {String} outputPath Output file path.
 * @param {Object} options Optional parameters.
 */
function obj2B3dm(objPath, options) {
    return obj2gltf(objPath, options)
        .then(function (result) {
            var glb = result.gltf;
            var batchTableJson = result.batchTableJson;

            return new Promise(function (resolve, reject) {
                if (options.customBatchTable) {
                    return fsExtra.readJson(options.customBatchTable)
                        .then(function (customBatchTable) {
                            if (!(customBatchTable.batchId && customBatchTable.batchId.length === batchTableJson.batchId.length)) {
                                reject('Custom BatchTable should have a proper "batchId" Array.');
                            }
                            resolve({
                                b3dm : createB3dm({
                                    glb: glb,
                                    featureTableJson: {
                                        BATCH_LENGTH: batchTableJson.batchId.length
                                    },
                                    batchTableJson: customBatchTable
                                }),
                                batchTableJson : batchTableJson
                            });
                        });
                }
                resolve({
                    b3dm : createB3dm({
                        glb: glb,
                        featureTableJson: {
                            BATCH_LENGTH: batchTableJson.batchId.length
                        },
                        batchTableJson: batchTableJson
                    }),
                    batchTableJson : batchTableJson
                });
            });
        });
}

/**
 * Default value for optional pramater.
 */
obj2B3dm.defaults = {
    /**
     * Gets or sets whether add the _BATCHID semantic to gltf per-model's attributes.
     * If true, _BATCHID begin from 0 for first mesh and add one for the next.
     * @type Boolean
     * @default false
     */
    batchId: false,
    /**
     * Gets or sets whether create b3dm model file, with _BATCHID and default batch table per-mesh.
     * @type Boolean
     * @default false
     */
    b3dm: false,
    /**
     * Gets or sets whether create BtchTable Json file.
     * @type Boolean
     * @default false
     */
    outputBatchTable: false,
    /**
     * Sets the default BatchTable object, should have proper property "batchId" Array.
     * @type Object
     * @default undefined
     */
    customBatchTable: undefined
};
