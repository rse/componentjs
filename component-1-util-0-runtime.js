/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  utility function: create an exception string for throwing  */
_cs.exception = function (method, error) {
    var trace;
    if (_cs.dbg !== null) {
        if (typeof printStackTrace !== "undefined") {
            trace = printStackTrace();
            _cs.dbg_log(trace.join("\n"));
        }
        else if (typeof GLOBAL.printStackTrace !== "undefined") {
            trace = GLOBAL.printStackTrace();
            _cs.dbg_log(trace.join("\n"));
        }
    }
    if (typeof console === "object") {
        if (typeof console.trace === "function")
            console.trace();
        else if (   typeof printStackTrace !== "undefined"
                 && typeof console.log === "function") {
            var trace = printStackTrace();
            console.log(trace.join("\n"));
        }
    }
    else if (typeof GLOBAL.console === "object") {
        if (typeof GLOBAL.console.trace === "function")
            GLOBAL.console.trace();
        else if (   typeof GLOBAL.printStackTrace !== "undefined"
                 && typeof GLOBAL.console.log === "function") {
            trace = GLOBAL.printStackTrace();
            GLOBAL.console.log(trace.join("\n"));
        }
    }
    return "[ComponentJS]: ERROR: " + method + ": " + error;
};

/*  utility function: minimal Pseudo Random Number Generator (PRNG)  */
_cs.prng = function (len, radix) {
    if (typeof radix === "undefined")
        radix = 256;
    var bytes = [];
    for (var i = 0; i < len; i++)
        bytes[i] = Math.floor(Math.random() * radix + 1);
    return bytes;
};

/*  utility function: logging via environment console  */
_cs.log = function (msg) {
    /*  try ComponentJS debugger  */
    if (_cs.dbg !== null)
        _cs.dbg_log(msg);

    /*  try Firebug-style console (in regular browser or Node)  */
    else if (   typeof GLOBAL.console     !== "undefined"
             && typeof GLOBAL.console.log !== "undefined")
        GLOBAL.console.log("[ComponentJS]: " + msg);

    /*  try API of Appcelerator Titanium  */
    else if (   typeof GLOBAL.Titanium         !== "undefined"
             && typeof GLOBAL.Titanium.API     !== "undefined"
             && typeof GLOBAL.Titanium.API.log === "function")
        GLOBAL.Titanium.API.log("[ComponentJS]: " + msg);
};

/*  utility function: debugging  */
$cs.debug = (function () {
    var debug_level = 9;
    return function (level, msg) {
        if (arguments.length === 1)
            /*  configure debugging  */
            debug_level = level;
        else {
            /*  perform runtime logging  */
            if (level <= debug_level) {
                /*  determine indentation based on debug level  */
                var indent = "";
                for (var i = 1; i < level; i++)
                    indent += "    ";

                /*  display debug message  */
                _cs.log("DEBUG[" + level + "]: " + indent + msg);
            }
        }
    };
})();

