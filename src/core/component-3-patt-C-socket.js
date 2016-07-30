/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern: socket  */
$cs.pattern.socket = $cs.trait({
    mixin: [
        $cs.pattern.tree,
        $cs.pattern.property
    ],
    dynamics: {
        __sockets: {},
        __plugs: {}
    },
    protos: {
        /*  define a socket  */
        socket: function () {
            /*  determine parameters  */
            var params = $cs.params("socket", arguments, {
                name:   {         def: "default" },
                scope:  {         def: null      },
                ctx:    { pos: 0, req: true      },
                plug:   { pos: 1, req: true      },
                unplug: { pos: 2, req: true      },
                spool:  {         def: null      }
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

            /*  remember socket under an id  */
            var id = _cs.cid();
            this.__sockets[id] = name;

            /*  optionally spool reverse operation  */
            if (params.spool !== null) {
                var info = _cs.spool_spec_parse(this, params.spool);
                info.comp.spool(info.name, this, "unsocket", id);
            }

            return id;
        },

        /*  destroy a socket  */
        unsocket: function () {
            /*  determine parameters  */
            var params = $cs.params("unsocket", arguments, {
                id: { pos: 0, req: true }
            });

            /*  remove  parameters from component  */
            if (typeof this.__sockets[params.id] === "undefined")
                throw _cs.exception("unsocket", "socket not found");

            /*  remove corresponding property  */
            var name = this.__sockets[params.id];
            $cs(this).property(name, null);

            /*  remove socket information  */
            delete this.__sockets[params.id];
            return;
        },

        /*  create a linking/pass-through socket  */
        link: function () {
            /*  determine parameters  */
            var params = $cs.params("link", arguments, {
                name:   {         def: "default" },
                scope:  {         def: null      },
                target: { pos: 0, req: true      },
                socket: { pos: 1, req: true      },
                spool:  {         def: null      }
            });

            /*  create a socket and pass-through the
                plug/unplug operations to the target  */
            return this.socket({
                name:   params.name,
                scope:  params.scope,
                spool:  params.spool,
                ctx:    {},
                plug:   function (obj) {
                    var id = _cs.annotation(obj, "link");
                    if (id !== null)
                        throw _cs.exception("link:plug: cannot plug, you have to unplug first");
                    id = $cs(params.target).plug({
                        name:      params.socket,
                        object:    obj,
                        targeting: true
                    });
                    _cs.annotation(obj, "link", id);
                },
                unplug: function (obj) {
                    var id = _cs.annotation(obj, "link");
                    if (id === null)
                        throw _cs.exception("link:unplug: cannot unplug, you have to plug first");
                    $cs(params.target).unplug({
                        id: id,
                        targeting: true
                    });
                    _cs.annotation(obj, "link", null);
                }
            });
        },

        /*  destroy a link  */
        unlink: function () {
            /*  determine parameters  */
            var params = $cs.params("unlink", arguments, {
                id: { pos: 0, req: true }
            });

            return this.unsocket(params.id);
        },

        /*  plug into a defined socket  */
        plug: function () {
            /*  determine parameters  */
            var params = $cs.params("plug", arguments, {
                name:      {         def: "default" },
                object:    { pos: 0, req: true      },
                spool:     {         def: null      },
                targeting: {         def: false     }
            });

            /*  remember plug operation  */
            var id = _cs.cid();
            this.__plugs[id] = params;

            /*  pass-through operation to common helper function  */
            _cs.plugger("plug", this, params.name, params.object, params.targeting);

            /*  optionally spool reverse operation  */
            if (params.spool !== null) {
                var info = _cs.spool_spec_parse(this, params.spool);
                info.comp.spool(info.name, this, "unplug", id);
            }

            return id;
        },

        /*  unplug from a defined socket  */
        unplug: function () {
            /*  determine parameters  */
            var params = $cs.params("unplug", arguments, {
                id:        { pos: 0, req: true  },
                targeting: {         def: false }
            });

            /*  determine plugging information  */
            if (typeof this.__plugs[params.id] === "undefined")
                throw _cs.exception("unplug", "plugging not found");
            var name   = this.__plugs[params.id].name;
            var object = this.__plugs[params.id].object;

            /*  pass-though operation to common helper function  */
            _cs.plugger("unplug", this, name, object, params.targeting);

            /*  remove plugging  */
            delete this.__plugs[params.id];
            return;
        }
    }
});

/*  internal "plug/unplug to socket" helper functionality  */
_cs.plugger = function (op, origin, name, object, targeting) {
    /*  resolve the socket property on the parents components
        NOTICE 1: we explicitly skip the origin component here as
                  resolving the socket property also on the origin
                  component might otherwise return the potentially existing
                  socket for the child components of the orgin component.
        NOTICE 2: we intentionally skip the origin and do not directly
                  resolve on the parent component as we want to take
                  scoped sockets (on the parent component) into account!  */
    var property = "ComponentJS:socket:" + name;
    var socket = origin.property({ name: property, targeting: targeting });
    if (!_cs.isdefined(socket))
        throw _cs.exception(op, "no socket found on parent component(s)");

    /*  determine the actual component owning the socket (for logging purposes only)  */
    var owner = origin.property({ name: property, targeting: targeting, returnowner: true });
    $cs.debug(1, "socket: " + owner.path("/") + ": " + name +
        " <--(" + op + ")-- " + origin.path("/"));

    /*  perform plug/unplug operation  */
    if (_cs.istypeof(socket[op]) === "string")
        socket.ctx[socket[op]].call(socket.ctx, object, origin);
    else if (_cs.istypeof(socket[op]) === "function")
        socket[op].call(socket.ctx, object, origin);
    else
        throw _cs.exception(op, "failed to perform \"" + op + "\" operation");
};

