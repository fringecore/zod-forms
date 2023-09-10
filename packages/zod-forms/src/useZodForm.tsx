import React, {ReactNode} from 'react';
import {ZodObject, ZodObjectDef, ZodType, z} from 'zod';

interface InputProps {
    children: ReactNode;
}

interface FieldStructure {
    Input: React.FC<InputProps>;
    fields?: NestedFieldStructure;
}

interface NestedFieldStructure {
    [key: string]: FieldStructure;
}

interface FormFields {
    Fields: NestedFieldStructure;
}

type FieldsProps = {
    children: React.ReactNode[];
};

type FormProps = {
    children: (fieldName: string) => React.ReactNode;
};

const createFormStructure = <T extends ZodObject<any>>(schema: T) => {
    type FieldKey = keyof T['shape'];

    const createFields = (schema: ZodObject<any>) => {
        const fields: any = {};

        for (const key in schema.shape) {
            if (schema.shape.hasOwnProperty(key)) {
                const fieldSchema = schema.shape[key] as ZodType<any>;
                if (fieldSchema instanceof ZodObject) {
                    fields[key] = {
                        Fields: createFields(fieldSchema),
                    };
                } else {
                    fields[key] = {
                        Input: ({children}: InputProps) => (
                            <div>{children}</div>
                        ),
                    };
                }
            }
        }

        return fields;
    };

    return {
        Form: {
            Fields: createFields(schema) as Record<
                FieldKey,
                {Input: React.FC<InputProps>}
            >,
        },
    };
};

export const useZodForm = <T extends ZodObject<any>>(demoSchema: T) => {
    type FieldKey = keyof T['shape'];

    return {
        Form: {
            Fields: createFormStructure(demoSchema).Form.Fields, //as Record<FieldKey, { Input: React.FC<InputProps> }>,
        },
        FormComponent: ({children}: FormProps) => (
            <form>
                {Object.keys(demoSchema.shape).map((fieldName) =>
                    children(fieldName),
                )}
            </form>
        ),
    };
};
