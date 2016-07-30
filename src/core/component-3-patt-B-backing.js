/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern: backing object  */
$cs.pattern.backing = $cs.trait({
    dynamics: {
        __obj: null
    },
    protos: {
        /*  get/set corresponding object  */
        obj: function (obj) {
            if (typeof obj === "undefined")
                /*  get current object  */
                return this.__obj;
            else if (typeof obj === "object") {
                /*  set new object  */
                if (obj !== null) {
                    _cs.annotation(obj, "comp", this);
                    this.__obj = obj;
                }
                else {
                    if (this.__obj !== null)
                        _cs.annotation(this.__obj, "comp", null);
                    this.__obj = null;
                }
            }
            else
                throw _cs.exception("obj", "invalid argument");
            return this;
        },

        /*  get/set attribute in corresponding object  */
        access: function (name, value) {
            /*  sanity check scenario  */
            if (typeof name === "undefined")
                throw _cs.exception("access", "no attribute name given");
            var obj = this.obj();
            if (obj === null)
                throw _cs.exception("access", "still no object attached");
            if (typeof obj[name] === "undefined")
                throw _cs.exception("access", "invalid attribute \"" + name + "\"");

            /*  access the attribute  */
            var value_old = obj[name];
            if (typeof value !== "undefined")
                obj[name] = value;
            return value_old;
        },

        /*  invoke method on corresponding object  */
        invoke: function (name) {
            /*  sanity check scenario  */
            if (typeof name === "undefined")
                throw _cs.exception("invoke", "no method name given");
            var obj = this.obj();
            if (obj === null)
                throw _cs.exception("invoke", "still no object attached");
            if (typeof obj[name] === "undefined")
                throw _cs.exception("invoke", "invalid method \"" + name + "\"");
            if (_cs.istypeof(obj[name]) !== "function")
                throw _cs.exception("invoke", "anything named \"" + name + "\" existing, but not a function");

            /*  call method  */
            var args = _cs.slice(arguments, 1);
            return obj[name].apply(obj, args);
        }
    }
});

