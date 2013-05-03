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
        model: function (model) {
            var name;

            /*  sanity check model  */
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
                            "default value \"" + model[name].value + "\", which does not validate " +
                            "against validation \"" + model[name].valid + "\"");
                }
            }

            /*  try to load stored model values  */
            var store = this.store("model");
            if (store !== null) {
                for (name in model) {
                    if (model[name].store) {
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
                returnowner: {         def: false     }
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

            /*  get new model value  */
            var value_new = params.value;

            /*  get old model value  */
            var ev;
            var value_old = model[params.name].value;
            var result;
            if (typeof value_new === "undefined") {
                if (owner.property({ name: "ComponentJS:model:subscribers:get", bubbling: false }) === true) {
                    /*  send event to observers for value get and allow observers
                        to reject value get operation and/or change old value to get  */
                    ev = owner.publish({
                        name:      "ComponentJS:model:" + params.name + ":get",
                        args:      [ value_old ],
                        capturing: false,
                        spreading: false,
                        bubbling:  false,
                        async:     false
                    });
                    if (ev.processing()) {
                        /*  re-fetch value from model
                            (in case the callback set a new value directly)  */
                        value_old = model[params.name].value;

                        /*  allow value to be overridden by event result  */
                        result = ev.result();
                        if (typeof result !== "undefined")
                            value_old = result;
                    }
                }
            }

            /*  optionally set new model value  */
            if (   typeof value_new !== "undefined"
                && (params.force || value_old !== value_new)) {

                /*  check validity of new value  */
                if (!$cs.validate(value_new, model[params.name].valid))
                    throw _cs.exception("value", "invalid value \"" + value_new +
                        "\" for model field \"" + params.name + "\"");

                /*  send event to observers for value set operation and allow observers
                    to reject value set operation and/or change new value to set  */
                var cont = true;
                if (owner.property({ name: "ComponentJS:model:subscribers:set", bubbling: false }) === true) {
                    ev = owner.publish({
                        name:      "ComponentJS:model:" + params.name + ":set",
                        args:      [ value_new, value_old ],
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
                if (cont && !model[params.name].autoreset) {
                    /*  set value in model  */
                    model[params.name].value = value_new;

                    /*  synchronize model with underlying store  */
                    if (model[params.name].store) {
                        var store = owner.store("model");
                        store[params.name] = model[params.name].value;
                        owner.store("model", store);
                    }

                    /*  send event to observers after value finally changed  */
                    if (owner.property({ name: "ComponentJS:model:subscribers:changed", bubbling: false }) === true) {
                        owner.publish({
                            name:      "ComponentJS:model:" + params.name + ":changed",
                            args:      [ value_new, value_old ],
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

            /*  determine the actual component owning the model
                as we want to subscribe the change event there only  */
            var owner = null;
            var model = null;
            var comp = this;
            while (comp !== null) {
                owner = comp.property({ name: "ComponentJS:model", returnowner: true });
                if (!_cs.isdefined(owner))
                    throw _cs.exception("observe", "no model found containing value \"" + params.name + "\"");
                model = owner.property("ComponentJS:model");
                if (_cs.isdefined(model[params.name]))
                    break;
                comp = owner.parent();
            }
            if (comp === null)
                throw _cs.exception("observe", "no model found containing value \"" + params.name + "\"");

            /*  subscribe to model value change event  */
            var id = owner.subscribe({
                name:      "ComponentJS:model:" + params.name + ":" + params.operation,
                capturing: false,
                spreading: false,
                bubbling:  false,
                func:      params.func
            });

            /*  mark component for having subscribers of operation
                (for performance optimization reasons)  */
            owner.property("ComponentJS:model:subscribers:" + params.operation, true);

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
            while (comp !== null) {
                owner = comp.property({ name: "ComponentJS:model", returnowner: true });
                if (!_cs.isdefined(owner))
                    throw _cs.exception("unobserve", "no model subscription found");
                if (owner.subscription(params.id))
                    break;
                comp = owner.parent();
            }
            if (comp === null)
                throw _cs.exception("unobserve", "no model subscription found");

            /*  subscribe to model value change event  */
            owner.unsubscribe(params.id);
        }
    }
});

