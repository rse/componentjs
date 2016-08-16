/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  global API function: show suite of usecases one can drive  */
$cs.suite = function () {
    /*  sanity check run-time environment  */
    var $ = GLOBAL.jQuery || GLOBAL.$;
    if (typeof $ !== "function")
        throw new Error("testdrive#suite() requires jQuery");

    /*  the common CSS prefix (should be unique and not in conflict with the SPA classes!)  */
    var name = "ComponentJS-testdrive-suite";

    /*  find UI or create UI initually */
    var ui = $("body > ." + name);
    if (ui.length === 0) {
        ui = $(
            "<div class=\"" + name + "\">" +
                "<div class=\"" + name + "-head\">" +
                    "<b>ComponentJS</b> Test-Drive Use-Cases Suite" +
                    "<div class=\"" + name + "-head-close\">close</div>" +
                "</div>" +
                "<div class=\"" + name + "-list\"></div>" +
            "</div>"
        );
        ui.hide();
        $("body").append(ui);
    }

    /*  determine sizes  */
    var w = $(GLOBAL).width();
    var uiw = (w / 10) * 8;
    var uih = 400;

    /*  provide helper functions for animating the opening/closing of the UI  */
    var open = function (complete) {
        $(ui).show().animate({ top: 0 }, 300, "swing", complete);
    };
    var close = function (complete) {
        $(ui).animate({ top: -uih }, 300, "swing", function () {
            $(ui).hide();
            $(ui).remove();
            if (typeof complete === "function")
                complete();
        });
    };

    /*  allow one to close on subsequent call  */
    if ($("body > ." + name).filter(":visible").length > 0) {
        close();
        return;
    }

    /*  style the UI panel  */
    ui
        .width(uiw)
        .height(uih)
        .css("box-sizing", "content-box")
        .css("top", -uih)
        .css("left", (w / 2) - (uiw / 2))
        .css("position", "absolute")
        .css("z-index", 10000)
        .css("background-color", "#f8f8f8")
        .css("-webkit-box-shadow", "0 4px 16px 0 #909090")
        .css("box-shadow", "0 4px 16px 0 #909090")
        .css("-webkit-border-radius", "0 0 8px 8px")
        .css("border-radius", "0 0 8px 8px")
        .css("color", "#000000")
        .css("font-family", "sans-serif")
        .css("font-size", "11pt");

    /*  style the UI head  */
    $("." + name + "-head", ui)
        .width(uiw - 20)
        .height(20)
        .css("box-sizing", "content-box")
        .css("position", "relative")
        .css("background", "#666666")
        .css("background", "-moz-linear-gradient(top, #666666 0%, #333333 49%, #222222 51%, #000000 100%)")
        .css("background", "-webkit-linear-gradient(top, #666666 0% ,#333333 49% ,#222222 51%, #000000 100%)")
        .css("background", "linear-gradient(to bottom, #666666 0%, #333333 49%, #222222 51%, #000000 100%)")
        .css("color", "#ffffff")
        .css("padding", "7px 10px 7px 10px")
        .css("font-size", "16px");
    $("." + name + "-head-close", ui)
        .css("position", "absolute")
        .css("right", "10px")
        .css("top", "6px")
        .css("padding", "4px 10px 4px 10px")
        .css("font-size", "12px")
        .css("color", "#c0c0c0")
        .css("border", "1px solid #606060")
        .css("cursor", "pointer");

    /*  style the UI list  */
    $("." + name + "-list", ui)
        .width(uiw)
        .height(uih - 30)
        .css("overflow", "scroll")
        .css("overflow-x", "hidden");

    /*  generate the UI list content  */
    var table = $("<table></table>");
    table.append(
        "<tr class=\"" + name + "-list-row-first\">" +
            "<td class=\"" + name + "-list-name\">Identifier</td>" +
            "<td class=\"" + name + "-list-desc\">Description</td>" +
        "</tr>"
    );
    var k = 0;
    _cs.foreach(_cs.keysof(usecase).sort(), function (id) {
        table.append(
            "<tr data-id=\"" + id + "\" class=\"" + name + "-list-row " + name + "-list-row-" + (k++ % 2) + "\">" +
                "<td class=\"" + name + "-list-name\">" + id + "</td>" +
                "<td class=\"" + name + "-list-desc\">" + usecase[id].desc + "</td>" +
            "</tr>"
        );
    });
    $("." + name + "-list", ui).html(table);

    /*  style the UI list content  */
    $("." + name + "-list table", ui)
        .width(uiw)
        .css("border-collapse", "collapse");
    $("." + name + "-list-row", ui)
        .css("cursor", "pointer");
    $("." + name + "-list-row-first", ui)
        .width(uiw)
        .css("background-color", "#909090")
        .css("color", "#f0f0f0");
    $("." + name + "-list-row-1", ui)
        .width(uiw)
        .css("background-color", "#f0f0f0");
    $("." + name + "-list-name", ui)
        .css("padding", "2px 10px 2px 10px")
        .css("font-family", "monospace")
        .css("white-space", "nowrap");
    $("." + name + "-list-desc", ui)
        .width("100%")
        .css("padding", "2px 10px 2px 10px");

    /*  attach event handler to list items  */
    $("." + name + "-list-row", ui).on("click", function (ev) {
        /*  support tr/td as target  */
        var el = ev.target;
        if ($(el).prop("tagName") !== "tr")
            el = $(el).parent();

        /*  fetch usecase id  */
        var id = $(el).data("id");
        if (typeof id === "string" && id !== "") {
            /*  close UI and execute usecase  */
            close(function () {
                $cs.drive(id).then(null, function (e) {
                    /* global alert: true */
                    /* eslint no-alert: 0 */
                    alert("ComponentJS: testdrive: use case \"" + "\" failed: " + e);
                });
            });
        }
    });

    /*  attach event handler to close button  */
    $("." + name + "-head-close", ui).on("click", close);

    /*  initially open the UI  */
    open();
};

