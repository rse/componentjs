
/*  business service component [BS]  */
app.sv = cs.clazz({
    mixin: [ cs.marker.service ],
    protos: {
        prepare: function () {

            /*  determine realms  */
            cs(this).register({
                name: "load-realms",
                spool: "prepared",
                func: function (callback) {
                    /*  simulate a slow backend communication  */
                    setTimeout(function () {
                        callback([ "foo", "bar", "baz", "quux" ])
                    }, 1.0 * 1000)
                }
            })

            /*  determine hashed password hashed color/text  */
            cs(this).register({
                name: "hash-password",
                spool: "prepared",
                func: function (password) {
                    var djbhash = function (str) {
                        h = 5381
                        for (var i = 0; i < str.length; i++)
                            h = ((h << 5) + h) + str.charCodeAt(i)
                        h = Math.abs(h % 0xffffffff)
                        return h
                    }
                    var mkletter = function (i) {
                        return String.fromCharCode("A".charCodeAt(0) + i)
                    }
                    var result = { txt: "&nbsp;&nbsp;", col: 0 }
                    if (password !== "") {
                        h = djbhash(password)
                        result.col  = 1 + (h % 3);      h /= 3
                        result.txt  = mkletter(h % 24); h /= 24
                        result.txt += mkletter(h % 24)
                    }
                    return result
                }
            })
        },
        cleanup: function () {
            cs(this).unspool("prepared")
        }
    }
})
