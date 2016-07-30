/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global module: true */
module.exports = function (grunt) {
    /*  unit testing  */
    grunt.config.merge({
        mochaTest: {
            "core": {
                src: [ "tst/core/**/*.js" ]
            },
            "demo": {
                src: [ "tst/demo/index.js" ],
                options: {
                    timeout: 5 * 1000
                }
            },
            options: {
                reporter: "spec",
                require: "tst/common.js"
            }
        }
    });

    /*  register testing task  */
    grunt.registerTask("test", [
        "mochaTest:core",
        "mochaTest:demo"
    ]);
};

