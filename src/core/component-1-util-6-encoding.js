/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  Base16 encoding (number)  */
_cs.base16_number = function (num, min, uppercase) {
    var base16 = "";
    if (typeof min === "undefined")
        min = 0;
    if (typeof uppercase === "undefined")
        uppercase = false;
    var charset = uppercase ? "0123456789ABCDEF" : "0123456789abcdef";
    while (num > 0 || min > 0) {
        base16 = charset.charAt(Math.floor(num % 16)) + base16;
        num = Math.floor(num / 16);
        if (min > 0)
            min--;
    }
    return base16;
};

