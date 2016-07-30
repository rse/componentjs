/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  define a state transition  */
$cs.transition = function () {
    /*  special case  */
    if (arguments.length === 1 && arguments[0] === null) {
        /*  remove all user-defined transitions  */
        _cs.states_clear();
        return;
    }

    /*  determine parameters  */
    var params = $cs.params("transition", arguments, {
        target: { pos: 0, req: true      },
        enter:  { pos: 1, req: true      },
        leave:  { pos: 2, req: true      },
        color:  { pos: 3, def: "#000000" },
        source: {         def: null      }
    });

    /*  add new state  */
    _cs.states_add(
        params.target,
        params.enter,
        params.leave,
        params.color,
        params.source
    );
};

/*  initialize state transition set with a reasonable default  */
$cs.transition("created",      "create",  "destroy",  "#cc3333"); /* created and attached to component tree */
$cs.transition("configured",   "setup",   "teardown", "#eabc43"); /* configured and wired */
$cs.transition("prepared",     "prepare", "cleanup",  "#f2ec00"); /* prepared and ready for rendering */
$cs.transition("materialized", "render",  "release",  "#6699cc"); /* rendered onto the DOM tree */
$cs.transition("visible",      "show",    "hide",     "#669933"); /* visible to the user */
$cs.transition("enabled",      "enable",  "disable",  "#336600"); /* enabled for interaction */

