/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  create debugger view mask (markup and style)  */
_cs.dbg_view_mask = function (title) {
    _cs.jq("html head", _cs.dbg.document).html(
        "<title>" + title + "</title>"
    );
    _cs.jq("html body", _cs.dbg.document).html(
        "<style type=\"text/css\">" +
            "html, body {" +
                "margin: 0px;" +
                "padding: 0px;" +
            "}" +
            ".dbg {" +
                "width: 100%;" +
                "height: 100%;" +
                "font-family: Helvetica, Arial, sans-serif;" +
                "background-color: #e0e0e0;" +
                "overflow: hidden;" +
                "font-size: 9pt;" +
            "}" +
            ".dbg .header {" +
                "width: 100%;" +
                "height: 30px;" +
                "background: #666666;" +
                "background: -moz-linear-gradient(top,  #666666 0%, #333333 49%, #222222 51%, #000000 100%);" +
                "background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#666666), color-stop(49%,#333333), color-stop(51%,#222222), color-stop(100%,#000000));" +
                "background: -webkit-linear-gradient(top,  #666666 0%,#333333 49%,#222222 51%,#000000 100%);" +
                "background: -o-linear-gradient(top,  #666666 0%,#333333 49%,#222222 51%,#000000 100%);" +
                "background: -ms-linear-gradient(top,  #666666 0%,#333333 49%,#222222 51%,#000000 100%);" +
                "background: linear-gradient(to bottom,  #666666 0%,#333333 49%,#222222 51%,#000000 100%);" +
                "filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#666666', endColorstr='#000000',GradientType=0 );" +
                "text-align: center;" +
                "position: relative;" +
            "}" +
            ".dbg .header .text {" +
                "position: relative;" +
                "top: 6px;" +
                "color: #ffffff;" +
                "font-size: 12pt;" +
                "font-weight: bold;" +
            "}" +
            ".dbg .viewer {" +
                "position: relative;" +
                "width: 100%;" +
                "height: 50%;" +
                "background: #d0d0d0;" +
                "background: -moz-linear-gradient(top,  #d0d0d0 0%, #e8e8e8 50%, #d0d0d0 100%);" +
                "background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#d0d0d0), color-stop(50%,#e8e8e8), color-stop(100%,#d0d0d0));" +
                "background: -webkit-linear-gradient(top,  #d0d0d0 0%,#e8e8e8 50%,#d0d0d0 100%);" +
                "background: -o-linear-gradient(top,  #d0d0d0 0%,#e8e8e8 50%,#d0d0d0 100%);" +
                "background: -ms-linear-gradient(top,  #d0d0d0 0%,#e8e8e8 50%,#d0d0d0 100%);" +
                "background: linear-gradient(to bottom,  #d0d0d0 0%,#e8e8e8 50%,#d0d0d0 100%);" +
                "filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#d0d0d0', endColorstr='#d0d0d0',GradientType=0 );" +
                "overflow: hidden;" +
            "}" +
            ".dbg .viewer canvas {" +
                "position: absolute;" +
                "top: 0px;" +
                "left: 0px;" +
            "}" +
            ".dbg .status {" +
                "width: 100%;" +
                "height: 20px;" +
                "background: #666666;" +
                "background: -moz-linear-gradient(top,  #666666 0%, #333333 49%, #222222 51%, #000000 100%);" +
                "background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#666666), color-stop(49%,#333333), color-stop(51%,#222222), color-stop(100%,#000000));" +
                "background: -webkit-linear-gradient(top,  #666666 0%,#333333 49%,#222222 51%,#000000 100%);" +
                "background: -o-linear-gradient(top,  #666666 0%,#333333 49%,#222222 51%,#000000 100%);" +
                "background: -ms-linear-gradient(top,  #666666 0%,#333333 49%,#222222 51%,#000000 100%);" +
                "background: linear-gradient(to bottom,  #666666 0%,#333333 49%,#222222 51%,#000000 100%);" +
                "filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#666666', endColorstr='#000000',GradientType=0 );" +
                "color: #f0f0f0;" +
                "text-align: center;" +
            "}" +
            ".dbg .filter input {" +
                "width: 100%;" +
                "background: #eeeeee;" +
                "border: none;" +
                "padding: 2px 2px 3px 52px;" +
            "}" +
            ".dbg .status .text {" +
                "position: relative;" +
                "top: 3px;" +
                "color: #ffffff;" +
                "font-size: 9pt;" +
            "}" +
            ".dbg .console {" +
                "width: 100%;" +
                "height: 50%;" +
                "background-color: #ffffff;" +
                "color: #000000;" +
                "overflow-y: scroll;" +
                "font-size: 9pt;" +
            "}" +
            ".dbg .console .text {" +
                "width: 100%;" +
                "height: auto;" +
            "}" +
            ".dbg .console .text .line {" +
                "border-collapse: collapse;" +
                "width: 100%;" +
                "border-bottom: 1px solid #e0e0e0;" +
                "font-size: 9pt;" +
            "}" +
            ".dbg .console .text .num {" +
                "width: 40px;" +
                "background-color: #f0f0f0;" +
                "text-align: right;" +
            "}" +
            ".dbg .console .text .msg {" +
                "padding-left: 10px;" +
            "}" +
            ".dbg .console .text .msg .prefix {" +
                "color: #999999;" +
            "}" +
            ".dbg .console .text .msg .context {" +
                "font-weight: bold;" +
            "}" +
            ".dbg .console .text .msg .path {" +
                "color: #003399;" +
            "}" +
            ".dbg .console .text .msg .state {" +
                "font-style: italic;" +
            "}" +
            ".dbg .console .text .msg .arrow {" +
                "color: #999999;" +
            "}" +
            ".dbg .console .text .msg .method {" +
                "font-family: monospace;" +
            "}" +
            ".dbg .grabber {" +
                "position: absolute; " +
                "cursor: move; " +
                "width: 100%;" +
                "height: 20px;" +
                "background-color: transparent;" +
                "opacity: 0.5;" +
                "z-index: 100;" +
            "}" +
            ".dbg .infobox {" +
                "position: absolute;" +
                "top: 0px;" +
                "left: 0px;" +
                "width: 100%;" +
                "background-color: #ffffff;" +
                "color: #000000;" +
                "z-index: 200;" +
                "display: none;" +
            "}" +
            ".dbg .infobox table {" +
                "border-collapse: collapse;" +
                "width: 100%;" +
            "}" +
            ".dbg .infobox table tr td {" +
                "border-bottom: 1px solid #e0e0e0;" +
            "}" +
            ".dbg .infobox table tr td {" +
                "font-size: 11pt;" +
            "}" +
            ".dbg .infobox table tr td.label {" +
                "padding-left: 10px;" +
                "background-color: #f0f0f0;" +
                "color: #909090;" +
                "vertical-align: top;" +
                "width: 160px;" +
            "}" +
            ".dbg .infobox table tr td.value {" +
                "padding-left: 10px;" +
                "vertical-align: top;" +
            "}" +
            ".dbg .infobox table tr td.value span.none {" +
                "color: #909090;" +
                "font-style: italic;" +
            "}" +
            ".dbg .plus, .dbg .reset, .dbg .minus, .dbg .exporter {" +
                "cursor: pointer; " +
                "position: absolute; " +
                "top: 4px; " +
                "width: 10px; " +
                "text-align: center; " +
                "font-weight: bold; " +
                "padding: 2px 8px 2px 8px; " +
                "border-top: 1px solid #777777;" +
                "border-left: 1px solid #777777;" +
                "border-right: 1px solid #555555;" +
                "border-bottom: 1px solid #555555;" +
                "background: #666666;" +
                "background: -moz-linear-gradient(top,  #666666 0%, #333333 49%, #222222 51%, #000000 100%);" +
                "background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#666666), color-stop(49%,#333333), color-stop(51%,#222222), color-stop(100%,#000000));" +
                "background: -webkit-linear-gradient(top,  #666666 0%,#333333 49%,#222222 51%,#000000 100%);" +
                "background: -o-linear-gradient(top,  #666666 0%,#333333 49%,#222222 51%,#000000 100%);" +
                "background: -ms-linear-gradient(top,  #666666 0%,#333333 49%,#222222 51%,#000000 100%);" +
                "background: linear-gradient(to bottom,  #666666 0%,#333333 49%,#222222 51%,#000000 100%);" +
                "filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#666666', endColorstr='#000000',GradientType=0 );" +
                "color: #c0c0c0;" +
                "z-index: 100;" +
            "}" +
            ".dbg .plus {" +
                "right: 80px; " +
            "}" +
            ".dbg .reset {" +
                "right: 110px; " +
            "}" +
            ".dbg .minus {" +
                "right: 140px; " +
            "}" +
            ".dbg .exporter {" +
                "right: 20px; " +
                "font-weight: normal; " +
                "width: auto;" +
            "}" +
        "</style>" +
        "<div class=\"dbg\">" +
            "<div class=\"header\"><div class=\"text\">" + title + "</div></div>" +
            "<div class=\"viewer\"><canvas></canvas></div>" +
            "<div class=\"grabber\"></div>" +
            "<div class=\"plus\">+</div>" +
            "<div class=\"reset\">0</div>" +
            "<div class=\"minus\">-</div>" +
            "<div class=\"exporter\">Export</div>" +
            "<div class=\"status\"><div class=\"text\"></div></div>" +
            "<div class=\"filter\"><input type=\"text\" placeholder=\"Filter messages - RegExp enabled\"></div>" +
            "<div class=\"console\"><div class=\"text\"></div></div>" +
            "<div class=\"infobox\"></div>" +
        "</div>"
    );
};

