/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern: spool  */
$cs.pattern.spool = $cs.trait({
    dynamics: {
        /*  attributes  */
        __spool: {}
    },
    protos: {
        /*  spool an action for grouped execution  */
        spool: function () {
            /*  determine parameters  */
            var params = $cs.params("spool", arguments, {
                name:  { pos: 0,                   req: true },
                ctx:   { pos: 1,     def: this               },
                func:  { pos: 2,     def: $cs.nop, req: true },
                args:  { pos: "...", def: []                 }
            });

            /*  sanity check parameters  */
            if (!_cs.istypeof(params.func).match(/^(string|function)$/))
                throw _cs.exception("cleaner", "invalid function (either function object or method name required)");
            if (_cs.istypeof(params.func) === "string") {
                if (_cs.istypeof(params.ctx[params.func]) !== "function")
                    throw _cs.exception("cleaner", "invalid method name: \"" + params.func + "\"");
                params.func = params.ctx[params.func];
            }

            /*  spool cleanup action  */
            if (!_cs.isdefined(this.__spool[params.name]))
                this.__spool[params.name] = [];
            this.__spool[params.name].push(params);
            return;
        },

        /*  check whether actions are spooled  */
        spooled: function () {
            /*  determine parameters  */
            var params = $cs.params("spooled", arguments, {
                name: { pos: 0, req: true }
            });

            /*  return whether actions are spooled  */
            return (
                   _cs.isdefined(this.__spool[params.name])
                && this.__spool[params.name].length > 0
            );
        },

        /*  execute spooled actions  */
        unspool: function () {
            /*  determine parameters  */
            var params = $cs.params("unspool", arguments, {
                name: { pos: 0, req: true }
            });

            /*  execute spooled actions (in reverse spooling order)  */
            var actions = this.__spool[params.name];
            if (!_cs.isdefined(actions))
                throw _cs.exception("unspool", "no such spool: \"" + params.name + "\"");
            for (var i = actions.length - 1; i >= 0; i--)
                actions[i].func.apply(actions[i].ctx, actions[i].args);

            /*  destroy spool of now executed cleanup actions  */
            delete this.__spool[params.name];
            return;
        }
    }
});

