/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Component Information", function () {
    describe("id()", function () {
        it("should return a reasonable identifier for each component", function () {
            cs.create("/foo", {})
            cs.create("/bar", {})
            var idFoo = cs("/foo").id()
            var idBar = cs("/bar").id()
            expect(idFoo).to.be.a("string")
            expect(idBar).to.be.a("string")
            expect(idFoo).to.be.not.equal(idBar)
            cs.destroy("/foo")
            cs.destroy("/bar")
        })
    })
    describe("name()", function () {
        it("should return the component name", function () {
            cs.create("/foo/bar", {}, {})
            var nameFoo = cs("/foo").name()
            var nameBar = cs("/foo/bar").name()
            expect(nameFoo).to.be.a("string").and.equal("foo")
            expect(nameBar).to.be.a("string").and.equal("bar")
            cs.destroy("/foo")
        })
    })
    describe("obj()", function () {
        it("should return the backing object", function () {
            var obj = { id: "foo" }
            cs.create("/foo", obj)
            expect(cs("/foo").obj()).to.be.equal(obj)
            cs.destroy("/foo")
        })
    })
    describe("cfg()", function () {
        it("should allow attaching key/value information to a component", function () {
            var foo = cs.create("/foo", {})
            foo.cfg("foo", "FOO")
            foo.cfg("bar", "BAR")
            expect(foo.cfg("foo")).to.be.equal("FOO")
            expect(foo.cfg("bar")).to.be.equal("BAR")
            foo.cfg("foo", undefined)
            expect(foo.cfg("foo")).to.be.undefined
            cs.destroy("/foo")
        })
    })
})
