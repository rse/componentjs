/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Value Validation", function () {
    describe("validate()", function () {
        it("should validate stand-alone null/undefined", function () {
            expect(cs.validate(null, "null")).to.be.equal(true)
            expect(cs.validate(undefined, "undefined")).to.be.equal(true)
        })
        it("should validate stand-alone boolean/number/string/function", function () {
            expect(cs.validate(true, "boolean")).to.be.equal(true)
            expect(cs.validate(42, "number")).to.be.equal(true)
            expect(cs.validate("foo", "string")).to.be.equal(true)
            expect(cs.validate(function () {}, "function")).to.be.equal(true)
        })
        it("should validate stand-alone object", function () {
            expect(cs.validate(null, "object")).to.be.equal(true)
            expect(cs.validate({}, "object")).to.be.equal(true)
            expect(cs.validate([], "object")).to.be.equal(true)
        })
        it("should validate stand-alone any", function () {
            expect(cs.validate(null, "any")).to.be.equal(true)
            expect(cs.validate(true, "any")).to.be.equal(true)
            expect(cs.validate(42, "any")).to.be.equal(true)
            expect(cs.validate("foo", "any")).to.be.equal(true)
            expect(cs.validate(function () {}, "any")).to.be.equal(true)
            expect(cs.validate({}, "any")).to.be.equal(true)
            expect(cs.validate([], "any")).to.be.equal(true)
        })
        it("should validate stand-alone classes", function () {
            expect(cs.validate(new Array(), "Array")).to.be.equal(true)
            expect(cs.validate(new RegExp(), "RegExp")).to.be.equal(true)
            global.Foo = function () {};
            expect(cs.validate(new Foo(), "Foo")).to.be.equal(true)
        })
        it("should validate stand-alone trait/clazz/component", function () {
            var T = cs.trait({});
            expect(cs.validate(T, "trait")).to.be.equal(true)
            var C = cs.clazz({});
            expect(cs.validate(C, "clazz")).to.be.equal(true)
            var c = cs.create("/validate", C)
            expect(cs.validate(c, "component")).to.be.equal(true)
        })
        it("should validate arrays with arities", function () {
            expect(cs.validate([], "[ any? ]")).to.be.equal(true)
            expect(cs.validate([], "[ any* ]")).to.be.equal(true)
            expect(cs.validate([], "[ any+ ]")).to.be.equal(false)
            expect(cs.validate([ 42 ], "[ any? ]")).to.be.equal(true)
            expect(cs.validate([ 42 ], "[ any* ]")).to.be.equal(true)
            expect(cs.validate([ 42 ], "[ any+ ]")).to.be.equal(true)
            expect(cs.validate([ 42, "foo" ], "[ any? ]")).to.be.equal(false)
            expect(cs.validate([ 42, "foo" ], "[ any* ]")).to.be.equal(true)
            expect(cs.validate([ 42, "foo" ], "[ any+ ]")).to.be.equal(true)
        })
        it("should validate hashes with arities", function () {
            expect(cs.validate({}, "{}")).to.be.equal(true)
            expect(cs.validate({}, "{ foo?: any }")).to.be.equal(true)
            expect(cs.validate({}, "{ foo: any }")).to.be.equal(false)
            expect(cs.validate({ foo: "foo" }, "{ foo: any }")).to.be.equal(true)
            expect(cs.validate({ foo: "foo", bar: "bar" }, "{ foo: any }")).to.be.equal(false)
        })
        it("should validate complex structure fully", function () {
            expect(cs.validate(
                { foo: { bar: "bar", baz: 42 } },
                "{ foo: { bar: string, baz: number } }"
            )).to.be.equal(true)
            expect(cs.validate(
                { foo: { bar: "bar", baz: [ 7, 42 ], quux: "quux" } },
                "{ foo: { bar: string, baz: [ number* ] } }"
            )).to.be.equal(false)
            expect(cs.validate(
                { foo: { bar: "bar", baz: [ 7, 42 ], quux: "quux" } },
                "{ foo: { bar: string, baz: [ number* ], quux?: string } }"
            )).to.be.equal(true)
        })
        it("should validate complex structure partially", function () {
            expect(cs.validate(
                { bar: "bar", baz: [ 7, 42 ], quux: "quux" },
                "{ foo: { bar: string, baz: [ number* ], quux?: string } }",
                "foo"
            )).to.be.equal(true)
        })
    })
})

