'use strict';
var fsExtra = require('fs-extra');
var obj2gltf = require('./obj2gltf');
var obj2b3dm = require('./obj2b3dm');

module.exports = obj23dtiles;

function obj23dtiles(objPath, outputPath, options) {
    console.time('Total');

    if (options.b3dm) {
        obj2b3dm(objPath, outputPath, options)
            .then(function(b3dm){
                return fsExtra.outputFile(outputPath, b3dm);
            })
            .then(function() {
                console.timeEnd('Total');
            })
            .catch(function(error) {
                console.log(error.message);
                process.exit(1);
            });
    }
    else {
        obj2gltf(objPath, options)
            .then(function(result){
                var gltf = result.gltf;
                if (options.binary) {
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
}

/**
 * Default values that will used when call obj23dtiles to use.
 */
obj23dtiles.defaults = JSON.parse(JSON.stringify(obj2gltf.defaults));
Object.assign(obj23dtiles.defaults, JSON.parse(JSON.stringify(obj2b3dm.defaults)));
