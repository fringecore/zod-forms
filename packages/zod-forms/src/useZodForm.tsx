import React, {
    useEffect,
    useReducer,
    useRef,
    useState,
} from 'react';
import {
    ZodObject,
    ZodString,
    ZodNumber,
    ZodEnum,
    ZodArray,
    ZodDiscriminatedUnion,
    ZodRawShape,
    ZodBoolean,
    z,
} from 'zod';
import { BooleanFieldPropsType, NumberFieldPropsType, StringFieldPropsType } from './AllFieldTypes';

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
