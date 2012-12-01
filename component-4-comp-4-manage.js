/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  top-level API: create one or more components  */
$cs.create = function () {
    /*  sanity check arguments  */
    if (arguments.length < 2)
        throw _cs.exception("create", "invalid number of arguments");

    /*  determine base component  */
    var i = 0;
    var comp;
    if ((arguments.length % 2) === 0)
        comp = _cs.root;
    else {
        comp = arguments[i++];
        if (_cs.istypeof(comp) !== "component") {
            comp = _cs.annotation(comp, "comp");
            if (comp === null)
                throw _cs.exception("create", "invalid base argument " +
                    "(not an object attached to a component)");
        }
    }

    /*  iterate over all supplied path/clazz pairs (at least once)  */
    for (; i < arguments.length; i += 2)
        comp = _cs.create_single(comp, arguments[i], arguments[i + 1]);

    /*  return (last created) component  */
    return comp;
};

/*  internal: create a single component  */
_cs.create_single = function (base, path, clazz) {
    /*  sanity check parameters  */
    if (typeof path !== "string")
        throw _cs.exception("create", "invalid path argument (not a string)");

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

    /*  debug hint  */
    $cs.debug(1, "component: " + comp.path("/") + ": created component [" + comp.id() + "]");

    /*  switch state from "dead" to "created"
        (here synchronously as one expects that after a creation of a
        component, the state is really already "created", of course)  */
    comp.state({ state: "created", sync: true });

    /*  optionally update debugger view  */
    _cs.dbg_state_invalidate("components");
    _cs.dbg_update();

    /*  return new component  */
    return comp;
};

/*  top-level API: destroy a component  */
$cs.destroy = function () {
    /*  sanity check arguments  */
    if (arguments.length !== 1 && arguments.length !== 2)
        throw _cs.exception("destroy", "invalid number of arguments");

    /*  determine component  */
    var comp = _cs.lookup.apply(this, arguments);
    if (comp === _cs.none)
        throw _cs.exception("destroy", "no such component found to destroy");
    else if (comp === _cs.root)
        throw _cs.exception("destroy", "root component cannot be destroyed");

    /*  switch component state to "dead"
        (here synchronously as one expects that after a destruction of a
        component, the state is really already "dead", of course)  */
    comp.state({ state: "dead", sync: true });

    /*  detach component from component tree  */
    comp.detach();

    /*  remove bi-directional relationship between component and object  */
    comp.obj(null);

    /*  debug hint  */
    $cs.debug(1, "component: " + comp.path("/") + ": destroyed component [" + comp.id() + "]");

    /*  optionally update debugger view  */
    _cs.dbg_state_invalidate("components");
    _cs.dbg_update();

    return;
};

