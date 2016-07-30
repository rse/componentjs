/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  global API function: promise-based sleeping  */
$cs.sleep = function () {
    /*  determine parameters  */
    var params = $cs.params("sleep", arguments, {
        ms: { pos: 0, req: true, valid: "number" }
    });

    /*  create promise around setTimeout  */
    return new $cs.promise(function (fulfill, reject) {
        /* global setTimeout: false */
        setTimeout(function () {
            fulfill();
        }, params.ms);
    });
};

