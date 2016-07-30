/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*
 *  This is a graphical ComponentJS debugger which provides both a
 *  component tree visualization and a ComponentJS debug message
 *  console. As in a production environment one might not want to carry
 *  this functionality with the application, this functionality has to
 *  stay in a separate optional plugin, of course.
 */

/* global ComponentJS:false */

ComponentJS.plugin("debugger", function (_cs, $cs, GLOBAL) {
    include("component.plugin.debugger-jquery.js");
    include("component.plugin.debugger-view.js");
    include("component.plugin.debugger-logbook.js");
    include("component.plugin.debugger-infobox.js");
    include("component.plugin.debugger-window.js");
    include("component.plugin.debugger-render.js");
    include("component.plugin.debugger-hooks.js");
});

