import React from 'react';
import {useOnChange} from '../hooks/useOnChange';
import {useValue} from '../hooks/useValue';
import {ArrayFieldComponentType} from '../types/AllFieldTypes';
import {ZodObject} from 'zod';
import {ContextType} from '../types/CoreTypes';

/*export function ArrayInput<
    SCHEMA_TYPE extends ZodObject<any>,
    VALUE extends string,
>({
    context,
    leafPath,
    component: Component,
}: {
    context: ContextType<SCHEMA_TYPE>;
    leafPath: [string, ...string[]];
    component: ArrayFieldComponentType<VALUE>;
}) {
    const values =
        useValue<VALUE[], any>(context.emitters, context.data, leafPath) ?? [];

    const onChange = useOnChange<VALUE[], any>(
        context.emitters,
        context.data,
        leafPath,
    );

    return <Component values={values} onChange={onChange} />;
}*/

export function ArrayInput<
    SCHEMA_TYPE extends ZodObject<any>,
    VALUE extends string | '',
>({
    context,
    leafPath,
    component: Component,
}: {
    context: ContextType<SCHEMA_TYPE>;
    leafPath: [string, ...string[]];
    component: ArrayFieldComponentType<VALUE>;
}) {
    const values =
        useValue<VALUE[], any>(context.emitters, context.data, leafPath) ?? [];

    const onChange = useOnChange<VALUE[], any>(
        context.emitters,
        context.data,
        leafPath,
    );

    const addItem = () => {
        onChange([...values, ''] as VALUE[]);
    };

    const removeItem = (index: number) => {
        const updatedValues = [...values];
        updatedValues.splice(index, 1); 
        onChange(updatedValues);
    };

    return <Component items={values} onChange={onChange} addItem={addItem} removeItem={removeItem} />;
}

