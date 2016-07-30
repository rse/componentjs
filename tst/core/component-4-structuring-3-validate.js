/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Application Structuring: Value Validation", function () {
    describe("validate()", function () {
        it("should validate stand-alone null/undefined", function () {
            expect(cs.validate(null, "null")).to.be.true
            expect(cs.validate(undefined, "undefined")).to.be.true
        })
        it("should validate stand-alone boolean/number/string/function", function () {
            expect(cs.validate(true, "boolean")).to.be.true
            expect(cs.validate(42, "number")).to.be.true
            expect(cs.validate("foo", "string")).to.be.true
            expect(cs.validate(function () {}, "function")).to.be.true
        })
        it("should validate stand-alone object", function () {
            expect(cs.validate(null, "object")).to.be.true
            expect(cs.validate({}, "object")).to.be.true
            expect(cs.validate([], "object")).to.be.true
        })
        it("should validate stand-alone any", function () {
            expect(cs.validate(null, "any")).to.be.true
            expect(cs.validate(true, "any")).to.be.true
            expect(cs.validate(42, "any")).to.be.true
            expect(cs.validate("foo", "any")).to.be.true
            expect(cs.validate(function () {}, "any")).to.be.true
            expect(cs.validate({}, "any")).to.be.true
            expect(cs.validate([], "any")).to.be.true
        })
        it("should validate stand-alone classes", function () {
            expect(cs.validate(new Array(), "Array")).to.be.true
            expect(cs.validate(new RegExp(), "RegExp")).to.be.true
            global.Foo = function () {};
            expect(cs.validate(new Foo(), "Foo")).to.be.true
        })
        it("should validate stand-alone trait/clazz/component", function () {
            var T = cs.trait({});
            expect(cs.validate(T, "trait")).to.be.true
            var C = cs.clazz({});
            expect(cs.validate(C, "clazz")).to.be.true
            var c = cs.create("/validate", C)
            expect(cs.validate(c, "component")).to.be.true
        })
        it("should validate arrays with arities", function () {
            expect(cs.validate([], "[ any ]")).to.be.false
            expect(cs.validate([], "[ any? ]")).to.be.true
            expect(cs.validate([], "[ any* ]")).to.be.true
            expect(cs.validate([], "[ any+ ]")).to.be.false
            expect(cs.validate([], "[ any{1,oo} ]")).to.be.false
            expect(cs.validate([ 42 ], "[ any? ]")).to.be.true
            expect(cs.validate([ 42 ], "[ any* ]")).to.be.true
            expect(cs.validate([ 42 ], "[ any+ ]")).to.be.true
            expect(cs.validate([ 42 ], "[ any{1,oo} ]")).to.be.true
            expect(cs.validate([ 42, "foo" ], "[ any? ]")).to.be.false
            expect(cs.validate([ 42, "foo" ], "[ any* ]")).to.be.true
            expect(cs.validate([ 42, "foo" ], "[ any+ ]")).to.be.true
            expect(cs.validate([ 42, "foo" ], "[ any{1,2} ]")).to.be.true
        })
        it("should validate arrays as tuples", function () {
            expect(cs.validate([ "foo", 42, true ], "[ string, number, boolean ])")).to.be.true
            expect(cs.validate([ "foo", 42, 7, true ], "[ string, number+, boolean ])")).to.be.true
            expect(cs.validate([ "foo", 42, 7, true ], "[ string, number*, boolean ])")).to.be.true
            expect(cs.validate([ "foo", 42, 7, true ], "[ string, number{1,2}, boolean ])")).to.be.true
            expect(cs.validate([ "foo", 42, 7, 0, true ], "[ string, number{1,2}, boolean ])")).to.be.false
        })
        it("should validate hashes with arities", function () {
            expect(cs.validate({}, "{}")).to.be.true
            expect(cs.validate({}, "{ foo?: any }")).to.be.true
            expect(cs.validate({}, "{ foo: any }")).to.be.false
            expect(cs.validate({ foo: "foo" }, "{ foo: any }")).to.be.true
            expect(cs.validate({ foo: "foo", bar: "bar" }, "{ foo: any }")).to.be.false
        })
        it("should validate complex structure", function () {
            expect(cs.validate(
                { foo: { bar: "bar", baz: 42 } },
                "{ foo: { bar: string, baz: number } }"
            )).to.be.true
            expect(cs.validate(
                { foo: { bar: "bar", baz: [ 7, 42 ], quux: "quux" } },
                "{ foo: { bar: string, baz: [ number* ] } }"
            )).to.be.false
            expect(cs.validate(
                { foo: { bar: "bar", baz: [ 7, 42 ], quux: "quux" } },
                "{ foo: { bar: string, baz: [ number* ], quux?: string } }"
            )).to.be.true
        })
    })
})

