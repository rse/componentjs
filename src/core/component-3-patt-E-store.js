/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  load store via optional plugin  */
_cs.store_load = function (comp) {
    if (comp.__store === null) {
        _cs.hook("ComponentJS:store-load", "none", comp);
        if (   comp.__store === null
            || typeof comp.__store !== "object")
            comp.__store = {};
    }
};

/*  save store via optional plugin  */
_cs.store_save = function (comp) {
    if (comp.__store !== null)
        _cs.hook("ComponentJS:store-save", "none", comp);
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

