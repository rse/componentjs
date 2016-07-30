/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  global API function: promise-based polling  */
$cs.poll = function () {
    /*  determine parameters  */
    var params = $cs.params("poll", arguments, {
        check: { pos: 0, req: true, valid: "function"          },
        wait:  { pos: 1, def: 100,  valid: "(function|number)" },
        max:   { pos: 2, def: 600,  valid: "number"            }
    });

    /*  optionally on-the-fly provide waiting-promise  */
    if (typeof params.wait === "number") {
        params.wait = (function (wait) {
            return function () {
                return $cs.sleep(wait);
            };
        })(params.wait);
    }

    /*  create promise around a polling loop  */
    var check = params.check;
    var wait  = params.wait;
    var max   = params.max;
    return new $cs.promise(function (fulfill, reject) {
        var loop = function () {
            if      (max-- <= 0) reject();
            else if (check())    fulfill();
            else                 wait().then(loop);
        };
        loop();
    });
};

