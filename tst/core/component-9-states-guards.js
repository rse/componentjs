/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2017 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

describe("ComponentJS Component States", function () {
    var EnterGuard = {
        create: function () {
            cs(this).guard("setup", 1)
        }
    }
    var LeaveGuard = {
        prepare: function () {
            cs(this).guard("cleanup", 1)
        }
    }
    var ReleaseGuard = {
        create: function () {
            var self = this
            cs(self).guard("setup", 1)
            setTimeout(function () {
                cs(self).guard("setup", 0)
            }, 100)
        },
        prepare: function () {
            var self = this
            cs(self).guard("cleanup", 1)
            setTimeout(function () {
                cs(self).guard("cleanup", -1)
            }, 200)
        }
    }
    var KillGuard = {
        create: function () {
            var comp = cs(this)
            comp.guard("setup", 1)
            setTimeout(function () {
                comp.guard("setup", 0)
            }, 50)
        }
    }
    before(function() {
        cs.create("/enterguard", EnterGuard);
        cs.create("/leaveguard", LeaveGuard);
        cs.create("/releaseguard", ReleaseGuard);
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
        it("should not activate state transition when comp got destroyed", function(done) {
            var killguard = cs.create("/killguard", KillGuard)
            var callbackReached = false;
            killguard.state({
                state: "prepared", sync: true, func: function() {
                    expect(killguard.state()).to.be.equal("dead")
                    callbackReached = true;
                }
            })
            killguard.destroy()
            expect(killguard.state()).to.be.equal("dead")
            setTimeout(function() {
                expect(callbackReached).to.be.equal(false);
                done();
            }, 1000)
        })
    })
    after(function() {
        cs("//enterguard").destroy()
        cs("//leaveguard").destroy()
        cs("//releaseguard").destroy()
    })
})
