/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Component Creation", function () {
    describe("create() & destroy()", function () {
        it("should create and destroy component trees", function () {
            var foo  = { id: "foo" }
            var bar  = { id: "bar" }
            var baz  = { id: "baz" }
            var quux = { id: "quux" }

            var Foo = cs.create("/foo", foo)
            var Bar = cs.create(Foo, "bar", bar)
            Bar.create("baz", baz)
            cs("/foo").create("quux", quux)

            expect(cs("/foo").obj().id).to.be.equal("foo")
            expect(cs("/foo/bar").obj().id).to.be.equal("bar")
            expect(cs("/foo/bar/baz").obj().id).to.be.equal("baz")
            expect(cs("/foo/quux").obj().id).to.be.equal("quux")

            cs.destroy("/foo")

            cs.create("/foo/{bar/baz,quux}", foo, bar, baz, quux)

            expect(cs("/foo").obj().id).to.be.equal("foo")
            expect(cs("/foo/bar").obj().id).to.be.equal("bar")
            expect(cs("/foo/bar/baz").obj().id).to.be.equal("baz")
            expect(cs("/foo/quux").obj().id).to.be.equal("quux")

            cs.destroy("/foo")

        })
    })
})
