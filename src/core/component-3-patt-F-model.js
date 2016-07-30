/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern for model management  */
$cs.pattern.model = $cs.trait({
    protos: {
        /*  define model  */
        model: function () {
            /*  determine parameters  */
            var params = $cs.params("model", arguments, {
                spec: { pos: 0, req: true, valid:
                    "{ @: {" +
                    " value?: any," +
                    " valid?: (string|function|RegExp)," +
                    " autoreset?: boolean," +
                    " store?: boolean" +
                    "} }"
                }
            });

            /*  create new model  */
            var model = { spec: params.spec, data: {} };
            _cs.foreach(_cs.keysof(model.spec), function (name) {
                var item = model.spec[name];

                /*  provide default values for all the optional model item options  */
                if (typeof item.value     === "undefined") item.value     = "";
                if (typeof item.valid     === "undefined") item.valid     = "string";
                if (typeof item.autoreset === "undefined") item.autoreset = false;
                if (typeof item.store     === "undefined") item.store     = false;

                /*  sanity check model item specification  */
                if (!$cs.validate(item.value, item.valid))
                    throw _cs.exception("model", "model field \"" + name + "\" has " +
                        "default value " + _cs.json(item.value) + ", which does not validate " +
                        "against validation specification \"" + item.valid + "\"");

                /*  take over initial model item value  */
                model.data[name] = item.value;
            });

            /*  optionally load model values from store  */
            var store = this.store("model");
            if (store !== null) {
                _cs.foreach(_cs.keysof(model.spec), function (name) {
                    if (model.spec[name].store)
                        if (_cs.isdefined(store[name]))
                            model.data[name] = store[name];
                });
            }

            /*  optionally merge new model into old model  */
            var model_old = this.property({ name: "ComponentJS:model", bubbling: false });
            if (_cs.isdefined(model_old)) {
                var model_new = { spec: {}, data: {} };
                _cs.extend(model_new.spec, model_old.spec);
                _cs.extend(model_new.data, model_old.data);
                _cs.extend(model_new.spec, model.spec);
                _cs.extend(model_new.data, model.data);
                model = model_new;
            }

            /*  optionally save model values to store  */
            store = {};
            var save = false;
            _cs.foreach(_cs.keysof(model.spec), function (name) {
                if (model.spec[name].store) {
                    store[name] = model.data[name];
                    save = true;
                }
            });
            if (save)
                this.store("model", store);

            /*  (re)attach model to component  */
            this.property("ComponentJS:model", model);
        },

        /*  get/set model value  */
        value: function () {
            /*  determine parameters  */
            var params = $cs.params("value", arguments, {
                name:        { pos: 0, req: true,      valid: "string"   },
                value:       { pos: 1, def: undefined, valid: "any"      },
                force:       { pos: 2, def: false,     valid: "boolean"  },
                injected:    {         def: false,     valid: "boolean"  },
                op:          {         def: [],        valid: "(string|[string?]|[string,number,number])" },
                returnowner: {         def: false,     valid: "boolean"  }
            });

            /*  determine operation  */
            if (typeof params.op === "string")
                params.op = [ params.op ];
            if (params.op.length === 0)
                params.op = (_cs.isdefined(params.value) ? [ "set" ] : [ "get" ]);
            else if (!params.op[0].match(/^(?:get|set|splice|delete|push|pop|shift|unshift)$/))
                throw _cs.exception("value", "invalid operation \"" + params.op[0] + "\"");
            if (   params.op[0] === "splice"
                && (   params.op.length !== 3
                    || typeof params.op[1] !== "number"
                    || typeof params.op[2] !== "number"))
                throw _cs.exception("value", "invalid arguments for operation \"splice\"");

            /*  parse the value name into selection path segments  */
            var path = _cs.select_parse(params.name);

            /*  create new canonical name out of the parsed path segments  */
            var pathName = path.join(".");

            /*  determine component owning model with requested value  */
            var owner = null;
            var model = null;
            var comp  = this;
            while (comp !== null) {
                owner = comp.property({ name: "ComponentJS:model", returnowner: true });
                if (!_cs.isdefined(owner))
                    throw _cs.exception("value", "no model found containing value \"" + path[0] + "\"");
                model = owner.property("ComponentJS:model");
                if (_cs.isdefined(model.spec[path[0]]))
                    break;
                comp = owner.parent();
            }
            if (comp === null)
                throw _cs.exception("value", "no model found containing value \"" + path[0] + "\"");

            /*  get new model value  */
            var value_new = params.value;

            /*  translate special-case array operations to splice operation  */
            var obj;
            switch (params.op[0]) {
                case "unshift":
                    params.op = [ "splice", 0, 0 ];
                    break;
                case "shift":
                    params.op = [ "splice", 0, 1 ];
                    value_new = undefined;
                    break;
                case "push":
                    obj = $cs.select(model.data, path);
                    params.op = [ "splice", obj.length, 0 ];
                    break;
                case "pop":
                    obj = $cs.select(model.data, path);
                    params.op = [ "splice", obj.length - 1, 1 ];
                    value_new = undefined;
                    break;
            }

            /*  get old model value  */
            var ev;
            var result;
            var value_old = $cs.select(model.data, path);
            if (params.op[0] === "splice") {
                /*  splice operation is on collection itself,
                    so pick the target collection element!  */
                if (params.op[2] > 0)
                    value_old = $cs.select(value_old, "" + params.op[1]);
                else
                    value_old = undefined;
            }
            else if (params.op[0] === "get") {
                if (owner.property({ name: "ComponentJS:model:subscribers:get", def: 0, bubbling: false }) > 0) {
                    /*  send event to observers for value get and allow observers
                        to reject value get operation and/or change old value to get  */
                    ev = owner.publish({
                        name:      "ComponentJS:model:" + pathName + ":" + params.op[0],
                        args:      [ value_old, value_old, params.op, pathName ],
                        capturing: false,
                        spreading: false,
                        bubbling:  false,
                        async:     false
                    });
                    if (ev.processing()) {
                        /*  allow value to be overridden by event result  */
                        result = ev.result();
                        if (typeof result !== "undefined")
                            value_old = result;
                    }
                }
            }

            /*  optionally set/delete/splice new model value  */
            if (   (   params.op[0] === "set"
                    && (params.force || value_old !== value_new))
                || params.op[0] === "delete"
                || params.op[0] === "splice"                     ) {

                /*  check validity of new value  */
                if (   params.op[0] === "set"
                    || (   params.op[0] === "splice"
                        && value_new !== undefined  )) {
                    var subPath = (
                          params.op[0] === "splice"
                        ? path.slice(1).concat([ "0" ])
                        : path.slice(1)
                    );
                    if (!_cs.validate_at(value_new, model.spec[path[0]].valid, subPath))
                        throw _cs.exception("value", "model field \"" + params.name + "\" receives " +
                            "new value " + _cs.json(value_new) + ", which does not validate " +
                            "against \"" + model.spec[path[0]].valid + "\"" +
                            (subPath.length > 0 ? " at sub-path \"" + subPath.join(".") + "\"" : ""));
                }

                /*  send event to observers for value set/delete/splice operation
                    and allow observers to reject operation and/or change new value to set  */
                var cont = true;
                if (owner.property({ name: "ComponentJS:model:subscribers:" + params.op[0], def: 0, bubbling: false }) > 0) {
                    ev = owner.publish({
                        name:      "ComponentJS:model:" + pathName + ":" + params.op[0],
                        args:      [ value_new, value_old, params.op, pathName ],
                        capturing: false,
                        spreading: false,
                        bubbling:  false,
                        async:     false
                    });
                    if (!ev.processing()) {
                        if (params.injected)
                            throw _cs.exception("value", "model field \"" + params.name + "\" receives (again) " +
                                "value " + _cs.json(value_new) + ", which is rejected by observers, " +
                                "but the value was indicated to be already injected by third-parties " +
                                "(so it technically no longer can be rejected)");
                        cont = false;
                    }
                    else {
                        /*  allow value to be overridden  */
                        result = ev.result();
                        if (typeof result !== "undefined")
                            value_new = result;
                    }
                }
                if (cont && !model.spec[path[0]].autoreset) {
                    /*  perform destructive operation on model  */
                    if (params.op[0] === "set") {
                        /*  set value in model  */
                        $cs.select(model.data, path, value_new);
                    }
                    else if (params.op[0] === "splice") {
                        /*  splice value into model  */
                        obj = $cs.select(model.data, path);
                        if (!(obj instanceof Array))
                            throw new _cs.exception("value", "cannot splice: target object is not of Array type");
                        if (typeof value_new !== "undefined")
                            obj.splice(params.op[1], params.op[2], value_new);
                        else
                            obj.splice(params.op[1], params.op[2]);
                    }
                    else if (params.op[0] === "delete") {
                        /*  delete value from model  */
                        if (path.length < 2)
                            throw new _cs.exception("value", "cannot delete model root or top-level model entry");
                        obj = $cs.select(model.data, path.slice(0, path.length - 1));
                        var pathSegment = path[path.length - 1];
                        if (obj instanceof Array)
                            obj.splice(parseInt(pathSegment, 10), 1);
                        else if (typeof obj === "object")
                            delete obj[pathSegment];
                        else
                            throw new _cs.exception("value", "cannot delete: target object is neither Array nor Object type");
                    }

                    /*  synchronize model with underlying store  */
                    if (model.spec[path[0]].store) {
                        var store = owner.store("model");
                        store[path[0]] = model.data[path[0]];
                        owner.store("model", store);
                    }

                    /*  send event to observers after value finally changed  */
                    if (owner.property({ name: "ComponentJS:model:subscribers:changed", def: 0, bubbling: false }) > 0) {
                        owner.publish({
                            name:      "ComponentJS:model:" + pathName + ":changed",
                            args:      [ value_new, value_old, params.op, pathName ],
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
                name: { pos: 0, req: true, valid: "string" }
            });

            /*  simply force value to same value in order to trigger event  */
            this.value({
                name:     params.name,
                value:    this.value(params.name),
                injected: true,
                force:    true
            });
        },

        /*  start observing model value change  */
        observe: function () {
            /*  determine parameters  */
            var params = $cs.params("observe", arguments, {
                name:        { pos: 0, req: true,   valid: "string"        },
                func:        { pos: 1, req: true,   valid: "function"      },
                touch:       {         def: false,  valid: "boolean"       },
                boot:        {         def: false,  valid: "boolean"       },
                op:          {         def: "set",  valid: /^(?:get|set|changed|splice|delete)$/ },
                spool:       {         def: null,   valid: "(null|string)" },
                noevent:     {         def: false,  valid: "boolean"       }
            });

            /*  parse the value name into selection path segments  */
            var path = _cs.select_parse(params.name);

            /*  determine the actual component owning the model
                as we want to subscribe the change event there only  */
            var owner = null;
            var model = null;
            var comp  = this;
            while (comp !== null) {
                owner = comp.property({ name: "ComponentJS:model", returnowner: true });
                if (!_cs.isdefined(owner))
                    throw _cs.exception("observe", "no model found containing value \"" + path[0] + "\"");
                model = owner.property("ComponentJS:model");
                if (_cs.isdefined(model.spec[path[0]]))
                    break;
                comp = owner.parent();
            }
            if (comp === null)
                throw _cs.exception("observe", "no model found containing value \"" + path[0] + "\"");

            /*  support wildcard matching and always match childs  */
            var name = path.join(".")
                .replace(/\./g, "\\.")
                .replace(/\*\*/g, ".+?")
                .replace(/\*/g, "[^.]+");
            name += "(?:\\.[^.]+)*";

            /*  subscribe to model value change event  */
            var id = owner.subscribe({
                name:      new RegExp("ComponentJS:model:" + name + ":" + params.op),
                capturing: false,
                spreading: false,
                bubbling:  false,
                noevent:   params.noevent,
                func:      params.func
            });

            /*  mark component for having subscribers of operation
                (for performance optimization reasons)  */
            var key = "ComponentJS:model:subscribers:" + params.op;
            var subscribers = owner.property({ name: key, def: 0 });
            subscribers += 1;
            owner.property({ name: key, value: subscribers });

            /*  optionally spool reverse operation  */
            if (params.spool !== null) {
                var info = _cs.spool_spec_parse(this, params.spool);
                info.comp.spool(info.name, this, "unobserve", id);
            }

            /*  if requested (for a one-time initial observer run),
                either touch the model value once (which causes _all_ observers to trigger!)
                or do a "bootstrapping execution" of only our callback function once  */
            if (params.touch)
                this.touch(params.name);
            else if (params.boot) {
                var value = this.value(params.name);
                var args = [ value, value, params.op, path.join(".") ];
                if (!params.noevent) {
                    args.unshift($cs.event({
                        name:        params.name,
                        spec:        {},
                        async:       false,
                        result:      undefined,
                        target:      this,
                        propagation: true,
                        processing:  true,
                        dispatched:  false
                    }));
                }
                params.func.apply(this, args);
            }

            return id;
        },

        /*  stop observing model value change  */
        unobserve: function () {
            /*  determine parameters  */
            var params = $cs.params("unobserve", arguments, {
                id: { pos: 0, req: true, valid: "string" }
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
            var key = "ComponentJS:model:subscribers:" + subscription.op;
            var subscribers = owner.property({ name: key, def: 0 });
            subscribers = subscribers > 0 ? subscribers - 1 : null;
            owner.property({ name: key, value: subscribers });
        }
    }
});

