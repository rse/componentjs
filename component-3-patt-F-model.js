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
            _cs.foreach(model, function (name) {
                if (typeof model[name].value === "undefined")
                    model[name].value = "";
                if (typeof model[name].valid === "undefined")
                    model[name].valid = "string";
                _cs.foreach(model[name], function (key) {
                    if (key !== "value" && key !== "valid")
                        throw _cs.exception("model", "invalid specification key \"" +
                            key + "\" in specification of model field \"" + name + "\"");
                });
            });

            /*  store model  */
            var model_old = this.property({ name: "ComponentJS:model", bubbling: false });
            if (_cs.isdefined(model_old)) {
                /*  merge model into existing one  */
                var model_new = {};
                _cs.extend(model_new, model_old);
                _cs.extend(model_new, model);
                this.property("ComponentJS:model", model_new);
            }
            else {
                /*  set initial model  */
                this.property("ComponentJS:model", model);
            }
        },

        /*  get/set model value  */
        value: function (value) {
            /*  determine parameters  */
            var params = $cs.params("value", arguments, {
                name:  { pos: 0, def: null,     req: true },
                value: { pos: 1, def: undefined           }
            });

            /*  determine component owning model with requested value  */
            var owner = null;
            var model = null;
            var comp = this;
            while (comp !== null) {
                owner = comp.property({ name: "ComponentJS:model", returnowner: true });
                if (typeof owner === "undefined")
                    throw _cs.exception("value", "no model found containing value \"" + params.name + "\"");
                model = owner.property("ComponentJS:model");
                if (_cs.isdefined(model[params.name]))
                    break;
                comp = owner.parent();
            }
            if (comp === null)
                throw _cs.exception("value", "no model found containing value \"" + params.name + "\"");

            /*  get old model value  */
            var value_old = model[params.name].value;

            /*  optionally set new model value  */
            if (typeof params.value !== "undefined") {
                var value_new = params.value;
                var set_value = true;

                /*  check validity of new value  */
                if (!_cs.validate(value_new, model[params.name].valid))
                    throw _cs.exception("value", "invalid value \"" + value_new +
                        "\" for model field \"" + params.name + "\"");

                /*  send event to observers for value change and allow observers
                    to reject value set operation and/or change new value to set  */
                var ev = owner.publish({
                    name:      "ComponentJS:model:" + params.name,
                    args:      [ params.value, value ],
                    capturing: false,
                    bubbling:  false,
                    async:     false
                });
                if (ev.processing()) {
                    var result = ev.result();
                    if (typeof result !== "undefined")
                        value_new = result;
                }
                else
                    set_value = false;

                /*  set new value  */
                if (set_value)
                    model[params.name].value = value_new;
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

            /*  simply set value to same value in order to trigger event  */
            this.value({
                name: params.name,
                value: this.value(params.name)
            });
        },

        /*  start observing model value change  */
        observe: function () {
            /*  determine parameters  */
            var params = $cs.params("observe", arguments, {
                name:      { pos: 0, req: true  },
                func:      { pos: 1, req: true  },
                touchonce: { pos: 2, req: false }
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

