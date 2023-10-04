import {ZodObject} from 'zod';
import {BooleanFieldComponentType} from '../types/AllFieldTypes';
import {ContextType} from '../types/CoreTypes';
import React from 'react';
import {useValue} from '../hooks/useValue';
import {useOnChange} from '../hooks/useOnChange';

export function BooleanInput<SCHEMA_TYPE extends ZodObject<any>>({
    context,
    leafPath,
    component: Component,
}: {
    context: ContextType<SCHEMA_TYPE>;
    leafPath: string[];
    component: BooleanFieldComponentType;
}) {
    const value =
        useValue<boolean, SCHEMA_TYPE>(
            context.emitters,
            context.data,
            leafPath,
        ) ?? false;

    const onChange = useOnChange<boolean, SCHEMA_TYPE>(
        context.emitters,
        context.data,
        leafPath,
    );

    return <Component value={value} onChange={onChange} />;
}
