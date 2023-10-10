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
    certifications: z.array(
        z.object({
            institution: z.string(),
            program: z.string(),
            completion_year: z.number(),
        }),
    ),
    children_names: z.string().array(),
    children_ages: z.number().array(),
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
                        onChange={(e) => onChange(e.target.value)}>
                        {schema.shape.favoriteColor.options.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                )}
            </form.favoriteColor.Input>

            <div>
                Children Names
                <form.children_names.Input>
                    {({items, onChange, addItem, removeItem}) => (
                        <div>
                            {items.map(
                                (children_name: string, index: number) => (
                                    <div key={index}>
                                        <input
                                            type="text"
                                            value={children_name}
                                            onChange={(e) => {
                                                const updatedValue = [...items];
                                                updatedValue[index] =
                                                    e.target.value;
                                                onChange(updatedValue);
                                            }}
                                        />
                                        <button
                                            onClick={() => removeItem(index)}>
                                            Remove
                                        </button>
                                    </div>
                                ),
                            )}
                            <button onClick={addItem}>Add Field</button>
                        </div>
                    )}
                </form.children_names.Input>
            </div>

            <div>
                Certifications
                <form.certifications.Input>
                    {({items, onChange, addItem, removeItem}) => (
                        <div>
                            {items.map((certification, index) => (
                                <div key={index}>
                                    <input
                                        type="text"
                                        placeholder="Institution"
                                        value={certification?.institution}
                                        onChange={(e) => {
                                            const updatedValue = [...items];
                                            updatedValue[index] = {
                                                ...certification,
                                                institution: e.target.value,
                                            };
                                            onChange(updatedValue);
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Program"
                                        value={certification?.program}
                                        onChange={(e) => {
                                            const updatedValue = [...items];
                                            updatedValue[index] = {
                                                ...certification,
                                                program: e.target.value,
                                            };
                                            onChange(updatedValue);
                                        }}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Completion Year"
                                        value={certification?.completion_year}
                                        onChange={(e) => {
                                            const updatedValue = [...items];
                                            updatedValue[index] = {
                                                ...certification,
                                                completion_year:
                                                    parseInt(e.target.value) ||
                                                    0,
                                            };
                                            onChange(updatedValue);
                                        }}
                                    />
                                    <button onClick={() => removeItem(index)}>
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button onClick={addItem}>Add Field</button>
                        </div>
                    )}
                </form.certifications.Input>
            </div>

            <div>
                Children Ages
                <form.children_ages.Input>
                    {({items: children_ages, onChange, addItem, removeItem}) => (
                        <div>
                            {children_ages.map(
                                (children_age: string, index: number) => (
                                    <div key={index}>
                                        <input
                                            type="number"
                                            value={children_age}
                                            onChange={(e) => {
                                                const updatedValue = [...children_ages];
                                                updatedValue[index] =
                                                    parseInt(e.target.value);
                                                onChange(updatedValue);
                                            }}
                                        />
                                        <button
                                            onClick={() => removeItem(index)}>
                                            Remove
                                        </button>
                                    </div>
                                ),
                            )}
                            <button onClick={addItem}>Add Field</button>
                        </div>
                    )}
                </form.children_ages.Input>
            </div>
        </>
    );
}

function App() {
    return <MainForm />;
}

export default App;
