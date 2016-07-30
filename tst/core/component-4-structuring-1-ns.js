/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Application Structuring: Namespaces", function () {
    describe("ns()", function () {
        it("should create namespaces", function () {
            var quux = cs.ns("foo.bar.quux")
            expect(foo).to.be.like({ bar: { quux: {} } })
            expect(quux).to.be.equal(foo.bar.quux)
        })
    })
})
