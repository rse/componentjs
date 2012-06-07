/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  singleton component: root of the tree */
_cs.root = new _cs.comp("<root>", null, []);

/*  singleton component: special return value on lookups */
_cs.none = new _cs.comp("<none>", null, []);

