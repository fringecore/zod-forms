import React from 'react';
import {ReactElement, useState} from 'react';

export interface BooleanFieldPropsType {
    children: (props: {
        value: boolean;
        onChange: (value: boolean) => void;
    }) => ReactElement;
}

const BooleanField: React.FC<BooleanFieldPropsType> = ({children: Children}) => {
    const [value, setValue] = useState<boolean>(false);
    const handleChange = () => {
        setValue(!value);
    };

    return <Children value={value} onChange={handleChange}/>;

};

export default BooleanField;
