/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  global API function: promise-based jQuery#one() with additional DOM mutation support  */
$cs.once = function () {
    /*  determine parameters  */
    var params = $cs.params("once", arguments, {
        selector:    { pos: 0, req: true, valid: "any"           },
        events:      { pos: 1, req: true, valid: "string"        },
        subselector: { pos: 2, def: null, valid: "(string|null)" }
    });

    /*  sanity check run-time environment  */
    var $ = GLOBAL.jQuery || GLOBAL.$;
    if (typeof $ !== "function")
        throw new Error("testdrive#once() requires jQuery");

    /*  create promise  */
    var promise = new $cs.promise();

    /*  one-time bind to the DOM event  */
    if (params.events === "mutation") {
        if (typeof GLOBAL.MutationObserver !== "function")
            throw new Error("once: MutationObserver not available");
        if (params.subselector !== null)
            throw new Error("once: mutation event does not support sub-selector");
        var node = $(params.selector);
        if (node.length === 0)
            throw new Error("once: no nodes found");
        if (node.length !== 1)
            throw new Error("once: more than exactly one node found");
        var observer = new GLOBAL.MutationObserver(function (mutations) {
            observer.disconnect();
            promise.fulfill(mutations);
        });
        observer.observe(node.get(0), {
            attributes:    true,
            characterData: true,
            childList:     true,
            subtree:       false
        });
    }
    else {
        $(params.selector).one(params.events, params.subselector, function (ev) {
            promise.fulfill(ev);
        });
    }

    /*  return promise  */
    return promise.proxy;
};

