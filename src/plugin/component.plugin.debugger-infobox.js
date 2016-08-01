/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  determine component information for infobox  */
_cs.dbg_infobox_content = function (comp) {
    var name, method, id;
    var html = "";

    var arrayToSortedCodeElements =  function (arr) {
        arr.sort();
        var values = "";
        for (id in arr)
            values += "<code>" + arr[id] + "</code>, ";
        values = values.replace(/, $/, "");
        if (values === "")
            values = "<span class=\"none\">none</span>";
        return values;
    };

    var generateHTMLTableRow = function (label, value) {
        return "<tr>" +
            "<td class=\"label\">" + label + "</td>" +
            "<td class=\"value\">" + value + "</td>" +
            "</tr>";
    };

    /*  name and path  */
    name = comp.name().replace(/</, "&lt;").replace(/>/, "&gt;");
    html += generateHTMLTableRow("Name:", "<b>" + name + "</b>");
    html += generateHTMLTableRow("Path:", "<code>" + comp.path("/") + "</code>");

    /*  role markers  */
    var markers = "";
    if ($cs.marked(comp.obj(), "view"))       markers += "view, ";
    if ($cs.marked(comp.obj(), "model"))      markers += "model, ";
    if ($cs.marked(comp.obj(), "controller")) markers += "controller, ";
    if ($cs.marked(comp.obj(), "service"))    markers += "service, ";
    markers = markers.replace(/, $/, "");
    if (markers === "")
        markers = "<span class=\"none\">none</span>";
    html += generateHTMLTableRow("Markers:", markers);

    /*  state and guards  */
    html += generateHTMLTableRow("State:", "<code>" + comp.state() + "</code>");

    var guards = "";
    for (method in comp.__state_guards)
        if (_cs.isown(comp.__state_guards, method))
            if (typeof comp.__state_guards[method] === "number" &&
                comp.__state_guards[method] !== 0                 )
                guards += "<code>" + method + "</code> (" + comp.__state_guards[method] + "), ";
    guards = guards.replace(/, $/, "");
    if (guards === "")
        guards = "<span class=\"none\">none</span>";
    html += generateHTMLTableRow("Guards:", guards);

    /*  spools  */
    var spools = "";
    for (name in comp.__spool)
        if (_cs.isown(comp.__spool, name))
            if (typeof comp.__spool[name] !== "undefined" &&
                comp.__spool[name].length > 0            )
                spools += "<code>" + name + "</code> (" + comp.__spool[name].length + "), ";
    spools = spools.replace(/, $/, "");
    if (spools === "")
        spools = "<span class=\"none\">none</span>";
    html += generateHTMLTableRow("Spools:", spools);

    /*  model values  */
    var modelNames = [];
    for (id in comp.__config)
        if (_cs.isown(comp.__config, id))
            if (id.match(/^ComponentJS:property:ComponentJS:model/))
                if (typeof comp.__config[id] === "object")
                    for (name in comp.__config[id].data)
                        if (_cs.isown(comp.__config[id].data, name))
                            modelNames.push(name);
    html += generateHTMLTableRow("Model Values:", arrayToSortedCodeElements(modelNames));

    /*  sockets  */
    var socketNames = [];
    for (id in comp.__config)
        if (_cs.isown(comp.__config, id))
            if (id.match(/^ComponentJS:property:ComponentJS:socket:/))
                if (typeof comp.__config[id] === "object")
                    socketNames.push(id
                        .replace(/^ComponentJS:property:ComponentJS:socket:/, ""));
    html += generateHTMLTableRow("Sockets:", arrayToSortedCodeElements(socketNames));

    /*  event subscriptions, service registrations and hooks  */
    var subscriptionNames = [];
    var registrationNames = [];
    var hookNames = [];
    for (id in comp.__subscription)
        if (   _cs.isown(comp.__subscription, id)
            && typeof comp.__subscription[id] === "object"
            && typeof comp.__subscription[id].name === "string") {
            if (!comp.__subscription[id].name.match(/^ComponentJS:/))
                subscriptionNames.push(comp.__subscription[id].name);
            if (comp.__subscription[id].name.match(/^ComponentJS:service:/))
                registrationNames.push(comp.__subscription[id].name
                    .replace(/^ComponentJS:service:/, ""));
            if (comp.__subscription[id].name.match(/^ComponentJS:hook:/))
                hookNames.push(comp.__subscription[id].name
                    .replace(/^ComponentJS:hook:/, "") );
        }
    html += generateHTMLTableRow("Event Subscriptions:", arrayToSortedCodeElements(subscriptionNames));
    html += generateHTMLTableRow("Service Registrations:", arrayToSortedCodeElements(registrationNames));
    html += generateHTMLTableRow("Hook Points:", arrayToSortedCodeElements(hookNames));

    /*  finish and return table  */
    html = "<table>" + html + "</table>";
    return html;
};

