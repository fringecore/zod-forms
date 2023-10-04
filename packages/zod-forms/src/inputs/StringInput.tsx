import {ZodObject} from 'zod';
import {StringFieldComponentType} from '../types/AllFieldTypes';
import {ContextType} from '../types/CoreTypes';
import React from 'react';
import {useValue} from '../hooks/useValue';
import {useOnChange} from '../hooks/useOnChange';

export function StringInput<SCHEMA_TYPE extends ZodObject<any>>({
    context,
    leafPath,
    component: Component,
}: {
    context: ContextType<SCHEMA_TYPE>;
    leafPath: string[];
    component: StringFieldComponentType;
}) {
    const value =
        useValue<string, SCHEMA_TYPE>(
            context.emitters,
            context.data,
            leafPath,
        ) ?? '';

    const onChange = useOnChange<string, SCHEMA_TYPE>(
        context.emitters,
        context.data,
        leafPath,
    );

    return <Component value={value} onChange={onChange} />;
}
