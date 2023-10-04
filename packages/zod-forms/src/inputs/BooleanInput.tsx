import {useCallback, useEffect, useReducer} from 'react';
import {ZodObject} from 'zod';
import {BooleanFieldComponentType} from '../types/AllFieldTypes';
import {Emitter} from '../utils/emitter';
import {ContextType} from '../types/CoreTypes';
import {get, set} from 'wild-wild-path';
import {EmitterSymbol} from '../symbols';
import React from 'react';

export function BooleanInput<SCHEMA_TYPE extends ZodObject<any>>({
    context,
    leafPath,
    component: Component,
}: {
    context: ContextType<SCHEMA_TYPE>;
    leafPath: string[];
    component: BooleanFieldComponentType;
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

    const value: boolean =
        (get(context.data, leafPath) as boolean | undefined) ?? false;

    const onChange = useCallback((value: boolean) => {
        set(context.data, leafPath, value, {mutate: true});

        context.emitters[EmitterSymbol]?.emit();

        const leafEmitter = get(context.emitters, leafPath) as
            | Emitter
            | undefined;
        leafEmitter?.emit();
    }, []);

    return <Component value={value} onChange={onChange} />;
}
