
/*  use "cs" namespace for ComponentJS
    and "app" namespace for ourself  */
ComponentJS.symbol("cs")
cs.ns("app")
cs.ns("app.ui")

/*  bootstrap ComponentJS internals  */
cs.bootstrap()

/*  if instrumented with browser debugger,
    enable ComponentJS debug messages and
    enable ComponentJS debugger window  */
cs.debug(0)
if (cs.plugin("debugger")) {
    if (cs.debug_instrumented()) {
        cs.debug(9)
        cs.debug_window({
            enable:    true,
            natural:   true,
            autoclose: false,
            name:      "Demo",
            width:     800,
            height:    1000
        })
    }
}

/*  create root component and make it visible  */
main = function (callback) {
    cs.create("/sv", app.sv)
    cs("/sv").state("prepared", function () {
        cs.create("/ui/panel", {}, app.ui.panel)
        if (typeof callback === "function")
            callback()
        cs("/ui/panel").state(
            typeof document !== "undefined" ? "visible" : "prepared"
        )
    })
}

