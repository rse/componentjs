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
        __config: {}
    },
    protos: {
        /*  method: get/set particular configuration item  */
        cfg: function (name, value_new) {
            var cfg = this.__config;
            var value_old = cfg[name];
            if (typeof value_new !== "undefined")
                cfg[name] = value_new;
            return value_old;
        }
    }
});

