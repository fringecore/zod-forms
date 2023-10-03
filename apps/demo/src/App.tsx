import z from 'zod';
import {useFormData, useZodForm} from 'zod-forms';

const schema = z.object({
    name: z.object({
        first: z.string(),
        middle: z.string().optional(),
        last: z.string(),
    }),
    address: z.string(),
});

function MainForm() {
    const {form} = useZodForm(schema);
    const data = useFormData(form);

    return (
        <>
            <pre>
                <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
            <form.name.first.Input>
                {({value, onChange}) => {
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
            </form.name.first.Input>

            <form.name.first.Input>
                {({value, onChange}) => {
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
            </form.name.first.Input>
        </>
    );
}

function App() {
    return <MainForm />;
}

export default App;
