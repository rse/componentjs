/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  for passing a function as a callback parameter,
    wrap the function into a proxy function which
    has a particular excecution scope. Also supports
    optional cloning which allows to carry a private
    context which will be cloned together with function  */
_cs.proxy = function (ctx, func, clonable) {
    /*  support plain method name  */
    if (_cs.istypeof(func) === "string")
        if (_cs.istypeof(ctx) === "object")
            if (_cs.istypeof(ctx[func]) === "function")
                func = ctx[func];

    /*  fallback for clonable parameter  */
    if (!_cs.isdefined(clonable))
        clonable = false;

    /*  define the generator  */
    var generator = function () {
        /*  generate new wrapper function  */
        var proxy = function () {
            /*  if context is an object, annotate it with
                the real "this" pointer of this method call  */
            if (_cs.istypeof(arguments.callee.__ctx__) === "object")
                arguments.callee.__ctx__.__this__ = this;

            /*  just pass execution through to wrapped function
                with our attached store as its execution context object  */
            return func.apply(arguments.callee.__ctx__, arguments);
        };

        /*  create the attached store object
            (either with fresh or cloned context)  */
        proxy.__ctx__ = (clonable ? _cs.clone(_cs.isdefined(this.__ctx__) ? this.__ctx__ : ctx) : ctx);

        /*  add ourself as the cloning function  */
        if (clonable)
            proxy.clone = generator;

        /*  set "guid" property to the same of original function,
            so it is garbage collected correctly  */
        proxy.guid = func.guid = (func.guid || proxy.guid || _cs.cid());

        /*  return the new wrapper function  */
        return proxy;
    };

    /*  run the generator once  */
    return generator.call({});
};

/*  generate a proxy function which memoizes/caches the result of an
    idempotent function (a function without side-effects which always
    returns the same output value on the same input parameters)  */
_cs.memoize = function (func) {
    var f = function () {
        var key = _cs.json(_cs.slice(arguments, 0));
        var val; val = undefined;
        if (typeof arguments.callee.cache[key] !== "undefined") {
            /*  take memoized/cached value  */
            val = arguments.callee.cache[key];
        }
        else {
            /*  calculate new value and memoize/cache it  */
            val = func.apply(this, arguments);
            arguments.callee.cache[key] = val;
        }
        return val;
    };
    f.cache = {};
    return f;
};

/*  generate a proxy function which uses "currying"
    to remember its initially supplied arguments  */
_cs.curry = function (func) {
    var args_stored = _cs.slice(arguments, 1);
    return function () {
        var args_supplied = _cs.slice(arguments, 0);
        var args = _cs.concat(args_stored, args_supplied);
        return func.apply(this, args);
    };
};

