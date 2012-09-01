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
        property: function () {
            /*  determine parameters  */
            var params = $cs.params("property", arguments, {
                name:       { pos: 0, def: null,     req: true },
                value:      { pos: 1, def: undefined           },
                skiporigin: {         def: false               }
            });

            /*  start resolving with an undefined value  */
            var value_old = undefined;

            /*  get old configuration value
                (on current node or on any parent node)  */
            var v;
            for (var scope = null, node = this;
                 node !== null;
                 scope = node.name(), node = node.parent()) {

                /*  optionally skip the origin component
                    (usually if a property on the parent components
                    should be resolved only, but the scoping for the
                    origin component should be still taken into account
                    on the parent) */
                if (scope === null && params.skiporigin)
                    continue;

                /*  first try: child-scoped property  */
                if (scope !== null) {
                    v = node.cfg(params.name + "@" + scope);
                    if (typeof v !== "undefined") {
                        value_old = v;
                        break;
                    }
                }

                /*  second try: unscoped property  */
                v = node.cfg(params.name);
                if (typeof v !== "undefined") {
                    value_old = v;
                    break;
                }
            }

            /*  optionally set new configuration value
                (on current node only)  */
            var value = params.value;
            if (typeof value !== "undefined") {
                var set_value = true;

                /*  optional event support within component hierarchy  */
                var comp = _cs.lookup(this);
                if (comp !== _cs.none) {
                    var ev = comp.publish({
                        name: "set_" + params.name,
                        args: [ params.name, value_old, value ],
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
                    this.cfg(params.name, value);
            }

            /*  return old configuration value  */
            return value_old;
        }
    }
});

