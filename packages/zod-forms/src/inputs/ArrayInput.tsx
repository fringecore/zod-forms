import React from 'react';
import {useOnChange} from '../hooks/useOnChange';
import {useValue} from '../hooks/useValue';
import {ArrayFieldComponentType, ArrayFieldItemType} from '../types/AllFieldTypes';
import {ZodObject} from 'zod';
import {ContextType} from '../types/CoreTypes';

export function ArrayInput<
    SCHEMA_TYPE extends ZodObject<any>,
>({
    context,
    leafPath,
    component: Component,
}: {
    context: ContextType<SCHEMA_TYPE>;
    leafPath: [string, ...string[]];
    component: ArrayFieldComponentType<ArrayFieldItemType>;
}) {
    const values =
        useValue<ArrayFieldItemType[], any>(context.emitters, context.data, leafPath) ?? [];

    const onChange = useOnChange<ArrayFieldItemType[], any>(
        context.emitters,
        context.data,
        leafPath,
    );

    const addItem = () => {
        onChange([...values, ''] as ArrayFieldItemType[]);
    };

    const removeItem = (index: number) => {
        const updatedValues = [...values];
        updatedValues.splice(index, 1); 
        onChange(updatedValues);
    };

    return <Component items={values} onChange={onChange} addItem={addItem} removeItem={removeItem} />;
}

