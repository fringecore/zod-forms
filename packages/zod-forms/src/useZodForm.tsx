import React, {ReactElement} from 'react';
import {
    ZodObject,
    ZodType,
    ZodString,
    ZodNumber,
    ZodEnum,
    ZodArray,
    ZodDiscriminatedUnion,
    ZodRawShape,
    ZodBoolean,
} from 'zod';

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

export interface ArrayFieldPropsType {
    children: (props: {
        items: Array<any>;
        addItems: () => void;
    }) => React.ReactNode;
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
        ? TerminateFieldType<ArrayFieldPropsType>
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
            if (key === 'ZodString') {
                return {
                    Input: ({children}: StringFieldPropsType) => {
                        return children({value: '', onChange: (value) => {}});
                    },
                };
            } else if (key === 'ZodNumber') {
                return {
                    Input: ({children}: NumberFieldPropsType) => {
                        return children({value: 0, onChange: (value) => {}});
                    },
                };
            } else if (key === 'ZodBoolean') {
                return {
                    Input: ({children}: BooleanFieldPropsType) => {
                        return children({
                            value: false,
                            onChange: (value) => {},
                        });
                    },
                };
            } else if (key === 'ZodArray') {
                return {
                    Input: ({children}: ArrayFieldPropsType) => {
                        return children({items: [], addItems: () => {}});
                    },
                };
            } else if (key === 'ZodEnum') {
                return {
                    Input: ({children}: any) => {
                        return children({
                            value:
                                EnumFieldPropsType.BooleanFieldPropsType |
                                EnumFieldPropsType.NumberFieldPropsType |
                                EnumFieldPropsType.StringFieldPropsType,
                            onChange: (value: any) => {},
                        });
                    },
                };
            }

            return {};
        },
    },
);

/*const createFormStructure = <SCHEMA_TYPE extends ZodObject<any>>(
    schema: SCHEMA_TYPE,
): {
    form: {
        fields: FormFieldsType<SCHEMA_TYPE>;
    };
} => {
    type FieldKey = keyof SCHEMA_TYPE['shape'];

    const createFields = (schema: ZodObject<any>) => {
        const fields: any = {};

        for (const key in schema.shape) {
            if (schema.shape.hasOwnProperty(key)) {
                const fieldSchema = schema.shape[key] as ZodType<any>;
                const fieldSchemaType = (fieldSchema._def as any).typeName;
                const fieldProps = fieldPropsProxy[fieldSchemaType];

                if (Object.keys(fieldProps).length !== 0) {
                    fields[key] = fieldProps;
                } else if (
                    Object.keys(fieldProps).length === 0 &&
                    fieldSchema instanceof ZodObject
                ) {
                    fields[key] = createFields(fieldSchema);
                } else {
                /*else {
                    fields[key] = {
                        Items: {
                            Input: ({children}: any, index: number) => (
                                <div key={index}>{children}</div>
                            ),
                        },
                    };
                }//
                    fields[key] = {
                        Input: ({children}: any) => <>{children}</>,
                    };
                }
            }
        }

        return fields;
    };

    return {
        form: {
            fields: createFields(schema),
        },
    };
};*/

const memoCache = new WeakMap<ZodObject<any>, any>();

const createFormStructure = <SCHEMA_TYPE extends ZodObject<any>>(
    schema: SCHEMA_TYPE,
): {form: {fields: FormFieldsType<SCHEMA_TYPE>}} => {
    if (memoCache.has(schema)) {
        return memoCache.get(schema);
    }

    const fields: any = {};

    for (const key in schema.shape) {
        if (schema.shape.hasOwnProperty(key)) {
            const fieldSchema = schema.shape[key] as ZodType<any>;
            const fieldSchemaType = (fieldSchema._def as any).typeName;
            const fieldProps = fieldPropsProxy[fieldSchemaType];

            if (Object.keys(fieldProps).length !== 0) {
                fields[key] = fieldProps;
            } else if (fieldSchema instanceof ZodObject) {
                fields[key] = createFormStructure(fieldSchema).form.fields;
            } else {
                fields[key] = {
                    Input: ({children}: any) => <>{children}</>,
                };
            }
        }
    }

    const result = {
        form: {
            fields,
        },
    };

    memoCache.set(schema, result);

    return result;
};

export const useZodForm = <SCHEMA_TYPE extends ZodObject<any>>(
    schema: SCHEMA_TYPE,
): {
    form: {
        fields: FormFieldsType<SCHEMA_TYPE>;
    };
} => {
    return {
        form: {
            fields: createFormStructure(schema).form.fields,
        },
    };
};
