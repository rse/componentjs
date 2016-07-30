/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Application Structuring: Value Selection", function () {
    describe("select()", function () {
        var obj = {
            foo: {
                bar: {
                    baz: [ 7, "foo", 42, "bar", "quux" ],
                    quux: 42
                }
            }
        };
        it("should correctly get value", function () {
            expect(cs.select(obj, "")).to.be.equal(obj);
            expect(cs.select(obj, "   ")).to.be.equal(obj);
            expect(cs.select(obj, "foo")).to.be.equal(obj.foo);
            expect(cs.select(obj, "foo.bar")).to.be.equal(obj.foo.bar);
            expect(cs.select(obj, "foo.bar.baz[0]")).to.be.equal(obj.foo.bar.baz[0]);
            expect(cs.select(obj, "foo.bar.baz[4]")).to.be.equal(obj.foo.bar.baz[4]);
            expect(cs.select(obj, "foo['bar'].baz[4]")).to.be.equal(obj.foo.bar.baz[4]);
            expect(cs.select(obj, "['foo']['bar'][\"baz\"]['4']")).to.be.equal(obj.foo.bar.baz[4]);
            expect(cs.select(obj, " [ 'foo' ] [ 'bar'] [ \"baz\" ][ '4' ] ")).to.be.equal(obj.foo.bar.baz[4]);
        });
        it("should correctly set value", function () {
            var old = obj.foo.bar.baz;
            expect(cs.select(obj, "foo.bar.baz", { marker: 42 })).to.be.equal(old);
            expect(obj).to.be.like({ foo: { bar: { baz: { marker: 42 }, quux: 42 }}});
        });
    });
});
