/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*
 *  ComponentJS debugger window
 */

/*  debugger window  */
_cs.dbg = null;

/*  debugger update state  */
_cs.dbg_state_invalid = {
    components: false,
    states:     false,
    requests:   false,
    console:    false
};
_cs.dbg_state_invalidate = function (name) {
    _cs.dbg_state_invalid[name] = true;
};

/*  debugger canvas: natural tree direction flag  */
_cs.dbg_natural = false;

/*  try to determine whether we are running instrumented,
    i.e., whether the native Browser debugger is active/open  */
$cs.debug_instrumented = function () {
    return (
        typeof GLOBAL !== "undefined" &&
        GLOBAL.console &&
        (GLOBAL.console.firebug ||                        /* precision: Firefox Firebug  */
         (GLOBAL.outerHeight - GLOBAL.innerHeight) > 120) /* guessing:  Chrome/Safari Inspector, IE Debugger  */
    );
};

/*  try to determine whether Internet Explorer is used  */
_cs.isIE = function () {
    /* global navigator:false */
    return (
        typeof navigator !== "undefined" &&
        navigator.appName === "Microsoft Internet Explorer" &&
        navigator.userAgent.match(new RegExp("MSIE ([0-9]+[.0-9]*)"))
    );
};

/*  debugger window API entry point  */
$cs.debug_window = function () {
    /*  determine parameters  */
    var params = $cs.params("debugger", arguments, {
        enable:    { pos: 0, def: null  },
        autoclose: { pos: 1, def: false },
        name:      { pos: 2, def: null  },
        width:     {         def: 800   },
        height:    {         def: 600   },
        natural:   {         def: false }
    });

    /*  dispatch according to requested operation  */
    if (params.enable === null)
        /*  determine debugger state  */
        return (_cs.dbg !== null);
    else if (params.enable) {
        /*  remember natural rendering flag  */
        _cs.dbg_natural = params.natural;

        /*  enable debugger  */
        if (_cs.dbg === null) {
            /*  determine (potentially application specific) title  */
            var title = "ComponentJS Debugger";
            if (params.name !== null)
                title += " (" + params.name + ")";

            /*  create external debugger window  */
            var wname = title;
            var wopts = "location=no,scrollbars=no,toolbars=no,menubar=no,status=no";
            wopts += ",width=" + params.width + ",height=" + params.height;
            if (_cs.isIE())
                wname = wname.replace(/[^a-zA-Z0-9_]/g, "_");
            else
                wopts += ",replace=yes";
            _cs.dbg = GLOBAL.open("about:blank", wname, wopts);
            if (_cs.isIE()) {
                /*  IE does not support reuse flag, so close old instance and open a fresh one  */
                _cs.dbg.close();
                _cs.dbg = GLOBAL.open("about:blank", wname, wopts);
            }

            /*  initialize the window content (deferred to avoid problems)  */
            /* global setTimeout:false */
            setTimeout(_cs.hook("ComponentJS:plugin:debugger:settimeout:func", "pass", function () {
                _cs.jq(_cs.dbg.document).ready(function () {
                    /*  optionally automatically close debugger window with application window  */
                    if (params.autoclose) {
                        _cs.jq(GLOBAL).bind("beforeunload", function () {
                            if (_cs.dbg !== null)
                                _cs.dbg.close();
                        });
                    }

                    /*  generate view mask  */
                    _cs.dbg_view_mask(title);

                    /*  window-based resize support  */
                    _cs.dbg_refresh();
                    _cs.jq(_cs.dbg).bind("resize", function () {
                        _cs.dbg_refresh();
                    });

                    /*  avoid text selections (which confuse the grabbing) [non cross-browser event!]  */
                    _cs.jq(".dbg", _cs.dbg.document).bind("selectstart", function (ev) {
                        ev.preventDefault();
                        return false;
                    });

                    /*  grabbing-based resize support  */
                    var grabbing = false;
                    var positioning = false;
                    var positioning_x = -1;
                    var positioning_y = -1;
                    _cs.jq(".dbg .grabber", _cs.dbg.document).bind("mousedown", function (ev) {
                        grabbing = true;
                        _cs.jq(".dbg .grabber", _cs.dbg.document).css("background-color", "red");
                        ev.preventDefault();
                    });
                    _cs.jq(".dbg", _cs.dbg.document).bind("mousemove", function (ev) {
                        if (grabbing) {
                            var offset = ev.pageY;
                            if (offset < 300)
                                offset = 300;
                            var vh = _cs.jq(_cs.dbg).height();
                            if (offset > vh - 100)
                               offset = vh - 100;
                            _cs.jq(".dbg .grabber", _cs.dbg.document).css("top", offset);
                            _cs.dbg_grabber_offset = offset;
                            ev.preventDefault();
                        }
                        else if (positioning) {
                            if (positioning_x === -1)
                                positioning_x = ev.pageX;
                            if (positioning_y === -1)
                                positioning_y = ev.pageY;
                            var offsetX = positioning_x - ev.pageX;
                            var offsetY = positioning_y - ev.pageY;
                            positioning_x = ev.pageX;
                            positioning_y = ev.pageY;
                            _cs.dbg_canvas_info.x += offsetX;
                            _cs.dbg_canvas_info.y += offsetY;
                            _cs.dbg_reposition();
                        }
                    });
                    _cs.jq(".dbg", _cs.dbg.document).bind("mouseup", function (ev) {
                        if (grabbing) {
                            _cs.jq(".dbg .grabber", _cs.dbg.document).css("background-color", "transparent");
                            _cs.dbg_refresh();
                            grabbing = false;
                            ev.preventDefault();
                        }
                    });

                    /*  canvas export functionality  */
                    _cs.jq(".dbg .exporter", _cs.dbg.document).bind("click", function (ev) {
                        var ctx = _cs.jq(".dbg .viewer canvas", _cs.dbg.document).get(0);
                        if (typeof ctx !== "undefined") {
                            var dataurl = ctx.toDataURL("image/png");
                            GLOBAL.open(dataurl);
                        }
                        ev.preventDefault();
                        return false;
                    });

                    /*  canvas scroll and zoom functionality  */
                    var zoom_step   = 100;
                    var scroll_step = 10;
                    _cs.jq(".dbg .plus", _cs.dbg.document).bind("click", function (/* ev */) {
                        _cs.dbg_canvas_info.w += zoom_step;
                        _cs.dbg_canvas_info.h += zoom_step;
                        _cs.dbg_refresh();
                    });
                    _cs.jq(".dbg .minus", _cs.dbg.document).bind("click", function (/* ev */) {
                        _cs.dbg_canvas_info.w -= zoom_step;
                        _cs.dbg_canvas_info.h -= zoom_step;
                        _cs.dbg_refresh();
                    });
                    _cs.jq(".dbg .reset", _cs.dbg.document).bind("click", function (/* ev */) {
                        _cs.dbg_canvas_info.w = _cs.dbg_canvas_info.wmin;
                        _cs.dbg_canvas_info.h = _cs.dbg_canvas_info.hmin;
                        _cs.dbg_refresh();
                    });
                    _cs.jq(".dbg .viewer canvas", _cs.dbg.document).bind("mousedown", function (/* ev */) {
                        positioning = true;
                        positioning_x = -1;
                        positioning_y = -1;
                    });
                    _cs.jq(".dbg .viewer canvas", _cs.dbg.document).bind("mouseup", function (/* ev */) {
                        positioning = false;
                    });
                    _cs.jq(_cs.dbg.document).bind("keydown", function (ev) {
                        if (ev.keyCode === 43 || ev.keyCode === 107 || ev.keyCode === 187) {
                            /*  key "+" pressed  */
                            _cs.dbg_canvas_info.w += zoom_step;
                            _cs.dbg_canvas_info.h += zoom_step;
                            _cs.dbg_refresh();
                        }
                        else if (ev.keyCode === 45 || ev.keyCode === 109 || ev.keyCode === 189) {
                            /*  key "-" pressed  */
                            _cs.dbg_canvas_info.w -= zoom_step;
                            _cs.dbg_canvas_info.h -= zoom_step;
                            _cs.dbg_refresh();
                        }
                        else if (ev.keyCode === 48) {
                            /*  key "0" pressed  */
                            _cs.dbg_canvas_info.w = _cs.dbg_canvas_info.wmin;
                            _cs.dbg_canvas_info.h = _cs.dbg_canvas_info.hmin;
                            _cs.dbg_refresh();
                        }
                        else if (ev.keyCode === 37) {
                            /*  key LEFT pressed  */
                            _cs.dbg_canvas_info.x += scroll_step;
                            _cs.dbg_reposition();
                        }
                        else if (ev.keyCode === 38) {
                            /*  key UP pressed  */
                            _cs.dbg_canvas_info.y += scroll_step;
                            _cs.dbg_reposition();
                        }
                        else if (ev.keyCode === 39) {
                            /*  key RIGHT pressed  */
                            _cs.dbg_canvas_info.x -= scroll_step;
                            _cs.dbg_reposition();
                        }
                        else if (ev.keyCode === 40) {
                            /*  key DOWN pressed  */
                            _cs.dbg_canvas_info.y -= scroll_step;
                            _cs.dbg_reposition();
                        }
                    });

                    /*  filter handling  */
                    _cs.dbg_filter_timeout = null;
                    _cs.jq(".dbg .filter input", _cs.dbg.document).bind("keydown", function (ev) {
                        ev.stopPropagation();
                    });
                    _cs.jq(".dbg .filter input", _cs.dbg.document).bind("keyup", function (ev) {
                        if (_cs.dbg_filter_timeout) {
                            GLOBAL.clearTimeout(_cs.dbg_filter_timeout);
                            _cs.dbg_filter_timeout = null;
                        }
                        _cs.dbg_filter_timeout = GLOBAL.setTimeout(function () {
                            _cs.dbg_filter = ev.target.value;
                            _cs.dbg_update_once();
                            if (_cs.dbg_filter_timeout) {
                                GLOBAL.clearTimeout(_cs.dbg_filter_timeout);
                                _cs.dbg_filter_timeout = null;
                            }
                        }, 1000);
                    });
                });
            }), 500);
        }
        $cs.debug(3, "debugger enabled");
    }
    else {
        /*  disable debugger  */
        if (_cs.dbg !== null) {
            $cs.debug(3, "debugger disabled");
            _cs.dbg.close();
            _cs.dbg = null;
        }
    }
};

