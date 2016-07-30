/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Application Structuring: Attributes", function () {
    describe("attribute()", function () {
        it("should create reasonable attribute functions", function () {
        	var attr = cs.attribute("foo", 42, "number")
        	expect(attr()).to.be.equal(42)
        	expect(attr(7)).to.be.equal(42)
        	expect(function () { attr("foo") }).to.throw(Error)
        	attr = cs.attribute("foo", 42, /^4[0-9]$/)
        	expect(attr(43)).to.be.equal(42)
        })
    })
})
