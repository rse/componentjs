/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*
 *  This is a ComponentJS plugin which provides a Promise-based
 *  environment for test-driving a ComponentJS application based on a
 *  set of use-cases.
 */

/* global ComponentJS: false */
/* eslint no-unused-vars: 0 */
/* jshint unused: false */

ComponentJS.plugin("testdrive", function (_cs, $cs, GLOBAL) {
    include("component.plugin.testdrive-usecase.js");
    include("component.plugin.testdrive-suite.js");
    include("component.plugin.testdrive-promise.js");
    include("component.plugin.testdrive-drive.js");
    include("component.plugin.testdrive-ensure.js");
    include("component.plugin.testdrive-await.js");
    include("component.plugin.testdrive-poll.js");
    include("component.plugin.testdrive-sleep.js");
    include("component.plugin.testdrive-once.js");
});

