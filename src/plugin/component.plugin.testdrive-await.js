/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  list of currently awaited scenarios  */
var awaited = [];

/*  a situation change occurred...  */
var changeOccured = function (comp, state, direction) {
    var i;

    /*  if a component was created, refresh all component lookups
        which previously resolved to the "none" component, in the hope
        they now resolve to the new component  */
    if (_cs.states.length <= 1)
        throw _cs.exception("await(internal)", "no user-defined component states");
    if (state === _cs.states[1].state && direction === "enter")
        for (i = 0; i < awaited.length; i++)
            if (awaited[i].comp === _cs.none)
                awaited[i].comp = $cs(awaited[i].path);

    /*  iterate over all awaiting situations...  */
    for (i = 0; typeof awaited[i] !== "undefined"; ) {
        if (   awaited[i].comp      === comp
            && awaited[i].state     === state
            && awaited[i].direction === direction) {

            /*  asynchronously fulfill all promises and remove entry from awaited situations  */
            for (var j = 0; j < awaited[i].promises.length; j++) {
                (function (promise, comp) {
                    /* global setTimeout: false */
                    setTimeout(_cs.hook("ComponentJS:settimeout:func", "pass", function () {
                        promise.fulfill(comp);
                    }), 0);
                })(awaited[i].promises[j], comp);
            }
            awaited.splice(i, 1);
        }
        else
            i++;
    }

    /* if a component was destroyed, it will soon no longer be
       attached to the component tree, so change its lookup back to
       "none" in all remaining awaiting situations  */
    if (state === _cs.states[1].state && direction === "leave")
        for (i = 0; i < awaited.length; i++)
            if (awaited[i].comp === comp)
                awaited[i].comp = _cs.none;
};

/*  global API function: await a particular state to occur  */
$cs.await = function (path, state, direction) {
    /*  determine parameters  */
    var params = $cs.params("await", arguments, {
        path:       { pos: 0, req: true,    valid: "string" },
        state:      { pos: 1, req: true,    valid: "string" },
        direction:  { pos: 2, def: "enter", valid: "string" }
    });

    /*  sanity check state  */
    if (_cs.states.length <= 1)
        throw _cs.exception("await", "no user-defined component states");
    var idx = _cs.state_name2idx(params.state);
    if (idx === -1)
        throw _cs.exception("await", "invalid state name \"" + params.state + "\": no such state defined");

    /*  sanity check direction  */
    if (!params.direction.match(/^(?:enter|leave)$/))
        throw _cs.exception("await", "invalid direction \"" + params.direction + "\"");

    /*  create new promise  */
    var promise = new $cs.promise();

    /*  store awaiting situation  */
    var i;
    for (i = 0; i < awaited.length; i++) {
        if (   awaited[i].path      === params.path
            && awaited[i].state     === params.state
            && awaited[i].direction === params.direction) {
            break;
        }
    }
    if (i === awaited.length) {
        awaited[i] = {
            path:      params.path,
            comp:      $cs(params.path),
            state:     params.state,
            direction: params.direction,
            promises:  []
        };
    }
    awaited[i].promises.push(promise);

    /*  at least once check current situation  */
    var comp = awaited[i].comp;
    if (comp !== _cs.none)
        changeOccured(comp, comp.state(), "enter");

    /*  return (proxied) promise  */
    return promise.proxy;
};

/*  hook into the core functionality  */
_cs.latch("ComponentJS:bootstrap", function () {
    _cs.latch("ComponentJS:comp-created", function (comp) {
        if (_cs.states.length <= 1)
            throw _cs.exception("await(internal)", "no user-defined component states");
        changeOccured(comp, _cs.states[1].state, "enter");
    });
    _cs.latch("ComponentJS:comp-destroyed", function (comp) {
        if (_cs.states.length <= 1)
            throw _cs.exception("await(internal)", "no user-defined component states");
        changeOccured(comp, _cs.states[1].state, "leave");
    });
    _cs.latch("ComponentJS:state-enter", function (comp, state) {
        changeOccured(comp, state, "enter");
    });
    _cs.latch("ComponentJS:state-leave", function (comp, state) {
        changeOccured(comp, state, "leave");
    });
});

