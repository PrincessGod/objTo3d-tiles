'use strict';
var path = require('path');
var Cesium = require('cesium');
var createSingleTileset = require('./createSingleTileset');
var tilesetOptionsUtility = require('./tilesetOptionsUtility');
var obj2B3dm = require('./obj2B3dm');
var obj2I3dm = require('./obj2I3dm');
var Cartesian3 = Cesium.Cartesian3;
var Matrix3 = Cesium.Matrix3;
var CMath = Cesium.Math;

var defaultValue = Cesium.defaultValue;
var getPoint3MinMax = tilesetOptionsUtility.getPoint3MinMax;

module.exports = obj2Tileset;

function obj2Tileset(objPath, outputpath, options) {
    var folder = path.dirname(outputpath);
    var tileFullName = path.basename(outputpath);
    var folderPrifix = options.b3dm ? 'Batched' : 'Instanced';
    var tilesetFolderName = folderPrifix + path.basename(objPath, '.obj');
    var tilePath = path.join(folder, tilesetFolderName, tileFullName);
    var tilesetPath = path.join(folder, tilesetFolderName, 'tileset.json');
    var tilesetOptions = options.tilesetOptions || {};
    if (options.b3dm) {
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
                    tilesetOptions.tileWidth = defaultValue(tilesetOptions.tileWidth, width);
                    tilesetOptions.tileHeight = defaultValue(tilesetOptions.tileHeight, height);
                    tilesetOptions.transHeight = defaultValue(tilesetOptions.transHeight, -minmaxPoint.min[1]);
                    tilesetOptions.minHeight = defaultValue(tilesetOptions.minHeight, minmaxPoint.min[1] + tilesetOptions.transHeight);
                    tilesetOptions.maxHeight = defaultValue(tilesetOptions.maxHeight, minmaxPoint.max[1] + tilesetOptions.transHeight);
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
    } else if (options.i3dm) {
        return obj2I3dm(objPath, options)
            .then(function(result) {
                var batchTableJson = result.batchTableJson;
                var minmaxPoint = getPoint3MinMax(batchTableJson.minPoint.concat(batchTableJson.maxPoint));
                minmaxPoint.min = [minmaxPoint.min[0], minmaxPoint.min[2], minmaxPoint.min[1]];
                minmaxPoint.max = [minmaxPoint.max[0], minmaxPoint.max[2], minmaxPoint.max[1]];
                var featureTable = options.customFeatureTable;
                var tempPoints = [];
                var i;
                var j;
                var position = featureTable.position;
                var length = position.length;
                for (i = 0; i < length; i ++) {
                    tempPoints.push([minmaxPoint.min[0] + position[i][0], minmaxPoint.min[1] + position[i][1], minmaxPoint.min[2] + position[i][2]]);
                    tempPoints.push([minmaxPoint.min[0] + position[i][0], minmaxPoint.max[1] + position[i][1], minmaxPoint.min[2] + position[i][2]]);
                    tempPoints.push([minmaxPoint.max[0] + position[i][0], minmaxPoint.min[1] + position[i][1], minmaxPoint.min[2] + position[i][2]]);
                    tempPoints.push([minmaxPoint.max[0] + position[i][0], minmaxPoint.max[1] + position[i][1], minmaxPoint.min[2] + position[i][2]]);

                    tempPoints.push([minmaxPoint.max[0] + position[i][0], minmaxPoint.max[1] + position[i][1], minmaxPoint.max[2] + position[i][2]]);
                    tempPoints.push([minmaxPoint.max[0] + position[i][0], minmaxPoint.min[1] + position[i][1], minmaxPoint.max[2] + position[i][2]]);
                    tempPoints.push([minmaxPoint.min[0] + position[i][0], minmaxPoint.max[1] + position[i][1], minmaxPoint.max[2] + position[i][2]]);
                    tempPoints.push([minmaxPoint.min[0] + position[i][0], minmaxPoint.min[1] + position[i][1], minmaxPoint.max[2] + position[i][2]]);
                }
                if (featureTable.scale) {
                    var scale = featureTable.scale;
                    for (i = 0; i < length; i ++) {
                        for (j = 0; j < 8; j ++) {
                            tempPoints[i * 8 + j] = [tempPoints[i * 8 + j][0] * scale[i][0], tempPoints[i * 8 + j][1] * scale[i][1], tempPoints[i * 8 + j][2] * scale[i][2]];
                        }
                    }
                }
                if (featureTable.orientation) {
                    var orientation = featureTable.orientation;
                    var ps = new Array(8);
                    var m;
                    var rotate;
                    for (i = 0; i < length; i ++) {
                        rotate = orientation[i];
                        for (j = 0; j < 8; j ++) {
                            ps[j] = new Cartesian3(tempPoints[i * 8 + j][0], tempPoints[i * 8 + j][1], tempPoints[i * 8 + j][2]);
                        }
                        m = Matrix3.fromRotationZ(CMath.toRadians(rotate[2]));
                        for (j = 0; j < 8; j ++) {
                            ps[j] = Matrix3.multiplyByVector(m, ps[j], new Cartesian3());
                        }
                        m = Matrix3.fromRotationX(-CMath.toRadians(rotate[0]));
                        for (j = 0; j < 8; j ++) {
                            ps[j] = Matrix3.multiplyByVector(m, ps[j], new Cartesian3());
                        }
                        m = Matrix3.fromRotationY(CMath.toRadians(rotate[1]));
                        for (j = 0; j < 8; j ++) {
                            ps[j] = Matrix3.multiplyByVector(m, ps[j], new Cartesian3());
                        }
                        for (j = 0; j < 8; j ++) {
                            tempPoints[i * 8 + j] = [ps[j].x, ps[j].y, ps[j].z];
                        }
                    }
                }

                minmaxPoint = getPoint3MinMax(tempPoints);
                var width = minmaxPoint.max[0] - minmaxPoint.min[0];
                var height = minmaxPoint.max[1] - minmaxPoint.min[1];
                width = Math.ceil(width);
                height = Math.ceil(height);
                var offsetX = width / 2 + minmaxPoint.min[0];
                var offsetY = height / 2 + minmaxPoint.min[1];

                return new Promise(function(resolve) {
                    tilesetOptions.tileName = tileFullName;
                    tilesetOptions.tileWidth = defaultValue(tilesetOptions.tileWidth, width);
                    tilesetOptions.tileHeight = defaultValue(tilesetOptions.tileHeight, height);
                    tilesetOptions.transHeight = defaultValue(tilesetOptions.transHeight, -minmaxPoint.min[2]);
                    tilesetOptions.minHeight = defaultValue(tilesetOptions.minHeight, minmaxPoint.min[2] + tilesetOptions.transHeight);
                    tilesetOptions.maxHeight = defaultValue(tilesetOptions.maxHeight, minmaxPoint.max[2] + tilesetOptions.transHeight);
                    tilesetOptions.offsetX = defaultValue(tilesetOptions.offsetX, offsetX);
                    tilesetOptions.offsetY = defaultValue(tilesetOptions.offsetY, offsetY);
                    return resolve({
                        i3dm : result.i3dm,
                        batchTableJson: result.batchTableJson,
                        tilesetJson : createSingleTileset(tilesetOptions),
                        tilePath : tilePath,
                        tilesetPath : tilesetPath
                    });
                });
            });
        }
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
