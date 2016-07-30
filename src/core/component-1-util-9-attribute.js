/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  for defining getter/setter style attributes  */
$cs.attribute = function () {
    /*  determine parameters  */
    var params = $cs.params("attribute", arguments, {
        name:  { pos: 0, req: true,      valid: "string"                   },
        def:   { pos: 1, req: true,      valid: "any"                      },
        valid: { pos: 2, def: undefined, valid: "(function|RegExp|string)" }
    });

    /*  return closure-based getter/setter method  */
    return _cs.proxy({ value: params.def }, function (value_new) {
        /*  remember old value  */
        var value_old = this.value;

        /*  act on new value if given  */
        if (arguments.length > 0) {
            /*  check whether new value is valid  */
            if (typeof params.valid !== "undefined")
                if (!$cs.validate(value_new, params.valid))
                    throw _cs.exception("attribute",
                        "invalid value \"" + value_new + "\" " +
                        "for attribute \"" + params.name + "\"");

            /*  set new value  */
            this.value = value_new;

            /*  optionally notify observers  */
            var obj = this.__this__;
            if (   typeof obj !== "undefined"
                && typeof obj.notify === "function")
                obj.notify.call(obj, "attribute:set:" + params.name, value_new, value_old, params.name);
        }

        /*  return old value  */
        return value_old;
    }, true);
};

