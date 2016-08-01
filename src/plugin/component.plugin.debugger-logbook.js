/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  debugger console log  */
_cs.dbg_logline = 0;
_cs.dbg_logbook = [];
/*  debugger filter value  */
_cs.dbg_filter = "";

/*  log message to debugger console  */
_cs.dbg_log = function (msg) {
    if (_cs.dbg === null)
        return;
    var org = msg;
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
    _cs.dbg_logbook.push({ logline: _cs.dbg_logline, msg: msg, originalMsg: org });
    _cs.dbg_state_invalidate("console");
    _cs.dbg_update();
};

_cs.dbg_logbook_render = function () {
    var html = "";
    var match = /^\/(.*)\/(.*)?$/gm.exec(_cs.dbg_filter);
    var pattern = _cs.dbg_filter;
    var opts = "";
    if (match && match.length >= 2) {
        pattern = match[1];
    }
    if (match && match.length === 3) {
        opts = match[2];
    }
    var filterRegExp = new RegExp(pattern, opts);

    for (var id in _cs.dbg_logbook)
        if (_cs.isown(_cs.dbg_logbook, id)) {
            var logbook = _cs.dbg_logbook[id];
            if (filterRegExp.exec(logbook.originalMsg))
                html =
                    "<table class=\"line\">" +
                    "<tr>" +
                    "<td class=\"num\">" + logbook.logline + ".</td>" +
                    "<td class=\"msg\">" + logbook.msg + "</td>" +
                    "</tr>" +
                    "</table>" + html;
        }
    return html;
};

