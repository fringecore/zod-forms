import React from 'react';
import {
    z,
    ZodBoolean,
    ZodNumber,
    ZodObject,
    ZodOptional,
    ZodString,
    ZodType,
} from 'zod';
import {DataSymbol, EmittersSymbol, EmitterSymbolType} from '../symbols';
import {DeepPartial} from './DeepPartial';
import {
    BooleanFieldPropsType,
    NumberFieldPropsType,
    StringFieldPropsType,
} from './AllFieldTypes';
import {Emitter} from '../utils/emitter';

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

export type ContextType<SCHEMA_TYPE extends ZodObject<any>> = {
    elementCache: FormFieldsCacheType<SCHEMA_TYPE>;
    emitters: FormEmittersType<SCHEMA_TYPE>;
    data: DeepPartial<z.infer<SCHEMA_TYPE>>;
};
