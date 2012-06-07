/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
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

            /*  explicitly call optional constructor function  */
            if (exec_constructor && _cs.annotation(clz, "constructor") !== null) {
                var cons = _cs.annotation(clz, "constructor");
                if (_cs.istypeof(clz) === "clazz")
                    cons.apply(obj, arg); /* (might call parent constructor itself) */
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

    var no_internals = function (name, value) {
        return !name.match("^(?:base|__ComponentJS_[A-Za-z]+__)$");
    };

    if (_cs.isdefined(params.extend)) {
        /*  inherit all static fields  */
        _cs.extend(clazz, params.extend, no_internals);

        /*  set the prototype chain to inherit from parent class,
            but WITHOUT calling the parent class's constructor function  */
        var ctor = function () {
            this.constructor = clazz;
        }
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

    /*  explicitly add "base()" utility method for calling
        the base function in the inheritance/mixin chain  */
    clazz.prototype.base = function () {
        /*  attempt 1: call super function in mixin chain  */
        if (_cs.istypeof(_cs.annotation(arguments.callee.caller, "base")) === "function")
            return _cs.annotation(arguments.callee.caller, "base").apply(this, arguments);

        /*  attempt 2: call super function in inheritance chain  */
        else if (   _cs.istypeof(_cs.annotation(arguments.callee.caller, "name")) === "string"
                 && _cs.istypeof(_cs.annotation(this.constructor, "extend")) === "object"
                 && _cs.istypeof(_cs.annotation(this.constructor, "extend")[arguments.callee.caller.__name__]) === "function")
            return _cs.annotation(this.constructor, "extend")[arguments.callee.caller.__name__].apply(this, arguments);

        /*  else just give up and throw an exception  */
        else
            throw _cs.exception("base", "no base method found in inheritance/mixin chain");
    };

    /*
     * STEP 5: ALLOW TRAITS TO POST-ADJUST/SETUP DEFINED CLASS
     */

    /*  only classes execute trait setups...  */
    if (is_clazz) {
        var setup = function (trait) {
            /*  depth-first traversal  */
            if (_cs.istypeof(_cs.annotation(trait, "mixin")) === "array") {
                var mixin = _cs.annotation(trait, "mixin");
                for (var i = 0; i < mixin.length; i++)
                    arguments.callee(mixin[i]); /* RECURSION */
            }

            /*  execute optionally existing setup function  */
            if (_cs.istypeof(_cs.annotation(trait, "setup")) === "function")
                _cs.annotation(trait, "setup").call(trait);
        };
        setup(clazz);
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

