import z from 'zod';
import {useZodForm} from 'zod-forms';
//import {useEffect} from 'react';

const schema = z.object({
    name: z.object({
        first: z.string(),
        middle: z.string().optional(),
        last: z.string(),
    }),
    address: z.string(),
    age: z.number().min(18).max(150),
    favoriteColor: z.enum(['red', 'blue', 'green']),
    favoriteFoods: z.array(z.string()),
    isAwesome: z.boolean(),
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

function MainForm() {
    const {form} = useZodForm(schema);
    //const {form, getData} = useZodForm(schema);
    //const data = useFormData(form);

    // useEffect(() => {
    // console.log(data.name.first, data.name.middle, data.name.last);
    // }, [data.name]);

    return (
        <>
            {/*<NameForm form={form} />*/}
            <form.age.Input>
                {({value, onChange}) => {
                    console.log(value)
                    return (
                        <input
                            type={'number'}
                            value={value}
                            onChange={(ev) =>
                                onChange(parseInt(ev.target.value))
                            }
                        />
                    );
                }}
            </form.age.Input>
            <form.address.Input>
                {({value, onChange}) => {
                    console.log(value) 
                    return (
                        <input
                            type={'text'}
                            value={value}
                            onChange={(ev) => { onChange(ev.target.value); }}
                        />
                    );
                }}
            </form.address.Input>
        </>
    );
}

function App() {
    return <MainForm />;
}

export default App;
