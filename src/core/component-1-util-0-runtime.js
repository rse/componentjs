/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  utility function: create an exception string for throwing  */
_cs.exception = function (method, error) {
    var trace;

    /*  optionally log stack trace to console  */
    if ($cs.debug() > 0) {
        if (typeof GLOBAL.console === "object") {
            if (typeof GLOBAL.console.trace === "function")
                GLOBAL.console.trace();
            else if (   typeof GLOBAL.printStackTrace !== "undefined"
                     && typeof GLOBAL.console.log === "function") {
                trace = GLOBAL.printStackTrace();
                GLOBAL.console.log(trace.join("\n"));
            }
        }
    }

    /*  return Error exception object  */
    return new Error("[ComponentJS]: ERROR: " + method + ": " + error);
};

/*  utility function: logging via environment console  */
_cs.log = function (msg) {
    /*  try ComponentJS debugger  */
    if (_cs.hook("ComponentJS:log", "or", msg))
        { /* eslint no-empty: 0 */ } /*  do nothing, as plugins have already logged the message  */

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
    var debug_level = 0;
    return function (level, msg) {
        if (arguments.length === 0)
            /*  return old debug level  */
            return debug_level;
        else if (arguments.length === 1)
            /*  configure new debug level  */
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

