import {useEffect} from 'react';
import {Emitter} from '../utils/emitter';
import {get} from 'wild-wild-path';
import {useRerender} from './useRerender';
import {z, ZodObject} from 'zod';
import {FormEmittersType} from '../types/CoreTypes';
import {DeepPartial} from '../types/DeepPartial';

export function useValue<TYPE, SCHEMA_TYPE extends ZodObject<any>>(
    emitters: FormEmittersType<SCHEMA_TYPE>,
    data: DeepPartial<z.infer<SCHEMA_TYPE>>,
    path: string[],
) {
    const rerender = useRerender();

    useEffect(() => {
        const emitter: Emitter | undefined = get(emitters, path) as Emitter;

        emitter?.addListener(rerender);

        return () => {
            emitter?.removeListener(rerender);
        };
    }, []);

    return get(data, path) as TYPE | undefined;
}
