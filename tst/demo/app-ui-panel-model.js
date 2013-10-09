
/*  model component [PM+PL]  */
app.ui.panel.model = cs.clazz({
    mixin: [ cs.marker.model ],
    dynamics: { timer: null },
    protos: {
        create: function () {
            /*  presentation model [PM]  */
            cs(this).model({
                "data:status":      { value: "",    valid: "string"   }, /* [DV] */
                "param:clearafter": { value: 5,     valid: "number"   }, /* [PV] */
                "event:reset":      { value: false, valid: "boolean",
                                      autoreset: true                 }, /* [EV] */
            })
        },
        prepare: function () {
            /*  presentation logic [PL]  */
            var self = this
            cs(self).observe({
                name: "data:status", spool: "prepared",
                func: function (ev, status) {
                    if (self.timer !== null)
                        clearTimeout(self.timer)
                    self.timer = setTimeout(function () {
                        cs(self).value("data:status", "")
                    }, cs(self).value("param:clearafter") * 1000)
                }
            })
        },
        cleanup: function () {
            if (this.timer !== null) {
                clearTimeout(this.timer)
                this.timer = null
            }
            cs(this).unspool("prepared")
        }
    }
})

