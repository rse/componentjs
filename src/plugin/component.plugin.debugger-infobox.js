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

    /*  name and path  */
    name = comp.name().replace(/</, "&lt;").replace(/>/, "&gt;");
    html += "<tr>" +
        "<td class=\"label\">Name:</td>" +
        "<td class=\"value\"><b>" + name + "</b></td>" +
        "</tr>";
    html += "<tr>" +
        "<td class=\"label\">Path:</td>" +
        "<td class=\"value\"><code>" + comp.path("/") + "</code></td>" +
        "</tr>";

    /*  role markers  */
    var markers = "";
    if ($cs.marked(comp.obj(), "view"))       markers += "view, ";
    if ($cs.marked(comp.obj(), "model"))      markers += "model, ";
    if ($cs.marked(comp.obj(), "controller")) markers += "controller, ";
    if ($cs.marked(comp.obj(), "service"))    markers += "service, ";
    markers = markers.replace(/, $/, "");
    if (markers === "")
        markers = "<span class=\"none\">none</span>";
    html += "<tr>" +
        "<td class=\"label\">Markers:</td>" +
        "<td class=\"value\">" + markers + "</td>" +
        "</tr>";

    /*  state and guards  */
    html += "<tr>" +
        "<td class=\"label\">State:</td>" +
        "<td class=\"value\"><code>" + comp.state() + "</code></td>" +
        "</tr>";
    var guards = "";
    for (method in comp.__state_guards)
        if (_cs.isown(comp.__state_guards, method))
            if (typeof comp.__state_guards[method] === "number" &&
                comp.__state_guards[method] !== 0                 )
                guards += "<code>" + method + "</code> (" + comp.__state_guards[method] + "), ";
    guards = guards.replace(/, $/, "");
    if (guards === "")
        guards = "<span class=\"none\">none</span>";
    html += "<tr>" +
        "<td class=\"label\">Guards:</td>" +
        "<td class=\"value\">" + guards + "</td>" +
        "</tr>";

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
    html += "<tr>" +
        "<td class=\"label\">Spools:</td>" +
        "<td class=\"value\">" + spools + "</td>" +
        "</tr>";

    /*  model values  */
    var modelNames = [];
    for (id in comp.__config)
        if (_cs.isown(comp.__config, id))
            if (id.match(/^ComponentJS:property:ComponentJS:model/))
                if (typeof comp.__config[id] === "object")
                    for (name in comp.__config[id].data)
                        if (_cs.isown(comp.__config[id].data, name))
                            modelNames.push(name);
    html += "<tr>" +
        "<td class=\"label\">Model Values:</td>" +
        "<td class=\"value\">" + arrayToSortedCodeElements(modelNames) + "</td>" +
        "</tr>";

    /*  sockets  */
    var socketNames = [];
    for (id in comp.__config)
        if (_cs.isown(comp.__config, id))
            if (id.match(/^ComponentJS:property:ComponentJS:socket:/))
                if (typeof comp.__config[id] === "object")
                    socketNames.push(id
                        .replace(/^ComponentJS:property:ComponentJS:socket:/, ""));
    html += "<tr>" +
        "<td class=\"label\">Sockets:</td>" +
        "<td class=\"value\">" + arrayToSortedCodeElements(socketNames) + "</td>" +
        "</tr>";

    /*  event subscriptions  */
    var subscriptionNames = [];
    for (id in comp.__subscription)
        if (_cs.isown(comp.__subscription, id))
            if (typeof comp.__subscription[id] === "object")
                if (typeof comp.__subscription[id].name === "string")
                    if (!comp.__subscription[id].name.match(/^ComponentJS:/))
                        subscriptionNames.push(comp.__subscription[id].name);
    html += "<tr>" +
        "<td class=\"label\">Event Subscriptions:</td>" +
        "<td class=\"value\">" + arrayToSortedCodeElements(subscriptionNames) + "</td>" +
        "</tr>";

    /*  service registrations  */
    var registrationNames = [];
    for (id in comp.__subscription)
        if (_cs.isown(comp.__subscription, id))
            if (typeof comp.__subscription[id] === "object")
                if (typeof comp.__subscription[id].name === "string")
                    if (comp.__subscription[id].name.match(/^ComponentJS:service:/))
                        registrationNames.push(comp.__subscription[id].name
                            .replace(/^ComponentJS:service:/, ""));
    html += "<tr>" +
        "<td class=\"label\">Service Registrations:</td>" +
        "<td class=\"value\">" + arrayToSortedCodeElements(registrationNames) + "</td>" +
        "</tr>";

    /*  hooks  */
    var hookNames = [];
    for (id in comp.__subscription)
        if (_cs.isown(comp.__subscription, id))
            if (typeof comp.__subscription[id] === "object")
                if (typeof comp.__subscription[id].name === "string")
                    if (comp.__subscription[id].name.match(/^ComponentJS:hook:/))
                        hookNames.push(comp.__subscription[id].name
                            .replace(/^ComponentJS:hook:/, "") );
    html += "<tr>" +
        "<td class=\"label\">Hook Points:</td>" +
        "<td class=\"value\">" + arrayToSortedCodeElements(hookNames) + "</td>" +
        "</tr>";

    /*  finish and return table  */
    html = "<table>" + html + "</table>";
    return html;
};

