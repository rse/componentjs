/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  API function: validate an arbitrary value against a type specification  */
$cs.validate = function (value, spec, non_cache) {
    /*  compile validation tree from specification
        or reuse cached pre-compiled validation tree  */
    var tree;
    if (!non_cache)
        tree = _cs.validate_cache[spec];
    if (typeof tree === "undefined")
        tree = _cs.validate_compile(spec);
    if (!non_cache)
        _cs.validate_cache[spec] = tree;

    /*  execute validation tree against the value  */
    return _cs.validate_execute(value, tree);
};

/*  the internal compile cache  */
_cs.validate_cache = {};

/*
 *  VALIDATION SPECIFICATION COMPILER
 */

/*  compile validation specification into validation tree  */
_cs.validate_compile = function (spec) {
    /*  tokenize the specification string into a token stream */
    var token = _cs.validate_tokenize(spec);

    /*  parse the token stream into a tree  */
    return _cs.validate_parse_spec(token);
};

/*  tokenize the validation specification  */
_cs.validate_tokenize = function (spec) {
    /*  create new Token abstraction  */
    var token = new _cs.token();
    token.setText(spec);

    /*  determine individual token symbols  */
    var m;
    var b = 0;
    while (spec !== "") {
        m = spec.match(/^(\s*)([^{}\[\]:,?*+()!|\s]+|[{}\[\]:,?*+()!|])(\s*)/);
        if (m === null)
            throw new Error("parse error: cannot further canonicalize: \"" + spec + "\"");
        token.addToken(
            b,
            b + m[1].length,
            b + m[1].length + m[2].length - 1,
            b + m[0].length - 1,
            m[2]
        );
        spec = spec.substr(m[0].length);
        b += m[0].length;
    }
    return token;
};

/*  parse specification  */
_cs.validate_parse_spec = function (token) {
    if (token.len <= 0)
        return null;
    var tree;
    var symbol = token.peek();
    if (symbol === "!")
        tree = _cs.validate_parse_not(token);
    else if (symbol === "(")
        tree = _cs.validate_parse_group(token);
    else if (symbol === "{")
        tree = _cs.validate_parse_hash(token);
    else if (symbol === "[")
        tree = _cs.validate_parse_array(token);
    else if (symbol.match(/^(?:undefined|boolean|number|string|function|object)$/))
        tree = _cs.validate_parse_primary(token);
    else if (symbol.match(/^(?:class|trait|component)$/))
        tree = _cs.validate_parse_special(token);
    else if (symbol === "any")
        tree = _cs.validate_parse_any(token);
    else if (symbol.match(/^[A-Z][_a-zA-Z$0-9]*$/))
        tree = _cs.validate_parse_class(token);
    else
        throw new Error("parse error: invalid token symbol: \"" + token.ctx() + "\"");
    return tree;
};

/*  parse boolean "not" operation  */
_cs.validate_parse_not = function (token) {
    token.consume("!");
    var tree = _cs.validate_parse_spec(token); /*  RECURSION  */
    tree = { type: "not", op: tree };
    return tree;
};

/*  parse group (for boolean "or" operation)  */
_cs.validate_parse_group = function (token) {
    token.consume("(");
    var tree = _cs.validate_parse_spec(token);
    while (token.peek() === "|") {
        token.consume("|");
        var child = _cs.validate_parse_spec(token); /*  RECURSION  */
        tree = { type: "or", op1: tree, op2: child };
    }
    token.consume(")");
    return tree;
};

/*  parse hash type specification  */
_cs.validate_parse_hash = function (token) {
    token.consume("{");
    var elements = [];
    while (token.peek() !== "}") {
        var key = _cs.validate_parse_key(token);
        var arity = _cs.validate_parse_arity(token, "?");
        token.consume(":");
        var spec = _cs.validate_parse_spec(token);  /*  RECURSION  */
        elements.push({ type: "element", key: key, arity: arity, element: spec });
        if (token.peek() === ",")
            token.skip();
        else
            break;
    }
    var tree = { type: "hash", elements: elements };
    token.consume("}");
    return tree;
};

/*  parse array type specification  */
_cs.validate_parse_array = function (token) {
    token.consume("[");
    var elements = [];
    while (token.peek() !== "]") {
        var spec = _cs.validate_parse_spec(token);  /*  RECURSION  */
        var arity = _cs.validate_parse_arity(token, "?*+");
        elements.push({ type: "element", element: spec, arity: arity });
        if (token.peek() === ",")
            token.skip();
        else
            break;
    }
    var tree = { type: "array", elements: elements };
    token.consume("]");
    return tree;
};

/*  parse primary type specification  */
_cs.validate_parse_primary = function (token) {
    var primary = token.peek();
    if (!primary.match(/^(?:undefined|boolean|number|string|function|object)$/))
        throw new Error("parse error: invalid primary type \"" + primary + "\"");
    token.skip();
    return { type: "primary", name: primary };
};

/*  parse special ComponentJS type specification  */
_cs.validate_parse_special = function (token) {
    var special = token.peek();
    if (!special.match(/^(?:class|trait|component)$/))
        throw new Error("parse error: invalid special type \"" + special + "\"");
    token.skip();
    return { type: "special", name: special };
};

/*  parse special "any" type specification  */
_cs.validate_parse_any = function (token) {
    var any = token.peek();
    if (any !== "any")
        throw new Error("parse error: invalid any type \"" + any + "\"");
    token.skip();
    return { type: "any" };
};

/*  parse JavaScript class specification  */
_cs.validate_parse_class = function (token) {
    var clazz = token.peek();
    if (!clazz.match(/^[A-Z][_a-zA-Z$0-9]*$/))
        throw new Error("parse error: invalid class type \"" + clazz + "\"");
    token.skip();
    return { type: "class", name: clazz };
};

/*  parse arity specification  */
_cs.validate_parse_arity = function (token, charset) {
    var arity = [ 1, 1 ];
    if (   token.len >= 5
        && token.peek(0) === "{"
        && token.peek(1).match(/^[0-9]+$/)
        && token.peek(2) === ","
        && token.peek(3).match(/^(?:[0-9]+|oo)$/)
        && token.peek(4) === "}"          ) {
        arity = [
            parseInt(token.peek(1), 10),
            (  token.peek(3) === "oo"
             ? Number.MAX_VALUE
             : parseInt(token.peek(3), 10))
        ];
        token.skip(5);
    }
    else if (
           token.len >= 1
        && token.peek().length === 1
        && charset.indexOf(token.peek()) >= 0) {
        var c = token.peek();
        switch (c) {
            case "?": arity = [ 0, 1 ];                break;
            case "*": arity = [ 0, Number.MAX_VALUE ]; break;
            case "+": arity = [ 1, Number.MAX_VALUE ]; break;
        }
        token.skip();
    }
    return arity;
};

/*  parse hash key specification  */
_cs.validate_parse_key = function (token) {
    var key = token.peek();
    if (!key.match(/^[_a-zA-Z$][_a-zA-Z$0-9]*$/))
        throw new Error("parse error: invalid key \"" + key + "\"");
    token.skip();
    return key;
};

/*
 *  VALIDATION TREE EXECUTOR
 */

/*  execute value validation against validation tree  */
_cs.validate_execute = function (value, tree) {
    return _cs.validate_exec_spec(value, tree);
};

/*  validate specification (top-level)  */
_cs.validate_exec_spec = function (value, node) {
    var valid = false;
    if (node !== null) {
        switch (node.type) {
            case "not":     valid = _cs.validate_exec_not    (value, node); break;
            case "or":      valid = _cs.validate_exec_or     (value, node); break;
            case "hash":    valid = _cs.validate_exec_hash   (value, node); break;
            case "array":   valid = _cs.validate_exec_array  (value, node); break;
            case "primary": valid = _cs.validate_exec_primary(value, node); break;
            case "special": valid = _cs.validate_exec_special(value, node); break;
            case "class":   valid = _cs.validate_exec_class  (value, node); break;
            case "any":     valid = true;                                   break;
            default:
                throw new Error("validation error: invalid validation tree: " +
                    "node has unknown type \"" + node.type + "\"");
        }
    }
    return valid;
};

/*  validate through boolean "not" operation  */
_cs.validate_exec_not = function (value, node) {
    return !_cs.validate_exec_spec(value, node.op);  /*  RECURSION  */
};

/*  validate through boolean "or" operation  */
_cs.validate_exec_or = function (value, node) {
    return (
           _cs.validate_exec_spec(value, node.op1)  /*  RECURSION  */
        || _cs.validate_exec_spec(value, node.op2)  /*  RECURSION  */
    );
};

/*  validate hash type  */
_cs.validate_exec_hash = function (value, node) {
    var i, el;
    var valid = (typeof value === "object");
    var fields = {};
    if (valid) {
        /*  pass 1: ensure that all mandatory fields exist
            and determine map of valid fields for pass 2  */
        for (i = 0; i < node.elements.length; i++) {
            el = node.elements[i];
            fields[el.key] = el.element;
            if (el.arity[0] > 0 && typeof value[el.key] === "undefined") {
                valid = false;
                break;
            }
        }
    }
    if (valid) {
        /*  pass 2: ensure that no unknown fields exist
            and that all existing fields are valid  */
        for (var field in value) {
            if (!Object.hasOwnProperty.call(value, field))
                continue;
            if (   typeof fields[field] === "undefined"
                || !_cs.validate_exec_spec(value[field], fields[field])) {  /*  RECURSION  */
                valid = false;
                break;
            }
        }
    }
    return valid;
};

/*  validate array type  */
_cs.validate_exec_array = function (value, node) {
    var i, el;
    var valid = (typeof value === "object" && value instanceof Array);
    if (valid) {
        var pos = 0;
        for (i = 0; i < node.elements.length; i++) {
            el = node.elements[i];
            var found = 0;
            while (found < el.arity[1] && pos < value.length) {
                if (!_cs.validate_exec_spec(value[pos], el.element))  /*  RECURSION  */
                    break;
                found++;
                pos++;
            }
            if (found < el.arity[0]) {
                valid = false;
                break;
            }
        }
        if (pos < value.length)
            valid = false;
    }
    return valid;
};

/*  validate standard JavaScript type  */
_cs.validate_exec_primary = function (value, node) {
    return (typeof value === node.name);
};

/*  validate custom JavaScript type  */
_cs.validate_exec_class = function (value, node) {
    /*jshint evil:true */
    return (   typeof value === "object"
           && (   Object.prototype.toString.call(value) === "[object " + node.name + "]")
               || eval("value instanceof " + node.name)                                  );
};

/*  validate special ComponentJS type  */
_cs.validate_exec_special = function (value, node) {
    var valid = false;
    if (typeof value === (node.name === "component" ? "object" : "function"))
        valid = (_cs.annotation(value, "type") === node.name);
    return valid;
};

