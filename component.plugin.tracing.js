/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*
 *  This is a small ComponentJS plugin which traces all component tree
 *  communications.
 */

/*global ComponentJS:false */
/*jshint unused:false */

ComponentJS.plugin("tracing", function (_cs, $cs, GLOBAL) {
    /*  mixin this trait to all components  */
    _cs.latch("ComponentJS:lookup", function (comp) {
    });
});

