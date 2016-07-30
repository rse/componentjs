/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Component States", function () {
    var foo   = { id: "foo"   }
    var bar   = { id: "bar"   }
    var baz   = { id: "baz"   }
    var quux1 = { id: "quux1" }
    var quux2 = { id: "quux2" }
    before(function () {
        cs.create("/foo/{bar/quux,baz/quux}", foo, bar, quux1, baz, quux2);
    })
    describe.skip("state()", function () {
        it("should increase and decrease states", function () {
            /*  FIXME  */
        })
    })
    after(function () {
        cs.destroy("/foo")
    })
})
