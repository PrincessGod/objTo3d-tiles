'use strict';
var path = require('path');
var fsExtra = require('fs-extra');
var obj2gltf = require('./obj2gltf');
var obj2B3dm = require('./obj2B3dm');
var obj2I3dm = require('./obj2I3dm');
var obj2Tileset = require('./obj2Tileset');
var combine = require('./combineTileset');

module.exports = obj23dtiles;
obj23dtiles.combine = combine;

function obj23dtiles(objPath, outputPath, options) {

    if(typeof options.tilesetOptions === 'string') {
        options.tilesetOptions = fsExtra.readJsonSync(options.tilesetOptions);
    }
    if(typeof options.customBatchTable === 'string') {
        options.customBatchTable = fsExtra.readJsonSync(options.customBatchTable);
    }
    if (typeof options.customFeatureTable === 'string') {
        options.customFeatureTable = fsExtra.readJsonSync(options.customFeatureTable);
    }

    if (options && options.tileset) {
        if(!options.i3dm) {
            options.binary = true;
            options.batchId = true;
            options.b3dm = true;

            return obj2Tileset(objPath, outputPath, options)
                .then(function(result) {
                    var b3dm = result.b3dm;
                    var batchTableJson = result.batchTableJson;
                    var tileset = result.tilesetJson;
                    var tilePath = result.tilePath;
                    var tilesetPath = result.tilesetPath;

                    if(options.outputBatchTable) {
                        var batchTableJsonPath = tilePath.replace(/\.[^/.]+$/, '') + '_batchTable.json';
                        fsExtra.ensureDirSync(path.dirname(batchTableJsonPath));
                        fsExtra.writeJsonSync(batchTableJsonPath, batchTableJson, {spaces: 2});
                    }

                    var tasks = [];
                    fsExtra.ensureDirSync(path.dirname(tilePath));
                    tasks.push(fsExtra.outputFile(tilePath, b3dm));
                    tasks.push(fsExtra.writeJson(tilesetPath, tileset, {spaces: 2}));
                    return Promise.all(tasks);
                })
                .catch(function(error) {
                    console.log(error.message || error);
                    process.exit(1);
                });
        } else if (options.i3dm) {
            options.binary = true;
            options.batchId = false;
            if (!options.customFeatureTable) {
                console.log('Convert to i3dm need a custom FeatureTable.');
                process.exit(1);
            }

            return obj2Tileset(objPath, outputPath, options)
                .then(function(result) {
                    var i3dm = result.i3dm;
                    var batchTableJson = result.batchTableJson;
                    var tileset = result.tilesetJson;
                    var tilePath = result.tilePath;
                    var tilesetPath = result.tilesetPath;

                    if(options.outputBatchTable) {
                        var batchTableJsonPath = tilePath.replace(/\.[^/.]+$/, '') + '_batchTable.json';
                        fsExtra.ensureDirSync(path.dirname(batchTableJsonPath));
                        fsExtra.writeJsonSync(batchTableJsonPath, batchTableJson, {spaces: 2});
                    }

                    var tasks = [];
                    fsExtra.ensureDirSync(path.dirname(tilePath));
                    tasks.push(fsExtra.outputFile(tilePath, i3dm));
                    tasks.push(fsExtra.writeJson(tilesetPath, tileset, {spaces: 2}));
                    return Promise.all(tasks);
                })
                .catch(function(error) {
                    console.log(error.message || error);
                    process.exit(1);
                });
        }
    }
    else if (options && options.b3dm) {
        options.binary = true;
        options.batchId = true;
        return obj2B3dm(objPath, options)
            .then(function(result){
                var b3dm = result.b3dm;
                var batchTableJson = result.batchTableJson;

                if(options.outputBatchTable) {
                    var batchTableJsonPath = outputPath.replace(/\.[^/.]+$/, '') + '_batchTable.json';
                    fsExtra.ensureDirSync(path.dirname(batchTableJsonPath));
                    fsExtra.writeJsonSync(batchTableJsonPath, batchTableJson, {spaces: 2});
                }
                fsExtra.ensureDirSync(path.dirname(outputPath));
                return fsExtra.outputFile(outputPath, b3dm);
            })
            .catch(function(error) {
                console.log(error.message || error);
                process.exit(1);
            });
    }
    else if(options && options.i3dm) {
        options.binary = true;
        options.batchId = false;
        if (!options.customFeatureTable) {
            console.log('Convert to i3dm need a custom FeatureTable.');
            process.exit(1);
        }
        return obj2I3dm(objPath, options)
            .then(function(result){
                var i3dm = result.i3dm;
                var batchTableJson = result.batchTableJson;

                if(options.outputBatchTable) {
                    var batchTableJsonPath = outputPath.replace(/\.[^/.]+$/, '') + '_batchTable.json';
                    fsExtra.ensureDirSync(path.dirname(batchTableJsonPath));
                    fsExtra.writeJsonSync(batchTableJsonPath, batchTableJson, {spaces: 2});
                }
                fsExtra.ensureDirSync(path.dirname(outputPath));
                return fsExtra.outputFile(outputPath, i3dm);
            })
            .catch(function(error) {
                console.log(error.message || error);
                process.exit(1);
            });
    }
    else {
        return obj2gltf(objPath, options)
            .then(function(result){
                var gltf = result.gltf;
                if (options && options.binary) {
                    // gltf is a glb buffer
                    return fsExtra.outputFile(outputPath, gltf);
                }
                var jsonOptions = {
                    spaces : 2
                };
                return fsExtra.outputJson(outputPath, gltf, jsonOptions);
            })
            .catch(function(error) {
                console.log(error.message || error);
                process.exit(1);
            });
    }
}

/**
 * Default values that will used when call obj23dtiles to use.
 */
obj23dtiles.defaults = JSON.parse(JSON.stringify(obj2gltf.defaults));
Object.assign(obj23dtiles.defaults, JSON.parse(JSON.stringify(obj2B3dm.defaults)));
Object.assign(obj23dtiles.defaults, JSON.parse(JSON.stringify(obj2I3dm.defaults)));
Object.assign(obj23dtiles.defaults, JSON.parse(JSON.stringify(obj2Tileset.defaults)));
