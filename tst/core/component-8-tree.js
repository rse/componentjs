/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Component Tree", function () {
    var foo   = { id: "foo" }
    var bar   = { id: "bar" }
    var baz   = { id: "baz" }
    var quux  = { id: "quux" }
    var quux2 = { id: "quux2" }
    before(function () {
        cs.create("/foo/{bar/quux,baz/quux}", foo, bar, quux, baz, quux2);
    })
    describe("path()", function () {
        it("should return reasonable path", function () {
            expect(cs("/foo/bar/quux").path()).to.be.like([
                cs("/foo/bar/quux"), cs("/foo/bar"), cs("/foo"), cs("/")
            ])
            expect(cs("/foo/bar/quux").path("/")).to.be.equal("/foo/bar/quux")
            expect(cs("/").path("/")).to.be.equal("/")
            expect(cs("/unknown").path("/")).to.be.equal("/")
        })
    })
    describe("parent()", function () {
        it("should return the parent component", function () {
            expect(cs("/foo/bar/quux").parent()).to.be.equal(cs(bar))
            expect(cs("/foo").parent()).to.be.equal(cs("/"))
            expect(cs("/").parent()).to.be.null
            expect(cs("/unknown").parent()).to.be.null
        })
    })
    describe("children()", function () {
        it("should return the child components", function () {
            expect(cs("/foo").children()).to.be.like([ cs(bar), cs(baz) ])
        })
    })
    describe.skip("attach() & detach()", function () {
        it("should attach and detach components", function () {
            /*  FIXME  */
        })
    })
    describe.skip("walk_down() & walk_up()", function () {
        it("should walk upward and downward the component tree", function () {
            /*  FIXME  */
        })
    })
    after(function () {
        cs.destroy("/foo")
    })
})
