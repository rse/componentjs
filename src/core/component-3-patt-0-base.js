/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern: id  */
$cs.pattern.id = $cs.trait({
    dynamics: {
        id: $cs.attribute("id", null)
    }
});

/*  generic pattern: name  */
$cs.pattern.name = $cs.trait({
    dynamics: {
        name: $cs.attribute("name", "")
    }
});

