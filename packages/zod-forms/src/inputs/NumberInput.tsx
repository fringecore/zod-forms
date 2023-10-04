import {useCallback, useEffect, useReducer} from 'react';
import {ZodObject} from 'zod';
import {NumberFieldComponentType} from '../types/AllFieldTypes';
import {Emitter} from '../utils/emitter';
import {ContextType} from '../types/CoreTypes';
import {get, set} from 'wild-wild-path';
import {EmitterSymbol} from '../symbols';
import React from 'react';

export function NumberInput<SCHEMA_TYPE extends ZodObject<any>>({
    context,
    leafPath,
    component: Component,
}: {
    context: ContextType<SCHEMA_TYPE>;
    leafPath: string[];
    component: NumberFieldComponentType;
}) {
    const [, rerender] = useReducer((val) => val + 1, 0);

    useEffect(() => {
        const emitter: Emitter | undefined = get(
            context.emitters,
            leafPath,
        ) as Emitter;
        emitter?.addListener(rerender);

        return () => {
            emitter?.removeListener(rerender);
        };
    }, []);

    const value: number =
        (get(context.data, leafPath) as number | undefined) ?? 0;

    const onChange = useCallback((value: number) => {
        set(context.data, leafPath, value, {mutate: true});

        context.emitters[EmitterSymbol]?.emit();

        const leafEmitter = get(context.emitters, leafPath) as
            | Emitter
            | undefined;
        leafEmitter?.emit();
    }, []);

    return <Component value={value} onChange={onChange} />;
}
