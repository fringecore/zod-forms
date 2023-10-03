import z from 'zod';
import {useFormData, useZodForm} from 'zod-forms';
import {useState} from 'react';

const schema = z.object({
    name: z.object({
        first: z.string(),
        middle: z.string().optional(),
        last: z.string(),
    }),
    address: z.string(),
});

/*function NameForm({form}: {form: Form<z.infer<typeof schema>>}) {
    return (
        <>
            <form.name.first.Input>
                {(value, onChange) => {
                    return (
                        <input
                            type={'text'}
                            value={value}
                            onChange={(ev) => onChange(ev.target.value)}
                        />
                    );
                }}
            </form.name.first.Input>
            <form.name.middle.Input>
                {(value, onChange) => {
                    return (
                        <input
                            type={'text'}
                            value={value}
                            onChange={(ev) => onChange(ev.target.value)}
                        />
                    );
                }}
            </form.name.middle.Input>
            <form.name.last.Input>
                {(value, onChange) => {
                    return (
                        <input
                            type={'text'}
                            value={value}
                            onChange={(ev) => onChange(ev.target.value)}
                        />
                    );
                }}
            </form.name.last.Input>
        </>
    );
}*/

const FirstNameInput = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) => {
    return (
        <input
            className={'border-2 m-4'}
            type={'text'}
            value={value}
            onChange={(ev) => {
                onChange(ev.target.value);
            }}
        />
    );
};

function MainForm() {
    const {form} = useZodForm(schema);
    const data = useFormData(form);

    const [s, setS] = useState(0);

    return (
        <>
            <pre>{JSON.stringify(data, null, 2)}</pre>
            <button onClick={() => setS((s) => s + 1)}>Click {s}</button>
            <form.name.last.Input>
                {({
                    value,
                    onChange,
                }: {
                    value: string;
                    onChange: (value: string) => void;
                }) => {
                    return (
                        <input
                            className={'border-2 m-4'}
                            type={'text'}
                            value={value}
                            onChange={(ev) => {
                                onChange(ev.target.value);
                            }}
                        />
                    );
                }}
            </form.name.last.Input>
            <form.name.first.Input children={FirstNameInput} />

            {/*<form.name.first.Input>*/}
            {/*    {({value, onChange}) => {*/}
            {/*        return (*/}
            {/*            <input*/}
            {/*                className={'border-2 m-4 border-red-500'}*/}
            {/*                type={'text'}*/}
            {/*                value={value}*/}
            {/*                onChange={(ev) => {*/}
            {/*                    onChange(ev.target.value);*/}
            {/*                }}*/}
            {/*            />*/}
            {/*        );*/}
            {/*    }}*/}
            {/*</form.name.first.Input>*/}

            {/*<form.address.Input>*/}
            {/*    {({value, onChange}) => {*/}
            {/*        return (*/}
            {/*            <input*/}
            {/*                className={'border-2 m-4'}*/}
            {/*                type={'text'}*/}
            {/*                value={value}*/}
            {/*                onChange={(ev) => {*/}
            {/*                    onChange(ev.target.value);*/}
            {/*                }}*/}
            {/*            />*/}
            {/*        );*/}
            {/*    }}*/}
            {/*</form.address.Input>*/}
        </>
    );
}

function App() {
    return <MainForm />;
}

export default App;
