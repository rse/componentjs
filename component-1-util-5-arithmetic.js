/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  this is just a really minimal UI64 functionality,
    just sufficient enough for the UUID v1 generator!  */

/*  UI64 constants  */
_cs.UI64_DIGITS     = 8;    /* number of digits */
_cs.UI64_DIGIT_BITS = 8;    /* number of bits in a digit */
_cs.UI64_DIGIT_BASE = 256;  /* the numerical base of a digit */

/*  convert between individual digits and the UI64 representation  */
_cs.ui64_d2i = function (d7, d6, d5, d4, d3, d2, d1, d0) {
    return [ d0, d1, d2, d3, d4, d5, d6, d7 ];
};

/*  the zero represented as an UI64  */
_cs.ui64_zero = function () {
    return _cs.ui64_d2i(0, 0, 0, 0, 0, 0, 0, 0);
};

/*  convert between number and UI64 representation  */
_cs.ui64_n2i = function (n) {
    var ui64 = _cs.ui64_zero();
    for (var i = 0; i < _cs.UI64_DIGITS; i++) {
        ui64[i] = Math.floor(n % _cs.UI64_DIGIT_BASE);
        n /= _cs.UI64_DIGIT_BASE;
    }
    return ui64;
};

/*  convert between UI64 representation and number  */
_cs.ui64_i2n = function (x) {
    var n = 0;
    for (var i = _cs.UI64_DIGITS - 1; i >= 0; i--) {
        n *= _cs.UI64_DIGIT_BASE;
        n += x[i];
    }
    return Math.floor(n);
};

/*  add UI64 (y) to UI64 (x) and return overflow/carry as number  */
_cs.ui64_add = function (x, y) {
    var carry = 0;
    for (var i = 0; i < _cs.UI64_DIGITS; i++) {
        carry += x[i] + y[i];
        x[i]   = Math.floor(carry % _cs.UI64_DIGIT_BASE);
        carry  = Math.floor(carry / _cs.UI64_DIGIT_BASE);
    }
    return carry;
};

/*  multiply number (n) to UI64 (x) and return overflow/carry as number  */
_cs.ui64_muln = function (x, n) {
    var carry = 0;
    for (var i = 0; i < _cs.UI64_DIGITS; i++) {
        carry += x[i] * n;
        x[i]   = Math.floor(carry % _cs.UI64_DIGIT_BASE);
        carry  = Math.floor(carry / _cs.UI64_DIGIT_BASE);
    }
    return carry;
};

/*  rotate right UI64 (x) by a "s" bits and return overflow/carry as number  */
_cs.ui64_ror = function (x, s) {
    var ov = _cs.ui64_zero();
    if ((s % _cs.UI64_DIGIT_BITS) !== 0)
        throw _cs.exception("ui64_rol", "only bit rotations supported with a multiple of digit bits");
    var k = Math.floor(s / _cs.UI64_DIGIT_BITS);
    for (var i = 0; i < k; i++) {
        for (var j = _cs.UI64_DIGITS - 1 - 1; j >= 0; j--)
            ov[j + 1] = ov[j];
        ov[0] = x[0];
        for (j = 0; j < _cs.UI64_DIGITS - 1; j++)
            x[j] = x[j + 1];
        x[j] = 0;
    }
    return _cs.ui64_i2n(ov);
};

