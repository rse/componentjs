/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern: configuration  */
$cs.pattern.config = $cs.trait({
    dynamics: {
        /*  attributes  */
        __configuration: {}
    },
    protos: {
        /*  method: get/set particular configuration item  */
        cfg: function (name, value_new) {
            var cfg = this.__configuration;
            var value_old = cfg[name];
            if (typeof value_new !== "undefined")
                cfg[name] = value_new;
            return value_old;
        },

        /*  method: dump configuration items  */
        cfg_dump: function () {
            var dump = "";
            for (var name in this.__configuration) {
                if (_cs.isown(this.__configuration, name)) {
                    var value = this.__configuration[name];
                    switch (_cs.istypeof(value)) {
                        case "boolean":                        break;
                        case "number":                         break;
                        case "string":                         break;
                        case "null":     value = "<null>";     break;
                        case "function": value = "<function>"; break;
                        case "object":   value = "<object>";   break;
                        case "array":    value = "<array>";    break;
                        default:         value = "<unknown>";  break;
                    }
                    dump += (dump !== "" ? ", " : "");
                    dump += name + ": \"" + value + "\"";
                }
            }
            dump = "{" + dump + "}";
            return dump;
        }
    }
});

