import React, {useCallback, useEffect, useReducer, useRef} from 'react';
import {
    z,
    ZodBoolean,
    ZodNumber,
    ZodObject,
    ZodOptional,
    ZodString,
    ZodType,
} from 'zod';
import {createEmitter, Emitter} from './emitter';
import {
    DataSymbol,
    EmittersSymbol,
    EmitterSymbol,
    EmitterSymbolType,
} from './symbols';
import {get, set} from 'wild-wild-path';
import {
    BooleanFieldPropsType,
    NumberFieldPropsType,
    StringFieldPropsType,
} from './AllFieldTypes';
import {DeepPartial} from './types/DeepPartial';

export interface TerminateFieldType<INPUT_PROPS> {
    Input: React.FC<INPUT_PROPS>;
}

export interface RootSymbolFields<SCHEMA_TYPE extends ZodObject<any>> {
    [EmittersSymbol]: FormEmittersType<SCHEMA_TYPE>;
    [DataSymbol]: DeepPartial<z.infer<SCHEMA_TYPE>>;
}

export type ZodFormFieldType<SCHEMA extends ZodType> =
    SCHEMA extends ZodOptional<infer InnerShape>
        ? ZodFormFieldType<InnerShape>
        : SCHEMA extends ZodObject<any>
        ? {
              [key in keyof SCHEMA['shape']]: ZodFormFieldType<
                  SCHEMA['shape'][key]
              >;
          }
        : SCHEMA extends ZodString
        ? TerminateFieldType<StringFieldPropsType>
        : SCHEMA extends ZodNumber
        ? TerminateFieldType<NumberFieldPropsType>
        : SCHEMA extends ZodBoolean
        ? TerminateFieldType<BooleanFieldPropsType>
        : never;

export type RootFieldsType<SCHEMA_TYPE extends ZodObject<any>> =
    RootSymbolFields<SCHEMA_TYPE> & ZodFormFieldType<SCHEMA_TYPE>;

export type FormFieldsCacheType<SCHEMA_TYPE extends ZodObject<any>> = {
    [key in keyof SCHEMA_TYPE['shape']]?: SCHEMA_TYPE['shape'][key] extends never
        ? never
        : SCHEMA_TYPE['shape'][key] extends ZodNumber
        ? TerminateFieldType<NumberFieldPropsType>
        : SCHEMA_TYPE['shape'][key] extends ZodString
        ? TerminateFieldType<StringFieldPropsType>
        : SCHEMA_TYPE['shape'][key] extends ZodBoolean
        ? TerminateFieldType<BooleanFieldPropsType>
        : SCHEMA_TYPE['shape'][key] extends ZodObject<any>
        ? FormFieldsCacheType<SCHEMA_TYPE['shape'][key]>
        : never;
};

export type FormEmittersType<SCHEMA_TYPE extends ZodObject<any>> = {
    [key in
        | keyof SCHEMA_TYPE['shape']
        | EmitterSymbolType]?: key extends EmitterSymbolType
        ? Emitter
        : SCHEMA_TYPE['shape'][key] extends ZodObject<any>
        ? FormEmittersType<SCHEMA_TYPE['shape'][key]>
        : never;
};

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

export type ContextType<SCHEMA_TYPE extends ZodObject<any>> = {
    elementCache: FormFieldsCacheType<SCHEMA_TYPE>;
    emitters: FormEmittersType<SCHEMA_TYPE>;
    data: DeepPartial<z.infer<SCHEMA_TYPE>>;
};

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

export const useFormData = <SCHEMA extends ZodObject<any>>(
    form: RootFieldsType<SCHEMA>,
): DeepPartial<z.infer<SCHEMA>> => {
    const [, rerender] = useReducer((val) => val + 1, 0);

    useEffect(() => {
        const emitter = form[EmittersSymbol][EmitterSymbol];

        emitter?.addListener(() => {
            rerender();
        });

        return () => {
            emitter?.removeListener(rerender);
        };
    }, [rerender]);

    return form[DataSymbol];
};
