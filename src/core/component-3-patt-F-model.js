/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern for model management  */
$cs.pattern.model = $cs.trait({
    protos: {
        /*  define model  */
        model: function () {
            /*  determine parameters  */
            var params = $cs.params("model", arguments, {
                model: { pos: 0, def: null }
            });

            /*  simplify further processing  */
            var model = params.model;
            if (model === null)
                model = undefined;

            /*  sanity check model  */
            var name;
            if (_cs.isdefined(model)) {
                for (name in model) {
                    if (typeof model[name].value === "undefined")
                        model[name].value = "";
                    if (typeof model[name].valid === "undefined")
                        model[name].valid = "string";
                    if (typeof model[name].autoreset === "undefined")
                        model[name].autoreset = false;
                    if (typeof model[name].store === "undefined")
                        model[name].store = false;
                    for (var key in model[name]) {
                        if (key !== "value" && key !== "valid" && key !== "autoreset" && key !== "store")
                            throw _cs.exception("model", "invalid specification key \"" +
                                key + "\" in specification of model field \"" + name + "\"");
                    }
                    if (!$cs.validate(model[name].value, model[name].valid))
                        throw _cs.exception("model", "model field \"" + name + "\" has " +
                            "default value " + _cs.json(model[name].value) + ", which does not validate " +
                            "against validation \"" + model[name].valid + "\"");
                }
            }

            /*  try to load stored model values  */
            var store = this.store("model");
            if (store !== null) {
                if (_cs.isdefined(model)) {
                    for (name in model) {
                        if (model[name].store) {
                            if (_cs.isdefined(store[name]))
                                model[name].value = store[name];
                        }
                    }
                }
            }

            /*  retrieve old model  */
            var model_old = this.property({ name: "ComponentJS:model", bubbling: false });

            /*  store model  */
            if (_cs.isdefined(model)) {
                if (_cs.isdefined(model_old)) {
                    /*  merge model into existing one  */
                    var model_new = {};
                    _cs.extend(model_new, model_old);
                    _cs.extend(model_new, model);
                    this.property("ComponentJS:model", model_new);
                    model = model_new;
                }
                else {
                    /*  set initial model  */
                    this.property("ComponentJS:model", model);
                }

                /*  optionally save stored model values  */
                store = {};
                var save = false;
                for (name in model) {
                    if (model[name].store) {
                        store[name] = model[name].value;
                        save = true;
                    }
                }
                if (save)
                    this.store("model", store);
            }

            /*  return old model  */
            return model_old;
        },

        /*  get/set model value  */
        value: function () {
            /*  determine parameters  */
            var params = $cs.params("value", arguments, {
                name:        { pos: 0, req: true      },
                value:       { pos: 1, def: undefined },
                force:       { pos: 2, def: false     },
                operation:   {         def: []        },
                returnowner: {         def: false     }
            });

            /*  determine operation  */
            if (typeof params.operation === "string")
                params.operation = [ params.operation ];
            if (params.operation.length === 0)
                params.operation = (_cs.isdefined(params.value) ? [ "set" ] : [ "get" ]);
            else if (!params.operation[0].match(/^(?:get|set|splice|delete|push|pop|shift|unshift)$/))
                throw _cs.exception("value", "invalid operation \"" + params.operation[0] + "\"");
            if (   params.operation[0] === "splice"
                && (   params.operation.length !== 3
                    || typeof params.operation[1] !== "number"
                    || typeof params.operation[2] !== "number"))
                throw _cs.exception("value", "invalid arguments for operation \"splice\"");

            /*  parse the value name into selection path segments  */
            var path = _cs.select_parse(params.name);

            /*  create new name out of the canonicalized path segments  */
            var pathName = path.join(".");

            /*  determine component owning model with requested value  */
            var owner = null;
            var model = null;
            var comp = this;
            while (comp !== null) {
                owner = comp.property({ name: "ComponentJS:model", returnowner: true });
                if (!_cs.isdefined(owner))
                    throw _cs.exception("value", "no model found containing value \"" + path[0] + "\"");
                model = owner.property("ComponentJS:model");
                if (_cs.isdefined(model[path[0]]))
                    break;
                comp = owner.parent();
            }
            if (comp === null)
                throw _cs.exception("value", "no model found containing value \"" + path[0] + "\"");

            /*  get new model value  */
            var value_new = params.value;

            /*  translate special-case array operations to splice operation  */
            var obj;
            switch (params.operation[0]) {
                case "unshift":
                    params.operation = [ "splice", 0, 0 ];
                    break;
                case "shift":
                    params.operation = [ "splice", 0, 1 ];
                    value_new = undefined;
                    break;
                case "push":
                    obj = $cs.select(model[path[0]].value, path.slice(1));
                    params.operation = [ "splice", obj.length, 0 ];
                    break;
                case "pop":
                    obj = $cs.select(model[path[0]].value, path.slice(1));
                    params.operation = [ "splice", obj.length - 1, 1 ];
                    value_new = undefined;
                    break;
            }

            /*  get old model value  */
            var ev;
            var result;
            var value_old = model[path[0]].value;
            if (path.length > 1)
                value_old = $cs.select(value_old, path.slice(1));
            if (params.operation[0] === "splice") {
                /*  splice operation is on collection itself,
                    so pick the target collection element!  */
                if (params.operation[2] > 0)
                    value_old = $cs.select(value_old, "" + params.operation[1]);
                else
                    value_old = undefined;
            }
            else if (params.operation[0] === "get") {
                if (owner.property({ name: "ComponentJS:model:subscribers:get", def: 0, bubbling: false }) > 0) {
                    /*  send event to observers for value get and allow observers
                        to reject value get operation and/or change old value to get  */
                    ev = owner.publish({
                        name:      "ComponentJS:model:" + pathName + ":" + params.operation[0],
                        args:      [ value_old, value_old, params.operation, pathName ],
                        capturing: false,
                        spreading: false,
                        bubbling:  false,
                        async:     false
                    });
                    if (ev.processing()) {
                        /*  re-fetch value from model
                            (in case the callback set a new value directly)  */
                        value_old = model[path[0]].value;
                        if (path.length > 1)
                            value_old = $cs.select(value_old, path.slice(1));

                        /*  allow value to be overridden by event result  */
                        result = ev.result();
                        if (typeof result !== "undefined")
                            value_old = result;
                    }
                }
            }

            /*  optionally set/delete/splice new model value  */
            if (   (   params.operation[0] === "set"
                    && (params.force || value_old !== value_new))
                || params.operation[0] === "delete"
                || params.operation[0] === "splice"              ) {

                /*  check validity of new value  */
                if (   params.operation[0] === "set"
                    || (   params.operation[0] === "splice"
                        && value_new !== undefined)        ) {
                    var subPath = (
                          params.operation[0] === "splice"
                        ? path.slice(1).concat([ "0" ])
                        : path.slice(1)
                    );
                    if (!$cs.validate(value_new, model[path[0]].valid, subPath))
                        throw _cs.exception("value", "model field \"" + params.name + "\" receives " +
                            "new value " + _cs.json(value_new) + ", which does not validate " +
                            "against validation \"" + model[path[0]].valid + "\"" +
                            (subPath.length > 0 ? " at sub-path \"" + subPath.join(".") + "\"" : ""));
                }

                /*  send event to observers for value set/splice operation and allow observers
                    to reject value set operation and/or change new value to set  */
                var cont = true;
                if (owner.property({ name: "ComponentJS:model:subscribers:" + params.operation[0], def: 0, bubbling: false }) > 0) {
                    ev = owner.publish({
                        name:      "ComponentJS:model:" + pathName + ":" + params.operation[0],
                        args:      [ value_new, value_old, params.operation, pathName ],
                        capturing: false,
                        spreading: false,
                        bubbling:  false,
                        async:     false
                    });
                    if (!ev.processing())
                        cont = false;
                    else {
                        /*  allow value to be overridden  */
                        result = ev.result();
                        if (typeof result !== "undefined")
                            value_new = result;
                    }
                }
                if (cont && !model[path[0]].autoreset) {
                    /*  perform destructive operation on model  */
                    if (params.operation[0] === "set") {
                        /*  set value in model  */
                        if (path.length > 1)
                            $cs.select(model[path[0]].value, path.slice(1), value_new);
                        else
                            model[path[0]].value = value_new;
                    }
                    else if (params.operation[0] === "splice") {
                        /*  splice value into model  */
                        if (path.length > 1)
                            obj = $cs.select(model[path[0]].value, path.slice(1));
                        else
                            obj = model[path[0]].value;
                        if (!(obj instanceof Array))
                            throw new _cs.exception("value", "cannot splice: target object is not of Array type");
                        if (typeof value_new !== "undefined")
                            obj.splice(params.operation[1], params.operation[2], value_new);
                        else
                            obj.splice(params.operation[1], params.operation[2]);
                    }
                    else if (params.operation[0] === "delete") {
                        /*  delete value from model  */
                        if (path.length >= 3)
                            obj = $cs.select(model[path[0]].value, path.slice(1, path.length - 1));
                        else if (path.length === 2)
                            obj = model[path[0]].value;
                        else
                            throw new _cs.exception("value", "cannot delete a root model entry");
                        var pathSegment = path[path.length - 1];
                        if (obj instanceof Array)
                            obj.splice(parseInt(pathSegment, 10), 1);
                        else if (typeof obj === "object")
                            delete obj[pathSegment];
                        else
                            throw new _cs.exception("value", "cannot delete: target object is neither Array nor Object type");
                    }

                    /*  synchronize model with underlying store  */
                    if (model[path[0]].store) {
                        var store = owner.store("model");
                        store[path[0]] = model[path[0]].value;
                        owner.store("model", store);
                    }

                    /*  send event to observers after value finally changed  */
                    if (owner.property({ name: "ComponentJS:model:subscribers:changed", def: 0, bubbling: false }) > 0) {
                        owner.publish({
                            name:      "ComponentJS:model:" + pathName + ":changed",
                            args:      [ value_new, value_old, params.operation, pathName ],
                            noresult:  true,
                            capturing: false,
                            spreading: false,
                            bubbling:  false,
                            async:     true
                        });
                    }
                }
            }

            /*  return old model value  */
            return (params.returnowner ? owner : value_old);
        },

        /*  touch a model value and trigger event  */
        touch: function () {
            /*  determine parameters  */
            var params = $cs.params("touch", arguments, {
                name: { pos: 0, req: true }
            });

            /*  simply force value to same value in order to trigger event  */
            this.value({
                name: params.name,
                value: this.value(params.name),
                force: true
            });
        },

        /*  start observing model value change  */
        observe: function () {
            /*  determine parameters  */
            var params = $cs.params("observe", arguments, {
                name:      { pos: 0, req: true  },
                func:      { pos: 1, req: true  },
                touch:     {         def: false },
                operation: {         def: "set" },
                spool:     {         def: null  }
            });

            /*  parse the value name into selection path segments  */
            var path = _cs.select_parse(params.name);

            /*  determine the actual component owning the model
                as we want to subscribe the change event there only  */
            var owner = null;
            var model = null;
            var comp = this;
            while (comp !== null) {
                owner = comp.property({ name: "ComponentJS:model", returnowner: true });
                if (!_cs.isdefined(owner))
                    throw _cs.exception("observe", "no model found containing value \"" + path[0] + "\"");
                model = owner.property("ComponentJS:model");
                if (_cs.isdefined(model[path[0]]))
                    break;
                comp = owner.parent();
            }
            if (comp === null)
                throw _cs.exception("observe", "no model found containing value \"" + path[0] + "\"");

            /*  subscribe to model value change event  */
            var name = path.join(".")
                .replace(/\./g, "\\.")
                .replace(/\*\*/g, ".+?")
                .replace(/\*/g, "[^.]+");
            name += "(?:\\.[^.]+)*";
            var id = owner.subscribe({
                name:      new RegExp("ComponentJS:model:" + name + ":" + params.operation),
                capturing: false,
                spreading: false,
                bubbling:  false,
                func:      params.func
            });

            /*  mark component for having subscribers of operation
                (for performance optimization reasons)  */
            var key = "ComponentJS:model:subscribers:" + params.operation;
            var subscribers = owner.property({ name: key, def: 0 });
            subscribers += 1;
            owner.property({ name: key, value: subscribers });

            /*  optionally spool reverse operation  */
            if (params.spool !== null) {
                var info = _cs.spool_spec_parse(this, params.spool);
                info.comp.spool(info.name, this, "unobserve", id);
            }

            /*  if requested, touch the model value once (for an initial observer run)  */
            if (params.touch)
                this.touch(params.name);

            return id;
        },

        /*  stop observing model value change  */
        unobserve: function () {
            /*  determine parameters  */
            var params = $cs.params("unobserve", arguments, {
                id: { pos: 0, req: true }
            });

            /*  determine the actual component owning the model
                as we want to unsubscribe the change event there only  */
            var owner = null;
            var comp = this;
            var subscription;
            while (comp !== null) {
                owner = comp.property({ name: "ComponentJS:model", returnowner: true });
                if (!_cs.isdefined(owner))
                    throw _cs.exception("unobserve", "no model subscription found");
                if ((subscription = owner._subscription(params.id, true)) !== undefined)
                    break;
                comp = owner.parent();
            }
            if (comp === null)
                throw _cs.exception("unobserve", "no model subscription found");

            /*  unsubscribe from model value change event  */
            owner.unsubscribe(params.id);

            /*  unmark component for having subscribers of operation  */
            var key = "ComponentJS:model:subscribers:" + subscription.operation;
            var subscribers = owner.property({ name: key, def: 0 });
            subscribers = subscribers > 0 ? subscribers - 1 : null;
            owner.property({ name: key, value: subscribers });
        }
    }
});

