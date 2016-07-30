/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  internal API  */
var _cs = function () {};

/*  external API  */
var $cs = function () {
    /*  under run-time just pass through to lookup functionality  */
    return _cs.hook("ComponentJS:lookup", "pass", _cs.lookup.apply(GLOBAL, arguments));
};

/*  pattern sub-namespace  */
$cs.pattern = {};

/*  top-level API method: change symbol of external API  */
$cs.symbol = (function () {
    /*  internal state  */
    var value_original; value_original = undefined;
    var symbol_current = null;

    /*  top-level API method  */
    return function (symbol) {
        /*  release old occupation  */
        if (symbol_current !== null)
            GLOBAL[symbol_current] = value_original;

        /*  perform new occupation  */
        if (typeof symbol === "undefined" || symbol === "")
            /*  occupy no global slot at all  */
            symbol_current = null;
        else {
            /*  occupy new global slot  */
            symbol_current = symbol;
            value_original = GLOBAL[symbol_current];
            GLOBAL[symbol_current] = $cs;
        }

        /*  return the global API  */
        return $cs;
    };
})();

/*  top-level API method: create a global namespace
    and optionally assign a value to the leaf object  */
$cs.ns = function (name, value) {
    /*  sanity check name argument  */
    if (typeof name !== "string" || name === "")
        throw "invalid namespace path";

    /*  determine path  */
    var path = name.split(".");
    var len = path.length;
    if (typeof value !== "undefined")
        len--;

    /*  iterate over the path and create missing objects  */
    var i = 0;
    var ctx = GLOBAL;
    while (i < len) {
        if (typeof ctx[path[i]] === "undefined")
            ctx[path[i]] = {};
        ctx = ctx[path[i++]];
    }

    /*  optionally assign a value to the leaf object  */
    if (typeof value !== "undefined") {
        ctx[path[i]] = value;
        ctx = value;
    }

    /*  return the leaf object  */
    return ctx;
};

