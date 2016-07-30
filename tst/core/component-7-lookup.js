/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Component Lookup", function () {
    var foo   = { id: "foo" }
    var bar   = { id: "bar" }
    var baz   = { id: "baz" }
    var quux  = { id: "quux" }
    var quux2 = { id: "quux2" }
	before(function () {
        cs.create("/foo/{bar/quux,baz/quux}", foo, bar, quux, baz, quux2);
	})
    describe("cs()", function () {
        it("should lookup root and none components", function () {
            expect(cs("/").name()).to.be.equal("<root>")
            expect(cs("/unknown").name()).to.be.equal("<none>")
        })
        it("should lookup particular components (absolute path)", function () {
            expect(cs("/foo").name()).to.be.equal("foo")
            expect(cs("/foo").obj().id).to.be.equal("foo")
            expect(cs("/foo/bar/quux").name()).to.be.equal("quux")
            expect(cs("/foo/bar/quux").obj().id).to.be.equal("quux")
            expect(cs("/foo/baz/quux").name()).to.be.equal("quux")
            expect(cs("/foo/baz/quux").obj().id).to.be.equal("quux2")
        })
        it("should lookup particular components (relative path)", function (){
        	var Foo = cs("/foo")
        	var Bar = cs(Foo, "bar")
        	var Baz = cs(Foo, "baz")
        	var Quux = cs(Foo, "bar/quux")
        	var Quux2 = cs(Foo, "baz/quux")
            expect(Foo.obj().id).to.be.equal("foo")
            expect(Bar.obj().id).to.be.equal("bar")
            expect(Baz.obj().id).to.be.equal("baz")
            expect(Quux.obj().id).to.be.equal("quux")
            expect(Quux2.obj().id).to.be.equal("quux2")
            expect(cs(Quux2, "../../baz/quux")).to.be.equal(Quux2)
            expect(cs("//bar")).to.be.equal(Bar)
            expect(cs("//baz")).to.be.equal(Baz)
            expect(function () { cs("//quux") }).to.throw(Error)
            expect(cs(Foo, "bar/*")).to.be.equal(Quux)
            expect(cs(Foo, "baz/*")).to.be.equal(Quux2)
            expect(cs(Foo.obj())).to.be.equal(Foo)
        })
    })
    describe("exists()", function () {
        it("should correctly check for component existence", function () {
            expect(cs("/").exists()).to.be.true
            expect(cs("/foo").exists()).to.be.true
            expect(cs("/unknown").exists()).to.be.false
        })
    })
    after(function () {
        cs.destroy("/foo")
    })
})
