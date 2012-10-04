/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern: socket  */
$cs.pattern.socket = $cs.trait({
    mixin: [
        $cs.pattern.tree,
        $cs.pattern.property
    ],
    dynamics: {
        __plugs: {},
        __plugs_id: 0
    },
    protos: {
        /*  define a socket  */
        socket: function () {
            /*  determine parameters  */
            var params = $cs.params("socket", arguments, {
                name:   {         def: "default"       },
                scope:  {         def: null            },
                ctx:    { pos: 0, def: null, req: true },
                plug:   { pos: 1, def: null, req: true },
                unplug: { pos: 2, def: null, req: true }
            });

            /*  sanity check parameters  */
            if (   _cs.istypeof(params.plug) === "string"
                && _cs.istypeof(params.ctx[params.plug]) !== "function")
                throw _cs.exception("socket", "no plug method named \"" + params.plug + "\" found on context object");
            else if (   _cs.istypeof(params.plug) !== "string"
                     && _cs.istypeof(params.plug) !== "function")
                throw _cs.exception("socket", "plug operation neither method name nor function");
            if (   _cs.istypeof(params.unplug) === "string"
                && _cs.istypeof(params.ctx[params.unplug]) !== "function")
                throw _cs.exception("socket", "no unplug method named \"" + params.unplug + "\" found on context object");
            else if (   _cs.istypeof(params.unplug) !== "string"
                     && _cs.istypeof(params.unplug) !== "function")
                throw _cs.exception("socket", "unplug operation neither method name nor function");

            /*  remember parameters as (optionally scoped) component property  */
            var name = "ComponentJS:socket:" + params.name;
            if (params.scope !== null)
                name += "@" + params.scope;
            $cs(this).property(name, params);
        },

        /*  create a linking/pass-through socket  */
        link: function () {
            /*  determine parameters  */
            var params = $cs.params("link", arguments, {
                name:   {         def: "default"            },
                scope:  {         def: null                 },
                ctx:    { pos: 0, def: null,      req: true },
                target: { pos: 1, def: "default", req: true }
            });

            /*  create a socket and pass-through the
                plug/unplug operations to the target  */
            this.socket({
                name:   params.name,
                scope:  params.scope,
                ctx:    params.ctx,
                plug:   function (obj) {
                    return this.plug({
                        name:   params.target,
                        object: obj
                    });
                },
                unplug: function (obj) {
                    return this.unplug({
                        name:   params.target,
                        object: obj
                    });
                }
            });
        },

        /*  plug into a defined socket  */
        plug: function () {
            /*  determine parameters  */
            var params = $cs.params("plug", arguments, {
                name:     {         def: "default"           },
                object:   { pos: 0,                req: true },
                remember: {         def: true                }
            });

            /*  optionally remember plug operation  */
            if (params.remember)
                this.__plugs[this.__plugs_id++] = { name: params.name, object: params.object };

            /*  pass-though operation to common helper function  */
            _cs.plugger("plug", this, params.name, params.object);
        },

        /*  unplug from a defined socket  */
        unplug: function () {
            /*  determine parameters  */
            var params = $cs.params("unplug", arguments, {
                name:   {         def: "default"  },
                object: { pos: 0, def: null       }
            });

            /*  object parameter determines operation mode... */
            if (params.object === null) {
                /*  mode 1: unplug all remembered objects  */

                /*  iterate over all remembered plug operations  */
                var remove = [];
                var object = undefined;
                for (var id in this.__plugs) {
                    if (!_cs.isown(this.__plugs, id))
                        continue;
                    if (params.name === this.__plugs[id].name) {
                        object = this.__plugs[id].object;

                        /*  pass-though operation to common helper function  */
                        _cs.plugger("unplug", this, params.name, object);

                        remove.push(id);
                    }
                }
                if (typeof object === "undefined")
                    throw _cs.exception("unplug", "object(s) to unplug neither given nor previously remembered");

                /*  deferred cleanup  */
                var self = this;
                _cs.foreach(remove, function (id) {
                    delete self.__plugs[id];
                });
            }
            else {
                /*  mode 2: unplug one provided object  */

                /*  pass-though operation to common helper function  */
                _cs.plugger("unplug", this, params.name, params.object);
            }
        }
    }
});

/*  internal "plug/unplug to socket" helper functionality  */
_cs.plugger = function (op, origin, name, object) {
    /*  resolve the socket property on the parents components
        NOTICE 1: we explicitly skip the origin component here as
                  resolving the socket property also on the origin
                  component might otherwise return the potentially existing
                  socket for the child components of the orgin component.
        NOTICE 2: we intentionally skip the origin and do not directly
                  resolve on the parent component as we want to take
                  scoped sockets (on the parent component) into account!  */
    var property = "ComponentJS:socket:" + name;
    var socket = origin.property({ name: property, targeting: false });
    if (!_cs.isdefined(socket))
        throw _cs.exception(op, "no socket found on parent component(s)");

    /*  determine the actual component owning the socket (for logging purposes only)  */
    var owner = origin.property({ name: property, targeting: false, returnowner: true });
    $cs.debug(1, "socket: " + owner.path("/") + ": " + name +
        " <--(" + op + ")-- " + origin.path("/"));

    /*  perform plug/unplug operation  */
    if (_cs.istypeof(socket[op]) === "string")
        socket.ctx[socket[op]].call(socket.ctx, object);
    else if (_cs.istypeof(socket[op]) === "function")
        socket[op].call(socket.ctx, object);
    else
        throw _cs.exception(op, "failed to perform \"" + op + "\" operation");
};

