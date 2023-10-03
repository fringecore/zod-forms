import React, {useCallback, useEffect, useReducer, useRef} from 'react';
import {ZodObject, ZodOptional, ZodString, ZodType} from 'zod';
import {createEmitter, Emitter} from './utils/emitter';
import {DataSymbol, EmittersSymbol, EmitterSymbol} from './symbols';
import {get, set} from 'wild-wild-path';
import {StringFieldPropsType} from './types/AllFieldTypes';
import {ContextType, RootFieldsType, ZodFormFieldType} from './types/CoreTypes';

export function StringInput<SCHEMA_TYPE extends ZodObject<any>>({
    context,
    leafPath,
    component: Component,
}: {
    context: ContextType<SCHEMA_TYPE>;
    leafPath: string[];
    component: StringFieldPropsType['children'];
}) {
    const [, rerender] = useReducer((val) => val + 1, 0);

    useEffect(() => {
        const emitter: Emitter | undefined = get(
            context.emitters,
            leafPath,
        ) as Emitter;
        emitter?.addListener(rerender);

        return () => {
            emitter?.removeListener(rerender);
        };
    }, []);

    const value: string =
        (get(context.data, leafPath) as string | undefined) ?? '';

    const onChange = useCallback((value: string) => {
        set(context.data, leafPath, value, {mutate: true});

        context.emitters[EmitterSymbol]?.emit();

        const leafEmitter = get(context.emitters, leafPath) as
            | Emitter
            | undefined;
        leafEmitter?.emit();
    }, []);

    return <Component value={value} onChange={onChange} />;
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
