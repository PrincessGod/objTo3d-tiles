'use strict';
var fsExtra = require('fs-extra');
var createB3dm = require('./createB3dm');
var obj2gltf = require('./obj2gltf');

module.exports = obj23dtiles;

function obj23dtiles(objPath, outputPath, options) {
    console.time('Total');

    obj2gltf(objPath, options)
    .then(function(result) {
        var gltf = result.gltf;
        var batchTableJson = result.batchTableJson;
        if (options.binary) {
            if(options.b3dm) {
                var batchTableJsonPath = outputPath.slice(0, -5) + '_batchTable.json';
                fsExtra.writeJson(batchTableJsonPath, batchTableJson, {spaces: 2});
                return fsExtra.outputFile(outputPath, createB3dm({
                    glb: gltf,
                    featureTableJson: { BATCH_LENGTH : batchTableJson.batchId.length },
                    batchTableJson: batchTableJson
                }));
            }
            // gltf is a glb buffer
            return fsExtra.outputFile(outputPath, gltf);
        }
        var jsonOptions = {
            spaces : 2
        };
        return fsExtra.outputJson(outputPath, gltf, jsonOptions);
    })
    .then(function() {
        console.timeEnd('Total');
    })
    .catch(function(error) {
        console.log(error.message);
        process.exit(1);
    });
}

/**
 * Default values that will used when call obj23dtiles to use.
 */
obj23dtiles.defaults = JSON.parse(JSON.stringify(obj2gltf.defaults));
Object.assign(obj23dtiles.defaults, {
    /**
     * Gets or sets whether add the _BATCHID semantic to gltf per-model's attributes.
     * If true, _BATCHID begin from 0 for first mesh and add one for the next.
     * @type Boolean
     * @default false
     */
    batchId : false,
    /**
     * Gets or sets whether create b3dm model file, with _BATCHID and default batch table per-mesh.
     * @type Boolean
     * @default false
     */
    b3dm : false,
    /**
     * Gets or sets whether create BtchTable Json file.
     * @type Boolean
     * @default false
     */
    outputBatchTable : false
});
