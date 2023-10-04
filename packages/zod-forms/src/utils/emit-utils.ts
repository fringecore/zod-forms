import {Emitter} from './emitter';
import {EmitterSymbol} from '../symbols';
import {FormEmittersType} from '../types/CoreTypes';
import {ZodObject} from 'zod';

export function recursiveEmit(node: Emitter | any) {
    if (node instanceof Emitter) {
        node.emit();
    } else if (node instanceof Object) {
        for (const key in node) {
            recursiveEmit(node[key]);
        }

        if (node[EmitterSymbol]) {
            node[EmitterSymbol].emit();
        }
    }
}

export function chainEmit<SCHEMA_TYPE extends ZodObject<any>>(
    emitters: FormEmittersType<SCHEMA_TYPE>,
    path: [string, ...string[]],
) {
    let node: any = emitters;

    for (const key of path.slice(0, -1)) {
        if (EmitterSymbol in node) {
            node[EmitterSymbol]?.emit();
        } else if (node instanceof Emitter) {
            node?.emit();
        }

        node = node[key];
    }

    node[path[path.length - 1]]?.emit();
}
