/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern: hook  */
$cs.pattern.hook = $cs.trait({
    mixin: [
        $cs.pattern.eventing
    ],
    protos: {
        /*  latch into a hook  */
        latch: function () {
            /*  determine parameters  */
            var params = $cs.params("latch", arguments, {
                name:   { pos: 0,     def: null,    req: true },
                ctx:    {             def: this               },
                func:   { pos: 1,     def: $cs.nop, req: true },
                args:   { pos: "...", def: []                 }
            });

            /*  subscribe to hook event  */
            var id = this.subscribe({
                name: "hook." + params.name,
                ctx:  params.ctx,
                func: params.func,
                args: params.args
            });

            return id;
        },

        /*  notch from a hook  */
        notch: function () {
            /*  determine parameters  */
            var params = $cs.params("notch", arguments, {
                id: { pos: 0, req: true }
            });

            /*  unsubsribe from hook event  */
            this.unsubscribe(params.id);
        },

        /*  perform the hook  */
        hook: function () {
            /*  determine parameters  */
            var params = $cs.params("hook", arguments, {
                name:   { pos: 0,     def: null,  req: true },
                args:   { pos: "...", def: []               }
            });

            /*  dispatch hook event onto target component  */
            this.publish({
                name: "hook." + params.name,
                args: params.args,
                capturing: false,
                bubbling: false,
                async: false
            });
        }
    }
});

