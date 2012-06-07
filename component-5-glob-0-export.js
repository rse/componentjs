/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
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
    var regex = new RegExp("^(?:.*/)?component(?:-[0-9]+(?:\.[0-9]+)*)?(?:-min)?\.js$");
    for (var i = 0; i < s.length; i++) {
        if (s[i].hasAttribute("src")) {
            var src = s[i].getAttribute("src");
            if (regex.exec(src)) {
                if (s[i].hasAttribute("data-symbol")) {
                    name = s[i].getAttribute("data-symbol");
                    break;
                }
            }
        }
    }
    $cs.symbol(name);
}

