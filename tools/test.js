'use strict';

var util = require('util');
var exec = util.promisify(require('child_process').exec);

var commands = [
    'node ./bin/obj23dtiles.js -i ./bin/barrel/barrel.obj',
    'node ./bin/obj23dtiles.js -i ./bin/barrel/barrel.obj -b',
    'node ./bin/obj23dtiles.js -i ./bin/barrel/barrel.obj --b3dm',
    'node ./bin/obj23dtiles.js -i ./bin/barrel/barrel.obj --b3dm --outputBatchTable',
    'node ./bin/obj23dtiles.js -i ./bin/barrel/barrel.obj -c ./bin/barrel/customBatchTable.json --b3dm',
    'node ./bin/obj23dtiles.js -i ./bin/barrel/barrel.obj -f ./bin/barrel/customFeatureTable.json --i3dm',
    'node ./bin/obj23dtiles.js -i ./bin/barrel/barrel.obj -f ./bin/barrel/customFeatureTable.json -c ./bin/barrel/customI3dmBatchTable.json --i3dm',
    'node ./bin/obj23dtiles.js -i ./bin/barrel/barrel.obj --tileset',
    'node ./bin/obj23dtiles.js -i ./bin/barrel/barrel.obj --tileset -p ./bin/barrel/customTilesetOptions.json -c ./bin/barrel/customBatchTable.json',
    'node ./bin/obj23dtiles.js -i ./bin/barrel/barrel.obj --tileset --i3dm -f ./bin/barrel/customFeatureTable.json',
    'node ./bin/obj23dtiles.js -i ./bin/barrel/barrel.obj --tileset --i3dm -f ./bin/barrel/customFeatureTable.json -p ./bin/barrel/customTilesetOptions.json -c ./bin/barrel/customI3dmBatchTable.json',
];

var errcount = 0;
var finished = 0;
function logout(stdout, error, command) {
    if(error || stdout.stderr) {
        console.error(command , error, stdout.stderr);
        errcount ++;
    } else {
        console.log(command, stdout.stdout);
    }

    finished ++;
    if(finished === commands.length) {console.log('all down! ' + (errcount ? ('error: ' + error) : 'passed.'));}
}

function test() {
    commands.forEach( function(command) {
        exec(command).then( function(out, err) { logout(out, err, command); });
    });
}

test();
