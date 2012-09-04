/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  top-level API: create a component  */
$cs.create = function () {
    /*  parse arguments  */
    var base  = null;
    var path  = null;
    var clazz = null;
    if (arguments.length >= 1 && typeof arguments[0] === "string") {
        /*  special calling convention: create("/foo", foo) -> create(_cs.root, "/foo", foo) */
        base  = _cs.root;
        path  = arguments[0];
        clazz = arguments[1];
    }
    else if (arguments.length >= 2 && typeof arguments[1] === "string") {
        /*  standard calling convention  */
        base  = arguments[0];
        path  = arguments[1];
        clazz = arguments[2];

        /*  allow passing of underlying objects by mapping back to component  */
        if (_cs.istypeof(base) !== "component") {
            var c = _cs.annotation(base, "comp");
            if (c === null)
                throw _cs.exception("create", "invalid base argument (not an object attached to a component)");
            base = c;
        }
    }
    else
        throw _cs.exception("create", "invalid (number of) arguments");

    /*  split path into existing tree and the not existing component leaf node  */
    var m = path.match(/^(.*?)\/?([^\/]+)$/);
    if (!m[0])
        throw _cs.exception("create", "invalid path \"" + path + "\"");
    var path_tree = m[1];
    var path_leaf = m[2];

    /*  create new component id  */
    var id = $cs.cid();

    /*  substitute special "{id}" constructs in leaf path  */
    path_leaf = path_leaf.replace(/\{id\}/g, id);

    /*  lookup parent component (has to be existing)  */
    var comp_parent = _cs.lookup(base, path_tree);
    if (comp_parent === _cs.none)
        throw _cs.exception("create", "parent component path \"" +
            path_tree + "\" not already existing (please create first)");

    /*  attempt to lookup leaf component (has to be not existing)  */
    var comp = _cs.lookup(comp_parent, path_leaf);
    if (comp !== _cs.none)
        throw _cs.exception("create", "leaf component path \"" +
            path_leaf + "\" already existing (please destroy first)");

    /*  instanciate class  */
    var obj = null;
    switch (_cs.istypeof(clazz)) {
        case "clazz":
        case "trait":
        case "function":
            /*  standard case: $cs.create(..., MyClass)
                ComponentJS clazz/trait or foreign "class"  */
            obj = new clazz();
            break;
        case "object":
            /*  special case: $cs.create(..., new MyClass(arg1, arg2))
                manual instanciation because of parameter passing  */
            obj = clazz;
            break;
        case "null":
            /*  special case: $cs.create(..., null)
                early component create & late object attachment  */
            break;
        default:
            throw _cs.exception("create", "invalid class argument");
    }

    /*  create new corresponding component object in tree  */
    comp = new _cs.comp(path_leaf);

    /*  mark with component id  */
    comp.id(id);

    /*  attach to tree  */
    comp.attach(comp_parent);

    /*  remember bi-directional relationship between component and object  */
    comp.obj(obj);

    /*  optionally pimpup the object  */
    _cs.pimpup(obj);

    /*  switch state from "dead" to "created"
        (here synchronously as one expects that after a creation of a
        component, the state is really already "created", of course)  */
    comp.state({ state: "created", sync: true });

    /*  debug hint  */
    $cs.debug(1, "create: " + comp.path("/") + ": created component [" + comp.id() + "]");

    /*  optionally update debugger view  */
    _cs.dbg_state_invalidate("components");
    _cs.dbg_update();

    /*  return new component  */
    return comp;
};

/*  top-level API: destroy a component  */
$cs.destroy = function (path) {
    /*  determine component  */
    var comp = null;
    if (_cs.istypeof(path) === "component")
        comp = path;
    else if (typeof path === "string") {
        comp = _cs.lookup(path);
        if (comp === _cs.none)
            throw _cs.exception("destroy", "no such component under path \"" + path + "\"");
        if (comp === _cs.root)
            throw _cs.exception("destroy", "root component cannot be destroyed");
    }
    else
        throw _cs.exception("destroy", "invalid path argument");

    /*  switch component state to "dead"
        (here synchronously as one expects that after a destruction of a
        component, the state is really already "dead", of course)  */
    comp.state({ state: "dead", sync: true });

    /*  detach component from component tree  */
    comp.detach();

    /*  remove bi-directional relationship between component and object  */
    comp.obj(null);

    /*  debug hint  */
    $cs.debug(1, "destroy: " + comp.path("/") + ": destroyed component [" + comp.id() + "]");

    /*  optionally update debugger view  */
    _cs.dbg_state_invalidate("components");
    _cs.dbg_update();

    return;
};

