import z from 'zod';
import {useFormData, useZodForm} from 'zod-forms';

const schema = z.object({
    name: z.object({
        first: z.string(),
        middle: z.string().optional(),
        last: z.string(),
    }),
    address: z.string(),
    age: z.number(),
    isStudent: z.boolean(),
    favoriteColor: z.enum(['red', 'blue', 'green']),
});

function MainForm() {
    const {form} = useZodForm(schema);
    const data = useFormData(form);

    return (
        <>
            <pre>
                <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
            <form.name.middle.Input>
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
            </form.name.middle.Input>

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
            <form.age.Input>
                {({value, onChange}) => {
                    return (
                        <input
                            className={'border-2 m-4'}
                            type={'number'}
                            value={value}
                            onChange={(ev) => {
                                onChange(parseInt(ev.target.value));
                            }}
                        />
                    );
                }}
            </form.age.Input>
            <form.isStudent.Input>
                {({value, onChange}) => {
                    return (
                        <input
                            className={'border-2 m-4'}
                            type="checkbox"
                            onChange={() => {
                                onChange(!value);
                            }}
                        />
                    );
                }}
            </form.isStudent.Input>
        </>
    );
}

function App() {
    return <MainForm />;
}

export default App;
