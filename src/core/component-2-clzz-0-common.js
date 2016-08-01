/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
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
        var init = function (obj, clz, arg, exec_cons) {
            /*  depth-first visit of parent class  */
            var extend = _cs.annotation(clz, "extend");
            if (extend !== null)
                arguments.callee(obj, extend, arg, false); /* RECURSION */

            /*  depth-first visit of mixin traits  */
            var mixin = _cs.annotation(clz, "mixin");
            if (mixin !== null)
                for (var i = 0; i < mixin.length; i++)
                    arguments.callee(obj, mixin[i], arg, true); /* RECURSION */

            /*  establish clones of all own dynamic fields  */
            var dynamics = _cs.annotation(clz, "dynamics");
            if (dynamics !== null) {
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
            if (exec_cons) {
                var cons = _cs.annotation(clz, "cons");
                if (cons !== null) {
                    if (_cs.istypeof(clz) === "clazz")
                        cons.apply(obj, arg);
                    else
                        cons.call(obj);
                }
            }
        };
        init(obj, clz, arg, true);

        return obj;
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
     *  STEP 3: EXTEND CLASS WITH OWN PROPERTIES AND METHODS
     */

    /*  internal utility method for determining whether a given object
        defines a field that matches a state function  */
    var validateObject = function (identifier, obj) {
        var legal = true;
        if (_cs.istypeof(_cs.state_methods) === "function") {
            var stateMethods = _cs.state_methods();
            var wrongFields = [];
            for (var field in obj) {
                if (   _cs.isown(obj, field)
                    && stateMethods[field]) {
                    legal = false;
                    wrongFields.push("\"" + field + "\"");
                }
            }
            if (!legal)
                throw _cs.exception("clazz_or_trait", "definition of \"" + identifier +
                    "\" failed. You can not redefine state transition functions named " +
                    wrongFields.join(", "));
        }
        return legal;
    };

    if (_cs.isdefined(params.statics) && validateObject("statics", params.statics))
        _cs.extend(clazz, params.statics);
    if (_cs.isdefined(params.protos))
        _cs.mixin(clazz.prototype, params.protos);

    /*
     *  STEP 4: OPTIONALLY EXPLICITLY INHERIT FROM MIXIN CLASSES
     */

    /*  internal utility method for determining whether a function
        exists somewhere in the inheritance chain  */
    var has_base = function (name, clazz) {
        var extend = _cs.annotation(clazz, "extend");
        if (extend === null)
            return false;
        if (_cs.istypeof(extend) !== "clazz")
            return false;
        if (   _cs.istypeof(extend[name]) === "function"
            || (   _cs.istypeof(extend.prototype) === "object"
                && _cs.istypeof(extend.prototype[name]) === "function"))
            return true;
        else
            return has_base(name, extend);
    };

    if (_cs.isdefined(params.mixin)) {
        /*  inherit from mixin classes  */
        for (var i = 0; i < params.mixin.length; i++) {
            /*  inherit all static fields  */
            _cs.extend(clazz, params.mixin[i], no_internals);

            /*  as methods in mixin classes (traits) always have to call "this.base()",
                because they do not know where they are mixed into, we have to ensure
                that there is a target for "this.base()". If there is either a non-function
                (even undefined) property in the class we mixin into or the property
                is not our own one (and hence coming through the prototype chain),
                we provide a fallback no-operation function as the base function.  */
            for (var key in params.mixin[i].prototype) {
                if (!_cs.isown(params.mixin[i].prototype, key))
                    continue;
                if (   _cs.istypeof(clazz.prototype[key]) !== "function"
                    || !_cs.isown(clazz.prototype, key)                 ) {
                    var target;
                    if (has_base(key, clazz))
                        /*  provide a trampoline function  */
                        target = function () { return this.base.apply(this, arguments); };
                    else
                        /*  provide a no-operation function  */
                        target = function () {};
                    _cs.annotation(target, "name", key);
                    clazz.prototype[key] = target;
                }
            }

            /*  inherit prototype methods  */
            _cs.mixin(clazz.prototype, params.mixin[i].prototype, no_internals);
        }

        /*  remember mixin classes  */
        _cs.annotation(clazz, "mixin", params.mixin);
    }

    /*
     *  STEP 5: REMEMBER INFORMATION
     */

    /*  remember user-supplied constructor function
        (and provide fallback implementation)  */
    var cons = _cs.nop;
    if (_cs.isdefined(params.cons))
        cons = params.cons;
    else if (_cs.isdefined(params.extend))
        cons = function () { this.base(); };
    _cs.annotation(clazz, "cons", cons);

    /*  provide name for underlying implementation of "base()" for constructor  */
    _cs.annotation(cons, "name", "cons");
    if (_cs.isdefined(params.extend))
        _cs.annotation(cons, "base", _cs.annotation(params.extend, "cons"));

    /*  remember user-supplied setup function  */
    if (_cs.isdefined(params.setup))
        _cs.annotation(clazz, "setup", params.setup);

    /*  remember dynamics for per-object initialization  */
    if (_cs.isdefined(params.dynamics) && validateObject("dynamics", params.dynamics))
        _cs.annotation(clazz, "dynamics", params.dynamics);

    /*
     *  STEP 6: PROVIDE BASE/SUPER/PARENT RESOLVING FUNCTIONALITY
     */

    /*  internal utility method for resolving an annotation on a
        possibly cloned function (just for the following "base" method).
        Notice: for a cloned function the clone is a wrapper annotated
        with the annotation "clone" set to "true"!  */
    var resolve_annotation = function (func, name) {
        var result = _cs.annotation(func, name);
        while (result === null && _cs.annotation(func.caller, "clone") === true) {
            result = _cs.annotation(func.caller, name);
            func = func.caller;
        }
        return result;
    };

    /*  internal utility method for resolving the parent class
        in the inheritance chain by searching for one of its functions  */
    var resolve_extend = function (name, clazz, func) {
        /*  determine inheritance of current class  */
        var extend = _cs.annotation(clazz, "extend");
        if (extend === null)
            return null;

        /*  find function in current class' prototype and mixin chain  */
        var found = false;
        if (   _cs.istypeof(clazz.prototype[name]) === "function"
            && _cs.isown(clazz.prototype, name)                  ) {
            var currentFuncOfChain = clazz.prototype[name];
            while (_cs.istypeof(currentFuncOfChain) === "function") {
                if (currentFuncOfChain === func) {
                    found = true;
                    break;
                }
                currentFuncOfChain = resolve_annotation(currentFuncOfChain, "base");
            }
        }

        /*  if not found, search recusively in the parent hierarchy,
            starting from the parent class  */
        if (!found)
            return resolve_extend(name, extend, func);

        /*  return the parent class  */
        return extend;
    };

    /*  resolve to the optional parent/ancestor clone object  */
    var resolve_clone = function (func) {
        if (_cs.annotation(func, "clone") === null)
            while (_cs.annotation(func.caller, "clone") === true)
                func = func.caller;
        return func;
    };

    /*  explicitly add "base()" utility method for calling
        the base/super/parent function in the inheritance/mixin chain  */
    clazz.prototype.base = function () {
        /*  NOTICE: arguments.callee are we just ourself (this function), while
                    arguments.callee.caller is the function calling this.base()!
                    and because our cs.clone() creates wrapper functions we
                    optionally have to take those into account during resolving, too!  */
        var name = resolve_annotation(arguments.callee.caller, "name");
        var base = resolve_annotation(arguments.callee.caller, "base");
        var extend = resolve_extend(name, this.constructor, resolve_clone(arguments.callee.caller));

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
     *  STEP 7: ALLOW TRAITS TO POST-ADJUST/SETUP DEFINED CLASS
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
     *  STEP 8: PROVIDE RESULTS
     */

    /*  optionally insert class into global namespace ourself  */
    if (typeof params.name === "string")
        $cs.ns(params.name, clazz);

    /*  return created class  */
    return clazz;
};

