/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
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
                this.parent().children(_cs.filter(function (x) {
                    return x !== self;
                }, this.parent().children()));
                this.parent(null);
            }
        },

        /*  method: walk tree up  */
        walk_up: function (callback, ctx) {
            for (var node = this; node !== null; node = node.parent())
                ctx = callback(node, ctx);
            return ctx;
        },

        /*  method: walk tree  */
        walk_down: function (callback, ctx) {
            var _walk = function (level, node, ctx) {
                if (typeof callback === "function")
                    ctx = callback(level, node, ctx);
                var children = node.children();
                for (var i = 0; i < children.length; i++)
                    ctx = _walk(level + 1, children[i], ctx);
                return ctx;
            };
            ctx = _walk(0, this, ctx);
            return ctx;
        },

        /*  method: dump tree as indented string representation  */
        tree_dump: function (callback) {
            return this.walk_down(function (level, node, output) {
                for (var n = 0; n < level; n++)
                    output += "    ";
                output += "\"" + node.name() + "\"";
                if (typeof callback === "function")
                    output += ": " + callback(node);
                output += "\n";
                return output;
            }, "");
        }
    }
});

