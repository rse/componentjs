/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2014 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Application Structuring: Classes and Traits", function () {
    describe("clazz() & trait()", function () {
        it("should create reasonable classes", function () {
            var log = ""
            var sentinel = [ "42" ]
            var Trait = cs.trait({
                dynamics: {
                    _quux: "quux"
                },
                protos: {
                    quux: function () {
                        return this._quux
                    }
                }
            })
            var Parent1 = cs.clazz({
                protos: {
                    baz1: function (arg) {
                        return "<Parent1 arg=" + arg + "/>"
                    },
                    baz2: function (arg) {
                        return "<Parent1 arg=" + arg + "/>"
                    }
                }
            })
            var Parent2 = cs.clazz({
                extend: Parent1,
                mixin: [ Trait ],
                protos: {
                    baz1: function (arg) {
                        return "<Parent2 arg=" + arg + ">" + this.base(arg) + "</Parent2>"
                    }
                }
            })
            var Foo = cs.clazz({
                extend: Parent2,
                statics: {
                    BAR: "BAZ"
                },
                dynamics: {
                    _bar: "",
                    sentinel: sentinel
                },
                cons: function (bar) {
                    if (typeof bar !== "undefined")
                        this._bar = bar
                },
                protos: {
                    bar: function (value_new) {
                        var value_old = this._bar
                        if (typeof value_new !== "undefined")
                            this._bar = value_new
                        return value_old
                    },
                    baz1: function (arg) {
                        return "<Foo arg=" + arg + ">" + this.base(arg) + "</Foo>"
                    },
                    baz2: function (arg) {
                        return "<Foo arg=" + arg + ">" + this.base(arg) + "</Foo>"
                    }
                }
            })
            expect(Foo).to.be.a("function")
            expect(Foo.BAR).to.be.equal("BAZ")
            var foo = new Foo()
            expect(foo).to.be.a("object")
            expect(foo instanceof Foo).to.be.true
            expect(foo instanceof Parent2).to.be.true
            expect(foo instanceof Parent1).to.be.true
            expect(foo.bar()).to.be.equal("")
            expect(foo.bar("quux")).to.be.equal("")
            expect(foo.bar()).to.be.equal("quux")
            expect(foo.sentinel).to.be.like(sentinel)
            expect(foo.sentinel).to.be.not.equal(sentinel)
            expect(foo.quux()).to.be.equal("quux")
            expect(foo.baz1("baz")).to.be.equal("<Foo arg=baz><Parent2 arg=baz><Parent1 arg=baz/></Parent2></Foo>")
            expect(foo.baz2("baz")).to.be.equal("<Foo arg=baz><Parent1 arg=baz/></Foo>")
        })
    })
})
