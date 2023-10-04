import {z, ZodObject} from 'zod';
import {FormEmittersType} from '../types/CoreTypes';
import {DeepPartial} from '../types/DeepPartial';
import {useCallback} from 'react';
import {get, set} from 'wild-wild-path';
import {EmitterSymbol} from '../symbols';
import {Emitter} from '../utils/emitter';

export function useOnChange<TYPE, SCHEMA_TYPE extends ZodObject<any>>(
    emitters: FormEmittersType<SCHEMA_TYPE>,
    data: DeepPartial<z.infer<SCHEMA_TYPE>>,
    path: string[],
) {
    return useCallback((value: TYPE) => {
        set(data, path, value, {mutate: true});

        emitters[EmitterSymbol]?.emit();

        const leafEmitter = get(emitters, path) as Emitter | undefined;

        leafEmitter?.emit();
    }, []);
}
