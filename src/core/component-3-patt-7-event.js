/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern: event  */
$cs.pattern.event = $cs.clazz({
    mixin: [
        $cs.pattern.spec
    ],
    dynamics: {
        /*  attributes  */
        target:      $cs.attribute("target",      null),        /*  target object the event is send to  */
        propagation: $cs.attribute("propagation", true),        /*  whether event propagation should continue  */
        processing:  $cs.attribute("processing",  true),        /*  whether final default event processing should be performed  */
        dispatched:  $cs.attribute("dispatched",  false),       /*  whether event was dispatched at least once to a subscriber  */
        decline:     $cs.attribute("decline",     false),       /*  whether event was declined by subscriber  */
        state:       $cs.attribute("state",       "targeting"), /*  state of dispatching: capturing, targeting, spreading, bubbling */
        result:      $cs.attribute("result",      undefined),   /*  optional result value event subscribers can provide  */
        async:       $cs.attribute("async",       false)        /*  whether event is dispatched asynchronously  */
    }
});

/*  event factory  */
$cs.event = function () {
    /*  determine parameters  */
    var params = $cs.params("event", arguments, {
        name:        { pos: 0,     req: true        },
        spec:        {             def: {}          },
        target:      { pos: 1,     req: true        },
        propagation: { pos: 2,     def: true        },
        processing:  { pos: 3,     def: true        },
        dispatched:  { pos: 4,     def: false       },
        decline:     { pos: 5,     def: false       },
        state:       { pos: 6,     def: "targeting" },
        result:      { pos: 7,     def: undefined   },
        async:       { pos: 8,     def: false       }
    });

    /*  create new event  */
    var ev = new $cs.pattern.event();

    /*  configure event  */
    ev.name       (params.name);
    ev.target     (params.target);
    ev.propagation(params.propagation);
    ev.processing (params.processing);
    ev.dispatched (params.dispatched);
    ev.decline    (params.decline);
    ev.state      (params.state);
    ev.result     (params.result);
    ev.spec       (params.spec);
    ev.async      (params.async);

    return ev;
};

/*  generic pattern: eventing  */
$cs.pattern.eventing = $cs.trait({
    dynamics: {
        __subscription: {}
    },
    protos: {
        /*  subscribe on an event  */
        subscribe: function () {
            /*  determine parameters  */
            var params = $cs.params("subscribe", arguments, {
                name:      { pos: 0,     req: true  },
                spec:      {             def: {}    },
                ctx:       {             def: this  },
                func:      { pos: 1,     req: true  },
                args:      { pos: "...", def: []    },
                capturing: {             def: false },
                spreading: {             def: false },
                bubbling:  {             def: true  },
                noevent:   {             def: false },
                exclusive: {             def: false },
                spool:     {             def: null  }
            });

            /*  honor exclusive request
                (attention: name can also be a regular expression object!)  */
            var subscriptions = this._subscriptions(params.name.toString(), params.spec);
            if (subscriptions.length === 1 && subscriptions[0].exclusive)
                throw _cs.exception("subscribe", "existing exclusive subscription prevents additional one");
            if (params.exclusive && subscriptions.length > 0)
                throw _cs.exception("subscribe", "non-exclusive subscription(s) prevent exclusive one");

            /*  attach parameters to component  */
            var id = _cs.cid();
            this.__subscription[id] = params;

            /*  optionally spool reverse operation  */
            if (params.spool !== null) {
                var info = _cs.spool_spec_parse(this, params.spool);
                info.comp.spool(info.name, this, "unsubscribe", id);
            }

            return id;
        },

        /*  unsubscribe from an event  */
        unsubscribe: function () {
            /*  determine parameters  */
            var params = $cs.params("unsubscribe", arguments, {
                id: { pos: 0, req: true }
            });

            /*  detach parameters from component  */
            if (typeof this.__subscription[params.id] === "undefined")
                throw _cs.exception("unsubscribe", "subscription not found");
            delete this.__subscription[params.id];
            return;
        },

        /*  determine subscription existence  */
        _subscription: function () {
            /*  determine parameters  */
            var params = $cs.params("_subscription", arguments, {
                id:      { pos: 0, req: true  },
                details: { pos: 1, def: false }
            });

            /*  determine whether subscription exists  */
            var result = (typeof this.__subscription[params.id] !== "undefined");

            /*  optionally provide details about subscription  */
            if (params.details)
                result = (result ? this.__subscription[params.id] : undefined);

            return result;
        },

        /*  determine subscriptions (internal)  */
        _subscriptions: function () {
            /*  determine parameters  */
            var params = $cs.params("_subscriptions", arguments, {
                name:  { pos: 0, req: true },
                spec:  { pos: 1, def: {}   }
            });

            /*  make an event for matching only  */
            var ev = $cs.event({
                name:   params.name,
                spec:   params.spec,
                target: _cs.nop
            });

            /*  find and return all matching subscriptions  */
            var subscriptions = [];
            for (var id in this.__subscription) {
                if (!_cs.isown(this.__subscription, id))
                    continue;
                var s = this.__subscription[id];
                if (ev.matches(s.name, s.spec))
                    subscriptions.push(s);
            }
            return subscriptions;
        },

        /*  publish an event */
        publish: function () {
            var i;
            var self = this;

            /*  determine parameters  */
            var params = $cs.params("publish", arguments, {
                name:         { pos: 0,     req: true            },
                spec:         {             def: {}              },
                async:        {             def: false           },
                capturing:    {             def: true            },
                spreading:    {             def: false           },
                bubbling:     {             def: true            },
                completed:    {             def: _cs.nop         },
                resultinit:   {             def: undefined       },
                resultstep:   {             def: function (a, b) { return b; } },
                directresult: {             def: false           },
                noresult:     {             def: false           },
                firstonly:    {             def: false           },
                silent:       {             def: false           },
                args:         { pos: "...", def: []              }
            });

            /*  short-circuit processing (1/2) to speed up cases
                where no subscribers exist for a local event  */
            var short_circuit = false;
            if (!params.capturing && !params.spreading && !params.bubbling) {
                var subscribers = false;
                for (var id in this.__subscription) {
                    if (!_cs.isown(this.__subscription, id))
                        continue;
                    subscribers = true;
                    break;
                }
                if (!subscribers) {
                    if (params.noresult)
                        return undefined;
                    else if (params.directresult)
                        return params.resultinit;
                    else
                        short_circuit = true;
                }
            }

            /*  create event  */
            var ev = $cs.event({
                name:        params.name,
                spec:        params.spec,
                async:       params.async,
                result:      params.resultinit,
                target:      self,
                propagation: true,
                processing:  true,
                dispatched:  false
            });

            /*  short-circuit processing (2/2)  */
            if (short_circuit)
                return ev;

            /*  tracing  */
            if (!params.silent) {
                $cs.debug(1, "event:" +
                    " " + ev.target().path("/") + ": publish:" +
                    " name=" + ev.name() +
                    " async=" + ev.async() +
                    " capturing=" + params.capturing +
                    " spreading=" + params.spreading +
                    " bubbling=" + params.bubbling +
                    " directresult=" + params.directresult +
                    " noresult=" + params.noresult +
                    " firstonly=" + params.firstonly
                );
            }

            /*  helper function for dispatching event to single component  */
            var event_dispatch_single = function (ev, comp, params, state) {
                for (var id in comp.__subscription) {
                    if (!_cs.isown(comp.__subscription, id))
                        continue;
                    var s = comp.__subscription[id];
                    if (   (   (state === "capturing" && s.capturing)
                            || (state === "targeting"               )
                            || (state === "spreading" && s.spreading)
                            || (state === "bubbling"  && s.bubbling ))
                        && ev.matches(s.name, s.spec)                 ) {

                        /*  verbosity  */
                        if (!params.silent)
                            $cs.debug(1, "event: " + comp.path("/") + ": dispatch " + ev.name() + " to subscriber on " + state);

                        /*  further annotate event object  */
                        ev.state(state);
                        ev.decline(false);

                        /*  call subscription method  */
                        var args = _cs.concat(
                            s.noevent ? [] : [ ev ],
                            s.args,
                            params.args
                        );
                        var result = s.func.apply(s.ctx, args);

                        /*  process return value  */
                        if (s.noevent && _cs.isdefined(result))
                            ev.result(params.resultstep(ev.result(), result));

                        /*  control the further dispatching  */
                        if (!ev.decline()) {
                            ev.dispatched(true);
                            if (params.firstonly)
                                ev.propagation(false);
                        }
                    }
                }
            };

            /*  helper function for dispatching event to all components on hierarchy path  */
            var event_dispatch_all = function (ev, comp, params) {
                /*  determine component tree path  */
                var comp_path;
                if (params.capturing || params.bubbling)
                    comp_path = comp.path();

                /*  phase 1: CAPTURING
                    optionally dispatch event downwards from root component
                    towards target component for capturing subscribers  */
                if (params.capturing) {
                    for (i = comp_path.length - 1; i >= 1; i--) {
                        event_dispatch_single(ev, comp_path[i], params, "capturing");
                        if (!ev.propagation())
                            break;
                    }
                }

                /*  phase 2: TARGETING
                    dispatch event to target component  */
                if (ev.propagation())
                    event_dispatch_single(ev, comp, params, "targeting");

                /*  phase 3: SPREADING
                    dispatch event to all descendant components  */
                if (params.spreading && ev.propagation()) {
                    var visit = function (comp, isTarget) {
                        var cont = true;
                        if (!isTarget) {
                            /*  dispatch on non-target component  */
                            event_dispatch_single(ev, comp, params, "spreading");
                            if (!ev.propagation()) {
                                /*  if propagation should stop, reset the flag again
                                    as in the spreading phase propagation stops only(!)
                                    for the particular sub-tree, not the propagation
                                    process as a whole!  */
                                ev.propagation(true);
                                cont = false;
                            }
                        }
                        if (cont) {
                            /*  dispatch onto all direct child components  */
                            var children = comp.children();
                            for (var i = 0; i < children.length; i++)
                                visit(children[i], false);
                        }
                    };
                    visit(comp, true);
                }

                /*  phase 4: BUBBLING
                    dispatch event upwards from target component towards
                    root component for bubbling (regular) subscribers  */
                if (params.bubbling && ev.propagation()) {
                    for (i = 1; i < comp_path.length; i++) {
                        event_dispatch_single(ev, comp_path[i], params, "bubbling");
                        if (!ev.propagation())
                            break;
                    }
                }

                /*  notify publisher on dispatch completion  */
                params.completed.call(comp, ev);
            };

            /*  perform event publishing,
                either asynchronous or synchronous  */
            if (ev.async())
                /* global setTimeout:false */
                setTimeout(_cs.hook("ComponentJS:settimeout:func", "pass", function () {
                    event_dispatch_all(ev, self, params);
                }), 0);
            else
                event_dispatch_all(ev, self, params);

            /*  return the event, directly the result value or no result value at all  */
            if (params.noresult)
                return undefined;
            else if (params.directresult)
                return ev.result();
            else
                return ev;
        }
    }
});

