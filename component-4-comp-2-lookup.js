/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  top-level API: lookup component by path  */
_cs.lookup = function (base, path) {
    /*  handle special calling conventions  */
    if (arguments.length === 1) {
        if (_cs.istypeof(arguments[0]) === "string") {
            /*  special calling via path only: $cs("foo") -> $cs(_cs.root, "foo") */
            path = base;
            base = _cs.root;
        }
        else
            /*  special calling via base only: $cs(this) -> $cs(this, "") */
            path = "";
    }

    /*  handle special cases for path in advance  */
    if (typeof path !== "string")
        return _cs.none;
    else if (path === "<root>")
        return _cs.root;
    else if (path === "<none>")
        return _cs.none;

    /*  bootstrap component matching  */
    var comp;
    if (path.substr(0, 1) === "/") {
        /*  ignore base  */
        comp = _cs.root;
        path = path.substring(1);
    }
    else {
        /*  use base  */
        if (   _cs.istypeof(base) !== "component"
            && _cs.annotation(base, "comp") !== null)
            /*  success: find component object via shadow object  */
            comp = _cs.annotation(base, "comp");
        else if (_cs.istypeof(base) !== "component")
            /*  failure: found other object which is not already component  */
            throw _cs.exception("lookup", "invalid base component (type is \"" +
                _cs.istypeof(base) + "\")");
        else
            /*  success: found component object  */
            comp = base;
    }

    /*  lookup component via subsequent path stepping down the tree  */
    var _lookup = function (comp, path) {
        if (path === ".") {
            /* no-op */
        }
        else if (path === "..") {
            if (comp.parent() !== null)
                comp = comp.parent();
            else
                comp = _cs.none;
        }
        else if (path !== "") {
            var found = null;
            var children = comp.children();
            for (var i = 0; i < children.length; i++) {
                if (children[i].name() === path) {
                    found = children[i];
                    break;
                }
            }
            if (found !== null)
                comp = found;
            else
                comp = _cs.none;
        }
        return comp;
    };
    if (path !== "") {
        var path_steps = path.split("/");
        for (var i = 0; i < path_steps.length; i++)
            comp = _lookup(comp, path_steps[i]);
    }

    /*  return component  */
    return comp;
};

