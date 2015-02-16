/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2015 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  determine component information for infobox  */
_cs.dbg_infobox_content = function (comp) {
    var name, method, id;
    var html = "";

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
    var values = "";
    for (id in comp.__config)
        if (_cs.isown(comp.__config, id))
            if (id.match(/^ComponentJS:property:ComponentJS:model/))
                if (typeof comp.__config[id] === "object")
                    for (name in comp.__config[id].data)
                        if (_cs.isown(comp.__config[id].data, name))
                            values += "<code>" + name + "</code>, ";
    values = values.replace(/, $/, "");
    if (values === "")
        values = "<span class=\"none\">none</span>";
    html += "<tr>" +
        "<td class=\"label\">Model Values:</td>" +
        "<td class=\"value\">" + values + "</td>" +
        "</tr>";

    /*  sockets  */
    var sockets = "";
    for (id in comp.__config)
        if (_cs.isown(comp.__config, id))
            if (id.match(/^ComponentJS:property:ComponentJS:socket:/))
                if (typeof comp.__config[id] === "object")
                    sockets += "<code>" + id
                        .replace(/^ComponentJS:property:ComponentJS:socket:/, "") + "</code>, ";
    sockets = sockets.replace(/, $/, "");
    if (sockets === "")
        sockets = "<span class=\"none\">none</span>";
    html += "<tr>" +
        "<td class=\"label\">Sockets:</td>" +
        "<td class=\"value\">" + sockets + "</td>" +
        "</tr>";

    /*  event subscriptions  */
    var subscriptions = "";
    for (id in comp.__subscription)
        if (_cs.isown(comp.__subscription, id))
            if (typeof comp.__subscription[id] === "object")
                if (typeof comp.__subscription[id].name === "string")
                    if (!comp.__subscription[id].name.match(/^ComponentJS:/))
                        subscriptions += "<code>" + comp.__subscription[id].name + "</code>, ";
    subscriptions = subscriptions.replace(/, $/, "");
    if (subscriptions === "")
        subscriptions = "<span class=\"none\">none</span>";
    html += "<tr>" +
        "<td class=\"label\">Event Subscriptions:</td>" +
        "<td class=\"value\">" + subscriptions + "</td>" +
        "</tr>";

    /*  service registrations  */
    var registrations = "";
    for (id in comp.__subscription)
        if (_cs.isown(comp.__subscription, id))
            if (typeof comp.__subscription[id] === "object")
                if (typeof comp.__subscription[id].name === "string")
                    if (comp.__subscription[id].name.match(/^ComponentJS:service:/))
                        registrations += "<code>" + comp.__subscription[id].name
                            .replace(/^ComponentJS:service:/, "") + "</code>, ";
    registrations = registrations.replace(/, $/, "");
    if (registrations === "")
        registrations = "<span class=\"none\">none</span>";
    html += "<tr>" +
        "<td class=\"label\">Service Registrations:</td>" +
        "<td class=\"value\">" + registrations + "</td>" +
        "</tr>";

    /*  hooks  */
    var hooks = "";
    for (id in comp.__subscription)
        if (_cs.isown(comp.__subscription, id))
            if (typeof comp.__subscription[id] === "object")
                if (typeof comp.__subscription[id].name === "string")
                    if (comp.__subscription[id].name.match(/^ComponentJS:hook:/))
                        hooks += "<code>" + comp.__subscription[id].name
                            .replace(/^ComponentJS:hook:/, "") + "</code>, ";
    hooks = hooks.replace(/, $/, "");
    if (hooks === "")
        hooks = "<span class=\"none\">none</span>";
    html += "<tr>" +
        "<td class=\"label\">Hook Points:</td>" +
        "<td class=\"value\">" + hooks + "</td>" +
        "</tr>";

    /*  finish and return table  */
    html = "<table>" + html + "</table>";
    return html;
};

