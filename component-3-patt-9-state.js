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
      state: "dead"
    }
];

/*  clear all state transitions (except for "dead" state)  */
_cs.states_clear = function () {
    _cs.states = _cs.states.slice(1);
    return;
};

/*  add a state transition  */
_cs.states_add = function (target, enter, leave, source) {
    /*  create new state configuration  */
    var state = {
        enter: enter,
        leave: leave,
        state: target
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

/*  generic pattern for state management  */
$cs.pattern.state = $cs.trait({
    mixin: [
        $cs.pattern.tree
    ],
    dynamics: {
        /*  attributes  */
        __state: 0, /* = dead */
        state_auto_increase: $cs.attribute("state_auto_increase", false),
        state_auto_decrease: $cs.attribute("state_auto_decrease", false)
    },
    protos: {
        /*  get/set state of component  */
        state: function (arg, _direction) {
            var i, children, obj;

            /*  handle optional argument (USED INTERNALLY ONLY)  */
            if (typeof _direction === "undefined")
                _direction = "upward-and-downward";

            if (typeof arg === "string") {
                /*  determine index of state by name  */
                var state_new = -1;
                for (i = 0; i < _cs.states.length; i++) {
                    if (_cs.states[i].state === arg) {
                        state_new = i;
                        break;
                    }
                }
                if (state_new === -1)
                    throw _cs.exception("state", "invalid argument \"" + arg + "\"");

                /*  perform upward/downward state transition(s)  */
                var state;
                var enter;
                var leave;
                if (this.__state < state_new) {
                    /*  transition to higher state  */
                    while (this.__state < state_new) {
                        /*  determine names of state and enter method  */
                        state = _cs.states[this.__state + 1].state;
                        enter = _cs.states[this.__state + 1].enter;

                        /*  mandatory transition parent component to higher state first  */
                        if (this.parent() !== null) {
                            if (this.parent().state_compare(state) < 0) {
                                this.parent().state(state, "upward");
                                if (this.parent().state_compare(state) < 0) {
                                    _cs.log("WARNING: state: failed to enter state \"" + state + "\"" +
                                        " (parent component failed to enter at least this state first)");
                                    return this.state();
                                }
                            }
                        }

                        /*  transition current component to higher state second  */
                        this.__state++;
                        obj = this.obj();
                        if (obj !== null) {
                            if (typeof obj[enter] === "function") {
                                $cs.debug(1, "state: entering:" +
                                    " component=\"" + this.path("/") + "\"" +
                                    " state=\"" + state + "\"" +
                                    " method=\"" + enter + "\""
                                );
                                if (obj[enter]() === false) {
                                    _cs.log("WARNING: state: failed to enter state \"" + state + "\"");
                                    this.__state--;
                                    return this.state();
                                }
                            }
                        }

                        /*  optionally automatically transition
                            child component(s) to higher state third  */
                        if (_direction === "upward-and-downward" || _direction === "downward") {
                            children = this.children();
                            for (i = 0; i < children.length; i++)
                                if (children[i].state_compare(state) < 0)
                                    if (children[i].state_auto_increase())
                                        children[i].state(state, "downward");
                        }
                    }
                }
                else if (this.__state > state_new) {
                    /*  transition to lower state  */
                    while (this.__state > state_new) {
                        /*  determine names of state and leave method  */
                        state = _cs.states[this.__state].state;
                        leave = _cs.states[this.__state].leave;
                        var state_lower = _cs.states[this.__state - 1].state;

                        /*  mandatory transition children component(s) to lower state first  */
                        children = this.children();
                        for (i = 0; i < children.length; i++) {
                            if (children[i].state_compare(state_lower) > 0) {
                                children[i].state(state_lower, "downward");
                                if (children[i].state_compare(state_lower) > 0) {
                                    _cs.log("WARNING: state: failed to leave state \"" + state + "\"" +
                                        " (child component failed to leave at least this state first)");
                                    return this.state();
                                }
                            }
                        }

                        /*  transition current component to lower state second  */
                        this.__state--;
                        obj = this.obj();
                        if (obj !== null) {
                            if (typeof obj[leave] === "function") {
                                $cs.debug(1, "state: leaving:" +
                                    " component=\"" + this.path("/") + "\"" +
                                    " state=\"" + state + "\"" +
                                    " method=\"" + leave + "\""
                                );
                                if (obj[leave]() === false) {
                                    _cs.log("WARNING: state: failed to leave state \"" + state + "\"");
                                    this.__state++;
                                    return this.state();
                                }
                            }
                        }

                        /*  optionally automatically transition
                            parent component to lower state third  */
                        if (_direction === "upward-and-downward" || _direction === "upward")
                            if (this.parent() !== null)
                                if (this.parent().state_compare(state_lower) > 0)
                                    if (this.parent().state_auto_decrease())
                                        this.parent().state(state_lower, "upward");
                    }
                }
            }

            /*  return current (or new) state  */
            return _cs.states[this.__state].state;
        },

        /*  compare state of component  */
        state_compare: function (arg) {
            /*  sanity check argument  */
            if (typeof arg === "undefined")
                throw _cs.exception("state_compare", "missing state argument");
            else if (typeof arg !== "string")
                throw _cs.exception("state_compare", "invalid state argument");

            /*  determine index of state by name  */
            var state = -1;
            for (var i = 0; i < _cs.states.length; i++) {
                if (_cs.states[i].state === arg) {
                    state = i;
                    break;
                }
            }
            if (state === -1)
                throw _cs.exception("state_compare", "invalid state argument \"" + arg + "\"");

            /*  compare given state against state of component  */
            return (this.__state - state);
        }
    }
});

