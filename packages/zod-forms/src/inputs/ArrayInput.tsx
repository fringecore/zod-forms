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

    const handleInputChange = useOnChange<ArrayFieldItemType[], any>(
        context.emitters,
        context.data,
        leafPath,
    );

    function onChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        index: number,
        property?: string,
        object?: any,
    ) {
        const updatedValue = [...values];

        if (property) {
            const inputValue =
                e.target.type === 'number'
                    ? isNaN(parseInt(e.target.value))
                        ? 0
                        : parseInt(e.target.value, 10)
                    : e.target.value;
            updatedValue[index] = {
                ...object,
                [property]: inputValue,
            };
            handleInputChange(updatedValue);
        } else {
            const inputValue =
                e.target.type === 'number'
                    ? isNaN(parseInt(e.target.value))
                        ? 0
                        : parseInt(e.target.value, 10)
                    : e.target.value;

            updatedValue[index] = inputValue;

            handleInputChange(updatedValue);
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

        handleInputChange([...values, newItem]);
    };

    const removeItem = (index: number) => {
        const updatedValues = [...values];
        updatedValues.splice(index, 1);
        handleInputChange(updatedValues);
    };

    return (
        <Component
            items={values}
            onChange={onChange}
            addItem={addItem}
            removeItem={removeItem}
        />
    );
}
