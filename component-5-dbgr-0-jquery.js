/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  minimum emulation of jQuery  */
_cs.jq = function (sel, el) {
    if (typeof GLOBAL.jQuery !== "undefined")
        return GLOBAL.jQuery(sel, el);
    var result = [];
    if (arguments.length === 1 && typeof sel !== "string")
        result.push(sel);
    else {
        if (typeof el === "undefined")
            el = GLOBAL.document;
        result = el.querySelectorAll(sel);
    }
    _cs.extend(result, _cs.jq_methods);
    return result;
};
_cs.jq_methods = {
    ready: function (callback) {
        /*  not correct (because too complicated to
            emulate portably), but sufficient for now!  */
        for (var i = 0; i < this.length; i++) {
            (function () {
                var el = this[i];
                setTimeout(function () {
                    callback.call(el);
                }, 250);
            })();
        }
    },
    bind: function (name, callback) {
        for (var i = 0; i < this.length; i++) {
            if (typeof this[i].addEventListener == "function")
                this[i].addEventListener(name, callback, false);
            else if (typeof this[i].attachEvent == "function")
                this[i].attachEvent("on" + name, callback);
        }
        return this;
    },
    width: function (value) {
        var result = (typeof value !== "undefined" ? this : undefined);
        for (var i = 0; i < this.length; i++) {
            if (typeof value === "undefined") {
                result = this[i].offsetWidth;
                if (typeof result === "undefined")
                    result = this[i].innerWidth;
                if (typeof result === "undefined")
                    result = this[i].clientWidth;
            }
            else {
                this[i].style.width = value;
            }
        }
        return result;
    },
    height: function (value) {
        var result = (typeof value !== "undefined" ? this : undefined);
        for (var i = 0; i < this.length; i++) {
            if (typeof value === "undefined") {
                result = this[i].offsetHeight;
                if (typeof result === "undefined")
                    result = this[i].innerHeight;
                if (typeof result === "undefined")
                    result = this[i].clientHeight;
            }
            else {
                this[i].style.height = value;
            }
        }
        return result;
    },
    attr: function (name, value) {
        var result = (typeof value !== "undefined" ? this : undefined);
        for (var i = 0; i < this.length; i++) {
            if (typeof value === "undefined")
                result = this[i].getAttribute(name);
            else
                this[i].setAttribute(name, value);
        }
        return result;
    },
    html: function (html) {
        for (var i = 0; i < this.length; i++)
            this[i].innerHTML = html;
        return this;
    },
    scrollTop: function (value) {
        for (var i = 0; i < this.length; i++)
            this[i].scrollTop = value;
        return this;
    },
    get: function (pos) {
        return this[pos];
    },
};

