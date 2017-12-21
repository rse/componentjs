/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2017 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Component States", function () {
    var guardStateAndReleaseAfter = function (comp, state, timeout) {
        comp.guard(state, 1)
        if (timeout) {
            setTimeout(function () {
                comp.guard(state, 0)
            }, timeout)
        }
    }
    var EnterGuard = {
        create: function () { guardStateAndReleaseAfter(cs(this), "setup") }
    }
    var LeaveGuard = {
        prepare: function () { guardStateAndReleaseAfter(cs(this), "cleanup") }
    }
    var ReleaseGuard = {
        setup: function () { guardStateAndReleaseAfter(cs(this), "prepare", 100) },
        prepare: function () {guardStateAndReleaseAfter(cs(this), "cleanup", 200) }
    }
    var KillGuard = {
        setup: function () { guardStateAndReleaseAfter(cs(this), "prepare", 50) }
    }
    var LowerStateGuard = {
        setup: function () { guardStateAndReleaseAfter(cs(this), "prepare", 500) }
    }
    before(function() {
        cs.create("/enterguard", EnterGuard);
        cs.create("/leaveguard", LeaveGuard);
        cs.create("/releaseguard", ReleaseGuard);
        cs.create("/lowerguard", LowerStateGuard);
    })
    describe("guard()", function () {
        it("should guard an enter state", function () {
            cs("//enterguard").state({ state: "prepared", sync: true })
            expect(cs("//enterguard").state()).to.be.equal("created")
            cs("//enterguard").guard("setup", 0)
        })
        it("should guard an leave state", function () {
            cs("//leaveguard").state({ state: "prepared", sync: true }) // moving up first
            cs("//leaveguard").state({ state: "created", sync: true })  // moving down - should run into the guard
            expect(cs("//leaveguard").state()).to.be.equal("prepared")
            cs("//leaveguard").guard("cleanup", 0)
        })
        it("should release a guard", function (done) {
            this.timeout(5000);
            cs("//releaseguard").state({ state: "prepared", sync: true, func: function() {
                expect(cs("//releaseguard").state()).to.be.equal("prepared")
                setTimeout(function() {
                    cs("//releaseguard").state({
                        state: "created", sync: true, func: function () {
                            expect(cs("//releaseguard").state()).to.be.equal("created")
                            done()
                        }
                    })
                }, 0)
            }})
        })
        it("should call state functions after a guard released", function (done) {
            var release1 = false,
                release2 = false;
            cs("//releaseguard").state({ state: "prepared", func: function() {
                release1 = true;
                expect(cs("//releaseguard").state()).to.be.equal("prepared")
                if (release1 && release2) {
                    done();
                }
            }})
            cs("//releaseguard").state({ state: "prepared", func: function() {
                release2 = true;
                expect(cs("//releaseguard").state()).to.be.equal("prepared")
                if (release1 && release2) {
                    done();
                }
            }})
        })
        it("should not activate guarded state transition when comp got destroyed", function (done) {
            var killguard = cs.create("/killguard", KillGuard)
            var callbackReached = false;
            killguard.state({
                state: "prepared", sync: true, func: function () {
                    expect(killguard.state()).to.be.equal("dead")
                    callbackReached = true;
                }
            })
            killguard.destroy()
            expect(killguard.state()).to.be.equal("dead")
            setTimeout(function () {
                expect(callbackReached).to.be.equal(false);
                done();
            }, 1000)
        })
        it("should not activate guarded state transition when comp lifcycle got lowered", function (done) {
            var callbackReached = false;
            // ramp component up into a guarded state
            cs("//lowerguard").state({
                state: "prepared", sync: true, func: function () {
                    callbackReached = true;
                }
            })
            // ramp component down back to created while guard is still active
            cs("//lowerguard").state({ state: "created", sync: true })
            expect(cs("//lowerguard").state()).to.be.equal("created")
            setTimeout(function () {
                // expect the callback of the enter guard to not occur
                expect(callbackReached).to.be.equal(false);
                done();
            }, 1000)
        })
    })
    after(function () {
        cs("//enterguard").destroy()
        cs("//leaveguard").destroy()
        cs("//releaseguard").destroy()
        cs("//lowerguard").destroy()
    })
})
