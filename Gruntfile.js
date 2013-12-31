/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2014 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global module: true */
module.exports = function (grunt) {

    /*  load external requirements  */
    grunt.loadNpmTasks("grunt-complexity");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-env");
    grunt.loadNpmTasks("grunt-expand-include");
    grunt.loadNpmTasks("grunt-extend-config");
    grunt.loadNpmTasks("grunt-istanbul");
    grunt.loadNpmTasks("grunt-mkdir");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-newer-explicit");
    grunt.loadNpmTasks("grunt-open");
    grunt.loadNpmTasks("grunt-path-check");
    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("grunt-touch");
    grunt.loadNpmTasks("grunt-eslint");

    /*
     *  ==== COMMON CONFIGURATION ====
     */

    /*  common task configuration  */
    grunt.initConfig({
        version: grunt.file.readYAML("VERSION"),
        version_string: "<%= version.major %>.<%= version.minor %>.<%= version.micro %>",
        jshint: {
            "bld": [ "Gruntfile.js" ],
            options: {
                jshintrc: "jshint.json"
            }
        },
        eslint: {
            "bld": [ "Gruntfile.js" ],
            options: {
                config: "eslint.json"
            }
        },
        mkdir: {
            "bld": {
                options: {
                    create: [ "bld" ]
                }
            }
        },
        shell: {
            options: {
                stdout: true,
                stderr: true
            }
        },
        clean: {
            "clean":     [ "bld", "cov" ],
            "distclean": [ "node_modules" ]
        }
    });

    /*  common task aliasing  */
    grunt.registerTask("default", [
        "build"
    ]);
    grunt.registerTask("build", [
        "jshint:bld",
        "eslint:bld",
        "mkdir:bld",
        "src-build",
        "doc-build"
    ]);
    grunt.registerTask("cleanup", [
        "src-clean",
        "doc-clean"
    ]);

    /*
     *  ==== SOURCE BUILDING ====
     */

    /*  build core  */
    grunt.extendConfig({
        newer: {
            "src-core": {
                src: [ "src/core/component.js", "src/core/component-*.js" ],
                dest: "bld/component.js",
                options: { tasks: [ "expand-include:src-core" ] }
            }
        },
        "expand-include": {
            "src-core": {
                src: "src/core/component.js",
                dest: "bld/component.js",
                options: {
                    directiveSyntax: "js",
                    globalDefines: {
                        major: "<%= version.major %>",
                        minor: "<%= version.minor %>",
                        micro: "<%= version.micro %>",
                        date:  "<%= version.date  %>"
                    }
                }
            }
        },
        clean: {
            "src-core": [
                "bld/component.js"
            ]
        }
    });

    /*  build plugins (debugger only)  */
    grunt.extendConfig({
        newer: {
            "src-plugin-debugger": {
                src: [ "src/plugin/component.plugin.debugger.js", "src/plugin/component.plugin.debugger-*.js" ],
                dest: "bld/component.plugin.debugger.js",
                options: { tasks: [ "expand-include:src-plugin-debugger" ] }
            }
        },
        "expand-include": {
            "src-plugin-debugger": {
                src: "src/plugin/component.plugin.debugger.js",
                dest: "bld/component.plugin.debugger.js",
                options: {
                    directiveSyntax: "js"
                }
            }
        },
        clean: {
            "src-plugin-debugger": [
                "bld/component.plugin.debugger.js"
            ]
        }
    });

    /*  build plugins (others)  */
    grunt.extendConfig({
        newer: {
            "src-plugin-other": {
                src: [ "src/plugin/component.plugin.*.js", "!src/plugin/component.plugin.debugger*.js" ],
                dest: "bld/component.plugin.jquery.js",
                options: { tasks: [ "copy:src-plugin-other" ] }
            }
        },
        copy: {
            "src-plugin-other": {
                files: [{
                    expand: true,
                    src: [
                        "src/plugin/component.plugin.*.js",
                        "!src/plugin/component.plugin.debugger*.js"
                    ],
                    dest: "bld",
                    flatten: true
                }]
            }
        },
        clean: {
            "src-plugin-other": [
                "bld/component.plugin.*.js"
            ]
        }
    });

    /*  linting (JSHint)  */
    grunt.extendConfig({
        newer: {
            "src-jshint": {
                src: [ "bld/component.js", "bld/component.*.js", "!bld/component.*.min.js" ],
                dest: "bld/.done-src-jshint",
                options: { tasks: [ "jshint:src", "touch:src-jshint-done" ] }
            },
            "src-eslint": {
                src: [ "bld/component.js", "bld/component.*.js", "!bld/component.*.min.js" ],
                dest: "bld/.done-src-eslint",
                options: { tasks: [ "eslint:src", "touch:src-eslint-done" ] }
            }
        },
        jshint: {
            "src": [ "bld/*.js", "!bld/*.min.js" ]
        },
        eslint: {
            "src": {
                src: [ "bld/*.js", "!bld/*.min.js" ]
            }
        },
        touch: {
            "src-jshint-done": {
                src: [ "bld/.done-src-jshint" ]
            },
            "src-eslint-done": {
                src: [ "bld/.done-src-eslint" ]
            }
        },
        clean: {
            "src-jshint": [
                "bld/.done-src-jshint"
            ],
            "src-eslint": [
                "bld/.done-src-eslint"
            ]
        }
    });

    /*  linting (Google Closure Compiler)  */
    grunt.extendConfig({
        newer: {
            "src-closurecompiler": {
                src: [ "bld/component.js", "bld/component.*.js", "!bld/component.*.min.js" ],
                dest: "bld/.done-src-closurecompiler",
                options: { tasks: [ "path-check:src-closurecompiler", "touch:src-closurecompiler-done" ] }
            }
        },
        "path-check": {
            "src-closurecompiler": {
                src: [ "closure-compiler" ],
                options: {
                    mandatory: false,
                    tasks: [ "shell:src-closurecompiler" ]
                }
            }
        },
        shell: {
            "src-closurecompiler": {
                command: "closure-compiler " +
                    "--warning_level DEFAULT " +
                    "--compilation_level SIMPLE_OPTIMIZATIONS " +
                    "--language_in ECMASCRIPT5 " +
                    "--third_party " +
                    "--js bld/component.js",
                options: {
                    stdout: false,
                    stderr: true
                }
            }
        },
        touch: {
            "src-closurecompiler-done": {
                src: [ "bld/.done-src-closurecompiler" ]
            }
        },
        clean: {
            "src-closurecompiler": [
                "bld/.done-src-closurecompiler"
            ]
        }
    });

    /*  linting (Google Closure Linter)  */
    grunt.extendConfig({
        newer: {
            "src-closurelinter": {
                src: [ "bld/component.js", "bld/component.*.js", "!bld/component.*.min.js" ],
                dest: "bld/.done-src-closurelinter",
                options: { tasks: [ "path-check:src-closurelinter", "touch:src-closurelinter-done" ] }
            }
        },
        "path-check": {
            "src-closurelinter": {
                src: [ "gjslint" ],
                options: {
                    mandatory: false,
                    tasks: [ "shell:src-closurelinter" ]
                }
            }
        },
        shell: {
            "src-closurelinter": {
                command: "gjslint " +
                    "--disable 0001,0110,0120,0131 " +
                    "bld/component.js",
                options: {
                    stdout: false,
                    stderr: true
                }
            }
        },
        touch: {
            "src-closurelinter-done": {
                src: [ "bld/.done-src-closurelinter" ]
            }
        },
        clean: {
            "src-closurelinter": [
                "bld/.done-src-closurelinter"
            ]
        }
    });

    /*  minification (UglifyJS)  */
    grunt.extendConfig({
        newer: {
            "src-min": {
                src: [ "bld/component.js", "bld/component.*.js", "!bld/component.*.min.js" ],
                dest: "bld/component.min.js",
                options: { tasks: [ "uglify:src-min" ] }
            }
        },
        uglify: {
            "src-min": {
                files: [{
                    expand: true,
                    src: [ "bld/*.js", "!bld/*.min.js" ],
                    dest: "bld/",
                    rename: function (dest, src) { return dest + src.replace(/\.js$/, ".min.js"); },
                    flatten: true
                }]
            },
            options: {
                preserveComments: "some",
                report: "none"
            }
        },
        clean: {
            "src-min": [
                "bld/component*.min.js"
            ]
        }
    });

    /*  task aliasing  */
    grunt.registerTask("src-build", [
        "newer:src-core",
        "newer:src-plugin-debugger",
        "newer:src-plugin-other",
        "newer:src-jshint",
        "newer:src-eslint",
        "newer:src-closurecompiler",
        "newer:src-closurelinter",
        "newer:src-min"
    ]);
    grunt.registerTask("src-clean", [
        "clean:src-core",
        "clean:src-plugin-debugger",
        "clean:src-plugin-other",
        "clean:src-jshint",
        "clean:src-eslint",
        "clean:src-closurecompiler",
        "clean:src-closurelinter",
        "clean:src-min"
    ]);

    /*
     *  ==== DOCUMENTATION BUILDING =====
     */

    /*  generate HTML format  */
    grunt.extendConfig({
        newer: {
            "doc-component-api-screen-html": {
                src: [
                    "doc/component-api.pl",
                    "doc/component-api.tmpl",
                    "doc/component-api-*.txt"
                ],
                dest: "bld/component-api.screen.html",
                options: { tasks: [ "path-check:doc-component-api-screen-html" ] }
            }
        },
        "path-check": {
            "doc-component-api-screen-html": {
                src: [ "perl" ],
                options: {
                    mandatory: false,
                    tasks: [ "shell:doc-component-api-screen-html" ]
                }
            }
        },
        shell: {
            "doc-component-api-screen-html": {
                command: "perl " +
                    "doc/component-api.pl " +
                    "\"<%= version_string %>\" " +
                    "bld/component-api.screen.html " +
                    "doc/component-api.tmpl " +
                    "doc/component-api-*.txt"
            }
        },
        clean: {
            "doc-component-api-screen-html": [
                "bld/component-api.screen.html"
            ]
        }
    });

    /*  generate TXT format  */
    grunt.extendConfig({
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
    grunt.extendConfig({
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

    /*
     *  ==== TESTING ====
     */

    /*  unit testing  */
    grunt.extendConfig({
        mochaTest: {
            "core": {
                src: [ "tst/core/**/*.js" ]
            },
            "demo": {
                src: [ "tst/demo/index.js" ],
                options: {
                    timeout: 10*1000
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

    /*  coverage testing  */
    grunt.extendConfig({
        env: {
            "instrumented": {
                "COVERAGE_INSTRUMENTED": "true"
            }
        },
        instrument: {
            files: [ "bld/component*.js" ],
            options: {
                lazy: true,
                basePath: "cov/",
                flatten: true
            }
        },
        storeCoverage: {
            options: {
                dir: "cov/report"
            }
        },
        makeReport: {
            src: "cov/report/**/*.json",
            options: {
                type: "lcov",
                dir: "cov/report",
                print: "detail"
            }
        },
        open: {
            "report": {
                path: "cov/report/lcov-report/index.html"
            }
        },
        clean: {
            "cover": [ "cov" ]
        }
    });

    /*  register coverage task  */
    grunt.registerTask("cover", [
        "clean:cover",
        "instrument",
        "env:instrumented",
        "test",
        "storeCoverage",
        "makeReport"
    ]);

    /*  code complexity reporting  */
    grunt.extendConfig({
        complexity: {
            generic: {
                src: [ "src/core/*.js" ],
                options: {
                    errorsOnly:      false,
                    cyclomatic:      30,
                    halstead:        75,
                    maintainability: 65
                }
            }
        }
    });

    /*
     *  ==== RELEASE ENGINEERING ====
     */

    grunt.extendConfig({
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
                    "-e 'ComponentJS-*,.git,.gitignore,node_modules,bld/.done-*' " +
                    "-o ComponentJS-<%= version_string %>.tar.gz " +
                    "."
            },
            "snapshot": {
                command: "shtool tarball " +
                    "-c 'gzip -9' " +
                    "-e 'ComponentJS-*,.git,.gitignore,node_modules,bld/.done-*' " +
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

