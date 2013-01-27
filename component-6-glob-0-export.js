/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  export our global API...  */
if (typeof EXPORTS === "object")
    /*  ...to scoped CommonJS environment  */
    EXPORTS.ComponentJS = $cs;
else {
    /*  ...to globally scoped environment  */
    var name = "ComponentJS";
    var s = DOCUMENT.getElementsByTagName("script");
    var regex = new RegExp("^(?:.*/)?component(?:-[0-9]+(?:\\.[0-9]+)*)?(?:-min)?\\.js$");
    for (var i = 0; i < s.length; i++) {
        var src = s[i].getAttribute("src");
        if (src !== null) {
            if (regex.exec(src)) {
                var data = s[i].getAttribute("data-symbol");
                if (data !== null) {
                    name = data;
                    break;
                }
            }
        }
    }
    $cs.symbol(name);
}

