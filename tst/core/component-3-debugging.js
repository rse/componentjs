/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Library Debugging", function () {
    describe("debug()", function () {
        it("should allow manipulation of the debug level", function () {
            expect(cs.debug()).to.be.a("number").least(0)
            cs.debug(1)
            expect(cs.debug()).to.be.a("number").equal(1)
            cs.debug(0)
        })
    })
})
