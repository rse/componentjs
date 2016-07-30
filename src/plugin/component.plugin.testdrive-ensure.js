/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  global API function: ensure a state to occur  */
$cs.ensure = function () {
    /*  determine parameters  */
    var params = $cs.params("ensure", arguments, {
        path:     { pos: 0, req: true,  valid: "string"  },
        state:    { pos: 1, req: true,  valid: "string"  },
        min:      {         def: true,  valid: "boolean" },
        max:      {         def: false, valid: "boolean" },
        sync:     {         def: false, valid: "boolean" }
    });

    /*  create promise  */
    var promise = new $cs.promise();

    /*  execute state transition request  */
    var comp = $cs(params.path);
    comp.state({
        state: params.state,
        min:   params.min,
        max:   params.max,
        sync:  params.sync,
        func:  function (state) {
            promise.fulfill(comp);
        }
    });

    /*  return promise  */
    return promise.proxy;
};

