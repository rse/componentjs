/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  define a state transition  */
$cs.transition = function () {
    /*  special case  */
    if (arguments.length === 1 && arguments[0] === null) {
        /*  remove all user-defined transistions  */
        _cs.states_clear();
        return;
    }

    /*  determine parameters  */
    var params = $cs.params("transition", arguments, {
        target: { pos: 0,     def: null,  req: true },
        enter:  { pos: 1,     def: null,  req: true },
        leave:  { pos: 2,     def: null,  req: true },
        source: { pos: 3,     def: null             }
    });

    /*  add new state  */
    _cs.states_add(
        params.target,
        params.enter,
        params.leave,
        params.source
    );
};

/*  initialize state transition set with a reasonable default  */
$cs.transition("created",      "create",  "destroy"); /* created and attached to component tree */
$cs.transition("prepared",     "prepare", "cleanup"); /* prepared and ready for rendering */
$cs.transition("materialized", "render",  "release"); /* rendered onto the DOM tree */
$cs.transition("visible",      "show",    "hide"   ); /* visible to the user */
$cs.transition("enabled",      "enable",  "disable"); /* enabled and the user can operate on it */

