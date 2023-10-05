import {ReactElement} from 'react';

export type InputPropsType<COMPONENT_TYPE> =
    | {
          children: COMPONENT_TYPE;
      }
    | {
          component: COMPONENT_TYPE;
      };

export type StringFieldComponentType = (props: {
    value: string;
    onChange: (value: string) => void;
}) => ReactElement;

export type NumberFieldComponentType = (props: {
    value: number;
    onChange: (value: number) => void;
}) => ReactElement;

export type BooleanFieldComponentType = (props: {
    value: boolean;
    onChange: (value: boolean) => void;
}) => ReactElement;

export type EnumFieldComponentType<VALUE extends string> = (props: {
    options: VALUE[];
    value: VALUE;
    onChange: (value: VALUE) => void;
}) => ReactElement;

/*export type ArrayFieldComponentType<VALUE extends any> = (props: {
    values: VALUE[];
    onChange: (values: VALUE[]) => void;
}) => React.ReactElement;*/

export type ArrayFieldComponentType<VALUE extends string | ''> = (props: {
    items: VALUE[];
    addItem: () => void;
    removeItem: (index: number) => void;
    onChange: (values: VALUE[]) => void;
}) => React.ReactElement;

export type StringInputPropsType = InputPropsType<StringFieldComponentType>;
export type NumberInputPropsType = InputPropsType<NumberFieldComponentType>;
export type BooleanInputPropsType = InputPropsType<BooleanFieldComponentType>;
export type EnumInputPropsType<VALUE extends string> = InputPropsType<
    EnumFieldComponentType<VALUE>
>;
export type ArrayInputPropsType<VALUE extends string | ''> = InputPropsType<
    ArrayFieldComponentType<VALUE>
>;
