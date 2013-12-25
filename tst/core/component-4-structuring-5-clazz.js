/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Application Structuring: Classes and Traits", function () {
    describe("clazz() & trait()", function () {
        it("should create reasonable classes", function () {
            var sentinel = [ "42" ];
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
            var Parent1 = cs.clazz({})
            var Parent2 = cs.clazz({
                extend: Parent1,
                mixin: [ Trait ]
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
        })
    })
})
