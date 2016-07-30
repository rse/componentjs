/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  utility function: no operation (for passing as dummy callback)  */
_cs.nop = function () {};

/*  utility function: annotate an object  */
_cs.annotation = function (obj, name, value) {
    var result = null;
    var __name__ = "__ComponentJS_" + name + "__";
    if (typeof obj !== "undefined" && obj !== null) {
        /*  get annotation value  */
        if (typeof obj[__name__] !== "undefined")
            result = obj[__name__];
        if (typeof value !== "undefined") {
            /*  set annotation value  */
            if (value !== null)
                obj[__name__] = value;
            else
                delete obj[__name__];
        }
    }
    return result;
};

/*  utility function: conveniently check for defined variable  */
_cs.isdefined = function (obj) {
    return (typeof obj !== "undefined");
};

/*  utility function: check whether a field is directly owned by object
    (instead of implicitly resolved through the constructor's prototype object)  */
_cs.isown = function (obj, field) {
    var isown = Object.hasOwnProperty.call(obj, field);
    if (field === "constructor" || field === "prototype") {
        isown = isown && Object.propertyIsEnumerable.call(obj, field);
        if (obj[field].toString().indexOf("[native code]") !== -1)
            isown = false;
    }
    return isown;
};

/*  utility function: determine type of anything,
    an improved version of the built-in "typeof" operator  */
_cs.istypeof = function (obj) {
    var type = typeof obj;
    if (type === "object") {
        if (obj === null)
            /*  JavaScript nasty special case: null object  */
            type = "null";
        else if (Object.prototype.toString.call(obj) === "[object String]")
            /*  JavaScript nasty special case: String object  */
            type = "string";
        else if (Object.prototype.toString.call(obj) === "[object Number]")
            /*  JavaScript nasty special case: Number object  */
            type = "number";
        else if (Object.prototype.toString.call(obj) === "[object Boolean]")
            /*  JavaScript nasty special case: Boolean object  */
            type = "boolean";
        else if (Object.prototype.toString.call(obj) === "[object Function]")
            /*  JavaScript nasty special case: Function object  */
            type = "function";
        else if (Object.prototype.toString.call(obj) === "[object Array]")
            /*  JavaScript nasty special case: Array object  */
            type = "array";
        else if (_cs.annotation(obj, "type") !== null)
            /*  ComponentJS special case: "component"  */
            type = _cs.annotation(obj, "type");
    }
    else if (type === "function") {
        /*  ComponentJS special case: "{clazz,trait}"  */
        if (_cs.annotation(obj, "type") !== null)
            type = _cs.annotation(obj, "type");
    }
    return type;
};

/*  utility function: retrieve keys of object  */
_cs.keysof = function (obj) {
    var keys = [];
    for (var key in obj) {
        if (_cs.isown(obj, key))
            keys.push(key);
    }
    return keys;
};

/*  utility function: JSON encoding of object  */
_cs.json = (function () {
    var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var meta = { "\b": "\\b", "\t": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", "\"": "\\\"", "\\": "\\\\" };
    var quote = function (string) {
        escapable.lastIndex = 0;
        return (
            escapable.test(string)
            ? "\"" + string.replace(escapable, function (a) {
                  var c = meta[a];
                  return typeof c === "string"
                      ? c
                      : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
              }) + "\""
            : "\"" + string + "\""
        );
    };
    var encode = function (value, seen) {
        if (typeof value !== "boolean" && typeof value !== "number" && typeof value !== "string") {
            if (typeof seen[value] !== "undefined")
                return "null /* CYCLE! */";
            else
                seen[value] = true;
        }
        switch (typeof value) {
            case "boolean":  value = String(value); break;
            case "number":   value = (isFinite(value) ? String(value) : "NaN"); break;
            case "string":   value = quote(value); break;
            case "function":
                if (_cs.annotation(value, "type") !== null)
                    value = "<" + _cs.annotation(value, "type") + ">";
                else
                    value = "<function>";
                break;
            case "object":
                var a = [];
                if (value === null)
                    value = "null";
                else if (_cs.annotation(value, "type") !== null)
                    value = "<" + _cs.annotation(value, "type") + ">";
                else if (Object.prototype.toString.call(value) === "[object Function]")
                    value = "<function>";
                else if (   Object.prototype.toString.call(value) === "[object Array]"
                         || value instanceof Array) {
                    for (var i = 0; i < value.length; i++)
                        a[i] = arguments.callee(value[i], seen); /* RECURSION */
                    value = (a.length === 0 ? "[]" : "[" + a.join(",") + "]");
                }
                else {
                    for (var k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            var v = arguments.callee(value[k], seen); /* RECURSION */
                            a.push(quote(k) + ":" + v);
                        }
                    }
                    value = (a.length === 0 ? "{}" : "{" + a.join(",") + "}");
                }
                break;
            default:
                value = "<unknown>";
                break;
        }
        return value;
    };
    return function (value) {
        return encode(value, {});
    };
})();

/*  utility function: deep cloning of arbitrary data-structure  */
_cs.clone = function (source, continue_recursion) {
    /*  allow recursive cloning to be controlled  */
    if (typeof continue_recursion === "undefined")
        continue_recursion = function (/* name, value */) { return true; };
    else if (typeof continue_recursion === "string") {
        var pattern = continue_recursion;
        continue_recursion = function (name /*, value */) { return name.match(pattern); };
    }

    /*  helper functions  */
    var myself = arguments.callee;
    var clone_func = function (f, continue_recursion) {
        /* eslint no-unused-vars: 0 */
        var g = function ComponentJS_function_clone () {
            return f.apply(this, arguments);
        };
        g.prototype = f.prototype;
        for (var prop in f) {
            if (_cs.isown(f, prop)) {
                if (continue_recursion(prop, f))
                    g[prop] = myself(f[prop], continue_recursion); /* RECURSION */
                else
                    g[prop] = f[prop];
            }
        }
        _cs.annotation(g, "clone", true);
        return g;
    };

    var target; target = undefined;
    if (typeof source === "function")
        /*  special case: primitive function  */
        target = clone_func(source, continue_recursion);
    else if (typeof source === "object") {
        if (source === null)
            /*  special case: null object  */
            target = null;
        else if (Object.prototype.toString.call(source) === "[object String]")
            /*  special case: String object  */
            target = "" + source.valueOf();
        else if (Object.prototype.toString.call(source) === "[object Number]")
            /*  special case: Number object  */
            target = 0 + source.valueOf();
        else if (Object.prototype.toString.call(source) === "[object Boolean]")
            /*  special case: Boolean object  */
            target = !!source.valueOf();
        else if (Object.prototype.toString.call(source) === "[object Function]")
            /*  special case: Function object  */
            target = clone_func(source, continue_recursion);
        else if (Object.prototype.toString.call(source) === "[object Date]")
            /*  special case: Date object  */
            target = new Date(source.getTime());
        else if (Object.prototype.toString.call(source) === "[object RegExp]")
            /*  special case: RegExp object  */
            target = new RegExp(source.source);
        else if (Object.prototype.toString.call(source) === "[object Array]") {
            /*  special case: array object  */
            var len = source.length;
            target = [];
            for (var i = 0; i < len; i++)
                target.push(myself(source[i], continue_recursion)); /* RECURSION */
        }
        else {
            /*  special case: hash object  */
            target = {};
            for (var key in source) {
                if (key !== "constructor" && _cs.isown(source, key)) {
                    if (continue_recursion(key, source))
                        target[key] = myself(source[key], continue_recursion); /* RECURSION */
                    else
                        target[key] = source[key];
                }
            }
            if (typeof source.constructor === "function")
                target.constructor = source.constructor;
            if (typeof source.prototype === "object")
                target.prototype = source.prototype;
        }
    }
    else
        /*  regular case: anything else
            (just primitive data types and undefined value)  */
        target = source;
    return target;
};

/*  utility function: extend an object with other object(s)  */
_cs.extend = function (target, source, filter) {
    if (typeof filter === "undefined")
        filter = function (/* name, value */) { return true; };
    else if (typeof filter === "string") {
        var pattern = filter;
        filter = function (name /*, value */) { return name.match(pattern); };
    }
    for (var key in source)
        if (_cs.isown(source, key))
            if (filter(key, source[key]))
                target[key] = source[key];
    return target;
};

/*  utility function: mixin objects into another object by chaining methods  */
_cs.mixin = function (target, source, filter) {
    if (typeof filter === "undefined")
        filter = function (/* name, value */) { return true; };
    else if (typeof filter === "string") {
        var pattern = filter;
        filter = function (name /*, value */) { return name.match(pattern); };
    }
    for (var key in source) {
        if (_cs.isown(source, key)) {
            if (filter(key, source[key])) {
                if (_cs.istypeof(source[key]) === "function") {
                    /*  method/function  */
                    var src = _cs.clone(source[key], filter);
                    _cs.annotation(src, "name", key);
                    if (   _cs.istypeof(target[key]) === "function"
                        && _cs.isown(target, key)                  )
                        _cs.annotation(src, "base", target[key]);
                    target[key] = src;
                }
                else {
                    /*  property/field  */
                    target[key] = source[key];
                }
            }
        }
    }
    return target;
};

