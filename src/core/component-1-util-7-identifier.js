/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  advanced: 128-bit Counter-ID generation  */
_cs.cid = (function () {
    /*  128-bit emulated via 4 x 32-bit JavaScript 64-bit-floating-point-based "number"  */
    var counter = [ 0, 0, 0, 0 ];
    var base    = 4294967296; /* = 2^32 */

    /*  generate the next Counter-ID  */
    return function () {
        /*  increase counter  */
        counter[3]++;
        var carry = 0;
        for (var i = 3; i >= 0; i--) {
            carry     += counter[i];
            counter[i] = Math.floor(carry % base);
            carry      = Math.floor(carry / base);
        }

        /*  return counter  */
        return (
              _cs.base16_number(counter[0], 8, true)
            + _cs.base16_number(counter[1], 8, true)
            + _cs.base16_number(counter[2], 8, true)
            + _cs.base16_number(counter[3], 8, true)
        );
    };
})();

