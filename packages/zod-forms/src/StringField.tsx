import { ReactElement, useState } from 'react'

export interface StringFieldPropsType {
    children: (props: {
        value: string;
        onChange: (value: string) => void;
    }) => ReactElement;
}

const StringField: React.FC<StringFieldPropsType> = ({ children }) => {
    const [value, setValue] = useState<string>('');

    const handleChange = (newValue: string) => {
        setValue(newValue);
    };

    return children({ value, onChange: handleChange });
};


export default StringField