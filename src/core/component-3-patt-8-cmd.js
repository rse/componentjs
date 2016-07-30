/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern: command  */
$cs.pattern.command = $cs.clazz({
    mixin: [
        $cs.pattern.observable
    ],
    dynamics: {
        /*  standard attributes  */
        ctx:   $cs.attribute("ctx",   null),
        func:  $cs.attribute("func",  _cs.nop),
        args:  $cs.attribute("args",  []),
        async: $cs.attribute("async", false),

        /*  usually observed attribute  */
        enabled: $cs.attribute("enabled", true, "boolean")
    },
    protos: {
        /*  method: execute the command  */
        execute: function (caller_args, caller_result) {
            if (!this.enabled())
                return undefined;
            var args = [];
            if (this.async()) {
                args.push(function (value) {
                    if (typeof caller_result === "function")
                        caller_result(value);
                });
            }
            args = _cs.concat(args, this.args(), caller_args);
            return this.func().apply(this.ctx(), args);
        }
    }
});

/*  command factory  */
$cs.command = function () {
    /*  determine parameters  */
    var params = $cs.params("command", arguments, {
        ctx:      {             def: null  },
        func:     { pos: 0,     req: true  },
        args:     { pos: "...", def: []    },
        async:    {             def: false },
        enabled:  {             def: true  },
        wrap:     {             def: false }
    });

    /*  create new command  */
    var cmd = new $cs.pattern.command();

    /*  configure command  */
    cmd.ctx    (params.ctx);
    cmd.func   (params.func);
    cmd.args   (params.args);
    cmd.async  (params.async);
    cmd.enabled(params.enabled);

    /*  optionally wrap into convenient "execute" closure  */
    var result = cmd;
    if (params.wrap) {
        result = function () {
            var args = _cs.concat(arguments);
            var cb = null;
            if (arguments.callee.command.async())
                cb = args.pop();
            return arguments.callee.command.execute.call(arguments.callee.command, args, cb);
        };
        result.command = cmd;
    }

    return result;
};

