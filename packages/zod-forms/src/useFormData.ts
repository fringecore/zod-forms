import {z, ZodObject} from 'zod';
import {RootFieldsType} from './types/CoreTypes';
import {DeepPartial} from './types/DeepPartial';
import {useEffect, useReducer} from 'react';
import {DataSymbol, EmittersSymbol, EmitterSymbol} from './symbols';

export const useFormData = <SCHEMA extends ZodObject<any>>(
    form: RootFieldsType<SCHEMA>,
): DeepPartial<z.infer<SCHEMA>> => {
    const [, rerender] = useReducer((val) => val + 1, 0);

    useEffect(() => {
        const emitter = form[EmittersSymbol][EmitterSymbol];

        emitter?.addListener(() => {
            rerender();
        });

        return () => {
            emitter?.removeListener(rerender);
        };
    }, [rerender]);

    return form[DataSymbol];
};