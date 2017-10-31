'use strict';
var Cesium = require('cesium');
var path = require('path');
var fsExtra = require('fs-extra');
var obj2B3dm = require('./obj2B3dm');
var createSingleTileset = require('./createSingleTileset');

var defaultValue = Cesium.defaultValue;

module.exports = obj2Tileset;

function obj2Tileset(objPath, outputpath, options) {
    var folder = path.dirname(outputpath);
    var tileFullName = path.basename(outputpath);
    var tilesetFolderName = 'Batched' + path.basename(objPath, '.obj');
    var tilePath = path.join(folder, tilesetFolderName, tileFullName);
    var tilesetPath = path.join(folder, tilesetFolderName, 'tileset.json');

    return obj2B3dm(objPath, options)
        .then(function(result){
            return new Promise(function(resolve) {
                if(options.tilesetOptions) {
                    return fsExtra.readJson(options.tilesetOptions)
                        .then(function(tilesetOptions){
                            tilesetOptions.tileName = defaultValue(tilesetOptions.tileName, tileFullName);
                            resolve({
                                b3dm : result.b3dm,
                                batchTableJson: result.batchTableJson,
                                tilesetJson : createSingleTileset(tilesetOptions),
                                tilePath : tilePath,
                                tilesetPath : tilesetPath
                            });
                        });
                }
                return resolve({
                    b3dm : result.b3dm,
                    batchTableJson: result.batchTableJson,
                    tilesetJson : createSingleTileset({tileName: tileFullName}),
                    tilePath : tilePath,
                    tilesetPath : tilesetPath
                });
            });
        });
}