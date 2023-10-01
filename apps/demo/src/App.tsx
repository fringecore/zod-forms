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

function NameForm({form}: {form: Form<z.infer<typeof schema>>}) {
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
}

function MainForm() {
    const {form, getData} = useZodForm(schema);
    const data = useFormData(form);

    useEffect(() => {
        console.log(data.name.first, data.name.middle, data.name.last);
    }, [data.name]);

    return (
        <>
            <NameForm form={form} />
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
