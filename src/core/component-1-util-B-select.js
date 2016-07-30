/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  API function: select an arbitrary value via a path specification
    and either get the current value or set the new value  */
$cs.select = function (obj, spec, value) {
    /*  compile path specification (or use pre-compiled path)  */
    var path = (typeof spec === "string" ? _cs.select_parse(spec) : spec);

    /*  subset the object graph  */
    return (
          arguments.length === 2
        ? _cs.select_path(obj, path)
        : _cs.select_path(obj, path, value)
    );
};

/*  the internal compile cache  */
_cs.select_cache = {};

/*  compile a path specification into array of dereferencing steps  */
_cs.select_parse = function (spec) {
    var path = _cs.select_cache[spec];
    if (typeof path === "undefined") {
        path = [];
        var pos = 0;
        var txt = spec;
        var m;
        while (txt !== "") {
            if ((m = txt.match(/^\s*(?:\.)?\s*([a-zA-Z$0-9_][a-zA-Z$0-9_:-]*)/)) !== null)
                path.push(m[1]);
            else if ((m = txt.match(/^\s*\[\s*(\d+|\*{1,2})\s*\]/)) !== null)
                path.push(m[1]);
            else if ((m = txt.match(/^\s*\[\s*"((?:\\"|.)*?)"\s*\]/)) !== null)
                path.push(m[1].replace(/\\"/g, "\""));
            else if ((m = txt.match(/^\s*\[\s*'((?:\\'|.)*?)'\s*\]/)) !== null)
                path.push(m[1].replace(/\\'/g, "'"));
            else if ((m = txt.match(/^\s+$/)) !== null)
                break;
            else
                throw _cs.exception("select", "parse error: invalid character at: " +
                    spec.substr(0, pos) + "<" + txt.substr(0, 1) + ">" + txt.substr(1));
            pos += m[0].length;
            txt = txt.substr(m[0].length);
        }
        _cs.select_cache[spec] = path;
    }
    return path;
};

/*  subset an object graph  */
_cs.select_path = function (obj, path) {
    /*  handle special case of empty path */
    if (path.length === 0) {
        if (arguments.length === 3)
            throw _cs.exception("select", "cannot set value on empty path");
        else
            return obj;
    }

    /*  step into object graph according to path prefix  */
    var i = 0;
    while (i < path.length - 1) {
        if (typeof obj !== "object")
            throw _cs.exception("select", "cannot further dereference: no more intermediate objects in path");
        obj = obj[path[i++]];
    }

    /*  get the old value  */
    if (typeof obj !== "object")
        throw _cs.exception("select", "cannot further dereference: no object at end of path");
    var value_old = obj[path[i]];

    /*  optionally set new value  */
    if (arguments.length === 3) {
        var value_new = arguments[2];
        if (value_new === undefined) {
            /*  delete value from collection  */
            if (obj instanceof Array)
                obj.splice(parseInt(path[i], 10), 1);
            else
                delete obj[path[i]];
        }
        else
            /*  set value into collection  */
            obj[path[i]] = value_new;
    }

    return value_old;
};
