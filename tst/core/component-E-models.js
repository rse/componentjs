/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Models", function () {
    describe("model() & value()", function () {
        it("should provide presentation model", function () {
            var Foo = {
                create: function () {
                    cs(this).model({
                        "foo": { value: "TheFooValue", valid: "string" }
                    })
                }
            }
            var Bar = {
                create: function () {
                    cs(this).model({
                        "bar": { value: "TheBarValue", valid: "string" },
                        "obj": { value: { a: [ "a1" ], b: [ "b1" ], c: {} },
                                 valid: "{ a: [ string* ], b: [ string* ], " +
                                        "  c: { c1?: string, c2?: string } }" }
                    })
                }
            }
            var Quux = {
                create: function () {
                    cs(this).model({
                        "quux": { value: "TheQuuxValue", valid: "string" }
                    })
                }
            }
            cs.create("/foo/bar/quux", Foo, Bar, Quux);
            expect(cs("//quux").value("quux")).to.be.equal("TheQuuxValue")
            expect(cs("//quux").value("bar")) .to.be.equal("TheBarValue")
            expect(cs("//quux").value("foo")) .to.be.equal("TheFooValue")
            expect(cs("//quux").value("obj.a[0]")).to.be.equal("a1")
            expect(cs("//quux").value("obj.b[0]")).to.be.equal("b1")
        })
    })
    describe("observe() & value()", function () {
        it("should support scalar values", function (done) {
            var id = cs("//quux").observe({
                name: "obj.a[0]",
                func: function (ev, vnew, vold, op, path) {
                    expect(vnew).to.be.equal("a2")
                    expect(vold).to.be.equal("a1")
                    cs("//quux").unobserve(id)
                    done()
                }
            });
            cs("//quux").value({ name: "obj.a[0]", value: "a2" })
            expect(cs("//quux").value("obj.a[0]")).to.be.equal("a2")
        })
        it("should support collection values (push only)", function (done) {
            var id = cs("//quux").observe({
                name: "obj.a",
                op: "splice",
                func: function (ev, vnew, vold, op, path) {
                    expect(vnew).to.be.equal("a3")
                    expect(vold).to.be.undefined
                    cs("//quux").unobserve(id)
                    done()
                }
            });
            cs("//quux").value({ name: "obj.a", op: "push", value: "a3" })
            expect(cs("//quux").value("obj.a[1]")).to.be.equal("a3")
        })
        it("should support collection values (array operations)", function () {
            cs("//quux").value({ name: "obj.a", op: "set", value: [] })
            expect(cs("//quux").value("obj.a")).to.be.like([])

            cs("//quux").value({ name: "obj.a", op: "push", value: "a1" })
            expect(cs("//quux").value("obj.a")).to.be.like([ "a1" ])

            cs("//quux").value({ name: "obj.a", op: "unshift", value: "a0" })
            expect(cs("//quux").value("obj.a")).to.be.like([ "a0", "a1" ])

            cs("//quux").value({ name: "obj.a", op: "push", value: "a2" })
            expect(cs("//quux").value("obj.a")).to.be.like([ "a0", "a1", "a2" ])

            var val = cs("//quux").value({ name: "obj.a[1]", op: "delete" })
            expect(val).to.be.equal("a1");
            expect(cs("//quux").value("obj.a")).to.be.like([ "a0", "a2" ])

            cs("//quux").value({ name: "obj.a", op: [ "splice", 1, 0 ], value: "a1" })
            expect(cs("//quux").value("obj.a")).to.be.like([ "a0", "a1", "a2" ])

            val = cs("//quux").value({ name: "obj.a", op: "pop" })
            expect(val).to.be.equal("a2");
            expect(cs("//quux").value("obj.a")).to.be.like([ "a0", "a1" ])

            cs("//quux").value({ name: "obj.a", op: "shift" })
            expect(cs("//quux").value("obj.a")).to.be.like([ "a1" ])

            cs("//quux").value({ name: "obj.a", op: "shift" })
            expect(cs("//quux").value("obj.a")).to.be.like([])

            val = cs("//quux").value({ name: "obj.a[0]", value: "a0" })
            expect(val).to.be.undefined
            expect(cs("//quux").value("obj.a")).to.be.like([ "a0" ])

            val = cs("//quux").value({ name: "obj.a[0]", value: "a1" })
            expect(val).to.be.equal("a0")
            expect(cs("//quux").value("obj.a")).to.be.like([ "a1" ])
        })
        it("should support collection values (hash operations)", function () {
            cs("//quux").value({ name: "obj.c.c1", value: "c1" })
            expect(cs("//quux").value("obj.c")).to.be.like({ c1: "c1" })

            cs("//quux").value({ name: "obj.c.c2", value: "c2" })
            expect(cs("//quux").value("obj.c")).to.be.like({ c1: "c1", c2: "c2" })

            cs("//quux").value({ name: "obj.c.c1", op: "delete" })
            expect(cs("//quux").value("obj.c")).to.be.like({ c2: "c2" })
        })
        it("should support observations at parent items", function (done) {
            cs("//quux").value({ name: "obj.a", op: "set", value: [] })
            var id = cs("//quux").observe({
                name: "obj",
                op: "splice",
                func: function (ev, vnew, vold, op, path) {
                    expect(vnew).to.be.equal("a1")
                    expect(vold).to.be.undefined
                    expect(op[0]).to.be.equal("splice")
                    expect(path).to.be.equal("obj.a")
                    cs("//quux").unobserve(id)
                    done()
                }
            });
            cs("//quux").value({ name: "obj.a", op: "push", value: "a1" })
        })
    })
})
