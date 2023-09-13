import React, { ReactElement, ReactNode } from 'react';
import {
    ZodObject,
    ZodType,
    z,
    ZodString,
    ZodNumber,
    ZodEnum,
    ZodArray,
    ZodDiscriminatedUnion,
    ZodRawShape,
} from 'zod';
import { ZodBoolean } from 'zod';

export interface BooleanFieldPropsType {
    children: (props: {
        value: boolean;
        onChange: (value: boolean) => void;
    }) => ReactElement;
}

export interface TerminateFieldType<INPUT_PROPS> {
    Input: React.FC<INPUT_PROPS>;
}

export type FormFieldsType<SCHEMA_TYPE extends ZodObject<any>> = {
    [key in keyof SCHEMA_TYPE['shape']]: SCHEMA_TYPE['shape'][key] extends never
    ? never
    : SCHEMA_TYPE['shape'][key] extends ZodEnum<infer ENUM_ITEM_SCHEMA>
    ? TerminateFieldType<BooleanFieldPropsType>
    : SCHEMA_TYPE['shape'][key] extends ZodNumber
    ? TerminateFieldType<BooleanFieldPropsType>
    : SCHEMA_TYPE['shape'][key] extends ZodString
    ? TerminateFieldType<BooleanFieldPropsType>
    : SCHEMA_TYPE['shape'][key] extends ZodBoolean
    ? TerminateFieldType<BooleanFieldPropsType>
    : SCHEMA_TYPE['shape'][key] extends ZodObject<
        infer SUB_OBJECT_SCHEMA extends ZodRawShape
    >
    ? FormFieldsType<SCHEMA_TYPE['shape'][key]>
    : SCHEMA_TYPE['shape'][key] extends ZodArray<infer ARRAY_SCHEMA>
    ? TerminateFieldType<BooleanFieldPropsType>
    : SCHEMA_TYPE['shape'][key] extends ZodDiscriminatedUnion<
        infer DISCRIMINATOR,
        infer OPTIONS
    >
    ? TerminateFieldType<BooleanFieldPropsType>
    : never;
};

interface InputProps {
    children: ReactNode;
}

interface NestedFieldStructure {
    [key: string]: {
        Input: React.FC<InputProps>;
        fields?: NestedFieldStructure;
    };
}

type FormProps = {
    children: (fieldName: string) => React.ReactNode;
};

const createFormStructure = <T extends ZodObject<any>>(schema: T): {
    Form: {
        fields: FormFieldsType<T>;
    };
} => {
    type FieldKey = keyof T["shape"];

    const createFields = (schema: ZodObject<any>) => {
        const fields: any = {};

        for (const key in schema.shape) {
            if (schema.shape.hasOwnProperty(key)) {
                const fieldSchema = schema.shape[key] as ZodType<any>;
                if (fieldSchema instanceof ZodObject) {
                    fields[key] = {
                        Fields: createFields(fieldSchema),
                    };
                } else if (fieldSchema instanceof ZodArray) {
                    if (key === "rolls") {
                        fields[key] = {
                            Input: ({
                                children,
                            }: {
                                children: (props: {
                                    items: Array<any>;
                                    addItems: () => void;
                                }) => React.ReactNode;
                            }) => {
                                return children({ items: [], addItems: () => { } });
                            },
                        };
                    } else {
                        fields[key] = {
                            Items: {
                                Input: ({ children }: InputProps, index: number) => (
                                    <div key={index}>{children}</div>
                                ),
                            },
                        };
                    }
                } else {
                    fields[key] = {
                        Input: ({ children }: InputProps) => <div>{children}</div>,
                    };
                }
            }
        }

        return fields/* as Record<
        FieldKey,
        { Input: React.FC<InputProps> }
      >;*/
    };

    return {
        Form: {
            fields: createFields(schema),
        },
    };
};

export const useZodForm = <SCHEMA_TYPE extends ZodObject<any>>(
    schema: SCHEMA_TYPE,
): {
    fields: FormFieldsType<SCHEMA_TYPE>;
    FormComponent: React.FC<FormProps>;
} => {

    return {
        fields: createFormStructure(schema).Form.fields, //as Record<FieldKey, { Input: React.FC<InputProps> }>,

        FormComponent: ({ children }: FormProps) => (
            <form>
                {Object.keys(schema.shape).map((fieldName) => children(fieldName))}
            </form>
        ),
    };
};
