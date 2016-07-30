/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
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

/*  generic pattern for marking components  */
$cs.pattern.marker = $cs.trait({
    protos: {
        mark: function (name) {
            $cs.mark(this.obj(), name);
        },
        marked: function (name) {
            return $cs.marked(this.obj(), name);
        }
    }
});

/*  convenient marker traits  */
$cs.marker = {
    service:    $cs.trait({ cons: function () { $cs.mark(this, "service");    } }),
    controller: $cs.trait({ cons: function () { $cs.mark(this, "controller"); } }),
    model:      $cs.trait({ cons: function () { $cs.mark(this, "model");      } }),
    view:       $cs.trait({ cons: function () { $cs.mark(this, "view");       } })
};

