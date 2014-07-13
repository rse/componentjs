
if (cs.plugin("testdrive")) {
    cs.usecase("reset", "reset all login dialogs", function () {
        return cs.ensure("/ui/panel/model", "prepared").then(function (comp) {
            comp.value("event:reset", true);
        });
    });
    cs.usecase({
        name: "login",
        desc: "fill out a login dialog",
        conf: { num: 1, realm: "foo", username: "bar", password: "baz!quux" },
        func: function (conf) {
            return cs.ensure("//login" + conf.num + "/model", "prepared").then(function (comp) {
                comp.value("data:realm", conf.realm);
                comp.value("data:username", conf.username);
                comp.value("data:password", conf.password);
                comp.value("event:login-requested", true);
            });
        }
    });
    cs.usecase({
        name: "awaitStatus",
        desc: "await the status to show a particular text",
        conf: { num: 1, realm: "foo", username: "bar", password: "baz!quux" },
        func: function (conf) {
            var re = new RegExp("login from \".*login" + conf.num + "\" with realm \"" + conf.realm +
                "\", username \"" + conf.username + "\" and password \"" + conf.password + "\"");
            return cs.poll(function (fulfill, reject) {
                return $("div.status").text().match(re);
            }, function () {
                return cs.once($("div.status"), "mutation");
            });
        }
    });
    cs.usecase("all", "fill out all login dialogs", function () {
        return cs.drive("reset")
            .then(function () { return cs.drive("login",       { num: 1, realm: "foo",  username: "foo",  password: "pw1!pw1" }); })
            .then(function () { return cs.drive("awaitStatus", { num: 1, realm: "foo",  username: "foo",  password: "pw1!pw1" }); })
            .then(function () { return cs.drive("login",       { num: 2, realm: "bar",  username: "bar",  password: "pw2!pw2" }); })
            .then(function () { return cs.drive("awaitStatus", { num: 2, realm: "bar",  username: "bar",  password: "pw2!pw2" }); })
            .then(function () { return cs.drive("login",       { num: 3, realm: "baz",  username: "baz",  password: "pw3!pw3" }); })
            .then(function () { return cs.drive("awaitStatus", { num: 3, realm: "baz",  username: "baz",  password: "pw3!pw3" }); })
            .then(function () { return cs.drive("login",       { num: 4, realm: "quux", username: "quux", password: "pw4!pw4" }); })
            .then(function () { return cs.drive("awaitStatus", { num: 4, realm: "quux", username: "quux", password: "pw4!pw4" }); });
    });
}

