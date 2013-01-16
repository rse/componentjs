/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  singleton component: root of the tree */
_cs.root = new _cs.comp("<root>", null, []);

/*  singleton component: special return value on lookups */
_cs.none = new _cs.comp("<none>", null, []);

/*  reasonable error catching for _cs.none usage
    ATTENTION: method "exists" intentionally is missing here,
               because it is required to be called on _cs.none, of course!  */
var methods = [
    "create", "destroy", "guard", "hook", "invoke",
    "latch", "link", "listen", "listening", "model", "notify", "observe",
    "plug", "property", "publish", "register", "service_enabled", "socket",
    "spool", "spooled", "state", "state_compare", "store", "subscribe",
    "subscribers", "touch", "unlatch", "unlisten", "unobserve", "unplug",
    "unregister", "unspool", "unsubscribe", "value", "values"
];
_cs.foreach(methods, function (method) {
    _cs.none[method] = function () {
        throw _cs.exception(method, "no such component");
    };
});

