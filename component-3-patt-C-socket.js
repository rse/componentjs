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
    protos: {
        /*  define a socket  */
        socket: function () {
            /*  determine parameters  */
            var params = $cs.params("socket", arguments, {
                name:   {         def: null            },
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
            var name = "socket";
            if (params.name !== null)
                name += ":" + params.name;
            if (params.scope !== null)
                name += "@" + params.scope;
            $cs(this).property(name, params);
        },

        /*  plug into a defined socket  */
        plug: function () {
            return _cs.plugger("plug", this, false, arguments);
        },
        plugInto: function () {
            return _cs.plugger("plug", this, true, arguments);
        },

        /*  unplug from a defined socket  */
        unplug: function () {
            return _cs.plugger("unplug", this, false, arguments);
        },
        unplugFrom: function () {
            return _cs.plugger("unplug", this, true, arguments);
        }
    }
});

/*  internal "plug/unplug to socket" helper functionality  */
_cs.plugger = function (op, origin, named, args) {
    /*  determine socket property name  */
    var property = "socket";
    if (named) {
        property += ":" + args[0];
        args = _cs.filter(function (_, i) { return i >= 1; }, args);
    }

    /*  resolve the socket property on the parents components
        NOTICE 1: we explicitly skip the origin component here as
                  resolving the socket property also on the origin
                  component might otherwise return the potentially
                  existing socket for the child components of the orgin
                  component.
        NOTICE 2: we intentionally skip the origin and do not directly
                  resolve on the parent component as we want to take
                  scoped sockets (on the parent component) into account!  */
    var socket = origin.property({ name: property, skiporigin: true });
    if (!_cs.isdefined(socket))
        throw _cs.exception(op, "no socket found on parent component(s)");

    /*  perform plug/unplug operation  */
    if (_cs.istypeof(socket[op]) === "string")
        return socket.ctx[socket[op]].apply(socket.ctx, args);
    else if (_cs.istypeof(socket[op]) === "function")
        return socket[op].apply(socket.ctx, args);
    else
        throw _cs.exception(op, "unable to perform \"" + op + "\" operation");
};

