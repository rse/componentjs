/*
**  ComponentJS -- Component System for JavaScript <http://componentjs.com>
**  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License, v. 2.0. If a copy of the MPL was not distributed with this
**  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/*  FIXME: just a quick and dirty, incomplete and unclean TypeScript
    type definition for ComponentJS. Needs more time...  */

interface ComponentJS_event {
}
interface ComponentJS_event_cb {
    (ev: ComponentJS_event, ...rest: any[]): void;
}
interface ComponentJS_event_cb_directresult {
    (...rest: any[]): any;
}

interface ComponentJS_comp {
    /*
    create(name1: string, clazz1: any);
    create(name1: string, clazz1: any,
           name2: string, clazz2: any);
    create(name1: string, clazz1: any,
           name2: string, clazz2: any,
           name3: string, clazz3: any);
    create(name1: string, clazz1: any,
           name2: string, clazz2: any,
           name3: string, clazz3: any,
           name4: string, clazz4: any);
    create(name1: string, clazz1: any,
           name2: string, clazz2: any,
           name3: string, clazz3: any,
           name4: string, clazz4: any,
           ...rest: any[]);
           */
    create(spec: string, ...rest: any[]);

    model(params: Object): Object;

    value(name: string): any;
    value(name: string, value: any): any;
    value(params: {
        name: string;
        value: any;
        force: bool;
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
        touch?: bool;
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
        async?: bool;
        capturing?: bool;
        bubbling?: bool;
        completed?: () => void;
        resultinit?: any;
        resultstep?: (a: any, b: any) => any;
        directresult?: bool;
        firstonly?: bool;
        silent?: bool;
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

    state_auto_increase(enable: bool): void;
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
        capture?: bool;
        noevent?: bool;
        exclusive?: bool;
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
        sync?: bool;
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

/*  official global API  */
interface ComponentJS_api {
    /*  API symbol is both namespace and function  */
    (object: any):                   ComponentJS_comp;
    (selector: string):              ComponentJS_comp;
    (object: any, selector: string): ComponentJS_comp;

    plugin(): string[];
    plugin(name: string): bool;
    plugin(name: string, callback: (_cs: any, $cs: any, GLOBAL: any) => void): void;

    bootstrap(): void;
    shutdown(): void;

    /* create(selector: string, object: any): void; */
    create(spec: string, ...rest: any[]);
    create(base: any, spec: string, ...rest: any[]);

    mark(obj: any, name: string): void;

    marked(obj: any, name: string): bool;

    debug(level: number): void;

    debug_window(): bool;
    debug_window(enable: bool, name: string): void;
    debug_window(params: {
        enable: bool;
        autoclose: bool;
        name: string;
        natural?: bool;
        width?: number;
        height?: number;
    }): void;

    debug_instrumented(): bool;

    symbol(name: string): void;
    symbol(): string;
}

/*  the official export method  */
declare var ComponentJS_export: String

/*  the official/default global symbol  */
declare var ComponentJS: ComponentJS_api

/*  the inofficial/de-facto global symbol  */
declare var cs: ComponentJS_api

