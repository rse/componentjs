/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  pre-defined reusable hook result value processings  */
_cs.hook_proc = {
    "none":   { init: undefined, step: function (a, b) { return b;              } },
    "or":     { init: false,     step: function (a, b) { return a || b;         } },
    "and":    { init: true,      step: function (a, b) { return a && b;         } },
    "add":    { init: 0,         step: function (a, b) { return a + b;          } },
    "concat": { init: "",        step: function (a, b) { return a + b;          } },
    "append": { init: [],        step: function (a, b) { a.push(b);   return a; } },
    "insert": { init: {},        step: function (a, b) { a[b] = true; return a; } }
};

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
                name:    { pos: 0,     def: null,    req: true },
                ctx:     {             def: this               },
                func:    { pos: 1,     def: $cs.nop, req: true },
                args:    { pos: "...", def: []                 },
                spool:   {             def: null               }
            });

            /*  subscribe to hook event  */
            var id = this.subscribe({
                name:    "ComponentJS:hook:" + params.name,
                ctx:     params.ctx,
                func:    params.func,
                args:    params.args,
                noevent: true
            });

            /*  optionally spool reverse operation  */
            if (params.spool !== null)
                this.spool(params.spool, this, "unlatch", id);

            return id;
        },

        /*  unlatch from a hook  */
        unlatch: function () {
            /*  determine parameters  */
            var params = $cs.params("unlatch", arguments, {
                id: { pos: 0, req: true }
            });

            /*  unsubsribe from hook event  */
            this.unsubscribe(params.id);
        },

        /*  perform the hook  */
        hook: function () {
            /*  determine parameters  */
            var params = $cs.params("hook", arguments, {
                name:   { pos: 0,     def: null,    req: true },
                proc:   { pos: 1,     def: "none",
                          valid: function (x) {
                              return _cs.isdefined(_cs.hook_proc[x]); } },
                args:   { pos: "...", def: []                 }
            });

            /*  dispatch hook event onto target component  */
            return this.publish({
                name:         "ComponentJS:hook:" + params.name,
                args:         params.args,
                capturing:    false,
                spreading:    false,
                bubbling:     false,
                async:        false,
                resultinit:   _cs.hook_proc[params.proc].init,
                resultstep:   _cs.hook_proc[params.proc].step,
                directresult: true
            });
        }
    }
});

