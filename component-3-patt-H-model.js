/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2012 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  generic pattern for model management  */
$cs.pattern.model = $cs.trait({
    protos: {
        /*  define model  */
        model: function (model) {
            /*  sanity check model  */
            if (_cs.isdefined(model)) {
                for (var name in model) {
                    if (typeof model[name].value === "undefined")
                        model[name].value = "";
                    if (typeof model[name].valid === "undefined")
                        model[name].valid = "string";
                    if (typeof model[name].autoreset === "undefined")
                        model[name].autoreset = false;
                    if (typeof model[name].persist === "undefined")
                        model[name].persist = false;
                    for (var key in model[name]) {
                        if (key !== "value" && key !== "valid" && key !== "autoreset" && key !== "persist")
                            throw _cs.exception("model", "invalid specification key \"" +
                                key + "\" in specification of model field \"" + name + "\"");
                    }
                }
            }

            /*  try to load persistent model values  */
            var store = this.store("model");
            if (store !== null) {
                for (var name in model) {
                    if (model[name].persist) {
                        if (_cs.isdefined(store[name]))
                            model[name].value = store[name];
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

                /*  optionally save persistent model values  */
                store = {};
                var save = false;
                for (var name in model) {
                    if (model[name].persist) {
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

        /*  retrieve a property based values object  */
        values: function () {
            /*  sanity check run-time environment  */
            if (_cs.istypeof(Object.defineProperty) !== "function")
                throw _cs.exception("values", "sorry, mandatory Object.defineProperty not supported by run-time environment");

            /*  retrieve values object  */
            var comp = this;
            var values_comp = comp.property({ name: "ComponentJS:model:values", returnowner: true });
            if (!_cs.isdefined(values_comp)) {
                /*  create initial values object  */
                model_comp = comp.property({ name: "ComponentJS:model", returnowner: true });
                if (!_cs.isdefined(model_comp))
                    throw _cs.exception("values", "no model found");
                values = {};
                model_comp.property("ComponentJS:model:values", values);

                /*  enhance values object with properties  */
                var model = model_comp.property("ComponentJS:model");
                for (var name in model) {
                    var symbol = name.replace(/[^a-zA-Z0-9_]+/g, "_");
                    (function (comp, name, symbol) {
                        Object.defineProperty(values, symbol, {
                            enumerable:   false,
                            configurable: false,
                            writeable:    true,
                            get: function ()      { return comp.value(name);        },
                            set: function (value) { return comp.value(name, value); }
                        });
                    })(comp, name, symbol);
                }
            }
            return values;
        },

        /*  get/set model value  */
        value: function (value) {
            /*  determine parameters  */
            var params = $cs.params("value", arguments, {
                name:  { pos: 0, def: null,     req: true },
                value: { pos: 1, def: undefined           },
                force: { pos: 2, def: false               }
            });

            /*  determine component owning model with requested value  */
            var owner = null;
            var model = null;
            var comp = this;
            while (comp !== null) {
                owner = comp.property({ name: "ComponentJS:model", returnowner: true });
                if (!_cs.isdefined(owner))
                    throw _cs.exception("value", "no model found containing value \"" + params.name + "\"");
                model = owner.property("ComponentJS:model");
                if (_cs.isdefined(model[params.name]))
                    break;
                comp = owner.parent();
            }
            if (comp === null)
                throw _cs.exception("value", "no model found containing value \"" + params.name + "\"");

            /*  get old and new model values  */
            var value_old = model[params.name].value;
            var value_new = params.value;

            /*  optionally set new model value  */
            if (   typeof value_new !== "undefined"
                && (params.force || value_old !== value_new)) {

                /*  check validity of new value  */
                if (!_cs.validate(value_new, model[params.name].valid))
                    throw _cs.exception("value", "invalid value \"" + value_new +
                        "\" for model field \"" + params.name + "\"");

                /*  send event to observers for value change and allow observers
                    to reject value set operation and/or change new value to set  */
                var ev = owner.publish({
                    name:      "ComponentJS:model:" + params.name,
                    args:      [ value_new, value_old ],
                    capturing: false,
                    bubbling:  false,
                    async:     false
                });
                if (ev.processing()) {
                    /*  allow value to be overridden  */
                    var result = ev.result();
                    if (typeof result !== "undefined")
                        value_new = result;

                    /*  set new value  */
                    if (!model[params.name].autoreset) {
                        model[params.name].value = value_new;
                        if (model[params.name].persist) {
                            var store = owner.store("model");
                            store[params.name] = value_new;
                            owner.store("model", store);
                        }
                    }
                }
            }

            /*  return old model value  */
            return value_old;
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
                touchonce: { pos: 2, def: false },
                spool:     {         def: null  }
            });

            /*  determine the actual component owning the model
                as we want to subscribe the change event there only  */
            var comp = this.property({ name: "ComponentJS:model", returnowner: true });
            if (typeof comp === "undefined")
                throw _cs.exception("observe", "no model found");

            /*  subscribe to model value change event  */
            var id = comp.subscribe({
                name: "ComponentJS:model:" + params.name,
                func: params.func
            });

            /*  optionally spool reverse operation  */
            if (params.spool !== null)
                this.spool(params.spool, this, "unobserve", id);

            /*  if requested, touch the model value once (for an initial observer run)  */
            if (params.touchonce)
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
            var comp = this.property({ name: "ComponentJS:model", returnowner: true });
            if (typeof comp === "undefined")
                throw _cs.exception("unobserve", "no model found");

            /*  subscribe to model value change event  */
            comp.unsubscribe(params.id);
        }
    }
});

