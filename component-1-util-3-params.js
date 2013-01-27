/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  utility function: no operation (for passing as dummy callback)  */
$cs.nop = function () {};

/*  utility function: validate a value against a validation specification  */
_cs.validate = function () {
    /*  determine parameters  */
    var params = $cs.params("validate", arguments, {
        value: { pos: 0, req: true },
        valid: { pos: 1, req: true }
    });

    /*  map string and regex based validators  */
    if (typeof params.valid === "string") {
        var m = params.valid.match(/^array\((.+?)\)$/);
        if (m) {
            /*  "array(xxx)"  */
            (function () {
                var t = m[1];
                params.valid = function (a) {
                    if (_cs.istypeof(a) !== "array")
                        return false;
                    for (var i = 0; i < a.length; i++)
                        if (_cs.istypeof(a[i]) !== t)
                            return false;
                    return true;
                };
            })();
        }
        else {
            /*  "xxx"  */
            (function () {
                var t = params.valid;
                params.valid = function (a) {
                    return _cs.istypeof(a) === t;
                };
            })();
        }
    }
    else if (   typeof params.valid === "object"
             && params.valid instanceof RegExp) {
        /*  /xxx/  */
        (function () {
            var pattern = params.valid;
            params.valid = function (a) {
                return !!(a.match(pattern));
            };
        })();
    }
    else if (typeof params.valid !== "function")
        throw _cs.exception("validate", "invalid validator");

    /*  return result of validation  */
    return params.valid(params.value);
};

/*  utility function: flexible parameter handling  */
$cs.params = function (func_name, func_args, spec) {
    /*  start with a fresh parameter object  */
    var params = {};

    /*  1. determine number of positional parameters,
        2. determine number of required parameters,
        3. set default values  */
    var positional = 0;
    var required   = 0;
    var pos2name   = {};
    var name;
    for (name in spec) {
        if (_cs.isown(spec, name)) {
            /*  process parameter position  */
            if (typeof spec[name].pos !== "undefined") {
                pos2name[spec[name].pos] = name;
                if (typeof spec[name].pos === "number")
                    positional++;
                if (typeof spec[name].req !== "undefined" && spec[name].req)
                    required++;
            }

            /*  process default value  */
            if (typeof spec[name].def !== "undefined")
                params[name] = spec[name].def;
        }
    }

    /*  determine or at least guess whether we were called with
        positional or name-based parameters  */
    var name_based = false;
    if (   func_args.length === 1
        && _cs.istypeof(func_args[0]) === "object") {
        /*  ok, looks like a regular call like
            "foo({ foo: ..., bar: ...})"  */
        name_based = true;

        /*  ...but do not be mislead by a positional use like
            "foo(bar)" where "bar" is an arbitrary object!  */
        for (name in func_args[0]) {
            if (_cs.isown(func_args[0], name)) {
                if (typeof spec[name] === "undefined")
                    name_based = false;
            }
        }
    }

    /*  set actual values  */
    var i;
    var args;
    if (name_based) {
        /*  case 1: name-based parameter specification  */
        args = func_args[0];
        for (name in args) {
            if (_cs.isown(args, name)) {
                if (typeof spec[name] === "undefined")
                    throw _cs.exception(func_name, "unknown parameter \"" + name + "\"");
                if (typeof spec[name].valid !== "undefined")
                    if (!_cs.validate(args[name], spec[name].valid))
                        throw _cs.exception(func_name, "value of parameter \"" + name + "\" not valid");
                params[name] = args[name];
            }
        }
        for (name in spec) {
            if (_cs.isown(spec, name)) {
                if (   typeof spec[name].req !== "undefined"
                    && spec[name].req
                    && args[name] === "undefined")
                    throw _cs.exception(func_name, "required parameter \"" + name + "\" missing");
            }
        }
    }
    else {
        /*  case 2: positional parameter specification  */
        if (func_args.length < required)
            throw _cs.exception(func_name, "invalid number of arguments " +
                "(at least " + required + " required)");
        for (i = 0; i < positional && i < func_args.length; i++) {
            if (typeof spec[pos2name[i]].valid === "function")
                if (!spec[pos2name[i]].valid(func_args[i]))
                    throw _cs.exception(func_name, "value of parameter \"" + pos2name[i] + "\" not valid");
            params[pos2name[i]] = func_args[i];
        }
        if (i < func_args.length) {
            if (typeof pos2name["..."] === "undefined")
                throw _cs.exception(func_name, "too many arguments provided");
            args = [];
            for (; i < func_args.length; i++) {
                if (typeof spec[pos2name["..."]].valid === "function")
                    if (!spec[pos2name["..."]].valid(func_args[i]))
                        throw _cs.exception(func_name, "value of parameter \"" + pos2name["..."] + "\" not valid");
                args.push(func_args[i]);
            }
            params[pos2name["..."]] = args;
        }
    }

    /*  return prepared parameter object  */
    return params;
};

