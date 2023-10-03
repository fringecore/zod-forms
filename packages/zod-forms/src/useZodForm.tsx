import React, {
    ReactElement,
    useEffect,
    useReducer,
    useRef,
    useState,
} from 'react';
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
                return '';
            } else if (key === 'ZodNumber') {
                return 0;
            } else if (key === 'ZodBoolean') {
                return false;
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

type FieldSchema =
    | ZodNumber
    | ZodString
    | ZodBoolean
    | ZodObject<any>
    | ZodArray<ZodAny>;

type DefaultObject<T> = {
    [key in keyof T]: T[key] extends ZodNumber
        ? number
        : T[key] extends ZodString
        ? string
        : T[key] extends ZodBoolean
        ? boolean
        : T[key] extends ZodObject<any>
        ? DefaultObject<T[key]['shape']>
        : T[key] extends ZodArray<any>
        ? any[]
        : any;
};

const createDefaultObject = <T extends {[key: string]: FieldSchema}>(
    form: any,
): DefaultObject<T> => {
    const defaultObject: any = {};

    for (const field in form) {
        if (form.hasOwnProperty(field)) {
            const fieldSchema = form[field];

            console.log(fieldSchema.Input);

            if (fieldSchema.Input) {
                const fieldFunction = `${fieldSchema.Input}`;

                if (fieldFunction.includes('StringField')) {
                    defaultObject[field] = 'Default String';
                } else if (fieldFunction.includes('NumberField')) {
                    if ((fieldSchema._def as any)?.rules?.length > 0) {
                        const constraints = (fieldSchema._def as any)?.rules;
                        for (const rule of constraints) {
                            if (rule.type === 'refinement') {
                                if (rule.refinementType === 'min') {
                                    defaultObject[field] = rule.params.limit;
                                } else if (rule.refinementType === 'max') {
                                    defaultObject[field] = rule.params.limit;
                                }
                            }
                        }
                    } else {
                        defaultObject[field] = 0;
                    }
                } else if (fieldFunction.includes('BooleanField')) {
                    defaultObject[field] = false;
                }
            } else if (
                !fieldSchema.Input &&
                Object.keys(fieldSchema).length !== 0
            ) {
                defaultObject[field] = createDefaultObject(fieldSchema);
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

export function createEmitter() {
    const listeners = new Set<() => void>();

    return {
        addListener: (listener: () => void) => {
            listeners.add(listener);
        },
        removeListener: (listener: () => void) => {
            listeners.delete(listener);
        },
        emit: () => {
            listeners.forEach((listener) => {
                listener();
            });
        },
    };
}

export type Emitter = ReturnType<typeof createEmitter>;

export const EmitterSymbol = Symbol('EMITTER');
export const DataSymbol = Symbol('DATA');

export function StringInput({
    emitters,
    leafPath,
    data,
    component: Component,
}: any) {
    const [, rerender] = useReducer((val) => val + 1, 0);

    useEffect(() => {
        console.log('called');
        const listenerPairs: [Emitter, () => void][] = [];

        if (!emitters[EmitterSymbol]) {
            emitters[EmitterSymbol] = createEmitter();
        }

        emitters[EmitterSymbol].addListener(rerender);

        listenerPairs.push([emitters[EmitterSymbol], rerender]);

        let lastNode = emitters;

        for (const key of leafPath) {
            if (!lastNode[key]) {
                lastNode[key] = {};
            }

            if (!lastNode[key][EmitterSymbol]) {
                lastNode[key][EmitterSymbol] = createEmitter();
            }

            lastNode[key][EmitterSymbol].addListener(rerender);

            listenerPairs.push([lastNode[key][EmitterSymbol], rerender]);

            lastNode = lastNode[key];
        }

        return () => {
            for (const [emitter, listener] of listenerPairs) {
                emitter.removeListener(listener);
            }
        };
    }, []);

    const value = (() => {
        let subData: any = data;

        for (const key of leafPath) {
            const targetSubdata = subData[key];

            if (targetSubdata === undefined) {
                break;
            } else if (typeof targetSubdata === 'string') {
                return targetSubdata;
            } else {
                subData = targetSubdata;
            }
        }

        return '';
    })();

    const onChange = (value: string) => {
        // WRITE DATA TO DATA OBJECT
        let lastObject: any = data;

        for (const key of leafPath.slice(0, -1)) {
            if (!lastObject[key]) {
                lastObject[key] = {};
            }

            lastObject = lastObject[key];
        }

        lastObject[leafPath[leafPath.length - 1]] = value;

        // TRIGGER ALL EMITTERS IN PARENT NODES (optionally create emitters)
        emitters[EmitterSymbol].emit();

        let lastNode = emitters;

        for (const key of leafPath) {
            lastNode[key][EmitterSymbol].emit();
            lastNode = lastNode[key];
        }
    };

    return <Component value={value} onChange={onChange} />;
}

export function formObject<SCHEMA extends ZodObject<any>>(
    elementCache: any,
    emitters: any,
    data: Partial<z.infer<SCHEMA>>,
    schema: SCHEMA,
    path: string[],
): FormFieldsType<SCHEMA> {
    return new Proxy(
        {},
        {
            get(
                target,
                key: string | typeof DataSymbol | typeof EmitterSymbol,
            ) {
                if (key === DataSymbol) {
                    return data;
                } else if (key === EmitterSymbol) {
                    return emitters;
                }

                if (schema.shape[key] instanceof ZodObject) {
                    return formObject(
                        elementCache,
                        emitters,
                        data,
                        schema.shape[key],
                        [...path, key],
                    );
                } else if (schema.shape[key] instanceof ZodString) {
                    const leafPath = [...path, key];

                    let lastNode = elementCache;

                    for (const key of leafPath) {
                        if (!lastNode[key]) {
                            lastNode[key] = {};
                        }

                        lastNode = lastNode[key];
                    }

                    if (!lastNode.Input) {
                        lastNode.Input = ({children: component}: any) => {
                            const stableComponent = useRef(component);
                            const stableLeafPath = useRef(leafPath);

                            return (
                                <StringInput
                                    component={stableComponent.current}
                                    emitters={emitters}
                                    leafPath={stableLeafPath.current}
                                    data={data}
                                />
                            );
                        };
                    }

                    return {
                        Input: lastNode.Input,
                    };
                }
            },
        },
    ) as any;
}

export const useZodForm = <SCHEMA_TYPE extends ZodObject<any>>(
    schema: SCHEMA_TYPE,
): {
    form: FormFieldsType<SCHEMA_TYPE>;
} => {
    const [elementCache] = useState({});
    const [emitters] = useState({});
    const [data] = useState({});

    return {
        // form: createFormStructure(schema).form,
        form: formObject(elementCache, emitters, data, schema, []),
    };
};

export const useFormData = <SCHEMA extends ZodObject<any>>(
    form: FormFieldsType<SCHEMA>,
): Partial<z.infer<SCHEMA>> => {
    const [, rerender] = useReducer((val) => val + 1, 0);

    const emitters: any = form[EmitterSymbol as any];

    useEffect(() => {
        emitters[EmitterSymbol].addListener(rerender);

        return () => {
            emitters[EmitterSymbol].removeListener(rerender);
        };
    }, []);

    return form[DataSymbol as any];
};
