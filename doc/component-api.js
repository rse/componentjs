/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global require: true */
/* global process: true */
/* global console: true */
/* jshint -W003: false */
/* eslint no-console: 0 */
/* eslint no-use-before-define: 0 */
/* eslint no-shadow: 0 */

/*  load external requirements  */
var fs  = require("fs");
var xre = require("xregexp");

/*  command-line arguments  */
var version       = process.argv[2];
var filename_html = process.argv[3];
var filename_tmpl = process.argv[4];
var filename_txt  = process.argv.splice(5);

/*  display header  */
console.log("++ ComponentJS API Documentation Generation");

/*  read textual template  */
console.log("-- reading template: " + filename_tmpl);
var tmpl = fs.readFileSync(filename_tmpl, { encoding: "utf8" });

/*  read textual descriptions  */
var txt = "";
filename_txt.sort().forEach(function (filename) {
    console.log("-- reading input:    " + filename);
    txt += fs.readFileSync(filename, { encoding: "utf8" });
});

/*  replace version information  */
tmpl = tmpl.replace(/0\.0\.0/, version);

/*  start generating  */
var html_spec = "";
var html_navi = "";

/*  duplication removal cache  */
var cache = {};
var defined = {};

/*  remove comments  */
txt = txt.replace(/^#.*$/mg, "");

/*  create an id suitable for HTML anchors/hyperlinks  */
function mkid (id) {
    id = id.toLowerCase();
    id = xre.replace(id, xre("\\s+", "sg"), "_");
    id = xre.replace(id, xre("-", "sg"), "_");
    return id;
}

/*  convert double-type  */
function mklink (anchor, name) {
    var id = mkid(name);
    if (anchor) {
        if (!defined[id]) {
            defined[id] = true;
            return "<a name=\"" + id + "\">" + name + "</a>";
        }
        else
            return name;
    }
    else
        return "<a href=\"#" + id + "\">" + name + "</a>";
}

/*  convert text (either with anchors or hyperlinks)  */
function conv (anchor, txt) {
    /*  convert types  */
    txt = xre.replace(txt, xre("R<([^/].*?)>", "sg"), function (m0, m1) { return "<span class=\"R\">" + mklink(anchor, m1) + "</span>"; });
    txt = xre.replace(txt, xre("M<([^/].*?)>", "sg"), function (m0, m1) { return "<span class=\"M\">" + mklink(anchor, m1) + "</span>"; });
    txt = xre.replace(txt, xre("P<([^/].*?)>", "sg"), "<span class=\"P\">$1</span>");
    txt = xre.replace(txt, xre("F<([^/].*?)>", "sg"), "<span class=\"F\">$1</span>");
    txt = xre.replace(txt, xre("T<([^/].*?)>", "sg"), "<span class=\"T\">$1</span>");
    txt = xre.replace(txt, xre("O<([^/].*?)>", "sg"), "<span class=\"O\">$1</span>");
    txt = xre.replace(txt, xre("C<([^/].*?)>", "sg"), "<code>$1</code>");
    txt = xre.replace(txt, xre("I<([^/].*?):(\\d+)>", "sg"), "<img style=\"float: right;\" src=\"$1\" width=\"$2\"/>");

    /*  convert typography aspects  */
    txt = xre.replace(txt, xre("->", "sg"), "&rarr;");
    txt = xre.replace(txt, xre("<-", "sg"), "&larr;");
    txt = xre.replace(txt, xre("--", "sg"), "&mdash;");
    txt = xre.replace(txt, xre("(FIXME|TODO)", "sg"), "<span class=\"$1\">$1</span>");

    return txt;
}

/*  parse first-level structure  */
xre.forEach(txt, xre(
    "([A-Z][^\\n]+)\\n" +    // headline
    "---+[ \\t]*\\n" +       // underlining
    "(.+?\\n)" +             // body
    "(?=[A-Z][^\\n]+?\\n" +  // following headline
    "---+[ \\t]*\\n" +       // corresponding underlining
    "|$)",                   // or at end file
"sg"), function (m) {
    parse2(m[1], m[2]);
});

/*  process first-level structure  */
function parse2 (title, body) {
    /*  generate body headline  */
    html_spec += "<h2>" + mklink(1, title) + "</h2>\n";

    /*  start navigation entry  */
    html_navi += "<h2>" + mklink(0, title) + "</h2>\n";
    html_navi += "<ul>\n";

    /*  parse second-level structure (part 1)  */
    body = xre.replace(body, xre(
        "^(.+?\\n)" +           // intro paragraph
        "(?=\\n-[ \\t]+\\S+)",  // start of first function
    "s"), function (m0, m1) {
        html_spec += "<div class=\"intro\">" + addpara(conv(0, m1)) + "</div>";
    });
    function addpara (txt) {
        txt = xre.replace(txt, xre("(\\n).[ \\t]+([^\\n]*(?:\\n[ \\t]+[^\\n]+)*)", "sg"), "$1<li>$2</li>");
        txt = xre.replace(txt, xre("(\\n\\n)(<li>)", "sg"), "$1<ul>$2");
        txt = xre.replace(txt, xre("(<\/li>)(\\n\\n)", "sg"), "$1</ul>$2");
        txt = xre.replace(txt, xre("\\n{2,}", "sg"), "<p/>\n");
        return txt;
    }

    /*  parse second-level structure (part 2)  */
    body = xre.replace(body, xre(
        "-[ \\t]+(\\S+.+?)" +  // function start
        "(?=-[ \\t]+\\S+" +    // start of next function
        "|$)",                 // or end of file
    "sg"), function (m0, m1) {
        parse3(title, m1);
    });

    /*  process third-level structure  */
    function parse3 (title, body) {
        html_spec += "<ul>\n";

        /*  parse forth-level structure  */
        body = xre.replace(body, xre(
            "^" +
            "(.+?)\\n" +  //  synopsis
            "\\n" +       //  blank line
            "(.+)" +      //  body
            "$",
        "sx"), function (m0, m1, m2) {
            parse4(title, m1, m2);
        });

        /*  process forth-level structure  */
        function parse4 (title, synopsis, body) {
            html_spec += "<li>";

            /*  parse fifth-level structure (part 1)  */
            var txt = synopsis;
            txt = xre.replace(txt, xre("M<(.+?)>", "sg"), function (m0, m1) {
                parse5a(title, m1);
            });

            /*  process fifth-level structure  */
            function parse5a (title, txt) {
                if (!cache[title + ":" + txt]) {
                    html_navi += "<li>" + mklink(0, txt) + "</li>";
                    cache[title + ":" + txt] = true;
                }
            }

            /*  generate synopsis  */
            html_spec += "<div class=\"synopsis\">";
            synopsis = xre.replace(synopsis, xre("[ \\t]{2,}", "sg"), " ");
            synopsis = conv(1, synopsis);
            synopsis = xre.replace(synopsis, xre("(\\[|\\]|:|\\s+=\\s+)", "sg"), "<span class=\"meta\">$1</span>");
            synopsis = xre.replace(synopsis, xre(";", "sg"), "</div><div class=\"synopsis\">");
            synopsis = xre.replace(synopsis, xre("\\(\\s+", "sg"), "(");
            synopsis = xre.replace(synopsis, xre("\\s+\\)", "sg"), ")");
            html_spec += synopsis + "\n";
            html_spec += "</div>";

            /*  parse fifth-level structure (part 2)  */
            txt = body + "\n";
            txt = xre.replace(txt, xre(
                "(.+?\\n)" +
                "(?= \\n | $ )",
            "sgx"), function (m0, m1) {
                parse5b(m1);
            });

            /*  process fifth-level structure  */
            function parse5b (txt) {
                if (xre.test(txt, xre("^\\s*\\|\\s", "s"))) {
                    txt = xre.replace(txt, xre("^\\s*\\|\\s", "mg"), "");
                    txt = conv(0, txt);
                    txt = xre.replace(txt, xre("\\n+$", "s"), "");
                    txt = xre.replace(txt, xre("^\\s+", "s"), "");
                    html_spec += "<div class=\"example\">";
                    html_spec += txt + "\n";
                    html_spec += "</div>";
                }
                else if (xre.test(txt, xre("^\\s*Notice:\\s+", "s"))) {
                    txt = conv(0, txt);
                    html_spec += "<div class=\"notice\">";
                    html_spec += txt + "\n";
                    html_spec += "</div>";
                }
                else if (xre.test(txt, xre("^\\s*\\.\\s", "s"))) {
                    txt = xre.replace(txt, xre("([ \\t]+)\\.([ \\t]+)(.+?\\n(?:\\1 \\2.*?\\n)*)", "sg"), "<li>$3</li>");
                    txt = conv(0, txt);
                    html_spec += "<ul class=\"list\">";
                    html_spec += txt + "\n";
                    html_spec += "</ul>";
                }
                else if (xre.test(txt, xre("^\\s*\\+\\s", "s"))) {
                    txt = xre.replace(txt, xre("^\\s*\\+\\s", "mg"), "");
                    txt = conv(0, txt);
                    txt = xre.replace(txt, xre("^(.+)$", "mg"), "<tr><td>$1</td></tr>");
                    txt = xre.replace(txt, xre("(\\s+)\\+(\\s+)", "sg"), "</td><td>");
                    html_spec += "<table class=\"tabular\">";
                    html_spec += txt + "\n";
                    html_spec += "</table>";
                }
                else if (!xre.test(txt, xre("^\\s+$", "s"))) {
                    txt = conv(0, txt);
                    txt = xre.replace(txt, xre("[ \\t]{2,}", "sg"), " ");
                    html_spec += "<div class=\"desc\">";
                    html_spec += txt + "\n";
                    html_spec += "</div>";
                }
            }

            html_spec += "</li>";
        }

        html_spec += "</ul>\n";
    }

    /*  finish navigation entry  */
    html_navi += "</ul>\n";
}

/*  finish generating  */
tmpl = tmpl.replace("@SPEC@", html_spec);
tmpl = tmpl.replace("@NAVI@", html_navi);

/*  write result document  */
console.log("-- writing output:   " + filename_html);
fs.writeFileSync(filename_html, tmpl, { encoding: "utf8" });

