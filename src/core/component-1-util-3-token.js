/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  custom Token class  */
_cs.token = function () {
    this.name   = "";
    this.text   = "";
    this.tokens = [];
    this.pos    = 0;
    this.len    = 0;
};
_cs.token.prototype = {
    /*  setter for caller context name  */
    setName: function (name) {
        this.name = name;
    },

    /*  setter for plain-text input  */
    setText: function (text) {
        this.text = text;
    },

    /*  setter for additional token symbols  */
    addToken: function (b1, b2, e2, e1, symbol) {
        this.tokens.push({ b1: b1, b2: b2, e2: e2, e1: e1, symbol: symbol });
        this.len++;
    },

    /*  peek at the next token or token at particular offset  */
    peek: function (offset) {
        if (typeof offset === "undefined")
            offset = 0;
        if (offset >= this.len)
            throw _cs.exception(this.name, "parse error: not enough tokens");
        return this.tokens[this.pos + offset].symbol;
    },

    /*  skip one or more tokens  */
    skip: function (len) {
        if (typeof len === "undefined")
            len = 1;
        if (len > this.len)
            throw _cs.exception(this.name, "parse error: not enough tokens available to skip: " + this.ctx());
        this.pos += len;
        this.len -= len;
    },

    /*  consume the current token (by expecting it to be a particular symbol)  */
    consume: function (symbol) {
        if (this.len <= 0)
            throw _cs.exception(this.name, "parse error: no more tokens available to consume: " + this.ctx());
        if (this.tokens[this.pos].symbol !== symbol)
            throw _cs.exception(this.name, "parse error: expected token symbol \"" + symbol + "\": " + this.ctx());
        this.pos++;
        this.len--;
    },

    /*  return a textual description of the token parsing context  */
    ctx: function (width) {
        if (typeof width === "undefined")
            width = 78;
        var tok = this.tokens[this.pos];

        /*  the current token itself  */
        var ctx = "<" + this.text.substr(tok.b2, tok.e2 - tok.b2 + 1) + ">";
        ctx = this.text.substr(tok.b1, tok.b2 - tok.b1) + ctx;
        ctx = ctx + this.text.substr(tok.e2 + 1, tok.e1 - tok.e2);

        /*  the previous and following token(s)  */
        var k = (width - ctx.length);
        if (k > 0) {
            k = Math.floor(k / 2);
            var i, str;
            if (this.pos > 0) {
                /*  previous token(s)  */
                var k1 = 0;
                for (i = this.pos - 1; i >= 0; i--) {
                    tok = this.tokens[i];
                    str = this.text.substr(tok.b1, tok.e1 - tok.b1 + 1);
                    k1 += str.length;
                    if (k1 > k)
                        break;
                    ctx = str + ctx;
                }
                if (i > 0)
                    ctx = "[...]" + ctx;
            }
            if (this.len > 1) {
                /*  following token(s)  */
                var k2 = 0;
                for (i = this.pos + 1; i < this.pos + this.len; i++) {
                    tok = this.tokens[i];
                    str = this.text.substr(tok.b1, tok.e1 - tok.b1 + 1);
                    k2 += str.length;
                    if (k2 > k)
                        break;
                    ctx = ctx + str;
                }
                if (i < this.pos + this.len)
                    ctx = ctx + "[...]";
            }
        }

        /*  place everything on a single line through escape sequences  */
        ctx = ctx.replace(/\r/, "\\r")
                 .replace(/\n/, "\\n")
                 .replace(/\t/, "\\t");
        return ctx;
    }
};

