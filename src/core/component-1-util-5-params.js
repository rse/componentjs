/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  utility function: flexible parameter handling  */
$cs.params = function (func_name, func_args, spec) {
    /*  provide parameter processing hook  */
    _cs.hook("ComponentJS:params:" + func_name + ":enter", "none", { args: func_args, spec: spec });

    /*  start with a fresh parameter object  */
    var params = {};

    /*  1. determine number of total    positional parameters,
        2. determine number of required positional parameters,
        3. set default values
        4. sanity check default value against validation  */
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
            if (typeof spec[name].def !== "undefined") {
                if (typeof spec[name].valid !== "undefined")
                    if (!$cs.validate(spec[name].def, spec[name].valid))
                        throw _cs.exception(func_name, "parameter \"" + name + "\" has " +
                            "default value " + _cs.json(spec[name].def) + ", which does not validate " +
                            "against validation specification \"" + spec[name].valid + "\"");
                params[name] = spec[name].def;
            }
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

    /*  common value validity checking  */
    var check_validity = function (func, name, value, valid) {
        if (typeof valid !== "undefined")
            if (!$cs.validate(value, valid))
                throw _cs.exception(func, "parameter \"" + name + "\" has " +
                    "value " + _cs.json(value) + ", which does not validate " +
                    "against \"" + valid + "\"");
    };

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
                check_validity(func_name, name, args[name], spec[name].valid);
                params[name] = args[name];
            }
        }
        for (name in spec) {
            if (_cs.isown(spec, name)) {
                if (   typeof spec[name].req !== "undefined"
                    && spec[name].req
                    && typeof args[name] === "undefined")
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
            check_validity(func_name, pos2name[i], func_args[i], spec[pos2name[i]].valid);
            params[pos2name[i]] = func_args[i];
        }
        if (i < func_args.length) {
            if (typeof pos2name["..."] === "undefined")
                throw _cs.exception(func_name, "too many arguments provided");
            args = [];
            for (; i < func_args.length; i++)
                args.push(func_args[i]);
            check_validity(func_name, pos2name["..."], args, spec[pos2name["..."]].valid);
            params[pos2name["..."]] = args;
        }
    }

    /*  provide parameter processing hook  */
    _cs.hook("ComponentJS:params:" + func_name + ":leave", "none", { args: func_args, spec: spec, params: params });

    /*  return prepared parameter object  */
    return params;
};

