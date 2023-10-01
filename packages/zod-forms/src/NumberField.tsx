import {ReactElement, useState} from 'react';

export interface NumberFieldPropsType {
    children: (props: {
        value: number;
        onChange: (value: number) => void;
    }) => ReactElement;
}

const NumberField: React.FC<NumberFieldPropsType> = ({children}) => {
    const [value, setValue] = useState<number>(0);
    const handleChange = (newValue: number) => {
        setValue(newValue);
    };
    return children({value, onChange: handleChange});
};

export default NumberField;
