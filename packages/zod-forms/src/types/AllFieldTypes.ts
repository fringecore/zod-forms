import {ReactElement} from 'react';

export type StringFieldComponentType = (props: {
    value: string;
    onChange: (value: string) => void;
}) => ReactElement;

export type StringFieldPropsType =
    | {
          children: StringFieldComponentType;
      }
    | {
          component: StringFieldComponentType;
      };

export type NumberFieldComponentType = (props: {
    value: number;
    onChange: (value: number) => void;
}) => ReactElement;

export type NumberFieldPropsType =
    | {
          children: NumberFieldComponentType;
      }
    | {
          component: NumberFieldComponentType;
      };

export type BooleanFieldComponentType = (props: {
    value?: boolean;
    onChange: (value: boolean) => void;
}) => ReactElement;

export type BooleanFieldPropsType =
    | {
          children: BooleanFieldComponentType;
      }
    | {
          component: BooleanFieldComponentType;
      };

export type EnumFieldComponentType<VALUES extends [string, ...string[]]> =
    (props: {
        options: VALUES;
        value: VALUES[number];
        onChange: (value: VALUES[number]) => void;
    }) => ReactElement;

export type EnumFieldPropsType<VALUES extends [string, ...string[]]> =
    | {
          children: EnumFieldComponentType<VALUES>;
      }
    | {
          component: EnumFieldComponentType<VALUES>;
      };
