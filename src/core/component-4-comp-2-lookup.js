/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  lookup component by path  */
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
        var base_type = _cs.istypeof(base);
        var base_comp = _cs.annotation(base, "comp");
        if (base_type !== "component" && base_comp !== null)
            /*  success: found component object via backing object  */
            comp = base_comp;
        else if (base_type !== "component")
            /*  failure: found other object which is not already component  */
            throw _cs.exception("lookup", "invalid base component (type is \"" + base_type + "\")");
        else
            /*  success: found component object  */
            comp = base;
    }

    if (path !== "") {
        /*  lookup components  */
        var comps = [];
        _cs.lookup_step(comps, comp, path.split("/"), 0);

        /*  post-process component result set  */
        if (comps.length === 0)
            /*  no component found  */
            comp = _cs.none;
        else if (comps.length === 1)
            /*  single and hence unambitous component found  */
            comp = comps[0];
        else {
            /*  more than one result found: try to reduce duplicates first  */
            var seen = {};
            comps = _cs.filter(comps, function (comp) {
                var id = comp.id();
                var take = (typeof seen[id] === "undefined");
                seen[id] = true;
                return take;
            });
            if (comps.length === 1)
                /*  after de-duplication now only a single component found  */
                comp = comps[0];
            else {
                /*  error: still more than one component found  */
                var components = "";
                for (var i = 0; i < comps.length; i++)
                    components += " " + comps[i].path("/");
                throw _cs.exception("lookup",
                    "ambiguous component path \"" + path + "\" at " + comp.path("/") + ": " +
                    "expected only 1 component, but found " + comps.length + " components:" +
                    components
                );
            }
        }
    }

    /*  return component  */
    return comp;
};

/*  lookup component(s) at "comp", reachable via path segment "path[i]"  */
_cs.lookup_step = function (result, comp, path, i) {
    var j, children, nodes;
    if (i >= path.length)
        /*  stop recursion  */
        result.push(comp);
    else if (path[i] === ".")
        /*  CASE 1: current component (= no-op)  */
        _cs.lookup_step(result, comp, path, i + 1);                /* RECURSION */
    else if (path[i] === "..") {
        /*  CASE 2: parent component  */
        if (comp.parent() !== null)
            _cs.lookup_step(result, comp.parent(), path, i + 1);   /* RECURSION */
    }
    else if (path[i] === "*") {
        /*  CASE 3: all child components  */
        children = comp.children();
        for (j = 0; j < children.length; j++)
            _cs.lookup_step(result, children[j], path, i + 1);     /* RECURSION */
    }
    else if (path[i] === "") {
        /*  CASE 4: all descendent components  */
        nodes = comp.walk_down(function (depth, node, nodes, depth_first) {
            if (!depth_first)
                nodes.push(node);
            return nodes;
        }, []);
        for (j = 0; j < nodes.length; j++)
            _cs.lookup_step(result, nodes[j], path, i + 1);        /* RECURSION */
    }
    else {
        /*  CASE 5: a specific child component  */
        children = comp.children();
        for (j = 0; j < children.length; j++) {
            if (children[j].name() === path[i]) {
                _cs.lookup_step(result, children[j], path, i + 1); /* RECURSION */
                break;
            }
        }
    }
};

