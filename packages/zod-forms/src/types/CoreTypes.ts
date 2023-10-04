import React from 'react';
import {
    z,
    ZodBoolean,
    ZodEnum,
    ZodNumber,
    ZodObject,
    ZodOptional,
    ZodString,
    ZodType,
} from 'zod';
import {DataSymbol, EmittersSymbol, EmitterSymbolType} from '../symbols';
import {DeepPartial} from './DeepPartial';
import {
    BooleanInputPropsType,
    EnumInputPropsType,
    NumberInputPropsType,
    StringInputPropsType,
} from './AllFieldTypes';

import {Emitter} from '../utils/emitter';

export interface TerminateFieldType<INPUT_PROPS> {
    Input: React.FC<INPUT_PROPS>;
}

export interface RootSymbolFields<SCHEMA_TYPE extends ZodObject<any>> {
    [EmittersSymbol]: FormEmittersType<SCHEMA_TYPE>;
    [DataSymbol]: DeepPartial<z.infer<SCHEMA_TYPE>>;
}

export type ZodFormFieldType<SCHEMA_TYPE extends ZodType> =
    SCHEMA_TYPE extends ZodOptional<infer InnerShape>
        ? ZodFormFieldType<InnerShape>
        : SCHEMA_TYPE extends ZodObject<any>
        ? {
              [key in keyof SCHEMA_TYPE['shape']]: ZodFormFieldType<
                  SCHEMA_TYPE['shape'][key]
              >;
          }
        : SCHEMA_TYPE extends ZodString
        ? TerminateFieldType<StringInputPropsType>
        : SCHEMA_TYPE extends ZodEnum<[string, ...string[]]>
        ? TerminateFieldType<EnumInputPropsType<string>>
        : SCHEMA_TYPE extends ZodNumber
        ? TerminateFieldType<NumberInputPropsType>
        : SCHEMA_TYPE extends ZodBoolean
        ? TerminateFieldType<BooleanInputPropsType>
        : never;

export type RootFieldsType<SCHEMA_TYPE extends ZodObject<any>> =
    RootSymbolFields<SCHEMA_TYPE> & ZodFormFieldType<SCHEMA_TYPE>;

export type FormFieldsCacheType<SCHEMA_TYPE extends ZodObject<any>> = {
    [key in keyof SCHEMA_TYPE['shape']]?: SCHEMA_TYPE['shape'][key] extends never
        ? never
        : SCHEMA_TYPE['shape'][key] extends ZodNumber
        ? TerminateFieldType<NumberInputPropsType>
        : SCHEMA_TYPE['shape'][key] extends ZodString
        ? TerminateFieldType<StringInputPropsType>
        : SCHEMA_TYPE extends ZodEnum<[string, ...string[]]>
        ? TerminateFieldType<EnumInputPropsType<string>>
        : SCHEMA_TYPE['shape'][key] extends ZodBoolean
        ? TerminateFieldType<BooleanInputPropsType>
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
