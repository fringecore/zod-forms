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
    z,
    ZodAny,
} from 'zod';
import StringField, {StringFieldPropsType} from './StringField';
import NumberField, {NumberFieldPropsType} from './NumberField';
import BooleanField, {BooleanFieldPropsType} from './BooleanField';

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
                        return <StringField>{children}</StringField>;
                    },
                };
            } else if (key === 'ZodNumber') {
                return {
                    Input: ({children}: NumberFieldPropsType) => {
                        return <NumberField>{children}</NumberField>;
                    },
                };
            } else if (key === 'ZodBoolean') {
                return {
                    Input: ({children}: BooleanFieldPropsType) => {
                        return <BooleanField>{children}</BooleanField>;
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

const fieldDefaults: Record<string, any> = new Proxy(
    {},
    {
        get: (target, key) => {
            if (key === 'ZodString') {
                return ""
            } else if (key === 'ZodNumber') {
                return 0
            } else if (key === 'ZodBoolean') {
                return false
            }

            return null;
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

type FieldSchema = ZodNumber | ZodString | ZodBoolean | ZodObject<any> | ZodArray<ZodAny>;

type DefaultObject<T> = {
  [key in keyof T]: T[key] extends ZodNumber ? number : 
                   T[key] extends ZodString ? string :
                   T[key] extends ZodBoolean ? boolean :
                   T[key] extends ZodObject<any> ? DefaultObject<T[key]['shape']> :
                   T[key] extends ZodArray<any> ? any[] :
                   any;
};

const createDefaultObject = <T extends { [key: string]: FieldSchema }>(schema: z.ZodObject<T>): DefaultObject<T> => {
  const defaultObject: any = {};

  for (const field in schema.shape) {
    if (schema.shape.hasOwnProperty(field)) {
      const fieldSchema = schema.shape[field];

      if (fieldSchema instanceof ZodString) {
        defaultObject[field] = "Default String";
      } else if (fieldSchema instanceof ZodNumber) {
        if ((fieldSchema._def as any)?.rules?.length > 0) {
          const constraints = (fieldSchema._def as any)?.rules;

          for (const rule of constraints) {
            if (rule.type === "refinement") {
              if (rule.refinementType === "min") {
                defaultObject[field] = rule.params.limit;
              } else if (rule.refinementType === "max") {
                defaultObject[field] = rule.params.limit;
              }
            }
          }
        } else {
          defaultObject[field] = 0;
        }
      } else if (fieldSchema instanceof ZodBoolean) {
        defaultObject[field] = false;
      } else if (fieldSchema instanceof ZodObject) {
        defaultObject[field] = createDefaultObject(fieldSchema);
      } else if (fieldSchema instanceof ZodArray) {
        defaultObject[field] = [];
      } else {
        defaultObject[field] = null;
      }
    }
  }

  return defaultObject as DefaultObject<T>;
};

const memoCache = new WeakMap<ZodObject<any>, any>();

const createFormStructure = <SCHEMA_TYPE extends ZodObject<any>>(
    schema: SCHEMA_TYPE,
): {form: FormFieldsType<SCHEMA_TYPE>} => {
    if (memoCache.has(schema)) {
        return memoCache.get(schema);
    }

    const form: any = {};

    for (const key in schema.shape) {
        if (schema.shape.hasOwnProperty(key)) {
            const fieldSchema = schema.shape[key] as ZodType<any>;
            const fieldSchemaType = (fieldSchema._def as any).typeName;
            const fieldProps = fieldPropsProxy[fieldSchemaType];

            if (Object.keys(fieldProps).length !== 0) {
                form[key] = fieldProps;
            } else if (fieldSchema instanceof ZodObject) {
                form[key] = createFormStructure(fieldSchema).form;
            } else {
                form[key] = {
                    Input: ({children}: any) => <>{children}</>,
                };
            }
        }
    }

    const result = {
        form: form,
    };

    memoCache.set(schema, result);

    return result;
};

export const useZodForm = <SCHEMA_TYPE extends ZodObject<any>>(
    schema: SCHEMA_TYPE,
): {
    form: FormFieldsType<SCHEMA_TYPE>;
} => {
    const defaultObject = createDefaultObject(schema);
    console.log(defaultObject);
    
    return {
        form: createFormStructure(schema).form,
    };
};
