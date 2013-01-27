/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  for defining getter/setter style attributes  */
$cs.attribute = function () {
    /*  determine parameters  */
    var params = $cs.params("attribute", arguments, {
        name:     { pos: 0, def: null, req: true  },
        def:      { pos: 1, def: null, req: true  },
        validate: { pos: 2, def: null             }
    });

    /*  return closure-based getter/setter method  */
    return _cs.proxy({ value: params.def }, function (value_new, validate_only) {
        /*  remember old value  */
        var value_old = this.value;

        /*  act on new value if given  */
        if (arguments.length > 0) {
            /*  check whether new value is valid  */
            var is_valid = true;
            if (params.validate !== null) {
                /*  case 1: plain type comparison  */
                if (   typeof params.validate === "string"
                    || typeof params.validate === "boolean"
                    || typeof params.validate === "number" )
                    is_valid = (value_new === params.validate);

                /*  case 2: regular expression string match  */
                else if (   typeof params.validate === "object"
                         && params.validate instanceof RegExp  )
                    is_valid = params.validate.test(value_new);

                /*  case 3: flexible callback function check  */
                else if (typeof params.validate === "function")
                    is_valid = params.validate(value_new, value_old, validate_only, params.name);

                /*  otherwise: error  */
                else
                    throw _cs.exception("attribute",
                        "validation value \"" + params.validate + "\" " +
                        "for attribute \"" + params.name + "\" " +
                        "is of unsupported type \"" + (typeof params.validate) + "\"");
            }

            /*  either return validation result...  */
            if (typeof validate_only !== "undefined" && validate_only)
                return is_valid;

            /*  ...or set new valid value...  */
            else if (is_valid) {
                /*  set new value  */
                this.value = value_new;

                /*  optionally notify observers  */
                var obj = this.__this__;
                if (   typeof obj !== "undefined"
                    && typeof obj.notify === "function")
                    obj.notify.call(obj, "attribute:set:" + params.name, value_new, value_old, params.name);
            }

            /*  ...or throw an exception  */
            else
                throw _cs.exception("attribute",
                    "invalid value \"" + value_new + "\" " +
                    "for attribute \"" + params.name + "\"");
        }

        /*  return old value  */
        return value_old;
    }, true);
};

