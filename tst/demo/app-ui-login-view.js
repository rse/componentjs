
/*  view component [VM+VB]  */
app.ui.login.view = cs.clazz({
    mixin: [ cs.marker.view ],
    dynamics: { ui: null },
    protos: {
        prepare: function () {
            var self = this

            /*  load UI DOM tree [MR]  */
            cs(self).guard("render", +1)
            $.get("app-ui-login-mask.html", function (html) {
                self.ui = $.parseHTML(html)
                cs(self).guard("render", -1)
            })
        },
        render: function () {
            var self = this

            /*  inject the realms selection [MR]  */
            cs(this).observe({
                name: "param:realms", spool: "materialized", touch: true,
                func: function (ev, realms) {
                    var opt = ""
                    for (var i = 0; i < realms.length; i++)
                        opt += '<option value="' + realms[i] + '">' + realms[i] + '</option>'
                    $(".field-realms select", self.ui).html(opt)
                }
            })

            /*  inject the title [MR]  */
            cs(this).observe({
                name: "param:title", spool: "materialized", touch: true,
                func: function (ev, title) {
                    $(".title", self.ui).html(title)
                }
            })

            /*  plug UI into DOM of parent [MR]  */
            cs(this).plug({ object: self.ui, spool: "materialized" })

            /*  data bind the realms field [DB+EV]  */
            cs(this).observe({
                name: "data:realm", spool: "materialized", touch: true,
                func: function (ev, realm) {
                    if ($(".field-realms select option:selected", self.ui).val() !== realm)
                        $(".field-realms select option[value='" + realm + "']", self.ui)
                            .prop("selected", true)
                }
            })
            $(".field-realms select", self.ui).change(function () {
                cs(self).value("data:realm",
                    $(".field-realms select option:selected", self.ui).val()
                )
            })

            /*  data bind the username field [DB+EV]  */
            cs(this).observe({
                name: "data:username", spool: "materialized", touch: true,
                func: function (ev, username) {
                    if ($(".field-username input", self.ui).val() !== username)
                        $(".field-username input", self.ui).val(username)
                }
            })
            cs(this).observe({
                name: "state:username", spool: "materialized", touch: true,
                func: function (ev, state) {
                    $(".field-username .hint-border, " +
                      ".field-username .hint-txt", self.ui)
                        .removeClass("empty").removeClass("error").removeClass("valid")
                        .addClass(state)
                }
            })
            cs(this).observe({
                name: "state:username-hint", spool: "materialized", touch: true,
                func: function (ev, hint) {
                    $(".field-username .hint-txt", self.ui).html(hint)
                }
            })
            $(".field-username input", self.ui).keyup(function () {
                cs(self).value("data:username",
                    $(".field-username input", self.ui).val()
                )
            })

            /*  data bind the password field [DB+EV]  */
            cs(this).observe({
                name: "data:password", spool: "materialized", touch: true,
                func: function (ev, password) {
                    if ($(".field-password input", self.ui).val() !== password)
                        $(".field-password input", self.ui).val(password)
                }
            })
            cs(this).observe({
                name: "state:password", spool: "materialized", touch: true,
                func: function (ev, state) {
                    $(".field-password .hint-border, " +
                      ".field-password .hint-txt", self.ui)
                        .removeClass("empty").removeClass("error").removeClass("valid")
                        .addClass(state)
                }
            })
            cs(this).observe({
                name: "state:password-hint", spool: "materialized", touch: true,
                func: function (ev, hint) {
                    $(".field-password .hint-txt", self.ui).html(hint)
                }
            })
            $(".field-password input", self.ui).keyup(function () {
                cs(self).value("data:password",
                    $(".field-password input", self.ui).val()
                )
            })

            /*  data bind the hashcode [SB+EB]  */
            cs(this).observe({
                name: "state:hashcode-txt", spool: "materialized", touch: true,
                func: function (ev, txt) {
                    $(".hashcode div", self.ui).html(txt)
                }
            })
            cs(this).observe({
                name: "state:hashcode-col", spool: "materialized", touch: true,
                func: function (ev, col) {
                    $(".hashcode div", self.ui)
                        .removeClass("c1").removeClass("c2").removeClass("c3")
                        .addClass("c" + col)
                }
            })

            /*  data bind the login button [SB+EB]  */
            cs(this).observe({
                name: "state:login-allowed", spool: "materialized", touch: true,
                func: function (ev, enabled) {
                    if (enabled)
                        $(".button-login input", self.ui)
                            .removeAttr("disabled").removeClass("disabled")
                    else
                        $(".button-login input", self.ui)
                            .attr("disabled", "disabled").addClass("disabled")
                }
            })
            $(".button-login input", self.ui).click(function (ev) {
                if (cs(self).value("state:login-allowed")) {
                    cs(self).value("event:login-requested", true)
                    ev.preventDefault()
                }
            })

            /*  convert RETURN key in username field to a focus click into password field  */
            $(".field-username input", self.ui).keypress(function (ev) {
                if (ev.which === 13 /* RETURN */) {
                    $(".field-password input", self.ui).trigger("focus")
                    ev.preventDefault()
                }
            })

            /*  convert RETURN key in password field to a click on login button  */
            $(".field-password input", self.ui).keypress(function (ev) {
                if (ev.which === 13 /* RETURN */) {
                    $(".button-login input", self.ui).trigger("click")
                    ev.preventDefault()
                }
            })
        },
        release: function () {
            cs(this).unspool("materialized")
        }
    }
})

