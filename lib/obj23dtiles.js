'use strict';
var path = require('path');
var fsExtra = require('fs-extra');
var obj2gltf = require('./obj2gltf');
var obj2B3dm = require('./obj2B3dm');
var obj2Tileset = require('./obj2Tileset');

module.exports = obj23dtiles;

function obj23dtiles(objPath, outputPath, options) {
    console.time('Total');

    if (options.tileset) {
        obj2Tileset(objPath, outputPath, options)
        .then(function(result) {
            var b3dm = result.b3dm;
            var batchTableJson = result.batchTableJson;
            var tileset = result.tilesetJson;
            var tilePath = result.tilePath;
            var tilesetPath = result.tilesetPath;

            if(options.outputBatchTable) {
                var batchTableJsonPath = tilePath.replace(/\.[^/.]+$/, '') + '_batchTable.json';
                return fsExtra.ensureDir(path.dirname(batchTableJsonPath))
                    .then(function(){
                        return fsExtra.writeJson(batchTableJsonPath, batchTableJson, {spaces: 2})
                            .then(function() {
                                var tasks = [];
                                tasks.push(fsExtra.outputFile(tilePath, b3dm));
                                tasks.push(fsExtra.writeJson(tilesetPath, tileset, {spaces: 2}));
                                return Promise.all(tasks);
                            });
                    });
            }


        })
        .then(function() {
            console.timeEnd('Total');
        })
        .catch(function(error) {
            console.log(error.message);
            process.exit(1);
        });
    }
    else if (options.b3dm) {
        obj2B3dm(objPath, options)
            .then(function(result){
                var b3dm = result.b3dm;
                var batchTableJson = result.batchTableJson;
                if(options.outputBatchTable) {
                    var batchTableJsonPath = outputPath.replace(/\.[^/.]+$/, '') + '_batchTable.json';
                    return fsExtra.ensureDir(path.dirname(batchTableJsonPath))
                        .then(function(){
                            return fsExtra.writeJson(batchTableJsonPath, batchTableJson, {spaces: 2})
                                .then(function(){
                                    return fsExtra.outputFile(outputPath, b3dm);
                                });
                        });
                }
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
Object.assign(obj23dtiles.defaults, JSON.parse(JSON.stringify(obj2B3dm.defaults)));
