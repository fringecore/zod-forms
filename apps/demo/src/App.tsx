import z from 'zod';
import {useFormData, useZodForm} from 'zod-forms';
import {useSetFormData} from 'zod-forms';

const schema = z.object({
    name: z.object({
        first: z.string(),
        middle: z.string().optional(),
        last: z.string(),
    }),
    address: z.string(),
    tomato: z.enum(['yes', 'no'] as const),
    age: z.number(),
    isStudent: z.boolean(),
    favoriteColor: z.enum(['red', 'blue', 'green']),
});

function MainForm() {
    const {form} = useZodForm(schema, {
        initialData: {
            name: {
                first: 'John',
                last: 'Doe',
            },
            isStudent: true,
        },
    });

    const data = useFormData(form);
    const setFormData = useSetFormData(form);

    return (
        <>
            <pre>
                <code>{JSON.stringify(data, null, 2)}</code>
            </pre>

            <div>
                <button
                    onClick={() =>
                        setFormData({
                            name: {
                                first: 'Jane',
                                middle: 'Pattrick',
                            },
                        })
                    }>
                    CHANGE
                </button>
            </div>

            <div>
                MIDDLE
                <form.name.middle.Input
                    component={({value, onChange}) => {
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
                />
            </div>

            <div>
                FIRST
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
            </div>

            <div>
                AGE
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
            </div>

            <div>
                IS STUDENT
                <form.isStudent.Input>
                    {({value, onChange}) => {
                        return (
                            <input
                                className={'border-2 m-4'}
                                type="checkbox"
                                checked={value}
                                onChange={(ev) => {
                                    onChange(ev.target.checked);
                                }}
                            />
                        );
                    }}
                </form.isStudent.Input>
            </div>

            <form.favoriteColor.Input>
                {({value, onChange}) => (
                    <select
                        value={value}
                        onChange={(e) =>
                            onChange(e.target.value)
                        }>
                        {schema.shape.favoriteColor.options.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                )}
            </form.favoriteColor.Input>
        </>
    );
}

function App() {
    return <MainForm />;
}

export default App;
