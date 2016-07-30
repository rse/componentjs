/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  internal plugin registry  */
_cs.plugins = {};

/*  external plugin API  */
$cs.plugin = function (name, callback) {
    if (arguments.length === 0) {
        /*  use case 1: return list of registered plugins  */
        var plugins = [];
        for (name in _cs.plugins) {
            if (!_cs.isown(_cs.plugins, name))
                continue;
            plugins.push(name);
        }
        return plugins;
    }
    else if (arguments.length === 1) {
        /*  use case 2: check whether particular plugin was registered  */
        if (typeof name !== "string")
            throw _cs.exception("plugin", "invalid plugin name parameter");
        return (typeof _cs.plugins[name] !== "undefined");
    }
    else if (arguments.length === 2) {
        /*  use case 3: register a new plugin  */
        if (typeof name !== "string")
            throw _cs.exception("plugin", "invalid plugin name parameter");
        if (typeof _cs.plugins[name] !== "undefined")
            throw _cs.exception("plugin", "plugin named \"" + name + "\" already registered");
        callback.call(this, _cs, $cs, GLOBAL);
        _cs.plugins[name] = true;
    }
    else
        throw _cs.exception("plugin", "invalid number of parameters");
};

