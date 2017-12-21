'use strict';

var Cesium = require('cesium');

var Cartesian3 = Cesium.Cartesian3;
var defined = Cesium.defined;
var defaultValue = Cesium.defaultValue;
var HeadingPitchRoll = Cesium.HeadingPitchRoll;
var Matrix4 = Cesium.Matrix4;
var Transforms = Cesium.Transforms;

module.exports = createSingleTileset;

/**
 * Create a tileset JSON.
 * 
 * @param {Object} options The object have follow properties.
 * @param {String} options.tileName The tile name of root.
 * @param {Number} [options.longitude=-1.31968] The longitute of tile origin point.
 * @param {Number} [options.latitude=0.698874] The latitute of tile origin point.
 * @param {Number} [options.minHeight=0.0] The minimum height of the tile.
 * @param {Number} [options.maxHeight=40.0] The maximum height of the tile. 
 * @param {Number} [options.tileWidth=200.0] The horizontal length (cross longitude) of tile.
 * @param {Number} [options.tileHeight=200.0] The virtical length (cross latitude) of tile.
 * @param {Number} [options.transHeight=0.0] The transform height of the tile.
 * @param {String} [options.gltfUpAxis="Y"] The up axis of model.
 * @param {Object} [options.properties] Pre-model properties.
 * @param {Number} [options.geometricError = 200.0] The geometric error of tile.
 * @param {Matrix4} [options.transfrom] The tile transform.
 * @param {Boolean} [options.region = true] Using bounding region for tile.
 * @param {Boolean} [options.box] Using bounding box for tile.
 * @param {Boolean} [options.sphere] Using bounding sphere for tile.
 * 
 */
function createSingleTileset(options) {
    var longitude = defaultValue(options.longitude, -1.31968);
    var latitude = defaultValue(options.latitude, 0.698874);
    var minHeight = defaultValue(options.minHeight, 0.0);
    var maxHeight = defaultValue(options.maxHeight, 40.0);
    var transHeight = defaultValue(options.transHeight, 0.0);
    var tileWidth = defaultValue(options.tileWidth, 200.0);
    var tileHeight = defaultValue(options.tileHeight, 200.0);
    var offsetX = defaultValue(options.offsetX, 0.0);
    var offsetY = defaultValue(options.offsetY, 0.0);
    var upAxis = defaultValue(options.gltfUpAxis, 'Y');
    var properties = defaultValue(options.properties, undefined);
    var geometricError = defaultValue(options.geometricError, 200.0);
    var tileTransform = wgs84Transform(longitude, latitude, transHeight);
    var transform = defaultValue(options.transfrom, tileTransform);
    var transformArray = (defined(transform) && !Matrix4.equals(transform, Matrix4.IDENTITY)) ? Matrix4.pack(transform, new Array(16)) : undefined;
    var height = maxHeight - minHeight;

    if(!(options.region||options.box||options.sphere)) {
        options.region = true;
    }
    var boundingVolume;
    if(options.region) {
        var longitudeExtent = metersToLongitude(tileWidth, latitude);
        var latitudeExtent = metersToLatitude(tileHeight);

        var west = longitude - longitudeExtent / 2 + offsetX / tileWidth * longitudeExtent;
        var south = latitude - latitudeExtent / 2 - offsetY / tileHeight * latitudeExtent;
        var east = longitude + longitudeExtent / 2 + offsetX / tileWidth * longitudeExtent;
        var north = latitude + latitudeExtent / 2 - offsetY / tileHeight * latitudeExtent;

        boundingVolume = {
            region : [
                west,
                south,
                east,
                north,
                minHeight,
                maxHeight
            ]
        };
    }
    else if (options.box) {
        boundingVolume = {
            box : [
                offsetX, -offsetY, height / 2 + minHeight,       // center
                tileWidth / 2, 0, 0,                 // width
                0, tileHeight / 2, 0,                // depth
                0, 0, height / 2                     // height
            ]
        };
    }
    else if (options.sphere) {
        boundingVolume = {
            sphere : [
                offsetX, -offsetY, height / 2 + minHeight,
                Math.sqrt(tileWidth * tileWidth / 4 + tileHeight * tileHeight / 4 + height * height / 4)
            ]
        };
    }

    var tilesetJson = {
        asset : {
            version : '0.0',
            tilesetVersion : '1.0.0-obj23dtiles',
            gltfUpAxis : upAxis
        },
        properties : properties,
        geometricError : geometricError,
        root : {
            transform : transformArray,
            boundingVolume : boundingVolume,
            geometricError : 0.0,
            refine : 'ADD',
            content : {
                url : options.tileName
            }
        }
    };

    return tilesetJson;
}

function metersToLongitude(meters, latitude) {
    return meters * 0.000000156785 / Math.cos(latitude);
}

function metersToLatitude(meters) {
    return meters * 0.000000157891;
}

function wgs84Transform(longitude, latitude, height) {
    return Transforms.headingPitchRollToFixedFrame(Cartesian3.fromRadians(longitude, latitude, height), new HeadingPitchRoll());
}
