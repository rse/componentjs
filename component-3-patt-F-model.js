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

            /*  store model as a property  */
            this.property("model", model);
        },

        /*  get/set model value  */
        value: function (value) {
            /*  determine parameters  */
            var params = $cs.params("value", arguments, {
                name:  { pos: 0, def: null,     req: true },
                value: { pos: 1, def: undefined           }
            });

            /*  fetch model  */
            var model = this.property({ name: "model" });
            if (typeof model === "undefined")
                throw _cs.exception("value", "no model found");

            /*  sanity check model value reference  */
            if (typeof model[params.name] === "undefined")
                throw _cs.exception("value", "no such model field: \"" + params.name + "\"");

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

                /*  determine the actual component owning the model
                    as we want to publish the change event from there only  */
                var comp = this.property({ name: "model", returnowner: true });

                /*  send event to observers for value change and allow observers
                    to reject value set operation and/or change new value to set  */
                var ev = comp.publish({
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

        /*  start observing model value change  */
        observe: function () {
            /*  determine parameters  */
            var params = $cs.params("observe", arguments, {
                name:    { pos: 0, req: true  },
                func:    { pos: 1, req: true  },
                trigger: { pos: 2, req: false }
            });

            /*  determine the actual component owning the model
                as we want to subscribe the change event there only  */
            var comp = this.property({ name: "model", returnowner: true });

            /*  subscribe to model value change event  */
            var id = comp.subscribe({
                name: "ComponentJS:model:" + params.name,
                func: params.func
            });

            /*  if requested, trigger event once (for an initial observer run)  */
            if (params.trigger)
                this.value({ name: params.name, value: this.value(params.name) });
            
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
            var comp = this.property({ name: "model", returnowner: true });

            /*  subscribe to model value change event  */
            comp.unsubscribe(params.id);
        }
    }
});

