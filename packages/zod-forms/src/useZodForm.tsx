import React, {ReactElement, useEffect, useRef} from 'react';
import {
    z,
    ZodArray,
    ZodBoolean,
    ZodEnum,
    ZodNumber,
    ZodObject,
    ZodOptional,
    ZodString,
    ZodType,
} from 'zod';
import {createEmitter} from './utils/emitter';
import {DataSymbol, EmittersSymbol, EmitterSymbol} from './symbols';
import {get, set} from 'wild-wild-path';
import {ArrayInputPropsType, StringInputPropsType} from './types/AllFieldTypes';
import {
    ContextType,
    FormEmittersType,
    RootFieldsType,
    ZodFieldArrayType,
    ZodFormFieldType,
} from './types/CoreTypes';
import {StringInput} from './inputs/StringInput';
import {NumberInput} from './inputs/NumberInput';
import {BooleanInput} from './inputs/BooleanInput';
import {EnumInput} from './inputs/EnumInput';
import {DeepPartial} from './types/DeepPartial';
import {ArrayInput} from './inputs/ArrayInput';

export function createEmitterChain<SCHEMA_TYPE extends ZodObject<any>>(
    emitters: FormEmittersType<SCHEMA_TYPE>,
    path: [string, ...string[]],
) {
    let node: FormEmittersType<any> = emitters as any;

    for (const key of path.slice(0, -1)) {
        if (!(key in node)) {
            node[key] = {};
        }

        if (key in node && !(EmitterSymbol in node[key]!)) {
            (node[key] as any)[EmitterSymbol] = createEmitter();
        }

        node = node[key]!;
    }

    (node as any)[path[path.length - 1]] = createEmitter();
}

export function getMemoizedLeaf<
    SCHEMA_TYPE extends ZodObject<any>,
    SCHEMA extends ZodType,
>(
    context: ContextType<SCHEMA_TYPE>,
    path: [string, ...string[]],
    InputComponent: (props: {
        context: ContextType<SCHEMA_TYPE>;
        leafPath: [string, ...string[]];
        component: any;
    }) => ReactElement,
) {
    const leaf = get(context.elementCache, path);

    if (!leaf) {
        const components = {
            Input: (props: StringInputPropsType) => {
                const stableComponent = useRef(
                    'children' in props ? props.children : props.component,
                ).current;

                return (
                    <InputComponent
                        context={context}
                        leafPath={path}
                        component={stableComponent}
                    />
                );
            },
        };

        set(context.elementCache, path, components, {
            mutate: true,
        });

        createEmitterChain(context.emitters, path);

        return components as ZodFormFieldType<SCHEMA>;
    } else {
        return leaf as ZodFormFieldType<SCHEMA>;
    }
}

export function getArrayMemoizedLeaf<
    SCHEMA_TYPE extends ZodObject<any>,
    SCHEMA extends ZodType,
>(
    context: ContextType<SCHEMA_TYPE>,
    path: [string, ...string[]],
    schema: any,
    InputComponent: (props: {
        context: ContextType<SCHEMA_TYPE>;
        leafPath: [string, ...string[]];
        component: any;
    }) => ReactElement,
) {
    const leaf = get(context.elementCache, path);

    if (!leaf) {
        const components = {
            Inputs: (props: ArrayInputPropsType<any>) => {
                const stableComponent = useRef(
                    'children' in props ? props.children : props.component,
                ).current;

                const formKey = schema._def.type instanceof ZodString ? { item: getMemoizedLeaf(context, [...path, "item"], StringInput)} : { item: getMemoizedLeaf(context, [...path, "item"], NumberInput) };

                console.log(schema._def.type)
                //console.log(path)
                console.log(formKey)

                return (
                    <InputComponent
                        context={context}
                        leafPath={path}
                        component={stableComponent}
                    />
                );
            },
        };

        set(context.elementCache, path, components, {
            mutate: true,
        });

        createEmitterChain(context.emitters, path);

        return components as ZodFormFieldType<SCHEMA>;
    } else {
        return leaf as ZodFormFieldType<SCHEMA>;
    }
}

export function formNode<
    SCHEMA_TYPE extends ZodObject<any>,
    SCHEMA extends ZodType,
>(
    context: ContextType<SCHEMA_TYPE>,
    schema: SCHEMA,
    path: [string, ...string[]],
): ZodFormFieldType<SCHEMA> {
    console.log(schema)
    if (schema instanceof ZodOptional) {
        return formNode(
            context,
            schema.unwrap(),
            path,
        ) as ZodFormFieldType<SCHEMA>;
    } else if (schema instanceof ZodString) {
        return getMemoizedLeaf(context, path, StringInput);
    } else if (schema instanceof ZodNumber) {
        return getMemoizedLeaf(context, path, NumberInput);
    } else if (schema instanceof ZodBoolean) {
        return getMemoizedLeaf(context, path, BooleanInput);
    } else if (schema instanceof ZodEnum) {
        return getMemoizedLeaf(context, path, EnumInput);
    } else if (schema instanceof ZodArray) {
        return getArrayMemoizedLeaf(context, path, schema, ArrayInput);
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
    key: string = ""
): RootFieldsType<SCHEMA_TYPE> {
    console.log(new Proxy({} as unknown as RootFieldsType<SCHEMA_TYPE>, {
        get(target, key) {
            console.log(key)
            if (typeof key === 'symbol') {
                if (key === DataSymbol) {
                    return context.data;
                } else if (key === EmittersSymbol) {
                    return context.emitters;
                } else {
                    throw new Error('symbol not recognized.');
                }
            }
            return formNode(context, schema.shape[key], [...path, key] as any);
        },
    }))
    return new Proxy({} as unknown as RootFieldsType<SCHEMA_TYPE>, {
        get(target, key) {
            console.log(key)
            if (typeof key === 'symbol') {
                if (key === DataSymbol) {
                    return context.data;
                } else if (key === EmittersSymbol) {
                    return context.emitters;
                } else {
                    throw new Error('symbol not recognized.');
                }
            }

            return formNode(context, schema.shape[key], [...path, key] as any);
        },
    });
}

export const useZodForm = <SCHEMA_TYPE extends ZodObject<any>>(
    schema: SCHEMA_TYPE,
    options: {
        initialData?:
            | DeepPartial<z.infer<SCHEMA_TYPE>>
            | (() => DeepPartial<z.infer<SCHEMA_TYPE>>);
    } = {},
): {
    form: RootFieldsType<SCHEMA_TYPE>;
} => {
    const context = useRef<ContextType<SCHEMA_TYPE>>({
        elementCache: {},
        emitters: {},
        data:
            options?.initialData instanceof Function
                ? options.initialData()
                : options?.initialData ?? ({} as any),
        schema: schema,
    }).current;

    useEffect(() => {
        context.emitters[EmitterSymbol] = createEmitter();
    }, [context]);

    return useRef({
        form: formRoot(context, schema, []),
    }).current;
};
