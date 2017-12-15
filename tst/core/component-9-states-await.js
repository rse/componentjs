/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2017 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Component States", function () {
    var foo   = { id: "foo" }
    var bar   = { id: "bar" }
    before(function() {
        cs.create("/foo/bar", foo, bar);
        cs("//foo").property("ComponentJS:state-auto-increase", true);
    })
    describe("await()", function () {
        it("should await an upward state", function (done) {
            var awaitedFoo = false;
            var awaitedBar = false;
            cs("//foo").await("prepared", function() {
                expect(cs("//foo").state()).to.be.equal("prepared")
                awaitedFoo = true
                if (awaitedFoo && awaitedBar)
                    done()
            })
            cs("//bar").await({
                state: "prepared",
                func: function() {
                    expect(cs("//bar").state()).to.be.equal("prepared")
                    awaitedBar = true
                    if (awaitedFoo && awaitedBar)
                        done()
                },
                direction: "upward"
            })
            cs("//foo").state("prepared")
        })
        it("should await an downward state", function (done) {
            var awaitedFoo = false;
            var awaitedBar = false;
            cs("//foo").await({
                state: "created",
                func: function() {
                    expect(cs("//foo").state()).to.be.equal("created")
                    awaitedFoo = true
                    if (awaitedFoo && awaitedBar)
                        done()
                },
                direction: "downward"
            })
            cs("//bar").await({
                state: "created",
                func: function() {
                    expect(cs("//bar").state()).to.be.equal("created")
                    awaitedBar = true
                    if (awaitedFoo && awaitedBar)
                        done()
                },
                direction: "downward"
            })
            cs("//foo").state("created")
        })
    })
    after(function() {
        cs("//bar").destroy()
        cs("//foo").destroy()
    })
})
