/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  API function: define a usual JavaScript "class"  */
$cs.clazz = function () {
    /*  determine parameters  */
    var params = $cs.params("clazz", arguments, {
        name:        { def: undefined, valid: "string"           },
        extend:      { def: undefined, valid: "clazz"            },
        mixin:       { def: undefined, valid: "[ trait* ]"       },
        cons:        { def: undefined, valid: "function"         },
        statics:     { def: undefined, valid: "object"           },
        dynamics:    { def: undefined, valid: "object"           },
        protos:      { def: undefined, valid: "{ @?: function }" }
    });

    /*  just pass through definition  */
    var clazz = _cs.clazz_or_trait(params, true);

    /*  mark object as a logical ComponentJS "class"  */
    _cs.annotation(clazz, "type", "clazz");

    /*  return created class  */
    return clazz;
};

/*  API function: define a Scala-inspired "trait"  */
$cs.trait = function () {
    /*  determine parameters  */
    var params = $cs.params("trait", arguments, {
        name:        { def: undefined, valid: "string"           },
        mixin:       { def: undefined, valid: "[ trait* ]"       },
        cons:        { def: undefined, valid: "function"         },
        setup:       { def: undefined, valid: "function"         },
        statics:     { def: undefined, valid: "object"           },
        dynamics:    { def: undefined, valid: "object"           },
        protos:      { def: undefined, valid: "{ @?: function }" }
    });

    /*  just pass through definition  */
    var trait = _cs.clazz_or_trait(params, false);

    /*  mark object as a logical ComponentJS "trait"  */
    _cs.annotation(trait, "type", "trait");

    /*  return created trait  */
    return trait;
};

