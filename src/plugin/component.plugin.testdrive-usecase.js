/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  internal store of usecases  */
var usecase = {};

/*  global API function: define/undefine a usecase  */
$cs.usecase = function () {
    /*  determine parameters  */
    var params = $cs.params("usecase", arguments, {
        name:       { pos: 0, req: true, valid: "string"          },
        desc:       { pos: 1, req: true, valid: "string"          },
        conf:       {         def: {},   valid: "object"          },
        func:       { pos: 2, req: true, valid: "(function|null)" }
    });

    /*  remember or delete usecase  */
    if (params.func === null)
        delete usecase[params.name];
    else if (_cs.isdefined(usecase[params.name]))
        throw _cs.exception("usecase", "usecase of name \"" + params.name + "\" already defined");
    else {
        usecase[params.name] = {
            desc: params.desc,
            conf: params.conf,
            func: params.func
        };
    }

    return;
};

