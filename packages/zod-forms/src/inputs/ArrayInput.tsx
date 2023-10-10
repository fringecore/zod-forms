import React from 'react';
import {useOnChange} from '../hooks/useOnChange';
import {useValue} from '../hooks/useValue';
import {
    ArrayFieldComponentType,
    ArrayFieldItemType,
} from '../types/AllFieldTypes';
import {ZodObject} from 'zod';
import {ContextType} from '../types/CoreTypes';

export function ArrayInput<SCHEMA_TYPE extends ZodObject<any>>({
    context,
    leafPath,
    component: Component,
}: {
    context: ContextType<SCHEMA_TYPE>;
    leafPath: [string, ...string[]];
    component: ArrayFieldComponentType<ArrayFieldItemType>;
}) {
    const values =
        useValue<ArrayFieldItemType[], any>(
            context.emitters,
            context.data,
            leafPath,
        ) ?? [];

    const onChange = useOnChange<ArrayFieldItemType[], any>(
        context.emitters,
        context.data,
        leafPath,
    );

    function handleInputChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        index: number,
        property?: string,
        object?: any,
    ) {
        const updatedValue = [...values];

        if (property) {
            const inputValue =
                e.target.type === 'number'
                    ? parseInt(e.target.value, 10)
                    : e.target.value;
            updatedValue[index] = {
                ...object,
                [property]: inputValue,
            };
            onChange(updatedValue);
        } else {
            const inputValue =
                e.target.type === 'number'
                    ? parseInt(e.target.value, 10)
                    : e.target.value;

            updatedValue[index] = inputValue;

            onChange(updatedValue);
        }
    }

    const addItem = () => {
        let newItem: ArrayFieldItemType;

        if (values.length > 0) {
            const firstItemType = typeof values[0];
            if (firstItemType === 'string') {
                newItem = '';
            } else if (firstItemType === 'object' && values[0] !== null) {
                newItem = {};
            } else if (firstItemType === 'number') {
                newItem = 0;
            } else {
                newItem = '';
            }
        } else {
            newItem = '';
        }

        onChange([...values, newItem]);
    };

    const removeItem = (index: number) => {
        const updatedValues = [...values];
        updatedValues.splice(index, 1);
        onChange(updatedValues);
    };

    return (
        <Component
            items={values}
            handleInputChange={handleInputChange}
            addItem={addItem}
            removeItem={removeItem}
        />
    );
}
