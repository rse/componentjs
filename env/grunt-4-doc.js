/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global module: true */
/* global process: true */
module.exports = function (grunt) {
    /*  generate HTML format  */
    grunt.config.merge({
        newer: {
            "doc-component-api-screen-html": {
                src: [
                    "doc/component-api.pl",
                    "doc/component-api.tmpl",
                    "doc/component-api-*.txt"
                ],
                dest: "bld/component-api.screen.html",
                options: { tasks: [ "shell:doc-component-api-screen-html" ] }
            }
        },
        shell: {
            "doc-component-api-screen-html": {
                command: process.execPath + " " +
                    "doc/component-api.js " +
                    "\"<%= version_string %>\" " +
                    "bld/component-api.screen.html " +
                    "doc/component-api.tmpl " +
                    grunt.file.expand("doc/component-api-*.txt").join(" ")
            }
        },
        clean: {
            "doc-component-api-screen-html": [
                "bld/component-api.screen.html"
            ]
        }
    });

    /*  generate TXT format  */
    grunt.config.merge({
        newer: {
            "doc-component-api-screen-txt": {
                src: [ "bld/component-api.screen.html" ],
                dest: "bld/component-api.screen.txt",
                options: { tasks: [ "path-check:doc-component-api-screen-txt" ] }
            }
        },
        "path-check": {
            "doc-component-api-screen-txt": {
                src: [ "w3m" ],
                options: {
                    mandatory: false,
                    tasks: [ "shell:doc-component-api-screen-txt" ]
                }
            }
        },
        shell: {
            "doc-component-api-screen-txt": {
                command: "w3m -dump " +
                    "bld/component-api.screen.html " +
                    "> bld/component-api.screen.txt"
            }
        },
        clean: {
            "doc-component-api-screen-txt": [
                "bld/component-api.screen.txt"
            ]
        }
    });

    /*  generate PDF format  */
    grunt.config.merge({
        newer: {
            "doc-component-api-print-a4-pdf": {
                src: [ "bld/component-api.screen.html" ],
                dest: "bld/component-api.print-a4.pdf",
                options: { tasks: [ "path-check:doc-component-api-print-a4-pdf" ] }
            },
            "doc-component-api-print-us-pdf": {
                src: [ "bld/component-api.screen.html" ],
                dest: "bld/component-api.print-us.pdf",
                options: { tasks: [ "path-check:doc-component-api-print-us-pdf" ] }
            }
        },
        "path-check": {
            "doc-component-api-print-a4-pdf": {
                src: [ "prince" ],
                options: {
                    mandatory: false,
                    tasks: [ "shell:doc-component-api-print-a4-pdf" ]
                }
            },
            "doc-component-api-print-us-pdf": {
                src: [ "prince" ],
                options: {
                    mandatory: false,
                    tasks: [ "shell:doc-component-api-print-us-pdf" ]
                }
            }
        },
        shell: {
            "doc-component-api-print-a4-pdf": {
                command: "echo '@media print { @page { size: A4 !important; } }' " +
                    ">bld/component-api.paper.css; " +
                    "prince --style bld/component-api.paper.css " +
                    "-o bld/component-api.print-a4.pdf " +
                    "bld/component-api.screen.html; " +
                    "rm -rf fontconfig; rm -f bld/component-api.paper.css"
            },
            "doc-component-api-print-us-pdf": {
                command: "echo '@media print { @page { size: US-Letter !important; } }' " +
                    ">bld/component-api.paper.css; " +
                    "prince --style bld/component-api.paper.css " +
                    "-o bld/component-api.print-us.pdf " +
                    "bld/component-api.screen.html; " +
                    "rm -rf fontconfig; rm -f bld/component-api.paper.css"
            }
        },
        clean: {
            "doc-component-api-print-a4-pdf": [
                "bld/component-api.print-a4.pdf"
            ],
            "doc-component-api-print-us-pdf": [
                "bld/component-api.print-us.pdf"
            ]
        }
    });

    /*  task aliasing  */
    grunt.registerTask("doc-build", [
        "newer:doc-component-api-screen-html",
        "newer:doc-component-api-screen-txt",
        "newer:doc-component-api-print-a4-pdf",
        "newer:doc-component-api-print-us-pdf"
    ]);
    grunt.registerTask("doc-clean", [
        "clean:doc-component-api-screen-html",
        "clean:doc-component-api-screen-txt",
        "clean:doc-component-api-print-a4-pdf",
        "clean:doc-component-api-print-us-pdf"
    ]);
};

