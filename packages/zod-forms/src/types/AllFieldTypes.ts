import {ReactElement} from 'react';

export interface EnumFieldPropsType<VALUES extends [string, ...string[]]> {
    children: (props: {
        value: VALUES[number];
        onChange: (value: VALUES[number]) => void;
    }) => ReactElement;
}

export interface StringFieldPropsType {
    children: (props: {
        value: string;
        onChange: (value: string) => void;
    }) => ReactElement;
}

export interface NumberFieldPropsType {
    children: (props: {
        value: number;
        onChange: (value: number) => void;
    }) => ReactElement;
}

export interface BooleanFieldPropsType {
    children: (props: {
        value: boolean;
        onChange: (value: boolean) => void;
    }) => ReactElement;
}
