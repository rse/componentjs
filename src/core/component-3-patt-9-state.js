/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  component states  */
_cs.states = [
    { /* component is not existing (bootstrapping state transitions only) */
      enter: null,
      leave: null,
      state: "dead",
      color: "#000000"
    }
];

/*  clear all state transitions (except for "dead" state)  */
_cs.states_clear = function () {
    _cs.states = _cs.slice(_cs.states, 0, 1);
    return;
};

/*  add a state transition  */
_cs.states_add = function (target, enter, leave, color, source) {
    /*  create new state configuration  */
    var state = {
        enter: enter,
        leave: leave,
        state: target,
        color: color
    };

    /*  determine storage position  */
    var pos = 1;
    while (pos < _cs.states.length) {
        if (   source !== null
            && _cs.states[pos].state === source)
            break;
        pos++;
    }

    /*  store state  */
    _cs.states.splice(pos, 0, state);
};

/*  determine all state methods  */
_cs.state_methods = function () {
    var i;
    var stateMethods = {};
    for (i = 0; i < _cs.states.length; i++) {
        if (_cs.states[i].enter)
            stateMethods[_cs.states[i].enter] = _cs.states[i];
        if (_cs.states[i].leave)
            stateMethods[_cs.states[i].leave] = _cs.states[i];
    }
    return stateMethods;
};

/*  determine state index via state name  */
_cs.state_name2idx = function (name) {
    var idx = -1;
    var i;
    for (i = 0; i < _cs.states.length; i++) {
        if (_cs.states[i].state === name) {
            idx = i;
            break;
        }
    }
    return idx;
};

/*  perform a state enter/leave method call  */
_cs.state_method_call = function (type, comp, method) {
    var result = true;
    var obj = comp.obj();
    if (obj !== null && typeof obj[method] === "function") {
        var info = { type: type, comp: comp, method: method, ctx: obj, func: obj[method] };
        _cs.hook("ComponentJS:state-method-call", "none", info);
        result = info.func.call(info.ctx);
    }
    return result;
};

/*  set of current state transition requests
    (modeled via a map to the components)  */
_cs.state_requests = {};

/*  spawn all progression runs (asynchronously)  */
_cs.state_progression = function () {
    /* global setTimeout:false */
    setTimeout(_cs.hook("ComponentJS:settimeout:func", "pass", function () {
        /*  try to process the transition requests  */
        var remove = [];
        for (var cid in _cs.state_requests) {
            if (!_cs.isown(_cs.state_requests, cid))
                continue;
            var req = _cs.state_requests[cid];
            if (_cs.state_progression_single(req))
                remove.push(cid);
        }

        /*  perform deferred removal of original fields  */
        _cs.foreach(remove, function (cid) {
            delete _cs.state_requests[cid];
        });

        /*  give plugins a chance to react  */
        _cs.hook("ComponentJS:state-change", "none");
    }), 0);
};

/*  execute single progression run  */
_cs.state_progression_single = function (req) {
    var done = false;
    _cs.state_progression_run(req.comp, req.state);
    if (_cs.states[req.comp.__state].state === req.state) {
        if (typeof req.callback === "function")
            req.callback.call(req.comp, req.state);
        done = true;
    }
    return done;
};

/*  perform a single synchronous progression run for a particular component  */
_cs.state_progression_run = function (comp, arg, _direction) {
    var i, children;
    var state, enter, leave, spooled;

    /*  handle optional argument (USED INTERNALLY ONLY)  */
    if (typeof _direction === "undefined")
        _direction = "upward-and-downward";

    /*  determine index of state by name  */
    var state_new = _cs.state_name2idx(arg);
    if (state_new === -1)
        throw _cs.exception("state", "invalid argument \"" + arg + "\"");

    /*  perform upward/downward state transition(s)  */
    if (comp.__state < state_new) {
        /*  transition to higher state  */
        while (comp.__state < state_new) {
            /*  determine names of state and enter method  */
            state = _cs.states[comp.__state + 1].state;
            enter = _cs.states[comp.__state + 1].enter;

            /*  mandatory transition parent component to higher state first  */
            if (comp.parent() !== null) {
                if (comp.parent().state_compare(state) < 0) {
                    _cs.state_progression_run(comp.parent(), state, "upward"); /*  RECURSION  */
                    if (comp.parent().state_compare(state) < 0) {
                        $cs.debug(1,
                            "state: " + comp.path("/") + ": transition (increase) " +
                            "REJECTED BY PARENT COMPONENT (" + comp.parent().path("/") + "): " +
                            "@" + _cs.states[comp.__state].state + " --(" + enter + ")--> " +
                            "@" + _cs.states[comp.__state + 1].state + ": SUSPENDING CURRENT TRANSITION RUN"
                        );
                        return;
                    }
                }
            }

            /*  transition current component to higher state second  */
            if (_cs.isdefined(comp.__state_guards[enter])) {
                $cs.debug(1,
                    "state: " + comp.path("/") + ": transition (increase) REJECTED BY ENTER GUARD: " +
                    "@" + _cs.states[comp.__state].state + " --(" + enter + ")--> " +
                    "@" + _cs.states[comp.__state + 1].state + ": SUSPENDING CURRENT TRANSITION RUN"
                );
                return;
            }
            comp.__state++;
            $cs.debug(1,
                "state: " + comp.path("/") + ": transition (increase): " +
                "@" + _cs.states[comp.__state - 1].state + " --(" + enter + ")--> " +
                "@" + _cs.states[comp.__state].state
            );
            _cs.hook("ComponentJS:state-invalidate", "none", "states");
            _cs.hook("ComponentJS:state-change", "none");

            /*  execute enter method  */
            if (_cs.state_method_call("enter", comp, enter) === false) {
                /*  FULL STOP: state enter method rejected state transition  */
                $cs.debug(1,
                    "state: " + comp.path("/") + ": transition (increase) REJECTED BY ENTER METHOD: " +
                    "@" + _cs.states[comp.__state - 1].state + " --(" + enter + ")--> " +
                    "@" + _cs.states[comp.__state].state + ": SUSPENDING CURRENT TRANSITION RUN"
                );
                comp.__state--;
                return;
            }

            /*  notify subscribers about new state  */
            comp.publish({
                name:         "ComponentJS:state:" + _cs.states[comp.__state].state + ":enter",
                noresult:     true,
                capturing:    false,
                spreading:    false,
                bubbling:     false,
                async:        true,
                silent:       true
            });

            /*  give plugins a chance to react  */
            _cs.hook("ComponentJS:state-enter", "none", comp, _cs.states[comp.__state].state);

            /*  optionally automatically transition
                child component(s) to higher state third  */
            if (_direction === "upward-and-downward" || _direction === "downward") {
                children = comp.children();
                for (i = 0; i < children.length; i++) {
                    if (children[i].state_compare(state) < 0) {
                        if (   children[i].state_auto_increase()
                            || children[i].property("ComponentJS:state-auto-increase") === true) {
                            _cs.state_progression_run(children[i], state, "downward"); /*  RECURSION  */
                            if (children[i].state_compare(state) < 0) {
                                /*  enqueue state transition for child  */
                                _cs.state_requests[children[i].id()] =
                                    { comp: children[i], state: state };
                                _cs.hook("ComponentJS:state-invalidate", "none", "requests");
                                _cs.hook("ComponentJS:state-change", "none");
                            }
                        }
                    }
                }
            }
        }
    }
    else if (comp.__state > state_new) {
        /*  transition to lower state  */
        while (comp.__state > state_new) {
            /*  determine names of state and leave method  */
            state = _cs.states[comp.__state].state;
            leave = _cs.states[comp.__state].leave;
            var state_lower = _cs.states[comp.__state - 1].state;

            /*  mandatory transition children component(s) to lower state first  */
            children = comp.children();
            for (i = 0; i < children.length; i++) {
                if (children[i].state_compare(state_lower) > 0) {
                    _cs.state_progression_run(children[i], state_lower, "downward"); /*  RECURSION  */
                    if (children[i].state_compare(state_lower) > 0) {
                        $cs.debug(1,
                            "state: " + comp.path("/") + ": transition (decrease) " +
                            "REJECTED BY CHILD COMPONENT (" + children[i].path("/") + "): " +
                            "@" + _cs.states[comp.__state - 1].state + " <--(" + leave + ")-- " +
                            "@" + _cs.states[comp.__state].state + ": SUSPENDING CURRENT TRANSITION RUN"
                        );
                        return;
                    }
                }
            }

            /*  transition current component to lower state second  */
            if (_cs.isdefined(comp.__state_guards[leave])) {
                $cs.debug(1,
                    "state: " + comp.path("/") + ": transition (decrease) REJECTED BY LEAVE GUARD: " +
                    "@" + _cs.states[comp.__state - 1].state + " <--(" + leave + ")-- " +
                    "@" + _cs.states[comp.__state].state + ": SUSPENDING CURRENT TRANSITION RUN"
                );
                return;
            }
            comp.__state--;
            $cs.debug(1,
                "state: " + comp.path("/") + ": transition (decrease): " +
                "@" + _cs.states[comp.__state].state + " <--(" + leave + ")-- " +
                "@" + _cs.states[comp.__state + 1].state
            );
            _cs.hook("ComponentJS:state-invalidate", "none", "states");
            _cs.hook("ComponentJS:state-change", "none");

            /*  execute leave method  */
            if (_cs.state_method_call("leave", comp, leave) === false) {
                /*  FULL STOP: state leave method rejected state transition  */
                $cs.debug(1,
                    "state: " + comp.path("/") + ": transition (decrease) REJECTED BY LEAVE METHOD: " +
                    "@" + _cs.states[comp.__state].state + " <--(" + leave + ")-- " +
                    "@" + _cs.states[comp.__state + 1].state + ": SUSPENDING CURRENT TRANSITION RUN"
                );
                comp.__state++;
                return;
            }
            else {
                /*  in case leave method successful or not present
                    automatically unspool still pending actions
                    on spool named exactly like the left state  */
                spooled = comp.spooled(state);
                if (spooled > 0) {
                    $cs.debug(1, "state: " + comp.path("/") + ": auto-unspooling " + spooled + " operation(s)");
                    comp.unspool(state);
                }
            }

            /*  notify subscribers about new state  */
            comp.publish({
                name:         "ComponentJS:state:" + _cs.states[comp.__state + 1].state + ":leave",
                noresult:     true,
                capturing:    false,
                spreading:    false,
                bubbling:     false,
                async:        true,
                silent:       true
            });

            /*  give plugins a chance to react  */
            _cs.hook("ComponentJS:state-leave", "none", comp, _cs.states[comp.__state + 1].state);

            /*  optionally automatically transition
                parent component to lower state third  */
            if (_direction === "upward-and-downward" || _direction === "upward") {
                if (comp.parent() !== null) {
                    if (comp.parent().state_compare(state_lower) > 0) {
                        if (   comp.parent().state_auto_decrease()
                            || comp.parent().property("ComponentJS:state-auto-decrease") === true) {
                            _cs.state_progression_run(comp.parent(), state_lower, "upward"); /*  RECURSION  */
                            if (comp.parent().state_compare(state_lower) > 0) {
                                /*  enqueue state transition for parent  */
                                _cs.state_requests[comp.parent().id()] =
                                    { comp: comp.parent(), state: state_lower };
                                _cs.hook("ComponentJS:state-invalidate", "none", "requests");
                                _cs.hook("ComponentJS:state-change", "none");
                            }
                        }
                    }
                }
            }
        }
    }
};

/*  generic pattern for state management  */
$cs.pattern.state = $cs.trait({
    mixin: [
        $cs.pattern.tree
    ],
    dynamics: {
        /*  attributes  */
        __state: 0, /* = dead */
        __state_guards: {},
        state_auto_increase: $cs.attribute("state_auto_increase", false),
        state_auto_decrease: $cs.attribute("state_auto_decrease", false)
    },
    protos: {
        /*  get state or set state (or at least trigger transition)  */
        state: function () {
            /*  special case: just retrieve current state  */
            var state_old = _cs.states[this.__state].state;
            if (arguments.length === 0)
                return state_old;

            /*  determine parameters  */
            var params = $cs.params("state", arguments, {
                state:    { pos: 0, req: true,
                            valid: function (s) { return _cs.state_name2idx(s) !== -1; } },
                func:     { pos: 1, def: undefined },
                min:      {         def: undefined },
                max:      {         def: undefined },
                sync:     {         def: false     }
            });

            /*  if requested state is still not reached...  */
            var sOld = this.__state;
            var sNew = _cs.state_name2idx(params.state);
            if (   ( params.min === true && !params.max          && sNew  >  sOld)
                || (!params.min          &&  params.max === true && sNew  <  sOld)
                || ( params.min === true &&  params.max === true && sNew !== sOld)
                || (!params.min          && !params.max          && sNew !== sOld)) {
                var enqueue = true;
                var request = {
                    comp:     this,
                    state:    params.state,
                    callback: params.func
                };
                if (params.sync) {
                    /*  perform new state transition request (synchronously)  */
                    if (_cs.state_progression_single(request))
                        enqueue = false;
                }
                if (enqueue) {
                    /*  enqueue new state transition request and trigger
                        state transition progression (asynchronously)  */
                    _cs.state_requests[this.id()] = request;
                    _cs.hook("ComponentJS:state-invalidate", "none", "requests");
                    _cs.state_progression();
                }
            }
            else {
                /*  still run its optional callback function  */
                if (typeof params.func === "function")
                    params.func.call(this, params.state);
            }

            /*  return old (and perhaps still current) state  */
            return state_old;
        },

        /*  compare state of component  */
        state_compare: function () {
            /*  determine parameters  */
            var params = $cs.params("state", arguments, {
                state: { pos: 0, req: true,
                         valid: function (s) { return _cs.state_name2idx(s) !== -1; } }
            });

            /*  determine index of state by name  */
            var state = _cs.state_name2idx(params.state);

            /*  compare given state against state of component  */
            return (this.__state - state);
        },

        /*  guard a state enter/leave method  */
        guard: function () {
            /*  determine parameters  */
            var params = $cs.params("guard", arguments, {
                method: { pos: 0, valid: "string", req: true },
                level:  { pos: 1, valid: "number", req: true }
            });

            /*  sanity check enter/leave method name  */
            var valid = false;
            var i;
            for (i = 0; i < _cs.states.length; i++) {
                if (   _cs.states[i].enter === params.method
                    || _cs.states[i].leave === params.method) {
                    valid = true;
                    break;
                }
            }
            if (!valid)
                throw _cs.exception("guard", "no such declared enter/leave method: \""
                    + params.method + "\"");

            /*  ensure the guard slot exists  */
            if (!_cs.isdefined(this.__state_guards[params.method]))
                this.__state_guards[params.method] = 0;

            /*  activate/deactivate guard  */
            var deactivate = false;
            if (params.level > 0)
                /*  increase guard level  */
                this.__state_guards[params.method] += params.level;
            else  if (params.level < 0) {
                /*  decrease guard level  */
                if (this.__state_guards[params.method] < (-params.level))
                    throw _cs.exception("guard", "guard level decrease request too large");
                this.__state_guards[params.method] += params.level;
                if (this.__state_guards[params.method] === 0)
                    deactivate = true;
            }
            else {
                /*  reset guard level  */
                this.__state_guards[params.method] = 0;
                deactivate = true;
            }
            if (deactivate) {
                /*  finally deactivate guard  */
                delete this.__state_guards[params.method];

                /*  give all pending state transitions
                    (which now might proceed) a chance  */
                _cs.state_progression();
            }
        }
    }
});

