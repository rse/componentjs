/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern: specification  */
$cs.pattern.spec = $cs.trait({
    mixin: [
        /*  name-based identification (mandatory)  */
        $cs.pattern.name
    ],
    dynamics: {
        /*  key/value-based specification (optional)  */
        __spec: {}
    },
    protos: {
        /*  method: configure specification  */
        spec: function () {
            var spec = this.__spec;
            if (arguments.length === 0)
                return spec;
            else if (arguments.length === 1 && typeof arguments[0] === "string")
                return spec[arguments[0]];
            else {
                for (var i = 0; i < arguments.length; i++) {
                    if (typeof arguments[i] === "string") {
                        spec[arguments[i]] = arguments[i + 1];
                        i++;
                    }
                    else if (typeof arguments[i] === "object") {
                        for (var key in arguments[i])
                            if (_cs.isown(arguments[i], key))
                                spec[key] = arguments[i][key];
                    }
                }
            }
            return undefined;
        },

        /*  method: determine whether this object matches the name/spec patterns  */
        matches: function (name_pattern, spec_pattern) {
            /*  step 1: match mandatory name  */
            if (typeof name_pattern === "string") {
                if (this.name() !== name_pattern)
                    return false;
            }
            else if (   typeof name_pattern === "object"
                     && name_pattern instanceof RegExp) {
                if (!(this.name().match(name_pattern)))
                    return false;
            }
            else
                throw _cs.exception("matches", "invalid name pattern");

            /*  step 2: match optional specification  */
            var spec = this.__spec;
            for (var key in spec_pattern) {
                if (!_cs.isown(spec_pattern, key))
                    continue;
                if (!_cs.isdefined(spec[key]))
                    return false;
                var value = spec_pattern[key];
                switch (typeof spec[key]) {
                    case "number":
                    case "boolean":
                        if (spec[key] !== value)
                            return false;
                        break;
                    case "string":
                        if (!(   (   typeof value === "string"
                                  && spec[key] === value)
                              || (   typeof value === "object"
                                  && value instanceof RegExp
                                  && !(spec[key].match(value)))))
                            return false;
                        break;
                }
            }
            return true;
        }
    }
});

