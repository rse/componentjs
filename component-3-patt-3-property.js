/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern: tree property  */
$cs.pattern.property = $cs.trait({
    mixin: [
        $cs.pattern.tree,
        $cs.pattern.config
    ],
    protos: {
        /*  get/set a property  */
        property: function (name, value) {
            var value_old = undefined;

            /*  get old configuration value
                (on current node or on any parent node)  */
            var v;
            for (var scope = null, node = this;
                 node !== null;
                 scope = node.name(), node = node.parent()) {

                /*  first try: child-scoped property  */
                if (scope !== null) {
                    v = node.cfg(name + "@" + scope);
                    if (typeof v !== "undefined") {
                        value_old = v;
                        break;
                    }
                }

                /*  second try: unscoped property  */
                v = node.cfg(name);
                if (typeof v !== "undefined") {
                    value_old = v;
                    break;
                }
            }

            /*  optionally set new configuration value
                (on current node only)  */
            if (typeof value !== "undefined") {
                var set_value = true;

                /*  optional event support within component hierarchy  */
                var comp = _cs.lookup(this);
                if (comp !== _cs.none) {
                    var ev = comp.publish({
                        name: "set_" + name,
                        args: [ name, value_old, value ],
                        capturing: false,
                        bubbling: false
                    });
                    if (ev.processing()) {
                        var result = ev.result();
                        if (typeof result !== "undefined")
                            value = result;
                    }
                    else
                        set_value = false;
                }

                /*  set new value  */
                if (set_value)
                    this.cfg(name, value);
            }

            /*  return old configuration value  */
            return value_old;
        }
    }
});

