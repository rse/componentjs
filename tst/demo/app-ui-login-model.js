
/*  model component [PM+PL]  */
app.ui.login.model = cs.clazz({
    mixin: [ cs.marker.model ],
    protos: {
        create: function () {
            /*  presentation model [PM]  */
            cs(this).model({
                "param:title":           { value: "",      valid: "string"                   }, /* [PV] */
                "param:realms":          { value: [],      valid: "[string*]"                }, /* [PV] */
                "command:reset":         { value: false,   valid: "boolean", autoreset: true }, /* [CV] */
                "data:realm":            { value: "",      valid: "string", store: true      }, /* [DV] */
                "data:username":         { value: "",      valid: "string", store: true      }, /* [DV] */
                "data:password":         { value: "",      valid: "string"                   }, /* [DV] */
                "state:username":        { value: "empty", valid: "string"                   }, /* [SV] */
                "state:username-hint":   { value: "",      valid: "string"                   }, /* [SV] */
                "state:password":        { value: "empty", valid: "string"                   }, /* [SV] */
                "state:password-hint":   { value: "",      valid: "string"                   }, /* [SV] */
                "state:hashcode-col":    { value: 0,       valid: "number"                   }, /* [SV] */
                "state:hashcode-txt":    { value: "",      valid: "string"                   }, /* [SV] */
                "state:login-allowed":   { value: false,   valid: "boolean"                  }, /* [SV] */
                "event:login-requested": { value: false,   valid: "boolean", autoreset: true }  /* [EV] */
            })
        },
        prepare: function () {
            var self = this

            /*  presentation logic [PL]  */
            cs(self).observe({
                name: "param:realms", spool: "prepared", touch: true,
                func: function (ev, realms) {
                    if (cs(self).value("data:realm") === "")
                        cs(self).value("data:realm", realms[0])
                }
            })
            var determine_button_enabled = function () {
                cs(self).value("state:login-allowed",
                       cs(self).value("state:username") === "valid"
                    && cs(self).value("state:password") === "valid"
                )
            }
            cs(self).observe({
                name: "data:username", spool: "prepared", touch: true,
                func: function (ev, username) {
                    if (username === "") {
                        cs(self).value("state:username", "empty")
                        cs(self).value("state:username-hint",
                            "please enter your username")
                    }
                    else if (!username.match(/^[a-z][a-z0-9]*$/)) {
                        cs(self).value("state:username", "error")
                        cs(self).value("state:username-hint", "sorry, invalid username")
                    }
                    else {
                        cs(self).value("state:username", "valid")
                        cs(self).value("state:username-hint", "")
                    }
                    determine_button_enabled()
                }
            })
            cs(self).observe({
                name: "data:password", spool: "prepared", touch: true,
                func: function (ev, password) {
                    if (password === "") {
                        cs(self).value("state:password", "empty")
                        cs(self).value("state:password-hint", "please enter your password")
                    }
                    else if (!password.match(/^[^\s]{6,}$/)) {
                        cs(self).value("state:password", "error")
                        cs(self).value("state:password-hint", "sorry, invalid password")
                    }
                    else {
                        cs(self).value("state:password", "valid")
                        cs(self).value("state:password-hint", "")
                    }
                    determine_button_enabled()
                    var hash = cs("/sv").call("hash-password", password)
                    cs(self).value("state:hashcode-txt", hash.txt)
                    cs(self).value("state:hashcode-col", hash.col)
                }
            })
            cs(self).observe({
                name: "command:reset", spool: "prepared",
                func: function (ev) {
                    cs(self).value("data:realm", cs(self).value("param:realms")[0])
                    cs(self).value("data:username", "")
                    cs(self).value("data:password", "")
                    console.log("RESET: " + cs(self).value("param:title"))
                }
            })
        },
        cleanup: function () {
            cs(this).unspool("prepared")
        }
    }
})

