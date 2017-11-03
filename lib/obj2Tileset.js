'use strict';
var path = require('path');
var Cesium = require('cesium');
var createSingleTileset = require('./createSingleTileset');
var tilesetOptionsUtility = require('./tilesetOptionsUtility');
var obj2B3dm = require('./obj2B3dm');

var defaultValue = Cesium.defaultValue;
var getPoint3MinMax = tilesetOptionsUtility.getPoint3MinMax;

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
            var batchTableJson = result.batchTableJson;
            var minmaxPoint = getPoint3MinMax(batchTableJson.minPoint.concat(batchTableJson.maxPoint));
            var width = minmaxPoint.max[0] - minmaxPoint.min[0];
            var height = minmaxPoint.max[2] - minmaxPoint.min[2];
            width = Math.ceil(width);
            height = Math.ceil(height);
            var offsetX = width / 2 + minmaxPoint.min[0];
            var offsetY = height / 2 + minmaxPoint.min[2];
            return new Promise(function(resolve) {
                tilesetOptions.tileName = tileFullName;
                tilesetOptions.minHeight = defaultValue(tilesetOptions.minHeight, minmaxPoint.min[1]);
                tilesetOptions.maxHeight = defaultValue(tilesetOptions.maxHeight, minmaxPoint.max[1]);
                tilesetOptions.tileWidth = defaultValue(tilesetOptions.tileWidth, width);
                tilesetOptions.tileHeight = defaultValue(tilesetOptions.tileHeight, height);
                tilesetOptions.transHeight = defaultValue(tilesetOptions.transHeight, 0 - minmaxPoint.min[1]);
                tilesetOptions.offsetX = defaultValue(tilesetOptions.offsetX, offsetX);
                tilesetOptions.offsetY = defaultValue(tilesetOptions.offsetY, offsetY);
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
