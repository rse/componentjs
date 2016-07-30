/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern: configuration  */
$cs.pattern.config = $cs.trait({
    dynamics: {
        /*  attributes  */
        __config: {}
    },
    protos: {
        /*  method: get/set particular configuration item  */
        cfg: function (name, value) {
            var result;
            if (arguments.length === 0) {
                /*  return list of keys  */
                result = [];
                for (var key in this.__config)
                    if (_cs.isown(this.__config, key))
                        result.push(key);
            }
            else if (arguments.length === 1 && typeof name === "string") {
                /*  retrieve value  */
                result = this.__config[name];
            }
            else if (arguments.length === 2 && value !== null) {
                /*  set value  */
                result = this.__config[name];
                this.__config[name] = value;
            }
            else if (arguments.length === 2) {
                /*  remove key/value pair  */
                result = this.__config[name];
                delete this.__config[name];
            }
            else
                throw _cs.exception("cfg", "invalid arguments");
            return result;
        }
    }
});

