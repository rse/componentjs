/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  utility function: mark a component  */
_cs.mark = function (comp, name) {
    var marker = $cs.annotation("marker");
    if (marker === null)
        marker = {};
    marker[name] = true;
    $cs.annotation("marker", marker);
};

/*  utility function: determine whether a component is marked  */
_cs.marked = function (comp, name) {
    var marker = $cs.annotation("marker");
    if (marker === null)
        marker = {};
    return (marker[name] === true);
};

/*  marker trait: cross component */
$cs.marker.cross = $cs.trait({
    setup: function () {
        _cs.mark(this, "cross");
    }
});

/*  marker trait: service-style component */
$cs.marker.service = $cs.trait({
    setup: function () {
        _cs.mark(this, "service");
    }
});

/*  marker trait: controller-style component */
$cs.marker.controller = $cs.trait({
    setup: function () {
        _cs.mark(this, "controller");
    }
});

/*  marker trait: model-style component */
$cs.marker.model = $cs.trait({
    setup: function () {
        _cs.mark(this, "model");
    }
});

/*  marker trait: view-style component */
$cs.marker.view = $cs.trait({
    setup: function () {
        _cs.mark(this, "view");
    }
});

/*  marker trait: generic/reusable (view/controller) component */
$cs.marker.generic = $cs.trait({
    setup: function () {
        _cs.mark(this, "generic");
    }
});

