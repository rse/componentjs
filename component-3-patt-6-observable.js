/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern: observable  */
$cs.pattern.observable = $cs.trait({
    dynamics: {
        /*  internal state  */
        __listener: {}
    },
    protos: {
        /*  attach a listener  */
        listen: function () {
            /*  determine parameters  */
            var params = $cs.params("listen", arguments, {
                name:    { pos: 0,     def: null,    req: true },
                ctx:     { pos: 1,     def: this               },
                func:    { pos: 2,     def: $cs.nop, req: true },
                args:    { pos: "...", def: []                 },
                spec:    {             def: null               } /* customized matching */
            });

            /*  attach listener information  */
            var id = _cs.cid();
            this.__listener[id] = params;
            return id;
        },

        /*  check for an attached listener  */
        listening: function () {
            /*  determine parameters  */
            var params = $cs.params("listening", arguments, {
                id: { pos: 0, def: null, req: true }
            });

            /*  check whether listener is attached  */
            return (typeof this.__listener[params.id] !== "undefined");
        },

        /*  detach a listener  */
        unlisten: function () {
            /*  determine parameters  */
            var params = $cs.params("unlisten", arguments, {
                id: { pos: 0, def: null, req: true }
            });

            /*  detach parameters from component  */
            if (typeof this.__listener[params.id] === "undefined")
                throw _cs.exception("unlisten", "listener not found");
            var listener = this.__listener[params.id];
            delete this.__listener[params.id];
            return listener;
        },

        /*  notify all listeners  */
        notify: function () {
            /*  determine parameters  */
            var params = $cs.params("notify", arguments, {
                name:    { pos: 0,     def: null, req: true                               },
                args:    { pos: "...", def: []                                            },
                matches: {             def: function (p, l) { return p.name === l.name; } } /* customized matching */
            });

            /*  notify all listeners  */
            for (var id in this.__listener) {
                if (_cs.isown(this.__listener, id)) {
                    var listener = this.__listener[id];
                    if (params.matches(params, listener)) {
                        var args = _cs.concat(listener.args, params.args);
                        listener.func.apply(listener.ctx, args);
                    }
                }
            }
        }
    }
});

