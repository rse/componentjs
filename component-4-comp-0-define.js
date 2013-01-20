/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  component class definition  */
_cs.comp = $cs.clazz({
    mixin: [
        $cs.pattern.id,
        $cs.pattern.name,
        $cs.pattern.tree,
        $cs.pattern.config,
        $cs.pattern.spool,
        $cs.pattern.state,
        $cs.pattern.service,
        $cs.pattern.eventing,
        $cs.pattern.property,
        $cs.pattern.shadow,
        $cs.pattern.socket,
        $cs.pattern.model,
        $cs.pattern.store
    ],
    constructor: function (name, parent, children) {
        /*  component marking  */
        _cs.annotation(this, "type", "component");
        if (_cs.istypeof(name) !== "string")
            name = "<unknown>";
        this.name(name);

        /*  component tree and object attachment  */
        this.parent(_cs.istypeof(parent) === "object" ? parent : null);
        this.children(_cs.istypeof(children) === "array" ? children : []);
    },
    protos: {
        /*  create a sub-component  */
        create: function () {
            return $cs.create.apply(this, _cs.concat([ this ], arguments));
        },

        /*  destroy sub-component (or just this component) */
        destroy: function () {
            return $cs.destroy.apply(this, _cs.concat([ this ], arguments));
        },

        /*  check for existance of a component  */
        exists: function () {
            return (this.name() !== "<none>");
        }
    }
});

