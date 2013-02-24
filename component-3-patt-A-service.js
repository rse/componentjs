/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
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
                name:      { pos: 0,     def: null,    req: true },
                ctx:       {             def: this               },
                func:      { pos: 1,     def: $cs.nop, req: true },
                args:      { pos: "...", def: []                 },
                async:     {             def: false              },
                origin:    {             def: false              },
                spool:     {             def: null               },
                capturing: {             def: false              },
                spreading: {             def: false              },
                bubbling:  {             def: true               }
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
                        spreading: false,
                        bubbling:  false,
                        async:     true,
                        noresult:  true
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
                capturing: params.capturing,
                spreading: params.spreading,
                bubbling:  params.bubbling,
                exclusive: true
            });

            /*  optionally spool reverse operation  */
            if (params.spool !== null)
                this.spool(params.spool, this, "unregister", id);

            return id;
        },

        /*  determine registration existence  */
        registration: function () {
            /*  determine parameters  */
            var params = $cs.params("registration", arguments, {
                id: { pos: 0, req: true }
            });

            /*  determine whether registration exists  */
            return this.subscription(params.id);
        },

        /*  determine registrations  */
        registrations: function () {
            /*  determine parameters  */
            var params = $cs.params("registrations", arguments, {
                name: { pos: 0, def: null, req: true }
            });

            /*  determine whether registration exists  */
            return this.subscriptions("ComponentJS:service:" + params.name);
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
            var subscriptions = this.subscriptions(params.name);
            if (subscriptions.length !== 1)
                return undefined;
            var cmd = subscriptions[0].func().command;

            /*  get or set "enabled" attribute  */
            return cmd.enabled(params.value);
        },

        /*  call a service  */
        call: function () {
            /*  determine parameters  */
            var params = $cs.params("call", arguments, {
                name:      { pos: 0,     def: null,  req: true },
                args:      { pos: "...", def: []               },
                result:    {             def: null             },
                capturing: {             def: false            },
                spreading: {             def: false            },
                bubbling:  {             def: true             }
            });

            /*  dispatch service event onto target component  */
            var ev = this.publish({
                name:         "ComponentJS:service:" + params.name,
                args:         params.args,
                capturing:    params.capturing,
                spreading:    params.spreading,
                bubbling:     params.bubbling,
                firstonly:    true,
                async:        false
            });

            /*  ensure that the service event was successfully dispatched
                at least once (or our result value would have no meaning)  */
            if (!ev.dispatched())
                throw _cs.exception("call", "no such registered service found:" +
                    " \"" + params.name + "\"");

            /*  return the result value  */
            return ev.result();
        }
    }
});

