
/*  establish minimum run-time environment  */
exports = module.exports = global
var fs = require("fs")
var get = function (file) { return fs.readFileSync(file, "utf8") }
var load = function (file) { eval(get(file)) }
$ = { get: function (file) { return get("tst/demo/" + file); } }
setTimeout(function () {}, 4000)

/*  shutdown ComponentJS from earlier run  */
try { cs.shutdown() } catch (err) {}

/*  load application code  */
load("tst/demo/app-boot.js")
load("tst/demo/app-ui-panel-ctrl.js")
load("tst/demo/app-ui-panel-model.js")
load("tst/demo/app-ui-panel-view.js")
load("tst/demo/app-ui-login-ctrl.js")
load("tst/demo/app-ui-login-model.js")
load("tst/demo/app-ui-login-view.js")
load("tst/demo/app-sv.js")
load("tst/demo/app-testdrive.js")

/*  execute test scenario  */
describe("ComponentJS Demo (Headless Mode)", function () {
    it("should allow us to insert username/password and then press login", function (done) {
        cs.debug(0)
        main(function () {
            var console_req =
                'STATUS: login from "/ui/panel/model/view/login1" with realm "foo", username "login1" and password "foo!bar!quux"\n' +
                'STATUS: login from "/ui/panel/model/view/login2" with realm "foo", username "login2" and password "foo!bar!quux"\n' +
                'STATUS: login from "/ui/panel/model/view/login3" with realm "foo", username "login3" and password "foo!bar!quux"\n' +
                'STATUS: login from "/ui/panel/model/view/login4" with realm "foo", username "login4" and password "foo!bar!quux"\n' +
                'RESET: Login 1\n' +
                'RESET: Login 2\n' +
                'RESET: Login 3\n' +
                'RESET: Login 4\n'
            var console_out = ""
            var console_log = console.log
            global.console.log = function (msg) {
                if (typeof msg === "undefined")
                    return
                console_out += msg + "\n"
                if (console_out === console_req) {
                    console.log = console_log
                    done()
                }
            }
            var fillout = function (name) {
                var comp = cs("//" + name + "/model")
                comp.subscribe("ComponentJS:state:prepared:enter", function () {
                    comp.value("data:username", name)
                    comp.value("data:password", "foo!bar!quux")
                    comp.value("event:login-requested", true)
                })
            }
            fillout("login1")
            fillout("login2")
            fillout("login3")
            fillout("login4")
            setTimeout(function () {
                cs("/ui/panel/model").value("event:reset", true, true)
            }, 2*1000)
        })
    })
})

