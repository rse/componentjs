/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2016 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

interface ComponentJS_event {
    target     (val?: any    ): any;
    propagation(val?: boolean): boolean;
    processing (val?: boolean): boolean;
    dispatched (val?: boolean): boolean;
    decline    (val?: boolean): boolean;
    state      (val?: string ): string;
    result     (val?: any    ): any;
    async      (val?: boolean): boolean;
}

interface ComponentJS_event_cb {
    (ev: ComponentJS_event, ...rest: any[]): void;
}

interface ComponentJS_event_cb_directresult {
    (...rest: any[]): any;
}

interface ComponentJS_comp {
    create(spec: string, ...rest: any[]): ComponentJS_comp;
    destroy(): void;
    exists(): boolean;

    id(id?: string): string;
    path(): ComponentJS_comp[];
    path(sep: string): string;

    model(params: Object): Object;

    value(name: string): any;
    value(name: string, value: any): any;
    value(params: {
        name: string;
        value: any;
        force: boolean;
    }): any;

    register(params: {
        name: string;
        func: ComponentJS_event_cb;
        spool?: string;
    }): number;
    register(
        name: string,
        func: ComponentJS_event_cb
    ): number;

    observe(params: {
        name: string;
        func: ComponentJS_event_cb;
        spool?: string;
        touch?: boolean;
    }): number;
    observe(
        name: string,
        func: ComponentJS_event_cb
    ): number;

    call(params: {
        name: string;
        args: any[];
    }): any;
    call(
        name: string,
        ...args: any[]
    ): any;

    publish(params: {
        name: string;
        spec?: {};
        async?: boolean;
        capturing?: boolean;
        bubbling?: boolean;
        completed?: () => void;
        resultinit?: any;
        resultstep?: (a: any, b: any) => any;
        directresult?: boolean;
        firstonly?: boolean;
        silent?: boolean;
        args?: any[];
    }): any;
    publish(
        name: string,
        ...args: any[]
    ): any;

    unspool(name: string): void;

    guard(name: string, level: number): void;

    plug(params: {
        name?: string;
        object: any;
        spool?: string;
    }): void;
    plug(
        object: any
    ): void;

    unplug(params: {
        name?: string;
        object: any;
    }): void;
    unplug(
        object: any
    ): void;

    property(name: string): any;
    property(name: string, value: any): any;

    state_auto_increase(enable: boolean): void;
    socket(params: {
        name?: string;
        scope?: any;
        ctx: any;
        plug?: any;
        unplug?: any;
    }): void;
    socket(
        ctx: any,
        plug?: any,
        unplug?: any
    ): void;

    subscribe(params: {
        name: string;
        spec?: {};
        ctx?: any;
        func: ComponentJS_event_cb_directresult;
        args?: any[];
        capture?: boolean;
        noevent?: boolean;
        exclusive?: boolean;
        spool?: string;
    }): number;
    subscribe(
        name: string,
        func: ComponentJS_event_cb_directresult
    ): number;

    state(): string;
    state(state: string): void;
    state(params: {
        state: string;
        sync?: boolean;
        callback?: () => any;
    }): void;

    touch(name: string): void;

    link(params: {
        name?: string;
        scope?: string;
        ctx: any;
        target: string;
    }): void;
    link(
        ctx: any,
        target: string
    ): void;

    store(): string[];
    store(key: string): any;
    store(key: string, val: any): any;
}

interface ComponentJS_api_internal {
    extend(input: Object, mixin: Object): Object;
    latch(name: string, cb: (...args: any[]) => any): number;
    unlatch(name: string, id: number): void;
    hook(name: string, proc: string, ...args: any[]): any;
}

interface ComponentJS_api {
    /*
     *  Convenience Call Wrapping
     */

    (object: any):                   ComponentJS_comp;
    (object: any, selector: string): ComponentJS_comp;
    (selector: string):              ComponentJS_comp;

    /*
     *  API Management
     */

    symbol(name?: string): ComponentJS_api;

    version: {
        major: number;
        minor: number;
        micro: number;
        date: number;
    };

    /*
     *  Library Management
     */

    bootstrap(): void;

    shutdown(): void;

    plugin(): string[];
    plugin(
        name: string
    ): boolean;
    plugin(
        name: string,
        callback: (
            _cs: ComponentJS_api_internal,
            $cs: ComponentJS_api,
            GLOBAL: any
        ) => void
    ): void;

    /*
     *  Debugging
     */

    debug(): number;
    debug(level: number): void;
    debug(level: number, message: string): void;

    debug_instrumented(): boolean;

    debug_window(): boolean;
    debug_window(
        enable: boolean,
        autoclose: boolean,
        name: string
    ): void;
    debug_window(params: {
        enable?: boolean;
        autoclose?: boolean;
        name?: string;
        natural?: boolean;
        width?: number;
        height?: number;
    }): void;

    /*
     *  Code Structuring
     */

    ns(path: string, leaf?: Object): Object;

    validate(object: Object, spec: string, path?: string): boolean;
    select(object: Object, path: string): Object;

    params(
        name: string,
        args: any[],
        spec: {
            [key: string]: {
                pos?: number;
                req?: boolean;
                def?: any;
                valid?: any;
            }
        }
    ): Object;

    attribute(
        name: string,
        def: any,
        validate: any
    ): (value?: any) => any

    clazz(params: {
        name?: string;
        extend?: Object;
        mixin?: Object[];
        cons?: (...args: any[]) => any;
        dynamics?: Object;
        protos?: Object;
        statics?: Object;
    }): Object;

    trait(params: {
        name?: string;
        mixin?: Object[];
        cons?: (...args: any[]) => any;
        setup?: (...args: any[]) => any;
        dynamics?: Object;
        protos?: Object;
        statics?: Object;
    }): Object;

    /*
     *  Component Creation
     */

    create(spec: string, ...rest: any[]): ComponentJS_comp;
    create(base: any, spec: string, ...rest: any[]): ComponentJS_comp;

    destroy(spec: string, ...rest: any[]): void;
    destroy(base: any, spec: string, ...rest: any[]): void;

    /*
     *  Component Information
     */

    mark(obj: any, name: string): void;
    marked(obj: any, name: string): boolean;

    pattern: any;
}

declare var ComponentJS_export: string
declare var ComponentJS:        ComponentJS_api
declare var cs:                 ComponentJS_api

