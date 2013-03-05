/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  debugger console log  */
_cs.dbg_logline = 0;
_cs.dbg_logbook = "";

/*  log message to debugger console  */
_cs.dbg_log = function (msg) {
    if (_cs.dbg === null)
        return;
    msg = msg
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\n", "<br/>");
    _cs.dbg_logline++;
    msg = msg.replace(/(DEBUG\[\d+\]: )([^:]+)/,
        "<span class=\"prefix\">$1</span>" +
        "<span class=\"context\">$2</span>"
    );
    msg = msg.replace(/(\s+)(\/[^:\s]*)/g, "$1<span class=\"path\">$2</span>");
    msg = msg.replace(/(\s+)(@[a-z]+)/g,   "$1<span class=\"state\">$2</span>");
    msg = msg.replace(/((?:&lt;)?--\()([a-z]+)(\)--(?:&gt;)?)/g,
        "<span class=\"arrow\">$1</span>" +
        "<span class=\"method\">$2</span>" +
        "<span class=\"arrow\">$3</span>"
    );
    _cs.dbg_logbook +=
        "<table class=\"line\">" +
            "<tr>" +
                "<td class=\"num\">" + _cs.dbg_logline + ".</td>" +
                "<td class=\"msg\">" + msg + "</td>" +
            "</tr>" +
        "</table>";
    _cs.dbg_state_invalidate("console");
    _cs.dbg_update();
};

