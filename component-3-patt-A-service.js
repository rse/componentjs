/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern: service  */
$cs.pattern.service = $cs.trait({
    mixin: [
        $cs.pattern.eventing
    ],
    protos: {
        /*  register a service  */
        register: function () {
            /*  determine parameters  */
            var params = $cs.params("register", arguments, {
                name:   { pos: 0,     def: null,    req: true },
                ctx:    {             def: this               },
                func:   { pos: 1,     def: $cs.nop, req: true },
                args:   { pos: "...", def: []                 },
                async:  {             def: false              },
                origin: {             def: false              }
            });

            /*  create command object to wrap service  */
            var cmd = $cs.command({
                ctx:   params.ctx,
                func:  params.func,
                args:  params.args,
                async: params.async,
                wrap:  true
            });

            /*  publish changes to command's "enabled" attribute  */
            cmd.command.listen({
                name: "attribute:set:enabled",
                args: [ this, params.name ],
                func: function (comp, name, value_new, value_old) {
                    comp.publish({
                        name:      "ComponentJS:service:" + name + ":enabled",
                        args:      [ value_new, value_old ],
                        capturing: false,
                        bubbling:  false,
                        async:     true
                    });
                }
            });

            /*  subscribe to service event  */
            var id = this.subscribe({
                name:      "ComponentJS:service:" + params.name,
                ctx:       params.ctx,
                func:      cmd,
                noevent:   true,
                origin:    params.origin,
                exclusive: true
            });
            return id;
        },

        /*  unregister a service  */
        unregister: function () {
            /*  determine parameters  */
            var params = $cs.params("unregister", arguments, {
                id: { pos: 0, req: true }
            });

            /*  unsubscribe from service event  */
            this.unsubscribe(params.id);
            return;
        },

        /*  enable/disable a service  */
        service_enabled: function () {
            /*  determine parameters  */
            var params = $cs.params("service_enabled", arguments, {
                name:  { pos: 0, def: null,      req: true },
                value: { pos: 1, def: undefined            }
            });

            /*  find service command  */
            var subscribers = this.subscribers(params.name);
            if (subscribers.length !== 1)
                return undefined;
            var cmd = subscribers[0].func().command;

            /*  get or set "enabled" attribute  */
            return cmd.enabled(params.value);
        },

        /*  call a service  */
        call: function () {
            /*  determine parameters  */
            var params = $cs.params("call", arguments, {
                name:     { pos: 0,     def: null,  req: true },
                args:     { pos: "...", def: []               },
                result:   {             def: null             },
                bubbling: {             def: true             }
            });

            /*  dispatch service event onto target component  */
            return this.publish({
                name:         "ComponentJS:service:" + params.name,
                args:         params.args,
                capturing:    false,
                bubbling:     params.bubbling,
                directresult: true,
                firstonly:    true,
                async:        false
            });
        }
    }
});

