/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Library Management", function () {
    describe("bootstrap() & shutdown()", function () {
        it("need to be called as pairs", function () {
            cs.bootstrap()
            cs.shutdown()
            cs.bootstrap()
            cs.shutdown()
            cs.bootstrap()
        })
    })
    describe("plugin()", function () {
        it("allows a plugin to access the internal and external API", function () {
            cs.plugin("test", function (_cs, $cs, GLOBAL) {
                expect(_cs).to.be.a("function")
                expect(_cs.exception).to.be.a("function")
                expect($cs).to.be.equal(cs)
                expect(GLOBAL).to.be.equal(global)
            })
        })
    })
})

