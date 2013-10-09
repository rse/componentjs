
/*  controller component [PC]  */
app.ui.login = cs.clazz({
    mixin: [ cs.marker.controller ],
    dynamics: { title: "" },
    cons: function (title) {
        this.title = title
    },
    protos: {
        create: function () {
            /*  create our model and view  */
            cs(this).create("model/view", app.ui.login.model, app.ui.login.view)

            /*  allow us and sub-components to automatically increase state  */
            cs(this).property("ComponentJS:state-auto-increase", true)
        },
        prepare: function () {
            var self = this

            /*  feed model with title [PP]  */
            cs(self, "model").value("param:title", self.title)

            /*  feed model with realms [PP]  */
            cs(self, "model").guard("prepare", +1)
            cs("/sv").call("load-realms", function (realms) {
                cs(self, "model").value("param:realms", realms)
                cs(self, "model").guard("prepare", -1)
            })

            /*  event bind to presentation model click event [PA]  */
            cs(self, "model").observe({
                name: "event:login-requested",
                spool: "..:prepared",
                func: function (ev) {
                    cs(self).publish("login",
                        cs(self, "model").value("data:realm"),
                        cs(self, "model").value("data:username"),
                        cs(self, "model").value("data:password")
                    )
                }
            })

            /*  react upon general content reset event  */
            cs(self).subscribe({
                name: "content-reset",
                spreading: true,
                spool: "prepared",
                func: function (ev) {
                    cs(self, "model").value("command:reset", true, true)
                }
            })
        },
        cleanup: function () {
            cs(this).unspool("prepared")
        }
    }
})

