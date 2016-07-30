/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*
 *  ComponentJS debugger hooking
 */

/*  hook into internal logging  */
_cs.latch("ComponentJS:log", function (msg) {
    var logged = false;
    if (_cs.dbg !== null) {
        _cs.dbg_log(msg);
        logged = true;
    }
    return logged;
});

/*  hook into state changes  */
_cs.latch("ComponentJS:state-change", function () {
    _cs.dbg_update();
});

/*  hook into state invalidation  */
_cs.latch("ComponentJS:state-invalidate", function (name) {
    _cs.dbg_state_invalidate(name);
});

