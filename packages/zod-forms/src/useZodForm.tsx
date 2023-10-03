import React, {useCallback, useEffect, useReducer, useRef} from 'react';
import {z, ZodBoolean, ZodNumber, ZodObject, ZodRawShape, ZodString} from 'zod';
import {StringFieldPropsType} from './StringField';
import {NumberFieldPropsType} from './NumberField';
import {BooleanFieldPropsType} from './BooleanField';
import {createEmitter, Emitter} from './emitter';
import {
    DataSymbol,
    DataSymbolType,
    EmittersSymbol,
    EmittersSymbolType,
    EmitterSymbol,
    EmitterSymbolType,
} from './symbols';
import {get, set} from 'wild-wild-path';

export interface TerminateFieldType<INPUT_PROPS> {
    Input: React.FC<INPUT_PROPS>;
}

export type FormFieldsType<SCHEMA_TYPE extends ZodObject<any>> = {
    [key in
        | keyof SCHEMA_TYPE['shape']
        | EmittersSymbolType
        | DataSymbolType]: key extends EmittersSymbolType
        ? FormEmittersType<SCHEMA_TYPE>
        : key extends DataSymbolType
        ? Partial<z.infer<SCHEMA_TYPE>>
        : //
        ///
        // STRING KEYS
        SCHEMA_TYPE['shape'][key] extends ZodNumber
        ? TerminateFieldType<NumberFieldPropsType>
        : SCHEMA_TYPE['shape'][key] extends ZodString
        ? TerminateFieldType<StringFieldPropsType>
        : SCHEMA_TYPE['shape'][key] extends ZodBoolean
        ? TerminateFieldType<BooleanFieldPropsType>
        : SCHEMA_TYPE['shape'][key] extends ZodObject<any>
        ? FormFieldsType<SCHEMA_TYPE['shape'][key]>
        : never;
};

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

export function StringInput({
    emitters,
    leafPath,
    data,
    component: Component,
}: any) {
    const [, rerender] = useReducer((val) => val + 1, 0);

    useEffect(() => {
        const emitter: Emitter | undefined = get(emitters, leafPath) as Emitter;
        emitter?.addListener(rerender);

        return () => {
            emitter?.removeListener(rerender);
        };
    }, []);

    const value: string = (get(data, leafPath) as string | undefined) ?? '';

    const onChange = useCallback((value: string) => {
        set(data, leafPath, value, {mutate: true});

        emitters[EmitterSymbol].emit();

        const leafEmitter = get(emitters, leafPath) as Emitter | undefined;
        leafEmitter?.emit();
    }, []);

    return <Component value={value} onChange={onChange} />;
}

export function formObject<SCHEMA_TYPE extends ZodObject<any>>(
    context: ContextType<SCHEMA_TYPE>,
    schema: SCHEMA_TYPE,
    path: string[],
): FormFieldsType<SCHEMA_TYPE> {
    return new Proxy({} as unknown as FormFieldsType<SCHEMA_TYPE>, {
        get(target, key) {
            if (typeof key === 'symbol') {
                if (key === DataSymbol) {
                    return context.data;
                } else if (key === EmittersSymbol) {
                    return context.emitters;
                } else {
                    return null;
                }
            }

            if (schema.shape[key] instanceof ZodObject) {
                return formObject(context, schema.shape[key], [...path, key]);
            } else if (schema.shape[key] instanceof ZodString) {
                const leafPath = [...path, key];
                const leaf = get(context.elementCache, leafPath);

                if (!leaf) {
                    const components = {
                        Input: ({
                            children: component,
                        }: {
                            children: StringFieldPropsType;
                        }) => {
                            const stableComponent = useRef(component).current;

                            return (
                                <StringInput
                                    component={stableComponent}
                                    emitters={context.emitters}
                                    leafPath={leafPath}
                                    data={context.data}
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

                    return components;
                } else {
                    return leaf;
                }
            }
        },
    });
}

export type ContextType<SCHEMA_TYPE extends ZodObject<any>> = {
    elementCache: FormFieldsCacheType<SCHEMA_TYPE>;
    emitters: FormEmittersType<SCHEMA_TYPE>;
    data: Partial<z.infer<SCHEMA_TYPE>>;
};

export const useZodForm = <SCHEMA_TYPE extends ZodObject<any>>(
    schema: SCHEMA_TYPE,
): {
    form: FormFieldsType<SCHEMA_TYPE>;
} => {
    const context = useRef<ContextType<SCHEMA_TYPE>>({
        elementCache: {},
        emitters: {},
        data: {},
    }).current;

    useEffect(() => {
        context.emitters[EmitterSymbol] = createEmitter();
    }, [context]);

    return useRef({
        form: formObject(context, schema, []),
    }).current;
};

export const useFormData = <SCHEMA extends ZodObject<any>>(
    form: FormFieldsType<SCHEMA>,
): Partial<z.infer<SCHEMA>> => {
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
