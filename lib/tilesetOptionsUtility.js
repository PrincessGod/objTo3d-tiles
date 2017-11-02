'use strict';

module.exports = {
    getPoint3MinMax : getPoint3MinMax
};

function getPoint3MinMax(points) {
    var min = new Array(3).fill(Number.POSITIVE_INFINITY);
    var max = new Array(3).fill(Number.NEGATIVE_INFINITY);
    for(var i = 0; i < points.length; i ++) {
        for (var j = 0; j < 3; j ++) {
            min[j] = Math.min(min[j], points[i][j]);
            max[j] = Math.max(max[j], points[i][j]);
        }
    }
    return {
        min : min,
        max : max
    };
}
