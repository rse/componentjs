/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  determine unique store id  */
_cs.store_id = function (comp) {
    var id = "ComponentJS:store:";
    if (   typeof GLOBAL.document !== "undefined"
        && typeof GLOBAL.document.location !== "undefined"
        && typeof GLOBAL.document.location.pathname === "string")
        id += GLOBAL.document.location.pathname;
    else
        id += "unknown-path";
    id += ":" + comp.path("/");
    return id;
};

/*  load store via optionally available Web Storage API  */
_cs.store_load = function (comp) {
    if (comp.__store === null) {
        if (   typeof GLOBAL.localStorage !== "undefined"
            && typeof GLOBAL.JSON !== "undefined") {
            var id = _cs.store_id(comp);
            var obj = GLOBAL.localStorage.getItem(id);
            if (typeof obj === "string")
                comp.__store = GLOBAL.JSON.parse(obj);
        }
        if (   comp.__store === null
            || typeof comp.__store !== "object")
            comp.__store = {};
    }
};

/*  save store via optionally available Web Storage API  */
_cs.store_save = function (comp) {
    if (comp.__store !== null) {
        if (   typeof GLOBAL.localStorage !== "undefined"
            && typeof GLOBAL.JSON !== "undefined") {
            var id = _cs.store_id(comp);
            var obj = GLOBAL.JSON.stringify(comp.__store);
            if (obj === "{}")
                GLOBAL.localStorage.removeItem(id);
            else
                GLOBAL.localStorage.setItem(id, obj);
        }
    }
};

/*  generic pattern for store management  */
$cs.pattern.store = $cs.trait({
    dynamics: {
        __store: null
    },
    protos: {
        store: function () {
            var key, val;
            if (arguments.length === 0) {
                /*  get all keys  */
                _cs.store_load(this);
                var keys = [];
                for (key in this.__store)
                    keys.push(key);
                return keys;
            }
            else if (arguments.length === 1 && arguments[0] === null) {
                /*  clear store  */
                this.__store = {};
                _cs.store_save(this);
                return null;
            }
            else if (arguments.length === 1 && typeof arguments[0] === "string") {
                /*  get value  */
                _cs.store_load(this);
                key = arguments[0];
                if (typeof this.__store[key] === "undefined")
                    return null;
                else
                    return this.__store[key];
            }
            else if (arguments.length === 2 && arguments[1] === null) {
                /*  delete value  */
                _cs.store_load(this);
                key = arguments[0];
                delete this.__store[key];
                _cs.store_save(this);
                return null;
            }
            else if (arguments.length === 2) {
                /*  set value  */
                _cs.store_load(this);
                key = arguments[0];
                val = arguments[1];
                this.__store[key] = val;
                _cs.store_save(this);
                return val;
            }
            else
                 throw _cs.exception("store", "invalid argument(s)");
        }
    }
});

