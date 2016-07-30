/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern: tree  */
$cs.pattern.tree = $cs.trait({
    mixin: [
        $cs.pattern.name
    ],
    dynamics: {
        parent:   $cs.attribute("parent", null),
        children: $cs.attribute("children", [])
    },
    protos: {
        /*  method: path to (and including) node as either object array or name string  */
        path: function (separator) {
            var path, node;
            if (typeof separator === "undefined") {
                /*  return path as object array  */
                path = [];
                for (node = this; node !== null; node = node.parent())
                    path.push(node);
            }
            else {
                /*  return path as name string  */
                path = "";
                if (this.parent() === null)
                    path = separator;
                else {
                    for (node = this; node.parent() !== null; node = node.parent())
                        path = separator + node.name() + path;
                }
            }
            return path;
        },

        /*  method: attach node to tree  */
        attach: function (theparent) {
            if (this.parent() !== null)
                this.detach();
            var children = theparent.children();
            children.push(this);
            theparent.children(children);
            this.parent(theparent);
        },

        /*  method: detach node from tree  */
        detach: function () {
            if (this.parent() !== null) {
                var self = this;
                this.parent().children(_cs.filter(this.parent().children(), function (x) {
                    return x !== self;
                }));
                this.parent(null);
            }
        },

        /*  method: walk tree up  */
        walk_up: function (callback, ctx) {
            var depth, node;
            for (depth = 0, node = this; node !== null; node = node.parent(), depth++)
                ctx = callback(depth, node, ctx);
            return ctx;
        },

        /*  method: walk tree downward */
        walk_down: function (callback, ctx) {
            var _walk = function (depth, node, ctx) {
                if (typeof callback === "function")
                    ctx = callback(depth, node, ctx, false);
                var children = node.children();
                for (var i = 0; i < children.length; i++)
                    ctx = _walk(depth + 1, children[i], ctx);
                if (typeof callback === "function")
                    ctx = callback(depth, node, ctx, true);
                return ctx;
            };
            ctx = _walk(0, this, ctx);
            return ctx;
        },

        /*  method: dump tree as indented string representation  */
        _tree_dump: function (callback) {
            return this.walk_down(function (depth, node, output, depth_first) {
                if (!depth_first) {
                    for (var n = 0; n < depth; n++)
                        output += "    ";
                    output += "\"" + node.name() + "\"";
                    if (typeof callback === "function")
                        output += ": " + callback(node);
                    output += "\n";
                }
                return output;
            }, "");
        }
    }
});

