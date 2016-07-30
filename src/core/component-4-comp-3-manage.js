/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  top-level API: create one or more components  */
$cs.create = function () {
    /*  sanity check environment  */
    if (!_cs.bootstrapped) {
        /*  give warning but still be backward compatible  */
        var msg = "ComponentJS: WARNING: component system still not bootstrapped " +
            "(please call \"bootstrap\" method before first \"create\" method call!)";
        /* global alert:false */
        /* eslint no-alert: 0 */
        if (typeof alert === "function")
            alert(msg);
        /* global console:false */
        /* eslint no-console: 0 */
        else if (typeof console !== "undefined" && typeof console.log === "function")
            console.log(msg);
        $cs.bootstrap();
    }

    /*  sanity check arguments  */
    if (arguments.length < 2)
        throw _cs.exception("create", "invalid number of arguments");

    /*  initialize processing state  */
    var k = 0;
    var comp = null;
    var base = null;
    var base_stack = [];

    /*  determine base component  */
    if (_cs.istypeof(arguments[k]) === "string") {
        if (arguments[k].substr(0, 1) !== "/")
            throw _cs.exception("create", "either base component has to be given " +
                 "or the tree specification has to start with the root component (\"/\")");
        comp = _cs.root;
    }
    else {
        base = arguments[k++];
        if (_cs.istypeof(base) !== "component") {
            base = _cs.annotation(base, "comp");
            if (base === null)
                throw _cs.exception("create", "invalid base argument " +
                    "(not an object attached to a component)");
        }
    }

    /*  tokenize the tree specification  */
    var token = [];
    var spec = arguments[k++];
    var m;
    while (spec !== "") {
        m = spec.match(/^\s*([^\/{},]+|[\/{},])/);
        if (m === null)
            break;
        token.push(m[1]);
        spec = spec.substr(m[1].length);
    }

    /*  return the tree specification, marked at token k  */
    var at_pos = function (token, k) {
        var str = "";
        for (var i = 0; i < k && i < token.length; i++)
            str += token[i];
        if (i < token.length) {
            str += "<";
            str += token[i++];
            str += ">";
            for (; i < token.length; i++)
                str += token[i];
        }
        return str;
    };

    /*  iterate over all tokens...  */
    for (var i = 0; i < token.length; i++) {
        if (token[i] === "/") {
            /*  switch base  */
            if (comp === null)
                throw _cs.exception("create", "no parent component for step-down at " + at_pos(token, i));
            base = comp;
        }
        else if (token[i] === "{") {
            /*  save base  */
            base_stack.push(base);
        }
        else if (token[i] === ",") {
            /*  reset base  */
            if (base_stack.length === 0)
                throw _cs.exception("create", "no open brace section for parallelism at " + at_pos(token, i));
            base = base_stack[base_stack.length - 1];
        }
        else if (token[i] === "}") {
            /*  restore base  */
            if (base_stack.length === 0)
                throw _cs.exception("create", "no more open brace section for closing at " + at_pos(token, i));
            base = base_stack.pop();
            comp = null;
        }
        else {
            /*  create new component  */
            if (base === null)
                throw _cs.exception("create", "no base component at " + at_pos(token, i));
            comp = _cs.create_single(base, token[i], arguments[k++]);
        }
    }
    if (base_stack.length > 0)
        throw _cs.exception("create", "still open brace sections at end of tree specification");

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
    var id = _cs.cid();

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

    /*  debug hint  */
    $cs.debug(1, "component: " + comp.path("/") + ": created component [" + comp.id() + "]");

    /*  give plugins a chance to react (before creation of a component)  */
    _cs.hook("ComponentJS:comp-created", "none", comp);

    /*  switch state from "dead" to the first user-defined state (usually "created")
        (here synchronously as one expects that after a creation of a
        component, the state is really already "created", of course)  */
    if (_cs.states.length <= 1)
        throw _cs.exception("create", "no user-defined component states");
    comp.state({ state: _cs.states[1].state, sync: true });

    /*  give plugins a chance to react (after creation of a component)  */
    _cs.hook("ComponentJS:state-invalidate", "none", "components");
    _cs.hook("ComponentJS:state-change", "none");

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
    var path = comp.path("/");
    var id   = comp.id();

    /*  switch component state to "dead"
        (here synchronously as one expects that after a destruction of a
        component, the state is really already "dead", of course)  */
    comp.state({ state: "dead", sync: true });

    /*  give plugins a chance to react (before final destruction of a component)  */
    _cs.hook("ComponentJS:comp-destroyed", "none", comp);

    /*  detach component from component tree  */
    comp.detach();

    /*  remove bi-directional relationship between component and object  */
    comp.obj(null);

    /*  debug hint  */
    $cs.debug(1, "component: " + path + ": destroyed component [" + id + "]");

    /*  give plugins a chance to react (after final destruction of a component)  */
    _cs.hook("ComponentJS:state-invalidate", "none", "components");
    _cs.hook("ComponentJS:state-change", "none");

    return;
};

