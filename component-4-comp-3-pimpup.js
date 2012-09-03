/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  component object method pimpup  */
_cs.pimpup = function (obj) {
    var remove = [];

    /*  helper function for making getter/setter  */
    var make_gettersetter = function (obj, name, name$) {
        return $cs.attribute({
            name: name,
            def:  obj[name$],
            validate: function (value_new, value_old, validate_only, name) {
                var is_valid = true;
                if (!validate_only)
                    is_valid = _cs.lookup(obj).publish("ComponentJS:attribute:" + name, value_old, value_new);
                return is_valid;
            }
        });
    };

    /*  helper function for making service wrapper  */
    var make_service = function (obj, name) {
        return function () {
            return _cs.lookup(obj).call({
                name: name,
                args: arguments
            });
        };
    };

    /*  iterate over all object fields  */
    for (var name$ in obj) {
        if (!_cs.isown(obj, name$))
            continue;

        /*  act only on "xxx$" symbols  */
        var m = name$.match(/^(.+)\$$/);
        if (m === null || !m[0])
            continue;
        var name = m[1];

        /*  create service functionality  */
        var func;
        if (_cs.istypeof(obj[name$]) === "function") {
            $cs.debug(2, "pimpup: create wrapper service \"" + name + "\" for method \"" + name$ + "\"");
            func = obj[name$];
        }
        else {
            $cs.debug(2, "pimpup: create getter/setter service \"" + name + "\" for attribute \"" + name$ + "\"");
            func = make_gettersetter(obj, name, name$);
        }

        /*  register service on component  */
        _cs.lookup(obj).register({
            name: name,
            ctx:  obj,
            func: func
        });

        /*  create new property as service wrapper method  */
        obj[name] = make_service(obj, name);

        /*  remember original property for deferred removal  */
        remove.push(name$);
    }

    /*  deferred removal of pimped up properties  */
    _cs.foreach(remove, function (name$) {
        delete obj[name$];
    });
};

