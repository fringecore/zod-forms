import React, {ReactElement} from 'react';
import {
    ZodObject,
    ZodType,
    z,
    ZodString,
    ZodNumber,
    ZodEnum,
    ZodArray,
    ZodDiscriminatedUnion,
    ZodRawShape,
} from 'zod';
import {ZodBoolean} from 'zod';

export interface BooleanFieldPropsType {
    children: (props: {
        value: boolean;
        onChange: (value: boolean) => void;
    }) => ReactElement;
}

export interface TerminateFieldType<INPUT_PROPS> {
    Input: React.FC<INPUT_PROPS>;
}

export type FormFieldsType<SCHEMA_TYPE extends ZodObject<any>> = {
    [key in keyof SCHEMA_TYPE['shape']]: SCHEMA_TYPE['shape'][key] extends never
        ? never
        : SCHEMA_TYPE['shape'][key] extends ZodEnum<infer ENUM_ITEM_SCHEMA>
        ? TerminateFieldType<BooleanFieldPropsType>
        : SCHEMA_TYPE['shape'][key] extends ZodNumber
        ? TerminateFieldType<BooleanFieldPropsType>
        : SCHEMA_TYPE['shape'][key] extends ZodString
        ? TerminateFieldType<BooleanFieldPropsType>
        : SCHEMA_TYPE['shape'][key] extends ZodBoolean
        ? TerminateFieldType<BooleanFieldPropsType>
        : SCHEMA_TYPE['shape'][key] extends ZodObject<
              infer SUB_OBJECT_SCHEMA extends ZodRawShape
          >
        ? FormFieldsType<SCHEMA_TYPE['shape'][key]>
        : SCHEMA_TYPE['shape'][key] extends ZodArray<infer ARRAY_SCHEMA>
        ? TerminateFieldType<BooleanFieldPropsType>
        : SCHEMA_TYPE['shape'][key] extends ZodDiscriminatedUnion<
              infer DISCRIMINATOR,
              infer OPTIONS
          >
        ? TerminateFieldType<BooleanFieldPropsType>
        : never;
};

export const useZodForm = <SCHEMA_TYPE extends ZodObject<any>>(
    schema: SCHEMA_TYPE,
): {
    fields: FormFieldsType<SCHEMA_TYPE>;
} => {
    return {
        fields: {},
    } as any;
};
