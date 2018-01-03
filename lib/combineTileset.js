'use strict';
var Cesium = require('cesium');
var fsExtra = require('fs-extra');
var path = require('path');

var Matrix4 = Cesium.Matrix4;
var defaultValue = Cesium.defaultValue;
var defined = Cesium.defined;
var Cartesian3 = Cesium.Cartesian3;
var Cartographic = Cesium.Cartographic;

module.exports = combineTileset;

/**
 * Combie tileset into one tileset json.
 * 
 * @param {Object} options Object with following properties.
 * @param {String} options.inputDir Input directory include tilesets.
 * @param {String} [options.outputTileset="tileset.json"] Output tileset file path.
 */
function combineTileset(options) {
    var west = Number.POSITIVE_INFINITY;
    var south = Number.POSITIVE_INFINITY;
    var north = Number.NEGATIVE_INFINITY;
    var east = Number.NEGATIVE_INFINITY;
    var minBox = [Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY];
    var maxBox = [Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY];
    var minheight = Number.POSITIVE_INFINITY;
    var maxheight = Number.NEGATIVE_INFINITY;
    var inputDir = defaultValue(options.inputDir, './');
    var outputTileset = defaultValue(options.outputDir, path.join(inputDir, 'tileset.json'));

    var geometricError = 500;
    var children = [];
    var promises = [];
    var jsonFiles = [];
    inputDir = path.normalize(inputDir);
    outputTileset = path.normalize(outputTileset);
    var outputDir = path.dirname(outputTileset);
	var gltfUpAxis = "Y";
	var transform;

    getJsonFiles(inputDir, jsonFiles);
    jsonFiles.forEach(function(jsonFile) {
        var promise = fsExtra.readJson(jsonFile)
            .then(function(json) {
                if(!json.root) {return Promise.resolve();}
                var boundingVolume = json.root.boundingVolume;
                var geometricError = json.geometricError;
				transform = json.root.transform;
                var refine = json.root.refine;

				gltfUpAxis = json.asset.gltfUpAxis;
                if (defined(boundingVolume) && defined(geometricError)) {
                    // Use external tileset instand of b3dm.
                    var url = path.relative(outputDir, jsonFile);
                    url = url.replace(/\\/g, '/');

                    // Only support region for now.
                    if(boundingVolume.region) {
                        west = Math.min(west, boundingVolume.region[0]);
                        south = Math.min(south, boundingVolume.region[1]);
                        east = Math.max(east, boundingVolume.region[2]);
                        north = Math.max(north, boundingVolume.region[3]);
                        minheight = Math.min(minheight, boundingVolume.region[4]);
                        maxheight = Math.max(maxheight, boundingVolume.region[5]);
                    }else if(boundingVolume.box)
                    {
                        var tempMin = [boundingVolume.box[0]-boundingVolume.box[3]/2,
                            boundingVolume.box[1]-boundingVolume.box[7]/2,
                            boundingVolume.box[2]-boundingVolume.box[11]/2];
                        var tempMax = [boundingVolume.box[0]+boundingVolume.box[3]/2,
                            boundingVolume.box[1]+boundingVolume.box[7]/2,
                            boundingVolume.box[2]+boundingVolume.box[11]/2];
                        minBox = [tempMin[0]<minBox[0]?tempMin[0]:minBox[0],
                            tempMin[1]<minBox[1]?tempMin[1]:minBox[1],
                            tempMin[2]<minBox[2]?tempMin[2]:minBox[2]];
						
                        maxBox = [tempMax[0]>maxBox[0]?tempMax[0]:maxBox[0],
                            tempMax[1]>maxBox[1]?tempMax[1]:maxBox[1],
                            tempMax[2]>maxBox[2]?tempMax[2]:maxBox[2]];
                    }

                    var child = {
                        'boundingVolume': boundingVolume,
                        'geometricError': geometricError,
                        'refine': refine,
                        'content': {
                            'url': url
                        }
                    };
                    children.push(child);
                }
            })
            .catch(function(err) {
                throw Error(err);
            });

        promises.push(promise);
    });

    return Promise.all(promises).then(function() {
		var tileset;
        if(minBox === [Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY])
        {
            tileset = {
                'asset': {
                    'version': '0.0',
                    'tilesetVersion': '1.0.0-obj23dtiles',
                    'gltfUpAxis': gltfUpAxis
                },
                'geometricError': geometricError,
                'root': {
                    'boundingVolume': {
                        'region': [
                            west,
                            south,
                            east,
                            north,
                            minheight,
                            maxheight
                        ]
                    },
                    'refine': 'ADD',
                    'geometricError': geometricError,
                    'children': children
                }
            };
        }else
		{
			var center = new Cartesian3((minBox[0]+maxBox[0])/2,(minBox[1]+maxBox[1])/2,(minBox[2]+maxBox[2])/2);
            if(transform !== undefined)
            {
                var transformArray = (defined(transform) && !Matrix4.equals(transform, Matrix4.IDENTITY)) ? Matrix4.pack(transform, new Array(16)) : undefined;
                center = Matrix4.multiplyByPoint(transformArray, center, new Cartesian3());
            }
            tileset = {
                'asset': {
                    'version': '0.0',
                    'tilesetVersion': '1.0.0-obj23dtiles',
                    'gltfUpAxis': gltfUpAxis
                },
                'geometricError': geometricError,
                'root': {
                    'boundingVolume': {
                        'box': [
                            center.x,center.y,center.z,
                            maxBox[0]-minBox[0],0,0,
                            0,maxBox[1]-minBox[1],0,
                            0,0,maxBox[2]-minBox[2]
                        ]
                    },
                    'refine': 'ADD',
                    'geometricError': geometricError,
                    'children': children
                }
            };
		}
        return Promise.resolve({
            tileset: tileset,
            output: outputTileset
        });
    });
}

function getJsonFiles(dir, jsonFiles) {
    var files = fsExtra.readdirSync(dir);
    files.forEach(function (itm) {
        var fullpath = path.join(dir, itm);
        var stat = fsExtra.statSync(fullpath);
        if (stat.isDirectory()) {
            readFileList(fullpath, jsonFiles);
        }
    });
}

function readFileList(dir, jsonFiles) {
    var files = fsExtra.readdirSync(dir);
    files.forEach(function (itm) {
        var fullpath = path.join(dir, itm);
        var stat = fsExtra.statSync(fullpath);
        if (stat.isDirectory()) {
            readFileList(fullpath, jsonFiles);
        } else {
            var ext = path.extname(fullpath);
            if (ext === '.json'){
                jsonFiles.push(fullpath);
            }
        }
    });
}
