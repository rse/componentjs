/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  simple: 128-bit Random-ID generation  */
_cs.rid = function () {
    var data = _cs.prng(16, 255);
    return _cs.base16_bytearray(data, 0, 15, true).toUpperCase();
};

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

/*  complex: 128-bit RFC4122-compliant UUID generation  */
_cs.uuid = (function () {
    /*  internal state  */
    var time_last = 0;
    var time_seq  = 0;

    /*  generate the next UUID  */
    return function (version) {
        var uuid = [];
        if (version === 1) {
            /*  generate UUID version 1 (time and node based)  */

            /*  determine current time and time sequence counter  */
            var date = new Date();
            var time_now = date.getTime();
            if (time_now !== time_last)
                time_seq = 0;
            else
                time_seq++;
            time_last = time_now;

            /*  convert time to 100*nsec  */
            var t = _cs.ui64_n2i(time_now);
            _cs.ui64_muln(t, 1000 * 10);

            /*  adjust for offset between UUID and Unix Epoch time  */
            _cs.ui64_add(t, _cs.ui64_d2i(0x01, 0xB2, 0x1D, 0xD2, 0x13, 0x81, 0x40, 0x00));

            /*  compensate for low resolution system clock by adding
                the time/tick sequence counter  */
            if (time_seq > 0)
                _cs.ui64_add(t, _cs.ui64_n2i(time_seq));

            /*  store the 60 LSB of the time in the UUID  */
            var ov;
            ov = _cs.ui64_ror(t, 8); uuid[3] = (ov & 0xFF);
            ov = _cs.ui64_ror(t, 8); uuid[2] = (ov & 0xFF);
            ov = _cs.ui64_ror(t, 8); uuid[1] = (ov & 0xFF);
            ov = _cs.ui64_ror(t, 8); uuid[0] = (ov & 0xFF);
            ov = _cs.ui64_ror(t, 8); uuid[5] = (ov & 0xFF);
            ov = _cs.ui64_ror(t, 8); uuid[4] = (ov & 0xFF);
            ov = _cs.ui64_ror(t, 8); uuid[7] = (ov & 0xFF);
            ov = _cs.ui64_ror(t, 8); uuid[6] = (ov & 0x0F);

            /*  generate a random clock sequence  */
            var clock = _cs.prng(2, 255);
            uuid[8] = clock[0];
            uuid[9] = clock[1];

            /*  generate a random local multicast node address  */
            var node = _cs.prng(6, 255);
            node[0] += 0x01;
            node[0] += 0x02;
            for (var i = 0; i < 6; i++)
                uuid[10 + i] = node[i];
        }
        else {
            /*  generate UUID version 4 (random data based)  */
            uuid = _cs.prng(16, 255);
        }

        /*  brand with particular UUID version  */
        uuid[6] &= 0x0F;
        uuid[6] |= (version << 4);

        /*  brand as UUID variant 2 (DCE 1.1)  */
        uuid[8] &= 0x3F;
        uuid[8] |= (0x02 << 6);

        /*  return UUID in usual textual representation  */
        return (
              _cs.base16_bytearray(uuid,  0,  3, false) + "-"
            + _cs.base16_bytearray(uuid,  4,  5, false) + "-"
            + _cs.base16_bytearray(uuid,  6,  7, false) + "-"
            + _cs.base16_bytearray(uuid,  8,  9, false) + "-"
            + _cs.base16_bytearray(uuid, 10, 15, false)
        );
    };
})();

