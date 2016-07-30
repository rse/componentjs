/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  internal hook registry  */
_cs.hooks = {};

/*  internal hook processing  */
_cs.hook_proc = {
    "none":   { init: undefined,                     step: function (    ) {                          } },
    "pass":   { init: function (a) { return a[0]; }, step: function (a, b) { return b;                } },
    "or":     { init: false,                         step: function (a, b) { return a || b;           } },
    "and":    { init: true,                          step: function (a, b) { return a && b;           } },
    "mult":   { init: 1,                             step: function (a, b) { return a * b;            } },
    "add":    { init: 0,                             step: function (a, b) { return a + b;            } },
    "append": { init: "",                            step: function (a, b) { return a + b;            } },
    "push":   { init: [],                            step: function (a, b) { a.push(b); return a;     } },
    "concat": { init: [],                            step: function (a, b) { return _cs.concat(a, b); } },
    "insert": { init: {},                            step: function (a, b) { a[b] = true; return a;   } },
    "extend": { init: {},                            step: function (a, b) { return _cs.extend(a, b); } }
};

/*  latch into internal ComponentJS hook  */
_cs.latch = function (name, cb) {
    /*  sanity check arguments  */
    if (arguments.length < 2)
        throw _cs.exception("latch(internal)", "missing arguments");

    /*  on-the-fly create hook callback registry  */
    if (typeof _cs.hooks[name] === "undefined")
        _cs.hooks[name] = [];

    /*  store callback in hook callback registry  */
    var args = _cs.slice(arguments, 2);
    var id = _cs.cid();
    _cs.hooks[name].push({ id: id, cb: cb, args: args });
    return id;
};

/*  unlatch from internal ComponentJS hook  */
_cs.unlatch = function (name, id) {
    /*  sanity check arguments  */
    if (arguments.length !== 2)
        throw _cs.exception("unlatch(internal)", "invalid number of arguments");
    if (typeof _cs.hooks[name] === "undefined")
        throw _cs.exception("unlatch(internal)", "no such hook");

    /*  search for callback in hook callback registry  */
    var k = -1;
    for (var i = 0; i < _cs.hooks[name].length; i++) {
        if (_cs.hooks[name][i].id === id) {
            k = i;
            break;
        }
    }
    if (k === -1)
        throw _cs.exception("unlatch(internal)", "no such latched callback");

    /*  remove callback from hook callback registry  */
    _cs.hooks[name] = _cs.hooks[name].splice(k, 1);
    return;
};

/*  provide internal ComponentJS hook  */
_cs.hook = function (name, proc) {
    /*  sanity check arguments  */
    if (arguments.length < 2)
        throw _cs.exception("hook(internal)", "missing argument");
    if (typeof _cs.hook_proc[proc] === "undefined")
        throw _cs.exception("hook(internal)", "no such result processing defined");

    /*  start result with the initial value  */
    var result = _cs.hook_proc[proc].init;
    var args = null;
    if (typeof result === "function") {
        args = _cs.slice(arguments, 2);
        result = result.call(null, args);
    }

    /*  give all registered callbacks a chance to
        execute and modify the current result  */
    if (typeof _cs.hooks[name] !== "undefined") {
        if (args === null)
            args = _cs.slice(arguments, 2);
        _cs.foreach(_cs.hooks[name], function (l) {
            /*  call latched callback  */
            var r = l.cb.apply({
                args:   l.args,                 /*  latch arguments  */
                result: result,                 /*  current result   */
                hooks:  _cs.hooks[name].length, /*  total number of hooks latched  */
                _cs:    _cs,                    /*  internal ComponentJS API  */
                $cs:    $cs                     /*  external ComponentJS API  */
            }, args);                           /*  hook arguments  */

            /*  process/merge results  */
            result = _cs.hook_proc[proc].step.call(null, result, r);
        });
    }

    /*  return the final result  */
    return result;
};

