/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  utility function: define a JavaScript "class"  */
_cs.clazz_or_trait = function (params, is_clazz) {
    /*
     *  STEP 1: CREATE NEW CLASS
     */

    /*  create technical class constructor  */
    var clazz = function () {
        /*  remember information  */
        var obj = this;
        var clz = arguments.callee;
        var arg = arguments;

        /*  support also calls like "foo()" instead of "new foo()"  */
        if (!(obj instanceof clz))
            return new clz(); /* RECURSION */

        /*  initialize all mixin traits and this class (or trait)  */
        var init = function (obj, clz, arg, exec_constructor) {
            /*  depth-first visit of parent class  */
            if (_cs.annotation(clz, "extend") !== null)
                arguments.callee(obj, _cs.annotation(clz, "extend"), arg, false); /* RECURSION */

            /*  depth-first visit of mixin traits  */
            if (_cs.annotation(clz, "mixin") !== null) {
                var mixin = _cs.annotation(clz, "mixin");
                for (var i = 0; i < mixin.length; i++)
                    arguments.callee(obj, mixin[i], arg, true); /* RECURSION */
            }

            /*  establish clones of all own dynamic fields  */
            if (_cs.annotation(clz, "dynamics") !== null) {
                var dynamics = _cs.annotation(clz, "dynamics");
                for (var field in dynamics) {
                    if (_cs.isown(dynamics, field)) {
                        if (   _cs.istypeof(dynamics[field]) !== "null"
                            && _cs.istypeof(dynamics[field].clone) === "function")
                            obj[field] = dynamics[field].clone();
                        else
                            obj[field] = _cs.clone(dynamics[field]);
                    }
                }
            }

            /*  explicitly call optional constructor function
                NOTICE: a clazz gets supplied the original constructor
                parameters (we assume that it knows what to do with
                all or at least the N initial parameters as it is a
                real parent/base/super class) and has to call its own
                parent/base/super constructor itself via this.base(),
                but a trait intentionally gets no constructor parameters
                passed-through (as it cannot know where it gets mixed
                into, so it cannot know what to do with the parameters)  */
            if (exec_constructor && _cs.annotation(clz, "constructor") !== null) {
                var cons = _cs.annotation(clz, "constructor");
                if (_cs.istypeof(clz) === "clazz")
                    cons.apply(obj, arg);
                else
                    cons.call(obj);
            }
        };
        init(obj, clz, arg, true);

        return;
    };

    /*
     *  STEP 2: OPTIONALLY IMPLICITLY INHERIT FROM PARENT CLASS
     */

    var no_internals = function (name /*, value */) {
        return !name.match("^(?:base|__ComponentJS_[A-Za-z]+__)$");
    };

    if (_cs.isdefined(params.extend)) {
        /*  inherit all static fields  */
        _cs.extend(clazz, params.extend, no_internals);

        /*  set the prototype chain to inherit from parent class,
            but WITHOUT calling the parent class's constructor function  */
        var ctor = function () {
            this.constructor = clazz;
        };
        ctor.prototype = params.extend.prototype;
        clazz.prototype = new ctor();

        /*  remember parent class  */
        _cs.annotation(clazz, "extend", params.extend);
    }

    /*
     *  STEP 3: OPTIONALLY EXPLICITLY INHERIT FROM MIXIN CLASSES
     */

    if (_cs.isdefined(params.mixin)) {
        /*  inherit from mixin classes  */
        for (var i = 0; i < params.mixin.length; i++) {
            /*  inherit all static fields  */
            _cs.extend(clazz, params.mixin[i], no_internals);

            /*  inherit prototype methods  */
            _cs.mixin(clazz.prototype, params.mixin[i].prototype, no_internals);
        }

        /*  remember mixin classes  */
        _cs.annotation(clazz, "mixin", params.mixin);
    }

    /*
     *  STEP 4: OPTIONALLY SET OWN FIELDS/METHODS
     */

    /*  remember user-supplied constructor function
        (and provide fallback implementation)  */
    if (_cs.isdefined(params.constructor))
        _cs.annotation(clazz, "constructor", params.constructor);
    else if (_cs.isdefined(params.extend))
        _cs.annotation(clazz, "constructor", function () { this.base(); });
    else
        _cs.annotation(clazz, "constructor", $cs.nop);

    /*  provide name for underlying implementation of "base()"  */
    _cs.annotation(_cs.annotation(clazz, "constructor"), "name", "constructor");
    if (_cs.isdefined(params.extend))
        _cs.annotation(_cs.annotation(clazz, "constructor"), "base",
            _cs.annotation(params.extend, "constructor"));

    /*  remember user-supplied setup function  */
    if (_cs.isdefined(params.setup))
        _cs.annotation(clazz, "setup", params.setup);

    /*  extend class with own poperties and methods  */
    if (_cs.isdefined(params.statics))
        _cs.extend(clazz, params.statics);
    if (_cs.isdefined(params.protos))
        _cs.mixin(clazz.prototype, params.protos);

    /*  remember dynamics for per-object initialization  */
    if (_cs.isdefined(params.dynamics))
        _cs.annotation(clazz, "dynamics", params.dynamics);

    /*  internal utility method for resolving an annotation on a
        possibly cloned function (just for the following "base" method)  */
    var resolve = function (func, name) {
        var result = _cs.annotation(func, name);
        while (result === null && _cs.annotation(func.caller, "clone") === true) {
            result = _cs.annotation(func.caller, name);
            func = func.caller;
        }
        return result;
    };

    /*  explicitly add "base()" utility method for calling
        the base/super/parent function in the inheritance/mixin chain  */
    clazz.prototype.base = function () {
        /*  NOTICE: arguments.callee are we just ourself (this function), while
                    arguments.callee.caller is the function calling this.base()!
                    and because our cs.clone() creates wrapper functions we
                    optionally have to take those into account during resolving, too!  */
        var name = resolve(arguments.callee.caller, "name");
        var base = resolve(arguments.callee.caller, "base");
        var extend = _cs.annotation(this.constructor, "extend");

        /*  attempt 1: call base/super/parent function in mixin chain  */
        if (_cs.istypeof(base) === "function")
            return base.apply(this, arguments);

        /*  attempt 2: call base/super/parent function in inheritance chain (directly on object)  */
        else if (   _cs.istypeof(name) === "string"
                 && _cs.istypeof(extend) === "clazz"
                 && _cs.istypeof(extend[name]) === "function")
            return extend[name].apply(this, arguments);

        /*  attempt 3: call base/super/parent function in inheritance chain (via prototype object)  */
        else if (   _cs.istypeof(name) === "string"
                 && _cs.istypeof(extend) === "clazz"
                 && _cs.istypeof(extend.prototype) === "object"
                 && _cs.istypeof(extend.prototype[name]) === "function")
            return extend.prototype[name].apply(this, arguments);

        /*  else just give up and throw an exception  */
        else
            throw _cs.exception("base", "no base method found for method \"" +
                name + "\" in inheritance/mixin chain");
    };

    /*
     * STEP 5: ALLOW TRAITS TO POST-ADJUST/SETUP DEFINED CLASS
     */

    /*  only classes execute trait setups...  */
    if (is_clazz) {
        var setup = function (clazz, trait) {
            /*  depth-first traversal  */
            if (_cs.istypeof(_cs.annotation(trait, "mixin")) === "array") {
                var mixin = _cs.annotation(trait, "mixin");
                for (var i = 0; i < mixin.length; i++)
                    arguments.callee(clazz, mixin[i]); /* RECURSION */
            }

            /*  execute optionally existing setup function  */
            if (_cs.istypeof(_cs.annotation(trait, "setup")) === "function")
                _cs.annotation(trait, "setup").call(clazz);
        };
        setup(clazz, clazz);
    }

    /*
     * STEP 6: PROVIDE RESULTS
     */

    /*  optionally insert class into global namespace ourself  */
    if (typeof params.name === "string")
        $cs.ns(params.name, clazz);

    /*  return created class  */
    return clazz;
};

