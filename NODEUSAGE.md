# Using as module in node.

## Convert to `.gltf`

```javascript
    var obj23dtiles = require('./lib/obj23dtiles');

    var objPath = './bin/barrel/barrel.obj';
    var gltfPath = './bin/barrel/barrel.gltf';
    obj23dtiles(objPath, gltfPath);
```

## Convert to `.glb`

```javascript
    var obj23dtiles = require('./lib/obj23dtiles');

    var objPath = './bin/barrel/barrel.obj';
    var glbPath = './bin/barrel/barrel.glb';
    obj23dtiles(objPath, glbPath, {binary: true});
```

## Convert to `.b3dm`

```javascript
    var obj23dtiles = require('./lib/obj23dtiles');

    var objPath = './bin/barrel/barrel.obj';
    var b3dmPath = './bin/barrel/barrel.b3dm';
    obj23dtiles(objPath, glbPath, {b3dm: true});
```

Or use custom batchtable.

```javascript
    var obj23dtiles = require('./lib/obj23dtiles');

    var objPath = './bin/barrel/barrel.obj';
    var b3dmPath = './bin/barrel/barrel.b3dm';
    var customBatchTable = './bin/barrel/customBatchTbale.json'
    obj23dtiles(objPath, glbPath, {
        b3dm: true,
        customBatchTable: customBatchTable
    });
```

## Convert to tileset

```javascript
    var obj23dtiles = require('./lib/obj23dtiles');

    var objPath = './bin/barrel/barrel.obj';
    var tilesetPath = './bin/barrel/barrel.b3dm';
    obj23dtiles(objPath, tilesetPath, {tileset: true});
```

Or use custom tileset options.

```javascript
    var obj23dtiles = require('./lib/obj23dtiles');

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
        }
    });
```

## Combine tilesets

```javascript
    var fs = require('fs');
    var combine = require('../lib/combineTileset');

    combine({inputDir : './bin/tilesets/'})
        .then(function(tileset) {
            fs.writeFile('./bin/tilesets/tileset.json', JSON.stringify(tileset), 'utf8');
        })
        .catch(function(err) {
            console.log(err);
        });
```
