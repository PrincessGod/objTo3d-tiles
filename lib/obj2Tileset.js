'use strict';
var path = require('path');
var obj2B3dm = require('./obj2B3dm');
var createSingleTileset = require('./createSingleTileset');

module.exports = obj2Tileset;

function obj2Tileset(objPath, outputpath, options) {
    var folder = path.dirname(outputpath);
    var tileFullName = path.basename(outputpath);
    var tilesetFolderName = 'Batched' + path.basename(objPath, '.obj');
    var tilePath = path.join(folder, tilesetFolderName, tileFullName);
    var tilesetPath = path.join(folder, tilesetFolderName, 'tileset.json');
    var tilesetOptions = options.tilesetOptions || {};

    return obj2B3dm(objPath, options)
        .then(function(result){
            return new Promise(function(resolve) {
                tilesetOptions.tileName = tileFullName;
                return resolve({
                    b3dm : result.b3dm,
                    batchTableJson: result.batchTableJson,
                    tilesetJson : createSingleTileset(tilesetOptions),
                    tilePath : tilePath,
                    tilesetPath : tilesetPath
                });
            });
        });
}

/**
 * Default pramaters used in this moudle.
 */
obj2Tileset.defaults = {
    /**
     * Gets or set whether create a tileset.
     * 
     * @type Boolean
     * @default false
     */
    tileset: false,
    /**
     * Gets or set the tileset optional parameters.
     * 
     * @type Object
     * @default undefined
     */
    tilesetOptions: undefined
};
