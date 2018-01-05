# Using as module in node.

Install package from npm.

```
    npm install obj23dtiles
```

## Convert to `.gltf`

```javascript
    var obj23dtiles = require('obj23dtiles');

    var objPath = './bin/barrel/barrel.obj';
    var gltfPath = './bin/barrel/barrel.gltf';
    obj23dtiles(objPath, gltfPath);
```

## Convert to `.glb`

```javascript
    var obj23dtiles = require('obj23dtiles');

    var objPath = './bin/barrel/barrel.obj';
    var glbPath = './bin/barrel/barrel.glb';
    obj23dtiles(objPath, glbPath, {binary: true});
```

## Convert to `.b3dm`

```javascript
    var obj23dtiles = require('obj23dtiles');

    var objPath = './bin/barrel/barrel.obj';
    var b3dmPath = './bin/barrel/barrel.b3dm';
    obj23dtiles(objPath, b3dmPath, {b3dm: true});
```

Or use custom BatchTable.

```javascript
    var obj23dtiles = require('obj23dtiles');

    var objPath = './bin/barrel/barrel.obj';
    var b3dmPath = './bin/barrel/barrel.b3dm';
    var customBatchTable = './bin/barrel/customBatchTable.json' // file or JS Object.
    obj23dtiles(objPath, b3dmPath, {
        b3dm: true,
        customBatchTable: customBatchTable
    });
```

## Convert to `.i3dm`

```javascript
    var obj23dtiles = require('obj23dtiles');

    var objPath = './bin/barrel/barrel.obj';
    var i3dmPath = './bin/barrel/barrel.i3dm';
    obj23dtiles(objPath, i3dmPath, {
        i3dm: true,
        customFeatureTable: {
            position: [
                [0, 0, 0],
                [20, 0, 0]
            ],
            orientation: [
                [0, 0, 0],
                [0, 0, 45]
            ],
            scale: [
                [1, 1, 1],
                [0.8, 0.8, 0.8]
            ]
        }
    });
```

Or use custom BatchTable.

```javascript
    var obj23dtiles = require('obj23dtiles');

    var objPath = './bin/barrel/barrel.obj';
    var i3dmPath = './bin/barrel/barrel.i3dm';
    obj23dtiles(objPath, i3dmPath, {
        i3dm: true,
        customFeatureTable: {
            position: [
                [0, 0, 0],
                [20, 0, 0]
            ],
            orientation: [
                [0, 0, 0],
                [0, 0, 45]
            ],
            scale: [
                [1, 1, 1],
                [0.8, 0.8, 0.8]
            ]
        },
        customBatchTable: {
            name: [
                'modelNormal',
                'modelModified'
            ],
            id: [
                0,
                1
            ]
        }
    });
```

## Convert to tileset

* Convert to `.b3dm` tileset.

```javascript
    var obj23dtiles = require('obj23dtiles');

    var objPath = './bin/barrel/barrel.obj';
    var tilesetPath = './bin/barrel/barrel.b3dm';
    obj23dtiles(objPath, tilesetPath, {tileset: true});
```

Or use custom tileset options and BatchTable.

```javascript
    var obj23dtiles = require('obj23dtiles');

    var objPath = './bin/barrel/barrel.obj';
    var tilesetPath = './bin/barrel/barrel.b3dm';
    obj23dtiles(objPath, tilesetPath, {
        tileset: true,
        tilesetOptions: {
            longitude:      -1.31968,
            latitude:       0.698874,
            transHeight:    0.0,
            minHeight:      0.0,
            maxHeight:      40.0,
            tileWidth:      200.0,
            tileHeight:     200.0,
            geometricError: 200.0,
            region:         true
        },
        customBatchTable: { // Cause default BatchTable 'batchId' length is 14
            name: [
                'model1',
                'model2',
                'model3',
                'model4',
                'model5',
                'model6',
                'model7',
                'model8',
                'model9',
                'model10',
                'model11',
                'model12',
                'model13',
                'model14'
            ]
        }
    });
```

* Convert to `.i3dm` tileset.

```javascript
    var obj23dtiles = require('obj23dtiles');

    var objPath = './bin/barrel/barrel.obj';
    var tilesetPath = './bin/barrel/barrel.i3dm';
    obj23dtiles(objPath, tilesetPath, {
        tileset: true,
        i3dm: true,
        customFeatureTable: {
            position: [
                [0, 0, 0],
                [20, 0, 0]
            ],
            orientation: [
                [0, 0, 0],
                [0, 0, 45]
            ],
            scale: [
                [1, 1, 1],
                [0.8, 0.8, 0.8]
            ]
        }
    });
```

Or use custom tileset options and BatchTable.

```javascript
    var obj23dtiles = require('obj23dtiles');

    var objPath = './bin/barrel/barrel.obj';
    var tilesetPath = './bin/barrel/barrel.i3dm';
    obj23dtiles(objPath, tilesetPath, {
        tileset: true,
        i3dm: true,
        customFeatureTable: {
            position: [
                [0, 0, 0],
                [20, 0, 0]
            ],
            orientation: [
                [0, 0, 0],
                [0, 0, 45]
            ],
            scale: [
                [1, 1, 1],
                [0.8, 0.8, 0.8]
            ]
        },
        tilesetOptions: {
            longitude:      -1.31968,
            latitude:       0.698874,
            transHeight:    0.0,
            minHeight:      0.0,
            maxHeight:      40.0,
            tileWidth:      200.0,
            tileHeight:     200.0,
            geometricError: 200.0,
            region:         true
        },
        customBatchTable: {
            name: [
                'model1',
                'model2'
            ],
            id: [
                0,
                1
            ]
        }
    });
```

## Combine tilesets

```javascript
    var obj23dtiles = require('obj23dtiles');
    var fs = require('fs');

    var combine = obj23dtiles.combine;
    var outputPath = './bin/barrel/output/tileset.json';

    combine({inputDir : './bin/barrel/output'})
        .then(function(result) {
            fs.writeFile(outputPath, JSON.stringify(result.tileset), 'utf8');
        })
        .catch(function(err) {
            console.log(err);
        });
```
