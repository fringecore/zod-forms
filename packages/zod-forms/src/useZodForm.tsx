import React, {ReactElement, useEffect, useRef} from 'react';
import {
    z,
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
import {StringInputPropsType} from './types/AllFieldTypes';
import {ContextType, RootFieldsType, ZodFormFieldType} from './types/CoreTypes';
import {StringInput} from './inputs/StringInput';
import {NumberInput} from './inputs/NumberInput';
import {BooleanInput} from './inputs/BooleanInput';
import {DeepPartial} from './types/DeepPartial';

export function getMemoizedLeaf<
    SCHEMA_TYPE extends ZodObject<any>,
    SCHEMA extends ZodType,
>(
    context: ContextType<SCHEMA_TYPE>,
    path: string[],
    InputComponent: (props: {
        context: ContextType<SCHEMA_TYPE>;
        leafPath: string[];
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

        set(context.emitters, path, createEmitter(), {
            mutate: true,
        });

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
    path: string[],
): ZodFormFieldType<SCHEMA> {
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
    }).current;

    useEffect(() => {
        context.emitters[EmitterSymbol] = createEmitter();
    }, [context]);

    return useRef({
        form: formRoot(context, schema, []),
    }).current;
};
