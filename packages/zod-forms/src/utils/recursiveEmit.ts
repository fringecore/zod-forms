import {Emitter} from './emitter';
import {EmitterSymbol} from '../symbols';

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
