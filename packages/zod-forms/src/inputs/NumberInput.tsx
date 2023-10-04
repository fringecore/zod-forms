import {ZodObject} from 'zod';
import {NumberFieldComponentType} from '../types/AllFieldTypes';
import {ContextType} from '../types/CoreTypes';
import React from 'react';
import {useValue} from '../hooks/useValue';
import {useOnChange} from '../hooks/useOnChange';

export function NumberInput<SCHEMA_TYPE extends ZodObject<any>>({
    context,
    leafPath,
    component: Component,
}: {
    context: ContextType<SCHEMA_TYPE>;
    leafPath: string[];
    component: NumberFieldComponentType;
}) {
    const value =
        useValue<number, SCHEMA_TYPE>(
            context.emitters,
            context.data,
            leafPath,
        ) ?? 0;

    const onChange = useOnChange<number, SCHEMA_TYPE>(
        context.emitters,
        context.data,
        leafPath,
    );

    return <Component value={value} onChange={onChange} />;
}
