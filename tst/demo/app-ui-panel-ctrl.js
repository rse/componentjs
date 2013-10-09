
/*  controller component [PC]  */
app.ui.panel = cs.clazz({
    mixin: [ cs.marker.controller ],
    protos: {
        create: function () {
            /*  create sub-components  */
            cs(this).create(
                "model/view/{login1,login2,login3,login4}",
                app.ui.panel.model,
                app.ui.panel.view,
                new app.ui.login("Login 1"),
                new app.ui.login("Login 2"),
                new app.ui.login("Login 3"),
                new app.ui.login("Login 4")
            )

            /*  allow us and sub-components to automatically increase state  */
            cs(this).property("ComponentJS:state-auto-increase", true)
        },
        prepare: function () {
            /*  show login action information  */
            var self = this
            cs(self).subscribe({
                name: "login",
                spool: "prepared",
                func: function (ev, realm, username, password) {
                    var msg = 'login from "' + ev.target().path("/") +
                        '" with realm "' + realm +
                        '", username "' + username +
                        '" and password "' + password + '"'

                    /*  show in own view via model  */
                    cs(self, "model").value("data:status", msg, true)

                    /*  show in the debugger console  */
                    if (   typeof console !== "undefined"
                        && typeof console.log === "function")
                        console.log("STATUS: " + msg)
                }
            })

            /*  deliver reset action event  */
            cs(self, "model").observe({
                name: "event:reset",
                spool: "prepared",
                func: function (ev) {
                    cs(self).publish({ name: "content-reset", spreading: true })
                }
            })
        },
        cleanup: function () {
            /*  remove event subscription  */
            cs(this).unspool("prepared")
        }
    }
})

