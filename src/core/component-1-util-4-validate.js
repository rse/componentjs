/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  API function: validate an arbitrary value  */
$cs.validate = function (value, spec) {
    /*  case 1: specification is a regular expression object  */
    if (typeof spec === "object" && spec instanceof RegExp)
        return spec.test(value.toString());

    /*  case 2: specification is a function  */
    else if (typeof spec === "function")
        return spec(value);

    /*  case 3: specification is a validation expression  */
    else if (typeof spec === "string")
        return _cs.validate_at(value, spec);

    /*  anything else is a usage error  */
    else
        throw _cs.exception("validate", "invalid specification argument: \"" + spec + "\"");
};

/*  internal: validate an arbitrary value against a type specification  */
_cs.validate_at = function (value, spec, path) {
    /*  compile validation AST from specification
        or reuse cached pre-compiled validation AST  */
    var ast = _cs.validate_cache[spec];
    if (typeof ast === "undefined") {
        ast = _cs.validate_compile(spec);
        _cs.validate_cache[spec] = ast;
    }

    /*  optionally subset the AST  */
    if (typeof path !== "undefined") {
        var steps = (typeof path === "string" ? _cs.select_parse(path) : path);
        ast = _cs.validate_subset(ast, steps);
    }

    /*  execute validation AST against the value  */
    return _cs.validate_executor.exec_spec(value, ast);
};

/*  the internal compile cache  */
_cs.validate_cache = {};

/*
 *  VALIDATION SPECIFICATION COMPILER
 */

/*  compile validation specification into validation AST  */
_cs.validate_compile = function (spec) {
    /*  tokenize the specification string into a token stream */
    var token = _cs.validate_tokenize(spec);

    /*  parse the token stream into an AST  */
    return _cs.validate_parser.parse_spec(token);
};

/*  tokenize the validation specification  */
_cs.validate_tokenize = function (spec) {
    /*  create new Token abstraction  */
    var token = new _cs.token();
    token.setName("validate");
    token.setText(spec);

    /*  determine individual token symbols  */
    var m;
    var b = 0;
    while (spec !== "") {
        m = spec.match(/^(\s*)([^{}\[\]:,?*+()!|\s]+|[{}\[\]:,?*+()!|])(\s*)/);
        if (m === null)
            throw _cs.exception("validate", "parse error: cannot further canonicalize: \"" + spec + "\"");
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
_cs.validate_parser = {
    parse_spec: function (token) {
        if (token.len <= 0)
            return null;
        var ast;
        var symbol = token.peek();
        if (symbol === "!")
            ast = this.parse_not(token);
        else if (symbol === "(")
            ast = this.parse_group(token);
        else if (symbol === "{")
            ast = this.parse_hash(token);
        else if (symbol === "[")
            ast = this.parse_array(token);
        else if (symbol.match(/^(?:null|undefined|boolean|number|string|function|object)$/))
            ast = this.parse_primary(token);
        else if (symbol.match(/^(?:clazz|trait|component)$/))
            ast = this.parse_special(token);
        else if (symbol === "any")
            ast = this.parse_any(token);
        else if (symbol.match(/^[A-Z][_a-zA-Z$0-9]*$/))
            ast = this.parse_class(token);
        else
            throw _cs.exception("validate", "parse error: invalid token symbol: \"" + token.ctx() + "\"");
        return ast;
    },

    /*  parse boolean "not" operation  */
    parse_not: function (token) {
        token.consume("!");
        var ast = this.parse_spec(token); /*  RECURSION  */
        ast = { type: "not", op: ast };
        return ast;
    },

    /*  parse group (for boolean "or" operation)  */
    parse_group: function (token) {
        token.consume("(");
        var ast = this.parse_spec(token);
        while (token.peek() === "|") {
            token.consume("|");
            var child = this.parse_spec(token); /*  RECURSION  */
            ast = { type: "or", op1: ast, op2: child };
        }
        token.consume(")");
        return ast;
    },

    /*  parse hash type specification  */
    parse_hash: function (token) {
        token.consume("{");
        var elements = [];
        while (token.peek() !== "}") {
            var key = this.parse_key(token);
            var arity = this.parse_arity(token, "?");
            token.consume(":");
            var spec = this.parse_spec(token);  /*  RECURSION  */
            elements.push({ type: "element", key: key, arity: arity, element: spec });
            if (token.peek() === ",")
                token.skip();
            else
                break;
        }
        var ast = { type: "hash", elements: elements };
        token.consume("}");
        return ast;
    },

    /*  parse array type specification  */
    parse_array: function (token) {
        token.consume("[");
        var elements = [];
        while (token.peek() !== "]") {
            var spec = this.parse_spec(token);  /*  RECURSION  */
            var arity = this.parse_arity(token, "?*+");
            elements.push({ type: "element", element: spec, arity: arity });
            if (token.peek() === ",")
                token.skip();
            else
                break;
        }
        var ast = { type: "array", elements: elements };
        token.consume("]");
        return ast;
    },

    /*  parse primary type specification  */
    parse_primary: function (token) {
        var primary = token.peek();
        if (!primary.match(/^(?:null|undefined|boolean|number|string|function|object)$/))
            throw _cs.exception("validate", "parse error: invalid primary type \"" + primary + "\"");
        token.skip();
        return { type: "primary", name: primary };
    },

    /*  parse special ComponentJS type specification  */
    parse_special: function (token) {
        var special = token.peek();
        if (!special.match(/^(?:clazz|trait|component)$/))
            throw _cs.exception("validate", "parse error: invalid special type \"" + special + "\"");
        token.skip();
        return { type: "special", name: special };
    },

    /*  parse special "any" type specification  */
    parse_any: function (token) {
        var any = token.peek();
        if (any !== "any")
            throw _cs.exception("validate", "parse error: invalid any type \"" + any + "\"");
        token.skip();
        return { type: "any" };
    },

    /*  parse JavaScript class specification  */
    parse_class: function (token) {
        var clazz = token.peek();
        if (!clazz.match(/^[A-Z][_a-zA-Z$0-9]*$/))
            throw _cs.exception("validate", "parse error: invalid class type \"" + clazz + "\"");
        token.skip();
        return { type: "class", name: clazz };
    },

    /*  parse arity specification  */
    parse_arity: function (token, charset) {
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
    },

    /*  parse hash key specification  */
    parse_key: function (token) {
        var key = token.peek();
        if (!key.match(/^(?:[_a-zA-Z$][_a-zA-Z$0-9]*|@)$/))
            throw _cs.exception("validate", "parse error: invalid key \"" + key + "\"");
        token.skip();
        return key;
    }
};

/*
 *  VALIDATION AST SUB-SETTING
 */

/*  subset an AST through a path of dereferencing steps  */
_cs.validate_subset = function (node, path) {
    var i, imax, j, jmax;
    for (i = 0, imax = path.length; i < imax; i++) {
        if (node.type === "hash") {
            var found = false;
            for (j = 0, jmax = node.elements.length; j < jmax; j++) {
                if (node.elements[j].key === path[i]) {
                    node = node.elements[j].element;
                    found = true;
                    break;
                }
                else if (node.elements[j].key === "@") {
                    node = node.elements[j].element;
                    found = true;
                    /*  continue processing  */
                }
            }
            if (!found)
                throw _cs.exception("validate", "dereference error: hash key \"" + path[i] + "\" not found");
        }
        else if (node.type === "array") {
            j = parseInt(path[i], 10);
            if (j >= node.elements.length)
                throw _cs.exception("validate", "dereference error: array index #" + j + " (\"" + path[i] + "\") not found");
            node = node.elements[j].element;
        }
        else
            throw _cs.exception("validate", "dereference error: no more hash or array to be dereferenced by \"" + path[i] + "\"");
    }
    return node;
};

/*
 *  VALIDATION AST EXECUTOR
 */

_cs.validate_executor = {
    /*  validate specification (top-level)  */
    exec_spec: function (value, node) {
        var valid = false;
        if (node !== null) {
            switch (node.type) {
                case "not":     valid = this.exec_not    (value, node); break;
                case "or":      valid = this.exec_or     (value, node); break;
                case "hash":    valid = this.exec_hash   (value, node); break;
                case "array":   valid = this.exec_array  (value, node); break;
                case "primary": valid = this.exec_primary(value, node); break;
                case "special": valid = this.exec_special(value, node); break;
                case "class":   valid = this.exec_class  (value, node); break;
                case "any":     valid = true;                           break;
                default:
                    throw _cs.exception("validate", "invalid validation AST: " +
                        "node has unknown type \"" + node.type + "\"");
            }
        }
        return valid;
    },

    /*  validate through boolean "not" operation  */
    exec_not: function (value, node) {
        return !this.exec_spec(value, node.op);  /*  RECURSION  */
    },

    /*  validate through boolean "or" operation  */
    exec_or: function (value, node) {
        return (
               this.exec_spec(value, node.op1)  /*  RECURSION  */
            || this.exec_spec(value, node.op2)  /*  RECURSION  */
        );
    },

    /*  validate hash type  */
    exec_hash: function (value, node) {
        var i, el;
        var valid = (typeof value === "object");
        var fields = {};
        if (valid) {
            /*  pass 1: ensure that all mandatory fields exist
                and determine map of valid fields for pass 2  */
            for (i = 0; i < node.elements.length; i++) {
                el = node.elements[i];
                fields[el.key] = el.element;
                if (   el.arity[0] > 0
                    && (   (el.key === "@" && _cs.keysof(value).length === 0)
                        || (el.key !== "@" && typeof value[el.key] === "undefined"))) {
                    valid = false;
                    break;
                }
            }
        }
        if (valid) {
            /*  pass 2: ensure that no unknown fields exist
                and that all existing fields are valid  */
            for (var field in value) {
                if (   !Object.hasOwnProperty.call(value, field)
                    || !Object.propertyIsEnumerable.call(value, field)
                    || field === "constructor"
                    || field === "prototype"                          )
                    continue;
                if (   typeof fields[field] !== "undefined"
                    && this.exec_spec(value[field], fields[field])) /*  RECURSION  */
                    continue;
                if (   typeof fields["@"] !== "undefined"
                    && this.exec_spec(value[field], fields["@"]))   /*  RECURSION  */
                    continue;
                valid = false;
                break;
            }
        }
        return valid;
    },

    /*  validate array type  */
    exec_array: function (value, node) {
        var i, el;
        var valid = (typeof value === "object" && value instanceof Array);
        if (valid) {
            var pos = 0;
            for (i = 0; i < node.elements.length; i++) {
                el = node.elements[i];
                var found = 0;
                while (found < el.arity[1] && pos < value.length) {
                    if (!this.exec_spec(value[pos], el.element))  /*  RECURSION  */
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
    },

    /*  validate standard JavaScript type  */
    exec_primary: function (value, node) {
        return (node.name === "null" && value === null) || (typeof value === node.name);
    },

    /*  validate custom JavaScript type  */
    exec_class: function (value, node) {
        /* jshint evil:true */
        /* eslint no-eval: 0 */
        return (   typeof value === "object"
               && (   Object.prototype.toString.call(value) === "[object " + node.name + "]")
                   || eval("value instanceof " + node.name)                                  );
    },

    /*  validate special ComponentJS type  */
    exec_special: function (value, node) {
        var valid = false;
        if (typeof value === (node.name === "component" ? "object" : "function"))
            valid = (_cs.annotation(value, "type") === node.name);
        return valid;
    }
};
