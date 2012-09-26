/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
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
    _cs.states = _cs.states.slice(1);
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

/*  determine state index via state name  */
_cs.state_name2idx = function (name) {
    var idx = -1;
    for (i = 0; i < _cs.states.length; i++) {
        if (_cs.states[i].state === name) {
            idx = i;
            break;
        }
    }
    return idx;
};

/*  set of current state transition requests
    (modeled via a map to the components)  */
_cs.state_requests = {};

/*  spawn all progression runs (asynchronously)  */
_cs.state_progression = function () {
    setTimeout(function () {
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

        /*  give the debugger a chance to update itself  */
        _cs.dbg_update();
    }, 0);
};

/*  execute single progression run  */
_cs.state_progression_single = function (req) {
    var done = false;
    _cs.state_progression_run(req.comp, req.state);
    if (req.comp.state() === req.state) {
        if (typeof req.callback === "function")
            req.callback.call(req.comp, req.state);
        done = true;
    }
    return done;
};

/*  perform a single synchronous progression run for a particular component  */
_cs.state_progression_run = function (comp, arg, _direction) {
    var i, children, obj;
    var state, enter, leave;

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
                    _cs.state_progression_run(comp.parent(), state, "upward");
                    if (comp.parent().state_compare(state) < 0) {
                        $cs.debug(1,
                            "state: " + comp.path("/") + ": transition (increase) REJECTED BY PARENT COMPONENT (" + comp.parent().path("/") + "): " +
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
            _cs.dbg_state_invalidate("states");
            _cs.dbg_update();
            obj = comp.obj();
            if (obj !== null) {
                if (typeof obj[enter] === "function") {
                    if (obj[enter]() === false) {
                        /*  FULL STOP: state enter method rejected state transition  */
                        $cs.debug(1,
                            "state: " + comp.path("/") + ": transition (increase) REJECTED BY ENTER METHOD: " +
                            "@" + _cs.states[comp.__state - 1].state + " --(" + enter + ")--> " +
                            "@" + _cs.states[comp.__state].state + ": SUSPENDING CURRENT TRANSITION RUN"
                        );
                        comp.__state--;
                        return;
                    }
                }
            }
            comp.publish({
                name:         "ComponentJS:state:" + _cs.states[comp.__state].state,
                directresult: true,
                capturing:    false,
                bubbling:     false,
                async:        true,
                silent:       true
            });

            /*  optionally automatically transition
                child component(s) to higher state third  */
            if (_direction === "upward-and-downward" || _direction === "downward") {
                children = comp.children();
                for (i = 0; i < children.length; i++) {
                    if (children[i].state_compare(state) < 0) {
                        if (   children[i].state_auto_increase()
                            || children[i].property("ComponentJS:state-auto-increase") === true) {
                            _cs.state_progression_run(children[i], state, "downward");
                            if (children[i].state_compare(state) < 0) {
                                /*  enqueue state transition for child  */
                                _cs.state_requests[children[i].id()] =
                                    { comp: children[i], state: state };
                                _cs.dbg_state_invalidate("requests");
                                _cs.dbg_update();
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
                    _cs.state_progression_run(children[i], state_lower, "downward");
                    if (children[i].state_compare(state_lower) > 0) {
                        $cs.debug(1,
                            "state: " + comp.path("/") + ": transition (decrease) REJECTED BY CHILD COMPONENT (" + children[i].path("/") + "): " +
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
            obj = comp.obj();
            if (obj !== null) {
                if (typeof obj[leave] === "function") {
                    if (obj[leave]() === false) {
                        /*  FULL STOP: state leave method rejected state transition  */
                        $cs.debug(1,
                            "state: " + comp.path("/") + ": transition (decrease) REJECTED BY LEAVE METHOD: " +
                            "@" + _cs.states[comp.__state].state + " <--(" + leave + ")-- " +
                            "@" + _cs.states[comp.__state + 1].state + ": SUSPENDING CURRENT TRANSITION RUN"
                        );
                        comp.__state++;
                        return;
                    }
                }
            }
            comp.publish({
                name:         "ComponentJS:state:" + _cs.states[comp.__state].state,
                directresult: true,
                capturing:    false,
                bubbling:     false,
                async:        true,
                silent:       true
            });

            /*  optionally automatically transition
                parent component to lower state third  */
            if (_direction === "upward-and-downward" || _direction === "upward") {
                if (comp.parent() !== null) {
                    if (comp.parent().state_compare(state_lower) > 0) {
                        if (   comp.parent().state_auto_decrease()
                            || comp.parent().property("ComponentJS:state-auto-decrease") === true) {
                            _cs.state_progression_run(comp.parent(), state_lower, "upward");
                            if (comp.parent().state_compare(state_lower) > 0) {
                                /*  enqueue state transition for parent  */
                                _cs.state_requests[comp.parent().id()] =
                                    { comp: comp.parent(), state: state_lower };
                                _cs.dbg_state_invalidate("requests");
                                _cs.dbg_update();
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
                callback: { pos: 1, def: undefined },
                sync:     {         def: false     }
            });

            /*  if requested state is still not reached...  */
            if (_cs.states[this.__state].state !== params.state) {
                var enqueue = true;
                var request = {
                    comp:     this,
                    state:    params.state,
                    callback: params.callback
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
                    _cs.dbg_state_invalidate("requests");
                    _cs.state_progression();
                }
            }
            else {
                /*  still run its optional callback function  */
                if (typeof params.callback === "function")
                    params.callback.call(this, params.state);
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
                method:   { pos: 0, valid: "string",  req: true },
                activate: { pos: 1, valid: "boolean", req: true }
            });

            /*  sanity check enter/leave method name  */
            var valid = false;
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

            /*  activate/deactivate guard  */
            if (params.activate)
                /*  activate guard  */
                this.__state_guards[params.method] = true;
            else {
                /*  deactivate guard  */
                delete this.__state_guards[params.method];

                /*  give all pending state transitions
                    (which now might proceed) a chance  */
                _cs.state_progression();
            }
        }
    }
});

