/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*
 *  minimum emulation of jQuery
 */

_cs.jq = function (sel, el) {
    var result = [];
    if (arguments.length === 1 && typeof sel !== "string")
        result.push(sel);
    else {
        if (typeof el === "undefined")
            el = GLOBAL.document;
        try       { result = el.querySelectorAll(sel); }
        catch (e) { result = GLOBAL.document;          }
        result = _cs.concat([], result);
    }
    _cs.extend(result, _cs.jq_methods);
    return result;
};
_cs.jq_methods = {
    ready: function (callback) {
        /*  not correct (because too complicated to
            emulate portably), but sufficient for now!  */
        for (var i = 0; i < this.length; i++) {
            (function (i) {
                var el = this[i];
                /* global setTimeout:false */
                setTimeout(function () {
                    callback.call(el);
                }, 250);
            })(i);
        }
    },
    bind: function (name, callback) {
        for (var i = 0; i < this.length; i++) {
            if (typeof this[i].addEventListener === "function")
                this[i].addEventListener(name, callback, false);
            else if (typeof this[i].attachEvent === "function")
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
    css: function (name, value) {
        var result = (typeof value !== "undefined" ? this : undefined);
        var field = name.replace(/-([a-z])/g, function (a0, a1) {
            return a1.toUpperCase();
        });
        for (var i = 0; i < this.length; i++) {
            if (typeof value === "undefined")
                result = this[i].style[field];
            else {
                if (_cs.isIE())
                    this[i].style.cssText = name + ":" + value + ";";
                else
                    this[i].style[field] = value;
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
        for (var i = 0; i < this.length; i++) {
            try {
                /*  direct approach (but does not work on all elements,
                    especially not on html, head and body, etc)  */
                this[i].innerHTML = html;
            }
            catch (e) {
                /*  create an arbitrary element on which we can use innerHTML  */
                var content = _cs.dbg.document.createElement("div");

                /*  set innerHTML, but use an outer wrapper element
                    to ensure we have a single root element  */
                content.innerHTML = "<div>" + html + "</div>";

                /*  remove all nodes from target node  */
                while (this[i].firstChild)
                    this[i].removeChild(this[i].firstChild);

                /*  add all nodes in our <div><div>...</div></div> enclosure  */
                for (var j = 0; j < content.firstChild.childNodes.length; j++)
                    this[i].appendChild(content.firstChild.childNodes[j]);
            }
        }
        return this;
    },
    scrollTop: function (value) {
        for (var i = 0; i < this.length; i++)
            this[i].scrollTop = value;
        return this;
    },
    get: function (pos) {
        return this[pos];
    }
};

