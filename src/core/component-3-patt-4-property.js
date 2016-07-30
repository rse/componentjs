/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
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
                name:        { pos: 0, req: true      },
                value:       { pos: 1, def: undefined },
                def:         {         def: undefined },
                scope:       {         def: undefined },
                bubbling:    {         def: true      },
                targeting:   {         def: true      },
                returnowner: {         def: false     }
            });

            /*  sanity check usage  */
            if (!params.targeting && !params.bubbling)
                throw _cs.exception("property", "disabling both targeting and bubbling makes no sense");

            /*  start resolving with the default value  */
            var result; result = params.def;

            /*  get old configuration value
                (on current node or on any parent node)  */
            var v;
            for (var scope = [], node = this;
                node !== null;
                scope.unshift(node.name()), node = node.parent()) {

                /*  optionally skip the target component
                    (usually if a property on the parent components
                    should be resolved only, but the scoping for the
                    target component should be still taken into account
                    on the parent) */
                if (scope.length === 0 && !params.targeting)
                    continue;

                /*  first try: child-scoped property  */
                if (scope.length > 0) {
                    for (var i = scope.length - 1; i >= 0; i--) {
                        var probePath = scope.slice(0, i + 1).join("/");
                        v = node.cfg("ComponentJS:property:" + params.name + "@" + probePath);
                        if (typeof v !== "undefined")
                            break;
                    }
                    if (typeof v !== "undefined") {
                        result = (params.returnowner ? node : v);
                        break;
                    }
                }

                /*  second try: unscoped property  */
                v = node.cfg("ComponentJS:property:" + params.name);
                if (typeof v !== "undefined") {
                    result = (params.returnowner ? node : v);
                    break;
                }

                /*  if we should not bubble, stop immediately  */
                if (!params.bubbling)
                    break;
            }

            /*  optionally set new configuration value
                (on current node only)  */
            if (typeof params.value !== "undefined")
                if (typeof params.scope !== "undefined")
                    this.cfg("ComponentJS:property:" + params.name + "@" + params.scope, params.value);
                else
                    this.cfg("ComponentJS:property:" + params.name, params.value);

            /*  return result (either the old configuration
                value or the owning component)  */
            return result;
        }
    }
});

