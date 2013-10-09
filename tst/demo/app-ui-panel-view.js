
/*  view component [VM+VB]  */
app.ui.panel.view = cs.clazz({
    mixin: [ cs.marker.view ],
    dynamics: { ui: null },
    protos: {
        prepare: function () {
            var self = this

            /*  load UI DOM tree [MR]  */
            cs(self).guard("render", +1)
            $.get("app-ui-panel-mask.html", function (html) {
                self.ui = $.parseHTML(html)
                cs(self).guard("render", -1)
            })
        },
        render: function () {
            var self = this

            /*  place UI structure into DOM [MR]  */
            $("body").html(self.ui)

            /*  data bind the status line [DB]  */
            cs(this).observe({
                name: "data:status", spool: "materialized", touch: true,
                func: function (ev, status) {
                    $(".status", self.ui).html(status)
                }
            })

            /*  provide sockets to allow sub-components to plug into our UI  */
            cs(self).socket({ scope: "login1", ctx: $(".login1", self.ui), type: "jquery" });
            cs(self).socket({ scope: "login2", ctx: $(".login2", self.ui), type: "jquery" });
            cs(self).socket({ scope: "login3", ctx: $(".login3", self.ui), type: "jquery" });
            cs(self).socket({ scope: "login4", ctx: $(".login4", self.ui), type: "jquery" });

            /*  deliver reset event  */
            $(".reset", self.ui).click(function (ev) {
                cs(self).value("event:reset", true)
            })
        },
        release: function () {
            $("body").html("")
            cs(this).unspool("materialized")
        }
    }
})

