import React, { ReactElement } from 'react';
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

export interface StringFieldPropsType {
    children: (props: {
        value: string;
        onChange: (value: string) => void;
    }) => ReactElement;
}

export interface NumberFieldPropsType {
    children: (props: {
        value: number;
        onChange: (value: number) => void;
    }) => ReactElement;
}

export enum EnumFieldPropsType {
    BooleanFieldPropsType,
    StringFieldPropsType,
    NumberFieldPropsType,
}

export interface TerminateFieldType<INPUT_PROPS> {
    Input: React.FC<INPUT_PROPS>;
}

export type FormFieldsType<SCHEMA_TYPE extends ZodObject<any>> = {
    [key in keyof SCHEMA_TYPE['shape']]: SCHEMA_TYPE['shape'][key] extends never
    ? never
    : SCHEMA_TYPE['shape'][key] extends ZodEnum<infer ENUM_ITEM_SCHEMA>
    ? TerminateFieldType<EnumFieldPropsType>
    : SCHEMA_TYPE['shape'][key] extends ZodNumber
    ? TerminateFieldType<NumberFieldPropsType>
    : SCHEMA_TYPE['shape'][key] extends ZodString
    ? TerminateFieldType<StringFieldPropsType>
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

const fieldPropsProxy: Record<string, any> = new Proxy(
    {},
    {
        get: (target, key) => {
            if (key === 'string') {
                return {
                    Input: ({
                        children,
                    }: StringFieldPropsType) => {
                        return children({ value: '', onChange: (value) => { } });
                    },
                };
            } else if (key === 'number') {
                return {
                    Input: ({
                        children,
                    }: NumberFieldPropsType) => {
                        return children({ value: 0, onChange: (value) => { } });
                    },
                };
            } else if (key === 'boolean') {
                return {
                    Input: ({
                        children,
                    }: BooleanFieldPropsType) => {
                        return children({ value: false, onChange: (value) => { } });
                    },
                };
            }

            return {};
        },
    }
);

const createFormStructure = <SCHEMA_TYPE extends ZodObject<any>>(schema: SCHEMA_TYPE): {
    Form: {
        fields: FormFieldsType<SCHEMA_TYPE>;
    };
} => {
    type FieldKey = keyof SCHEMA_TYPE["shape"];

    const createFields = (schema: ZodObject<any>) => {

        const fields: any = {};

        for (const key in schema.shape) {
            if (schema.shape.hasOwnProperty(key)) {

                const fieldSchema = schema.shape[key] as ZodType<any>;
                const fieldSchemaType = typeof fieldSchema._def
                const fieldProps = fieldPropsProxy[fieldSchemaType];

                if (fieldProps) {
                    fields[key] = fieldProps;
                }

                else if (fieldSchema instanceof ZodObject) {
                    fields[key] = {
                        Fields: createFields(fieldSchema),
                    };
                }

                else if (fieldSchema instanceof ZodArray) {
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
                                Input: ({ children }: any, index: number) => (
                                    <div key={index}>{children}</div>
                                ),
                            },
                        };
                    }
                }

                else {
                    fields[key] = {
                        Input: ({ children }: any) => <>{children}</>,
                    };
                }
            }
        }

        return fields;
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
} => {

    return {
        fields: createFormStructure(schema).Form.fields, //as Record<FieldKey, { Input: React.FC<InputProps> }>,
    };
};
