/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  utility function: mark a component  */
$cs.mark = function (obj, name) {
    var marker = _cs.annotation(obj, "marker");
    if (marker === null)
        marker = {};
    marker[name] = true;
    _cs.annotation(obj, "marker", marker);
};

/*  utility function: determine whether a component is marked  */
$cs.marked = function (obj, name) {
    var marker = _cs.annotation(obj, "marker");
    if (marker === null)
        marker = {};
    return (marker[name] === true);
};

/*  marker trait: service-style component */
$cs.marker.service = $cs.trait({
    constructor: function () {
        $cs.mark(this, "service");
    }
});

/*  marker trait: controller-style component */
$cs.marker.controller = $cs.trait({
    constructor: function () {
        $cs.mark(this, "controller");
    }
});

/*  marker trait: model-style component */
$cs.marker.model = $cs.trait({
    constructor: function () {
        $cs.mark(this, "model");
    }
});

/*  marker trait: view-style component */
$cs.marker.view = $cs.trait({
    constructor: function () {
        $cs.mark(this, "view");
    }
});

