/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  utility function: concatenate array values  */
_cs.concat = function () {
    var target = [];
    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i];
        for (var j = 0; j < source.length; j++)
            target.push(source[j]);
    }
    return target;
};

/*  utility function: slice array values  */
_cs.slice = function (source, start, len) {
    var target = [];
    if (typeof len === "undefined")
        len = source.length;
    for (var i = start; i < len; i++)
        target.push(source[i]);
    return target;
};

/*  utility function: map array values  */
_cs.map = function (source, mapper) {
    var target = [];
    for (var i = 0; i < source.length; i++)
        target.push(mapper(source[i], i));
    return target;
};

/*  utility function: filter array values  */
_cs.filter = function (source, filter) {
    var target = [];
    for (var i = 0; i < source.length; i++)
        if (filter(source[i], i))
            target.push(source[i]);
    return target;
};

/*  utility function: iterate over values  */
_cs.foreach = function (source, callback) {
    for (var i = 0; i < source.length; i++)
        callback(source[i], i);
};

