import React, {useEffect, useRef} from 'react';
import {
    ZodBoolean,
    ZodNumber,
    ZodObject,
    ZodOptional,
    ZodString,
    ZodType,
} from 'zod';
import {createEmitter} from './utils/emitter';
import {DataSymbol, EmittersSymbol, EmitterSymbol} from './symbols';
import {get, set} from 'wild-wild-path';
import {
    BooleanFieldPropsType,
    NumberFieldPropsType,
    StringFieldPropsType,
} from './types/AllFieldTypes';
import {ContextType, RootFieldsType, ZodFormFieldType} from './types/CoreTypes';
import {StringInput} from './inputs/StringInput';
import {NumberInput} from './inputs/NumberInput';
import {BooleanInput} from './inputs/BooleanInput';

export function formNode<
    SCHEMA_TYPE extends ZodObject<any>,
    SCHEMA extends ZodType,
>(
    context: ContextType<SCHEMA_TYPE>,
    schema: SCHEMA,
    path: string[],
): ZodFormFieldType<SCHEMA> {
    if (schema instanceof ZodOptional) {
        return formNode(
            context,
            schema.unwrap(),
            path,
        ) as ZodFormFieldType<SCHEMA>;
    } else if (schema instanceof ZodString) {
        const leafPath = path;
        const leaf = get(context.elementCache, leafPath);

        if (!leaf) {
            const components = {
                Input: ({
                    children: component,
                }: {
                    children: StringFieldPropsType['children'];
                }) => {
                    const stableComponent = useRef(component).current;

                    return (
                        <StringInput
                            context={context}
                            leafPath={leafPath}
                            component={stableComponent}
                        />
                    );
                },
            };

            set(context.elementCache, leafPath, components, {
                mutate: true,
            });

            set(context.emitters, leafPath, createEmitter(), {
                mutate: true,
            });

            return components as ZodFormFieldType<SCHEMA>;
        } else {
            return leaf as ZodFormFieldType<SCHEMA>;
        }
    } else if (schema instanceof ZodNumber) {
        const leafPath = path;
        const leaf = get(context.elementCache, leafPath);
        if (!leaf) {
            const components = {
                Input: ({
                    children: component,
                }: {
                    children: NumberFieldPropsType['children'];
                }) => {
                    const stableComponent = useRef(component).current;
                    return (
                        <NumberInput
                            context={context}
                            leafPath={leafPath}
                            component={stableComponent}
                        />
                    );
                },
            };
            set(context.elementCache, leafPath, components, {
                mutate: true,
            });
            set(context.emitters, leafPath, createEmitter(), {
                mutate: true,
            });
            return components as ZodFormFieldType<SCHEMA>;
        } else {
            return leaf as ZodFormFieldType<SCHEMA>;
        }
    } else if (schema instanceof ZodBoolean) {
        const leafPath = path;
        const leaf = get(context.elementCache, leafPath);
        if (!leaf) {
            const components = {
                Input: ({
                    children: component,
                }: {
                    children: BooleanFieldPropsType['children'];
                }) => {
                    const stableComponent = useRef(component).current;
                    return (
                        <BooleanInput
                            context={context}
                            leafPath={leafPath}
                            component={stableComponent}
                        />
                    );
                },
            };
            set(context.elementCache, leafPath, components, {
                mutate: true,
            });
            set(context.emitters, leafPath, createEmitter(), {
                mutate: true,
            });
            return components as ZodFormFieldType<SCHEMA>;
        } else {
            return leaf as ZodFormFieldType<SCHEMA>;
        }
    } else if (schema instanceof ZodObject) {
        return new Proxy({} as unknown as ZodFormFieldType<SCHEMA>, {
            get(target, key: string) {
                return formNode(context, schema.shape[key], [...path, key]);
            },
        });
    } else {
        throw new Error('not implemented yet');
    }
}

export function formRoot<SCHEMA_TYPE extends ZodObject<any>>(
    context: ContextType<SCHEMA_TYPE>,
    schema: SCHEMA_TYPE,
    path: string[],
): RootFieldsType<SCHEMA_TYPE> {
    return new Proxy({} as unknown as RootFieldsType<SCHEMA_TYPE>, {
        get(target, key) {
            if (typeof key === 'symbol') {
                if (key === DataSymbol) {
                    return context.data;
                } else if (key === EmittersSymbol) {
                    return context.emitters;
                } else {
                    throw new Error('symbol not recognized.');
                }
            }

            return formNode(context, schema.shape[key], [...path, key]);
        },
    });
}

export const useZodForm = <SCHEMA_TYPE extends ZodObject<any>>(
    schema: SCHEMA_TYPE,
): {
    form: RootFieldsType<SCHEMA_TYPE>;
} => {
    const context = useRef<ContextType<SCHEMA_TYPE>>({
        elementCache: {},
        emitters: {},
        data: {} as any,
    }).current;

    useEffect(() => {
        context.emitters[EmitterSymbol] = createEmitter();
    }, [context]);

    return useRef({
        form: formRoot(context, schema, []),
    }).current;
};
