/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
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
    /*global navigator:false */
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
            if (typeof params.name !== null)
                title += " (" + params.name + ")";

            /*  create external debugger window  */
            var wname = title;
            var wopts = "location=no,scrollbars=no,toolbars=no,menubar=no,status=no";
            wopts += ",width=" + params.width + ",height=" + params.height;
            if (_cs.isIE())
                wname = wname.replace(/ /g, "_").replace(/[()]/g, "");
            else
                wopts += ",replace=yes";
            _cs.dbg = GLOBAL.open("about:blank", wname, wopts);
            if (_cs.isIE()) {
                /*  IE does not support reuse flag, so close old instance and open a fresh one  */
                _cs.dbg.close();
                _cs.dbg = GLOBAL.open("about:blank", wname, wopts);
            }

            /*  initialize the window content (deferred to avoid problems)  */
            /*global setTimeout:false */
            setTimeout(function () {
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
                });
            }, 500);
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

