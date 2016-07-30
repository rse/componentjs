/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS API Management", function () {
    describe("symbol()", function () {
        it("cannot be tested in Node's CommonJS environment", function () {
            /*  cannot be tested  */
        })
    })
    describe("version()", function () {
        it("should return reasonable structure", function () {
            expect(ComponentJS.version).to.have.keys([ "major", "minor", "micro", "date" ])
            expect(ComponentJS.version.major).to.be.a("number").least(0)
            expect(ComponentJS.version.minor).to.be.a("number").least(0)
            expect(ComponentJS.version.micro).to.be.a("number").least(0)
            expect(ComponentJS.version.date ).to.be.a("number").least(19700101)
        })
    })
})

