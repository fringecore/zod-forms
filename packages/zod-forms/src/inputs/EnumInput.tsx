import {ZodObject} from 'zod';
import {EnumFieldComponentType} from '../types/AllFieldTypes';
import {ContextType} from '../types/CoreTypes';
import React from 'react';
import {useValue} from '../hooks/useValue';
import {useOnChange} from '../hooks/useOnChange';

export function EnumInput<SCHEMA_TYPE extends ZodObject<any>, T extends string>({
    context,
    leafPath,
    component: Component,
}: {
    context: ContextType<SCHEMA_TYPE>;
    leafPath: string[];
    component: EnumFieldComponentType<T>;
}) {
    const options: T[] = [] 

    leafPath.forEach(path => {
        const value = (useValue<T, SCHEMA_TYPE>(
            context.emitters,
            context.data,
            [path],
        ) as T) ?? '';
        options.push(value);
    });

    const value =
        (useValue<T, SCHEMA_TYPE>(
            context.emitters,
            context.data,
            leafPath,
        ) as T) ?? '';

    const onChange = useOnChange<T, SCHEMA_TYPE>(
        context.emitters,
        context.data,
        leafPath,
    );

    return <Component options={options} value={value} onChange={onChange} />;
}
