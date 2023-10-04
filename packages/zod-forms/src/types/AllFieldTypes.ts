import { ReactElement } from "react";

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
        value?: boolean;
        onChange: (value: boolean) => void;
    }) => ReactElement;
}

export interface EnumFieldPropsType<T extends string> {
    options: T[];
    children: (props: {
        value: T;
        onChange: (value: T) => void;
    }) => ReactElement;
}
