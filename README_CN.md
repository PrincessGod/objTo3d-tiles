# objTo3d-tiles
将 obj 模型转换为 3D Tiles 的 Node 命令行工具以及 Node 模块， 基于[obj2gltf](https://github.com/AnalyticalGraphicsInc/obj2gltf)。

[在线示例](https://princessgod.github.io/plc/batchedTileset.html)

>注意: 目前只支持 `.b3dm` 和 `.i3dm` ！
>
>请使用 Cesium v1.37 或以后版本, 因为这里的 3D Tiles 使用 glTF2.0 。

## 开始使用

确保已经安装 [Node](https://nodejs.org/en/) , 然后

```
npm install -g obj23dtiles
```

### 基本用法

* 转换 `.obj` 为 `.gltf`

```
obj23dtiles -i ./bin/barrel/barrel.obj
// 在模型目录导出 barrel.gltf
```

* 转换 `.obj` 为 `.glb`

```
obj23dtiles -i ./bin/barrel/barrel.obj -b
// 在模型目录导出 barrel.glb
```

>注意: 更多 `.gltf` 和 `.glb` 的转换信息可以在 [obj2gltf](https://github.com/AnalyticalGraphicsInc/obj2gltf) 查看。

>注意: 如果你的模型中包含透明纹理，请添加 `--checkTransparency` 参数。

>注意: 如果的模型使用 blinn-phong 材质, 当转换为PBR材质时使用遮蔽贴图会使模型看起来变暗。
>所以 `useOcclusion` (使用遮蔽贴图) 默认为 `false`, 如果你的模型本身就准备使用PBR材质，请加 `--useOcclusion` 参数，这里有一些对比图。

<p align="center"><img src ="./pics/useOcclusion.png" /></p>


* 转换 `.obj` 为 `.b3dm` 同时带有基础的[属性表](https://github.com/AnalyticalGraphicsInc/3d-tiles/blob/master/TileFormats/BatchTable/README.md), 包含 `batchId` 和 `name` 属性, `name` 就是模型建模时的名字。

```
obj23dtiles -i ./bin/barrel/barrel.obj --b3dm
// 在模型目录导出 barrel.b3dm
```

* 转换 `.obj` 为 `.b3dm`，同时导出默认的[属性表](https://github.com/AnalyticalGraphicsInc/3d-tiles/blob/master/TileFormats/BatchTable/README.md) (一个 JSON 文件)。可以从这个表中获取相关信息以便制作自定义属性表。

```
obj23dtiles -i ./bin/barrel/barrel.obj --b3dm --outputBatchTable
// 在模型目录导出 barrel.b3dm 和 barrel_batchTable.json
```

* 转换 `.obj` 为 `.b3dm`，使用自定义[属性表](https://github.com/AnalyticalGraphicsInc/3d-tiles/blob/master/TileFormats/BatchTable/README.md)。属性和模型对应关系靠 `batchId` 进行连接。

```
obj23dtiles -i ./bin/barrel/barrel.obj -c ./bin/barrel/customBatchTable.json --b3dm
// 在模型目录导出 barrel.b3dm
```

* 转换 `.obj` 为 `.i3dm`，使用自定义[要素表](https://github.com/AnalyticalGraphicsInc/3d-tiles/blob/master/TileFormats/Instanced3DModel/README.md#feature-table)。

```
obj23dtiles -i ./bin/barrel/barrel.obj -f ./bin/barrel/customFeatureTable.json --i3dm
// 在模型目录导出 barrel.i3dm
```

* 转换 `.obj` 为 `.i3dm`，使用自定义[要素表](https://github.com/AnalyticalGraphicsInc/3d-tiles/blob/master/TileFormats/Instanced3DModel/README.md#feature-table)和[属性表](https://github.com/AnalyticalGraphicsInc/3d-tiles/blob/master/TileFormats/Instanced3DModel/README.md#batch-table)。

```
obj23dtiles -i ./bin/barrel/barrel.obj -f ./bin/barrel/customFeatureTable.json
-c ./bin/barrel/customI3dmBatchTable.json --i3dm
// 在模型目录导出 barrel.i3dm
```

要素表目前可以使用以下属性控制模型 : `position`（位置），`orientation`（旋转），`scale`（缩放）。


### 创建单个瓦片

* 创建一个 `.b3dm` 瓦片。

```
obj23dtiles -i ./bin/barrel/barrel.obj --tileset
// 在模型目录导出 Batchedbarrel 文件夹
```

* 创建一个 `.b3dm` 瓦片，并自定义瓦片参数和属性表。

```
obj23dtiles -i ./bin/barrel/barrel.obj --tileset
-p ./bin/barrel/customTilesetOptions.json -c ./bin/barrel/customBatchTable.json
// 在模型目录导出 Batchedbarrel 文件夹
```

* 创建一个 `.i3dm` 瓦片。

```
obj23dtiles -i ./bin/barrel/barrel.obj --tileset --i3dm
-f ./bin/barrel/customFeatureTable.json
// 在模型目录导出 Instancedbarrel 文件夹
```

* 创建一个 `.i3dm` 瓦片，并自定义瓦片参数和属性表。

```
obj23dtiles -i ./bin/barrel/barrel.obj --tileset --i3dm
-f ./bin/barrel/customFeatureTable.json -p ./bin/barrel/customTilesetOptions.json
-c ./bin/barrel/customI3dmBatchTable.json
// 在模型目录导出 Instancedbarrel 文件夹
```

`customTilesetOptions.json` 配置文件可以包含以下信息, 这些都是虚拟值，请在文件中包含自己想修改的属性，没有出现的属性会根据模型自动计算。
```
{
    "longitude":      -1.31968,     // 瓦片原点(模型原点 (0,0,0)) 经度的弧度值。
    "latitude":       0.698874,     // 瓦片原点维度的弧度值。
    "transHeight":    0.0,          // 瓦片原点所在高度，单位为米。
    "region":         true,         // 使用 region 作为外包体。
    "box":            false,        // 使用 box 作为外包体。
    "sphere":         false         // 使用 sphere 作为外包体。
}
```
>注意: 如果你没有指明 `transHeight` 属性，你的模型会被放置在高度为0的地表，无论你模型最低点是什么值。比如你有一个飞机模型，它在1000单位高度，那就会被放置在地面上，同样的道理如果你有一个潜艇，都在原点以下，也会被抬升到地面上。所以如果你想保留原始模型的相对高度，可以设置 `transHeight = 0.0`。

这是不用的外包体示意图。
<p align="center"><img src ="./pics/boundingvolume.png" /></p>

### 捆绑瓦片
你可以将多个瓦片捆绑为一个瓦片，每个瓦片作为外置瓦片集合到一个 `tileset.json` 中。

```
obj23dtiles combine -i ./bin/barrel/output/
```

## 作为 Node 模块使用
如果你想调试此工具或者在node中使用，可以看看[如何作为Node模块使用](NODEUSAGE.md)。

## 测试
导航到项目文件夹下，运行
```
npm run test
```

## 问题定位
首先，确保你的 `.obj` 文件是完整的，通常情况下包含 `.obj`， `.mtl` 和纹理文件比如 `.jpg` 或 `.png`。
如果你使用的 Win10, 可以使用自带的模型浏览工具 “Mixed Reality Viewer” 浏览你的 `.obj` 文件，
或者使用这个[在线浏览工具](https://3dviewer.net/)。
<br />
<br />
其次，使用此工具导出 `.glb` 然后查看是否现实正常，你可以使用[Cesium](https://www.virtualgis.io/gltfviewer/) 或者 [Three.js](https://gltf-viewer.donmccurdy.com/) gltf 浏览器。
<br />
<br />
最后，直接导出 `.b3dm` 或瓦片然后在 Cesium 中加载。

## 样例数据
示例代码中的样例数据在 `.bin\barrel\` 文件夹下。

```
barrel\
    |
    - barrel.blend              --
    |                             |- Blender 工程文件和纹理
    - barrel.png                --
    |
    - barrel.obj                --
    |                             |- Obj 模型文件
    - barrel.mtl                --
    |
    - customBatchTable.json     ---- b3dm 使用的属性表例子
    |
    - customTilesetOptions.json ---- 自定义瓦片配置文件
    |
    - customFeatureTable.json   ---- i3dm 使用的要素表例子
    |
    - customI3dmBatchTable.json ---- i3dm 使用的属性表例子
    |
    - output\                   ---- 导出的数据
        |
        - barrel.glb
        |
        - barrel.gltf
        |
        - barrel_batchTable.json    ---- 默认属性表
        |
        - Batchedbarrel\            ---- 使用 b3dm 的瓦片
        |   |
        |   - tileset.json
        |   |
        |   - barrel.b3dm
        |
        - Instancedbarrel\          ---- 使用 i3dm 的瓦片
        |   |
        |   - tileset.json
        |   |
        |   - barrel.i3dm
        |
        - BatchedTilesets\          ---- 自定义配置文件的瓦片
            |
            - tileset.json
            |
            - barrel_withDefaultBatchTable.b3dm
            |
            - barrel_withCustonBatchTable.b3dm
```

## 相关资源
* 在线 glTF 浏览工具。 [Cesium](https://www.virtualgis.io/gltfviewer/)， [Three.js](https://gltf-viewer.donmccurdy.com/)。
* [Cesium](https://github.com/AnalyticalGraphicsInc/cesium)
* [3D Tiles](https://github.com/AnalyticalGraphicsInc/3d-tiles)
* [glTF](https://github.com/KhronosGroup/glTF)
