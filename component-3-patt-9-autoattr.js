/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern: automatic attributes  */
$cs.pattern.autoattr = $cs.trait({
    setup: function () {
        /*  automatically replace marked fields with
            getter/setter-style wrapper methods  */
        var remove = [];
        for (var field in this) {
            if (!_cs.isown(this, field))
                continue;
            /*  act only on "xxx_" symbols  */
            var m = field.match(/^(.+)_$/);
            if (m === null || !m[0])
                continue;
            var field_base = m[1];

            /*  replace field with a getter/setter method  */
            var settings;
            if (   typeof this[field] === "object"
                && this[field] !== null
                && typeof this[field].def !== "undefined") {
                if (typeof this[field].name === "undefined")
                    this[field].name = field_base;
                settings = this[field];
            }
            else {
                settings = { name: field_base, def: this[field] };
            }
            this[field_base] = $cs.attribute(settings);

            /*  mark original field for deferred removal  */
            remove.push(field);
        }

        /*  perform deferred removal of original fields  */
        var self = this;
        _cs.foreach(remove, function (field) {
            delete self[field];
        });
    }
});

