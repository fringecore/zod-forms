import z from 'zod';
import {useZodForm} from 'zod-forms';
import {useEffect} from 'react';

const schema = z.object({
    name: z.object({
        first: z.string(),
        middle: z.string().optional(),
        last: z.string(),
    }),
    age: z.number().min(18).max(150),
    favoriteColor: z.enum(['red', 'blue', 'green']),
    favoriteFoods: z.array(z.string()),
    isAwesome: z.boolean(),
});

function NameForm() {
    const {from, useFormData} = useZodForm(schema.shape.name);
    const data = useFormData();

    useEffect(() => {
        console.log(data.first);
    }, [data]);

    return (
        <>
            <form.first.Input>
                {(value, onChange) => {
                    return (
                        <input
                            type={'text'}
                            value={value}
                            onChange={(ev) => onChange(ev.target.value)}
                        />
                    );
                }}
            </form.first.Input>
            <form.middle.Input>
                {(value, onChange) => {
                    return (
                        <input
                            type={'text'}
                            value={value}
                            onChange={(ev) => onChange(ev.target.value)}
                        />
                    );
                }}
            </form.middle.Input>
            <form.last.Input>
                {(value, onChange) => {
                    return (
                        <input
                            type={'text'}
                            value={value}
                            onChange={(ev) => onChange(ev.target.value)}
                        />
                    );
                }}
            </form.last.Input>
        </>
    );
}

function MainForm() {
    const {form, useFormData} = useZodForm(schema);
    const data = useFormData();

    useEffect(() => {
        console.log(data.name.first, data.name.middle, data.name.last);
    }, [data.name]);

    return (
        <>
            <NameForm />
            <form.age.Input>
                {(value, onChange) => {
                    return (
                        <input
                            type={'number'}
                            value={value}
                            onChange={(ev) => onChange(ev.target.value)}
                        />
                    );
                }}
            </form.age.Input>
        </>
    );
}

function App() {
    return <MainForm />;
}

export default App;
