/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  global API function: execute a usecase  */
$cs.drive = function () {
    /* global setTimeout: false */
    /* global clearTimeout: false */

    /*  determine parameters  */
    var params = $cs.params("drive", arguments, {
        name:       { pos: 0, req: true,    valid: "string" },
        conf:       { pos: 1, def: {},      valid: "object" },
        timeout:    { pos: 2, def: 10*1000, valid: "number" }
    });

    /*  sanity check usecase  */
    var uc = usecase[params.name];
    if (!_cs.isdefined(uc))
        throw _cs.exception("drive", "invalid usecase name \"" + params.name + "\"");

    /*  create promise  */
    var promise  = new $cs.promise();
    var response = promise.proxy;
    var resolved = false;

    /*  optionally reject promise on timeout  */
    var to = null;
    if (params.timeout > 0) {
        to = setTimeout(function () {
            to = null;
            if (!resolved) {
                /*  reject promise because of timeout  */
                resolved = true;
                $cs.debug(1, "drive: usecase \"" + params.name + "\", TIMEOUT after " + params.timeout + " ms");
                promise.reject(new Error("usecase \"" + params.name + "\": timeout"));
            }
        }, params.timeout);
    }

    /*  determine configuration  */
    var conf = {};
    _cs.extend(conf, uc.conf);
    _cs.extend(conf, params.conf);

    /*  execute usecase  */
    $cs.debug(1, "drive: usecase \"" + params.name + "\" (" + usecase[params.name].desc + "), EXECUTING" +
        (_cs.keysof(params.conf).length > 0 ? " with configuration " + _cs.json(params.conf) : "") +
        (params.timeout > 0 ? " and timeout of " + params.timeout + " ms" : ""));
    var result;
    try {
        result = uc.func.apply(conf, [ conf ]);
    }
    catch (ex) {
        if (!resolved) {
            /*  reject promise because of exception  */
            resolved = true;
            $cs.debug(1, "drive: usecase \"" + params.name + "\", EXCEPTION: " + ex.message);
            promise.reject(new Error("usecase \"" + params.name + "\": " + ex.message));
        }
    }

    /*  clear still pending timer  */
    if (to !== null) {
        clearTimeout(to);
        to = null;
    }

    /*  in case of no errors and no timeout, handle promise response  */
    if (!resolved) {
        if (   (typeof result === "object" || typeof result === "function")
            && typeof result.then === "function"                           )
            /*  replace our response promise with the given one  */
            response = result;
        else
            /*  fulfill our response promise  */
            promise.fulfill(true);
    }

    /*  log the regular reject of the promise, too  */
    response = response.then(null, function (e) {
        $cs.debug(1, "drive: usecase \"" + params.name + "\" failed: " + e);
        return e;
    });

    /*  return response promise  */
    return response;
};

