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
    /*  release engineering  */
    grunt.config.merge({
        "path-check": {
            "release": {
                src: [ "shtool", "tar", "gzip" ]
            },
            "snapshot": {
                src: [ "shtool", "tar", "gzip" ]
            }
        },
        shell: {
            "release": {
                command: "shtool tarball " +
                    "-c 'gzip -9' " +
                    "-e 'ComponentJS-*,.git,.gitignore,.travis.yml,node_modules,bld/.done-*' " +
                    "-o ComponentJS-<%= version_string %>.tar.gz " +
                    "."
            },
            "snapshot": {
                command: "shtool tarball " +
                    "-c 'gzip -9' " +
                    "-e 'ComponentJS-*,.git,.gitignore,.travis.yml,node_modules,bld/.done-*' " +
                    "-o ComponentJS-SNAPSHOT.tar.gz " +
                    "."
            }
        }
    });

    /*  register tasks  */
    grunt.registerTask("release", [
        "build",
        "path-check:release",
        "shell:release"
    ]);
    grunt.registerTask("snapshot", [
        "build",
        "path-check:snapshot",
        "shell:snapshot"
    ]);
};

