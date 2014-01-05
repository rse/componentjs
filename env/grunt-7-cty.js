/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2014 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global module: true */
module.exports = function (grunt) {
    /*  code complexity reporting  */
    grunt.extendConfig({
        complexity: {
            generic: {
                src: [ "src/core/*.js" ],
                options: {
                    errorsOnly:      false,
                    cyclomatic:      40,
                    halstead:        80,
                    maintainability: 65
                }
            }
        }
    });
};

