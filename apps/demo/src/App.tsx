import {useZodForm} from '../../../packages/zod-forms/src';
import z from 'zod';

const schema = z.object({
    name: z.string(),
    address: z.object({
        post_code: z.number(),
        is_permanent: z.boolean(),
    }),
    rolls: z.array(z.any()),
});

function App() {
    const {form} = useZodForm(schema);

    return (
        <>
            <form.fields.address.post_code.Input>
                {({
                    value,
                    onChange,
                }: {
                    value: number;
                    onChange: (value: number) => void;
                }) => {
                    return (
                        <input
                            className="border-2 border-black rounded px-4 py-2"
                            onChange={(e) => {
                                onChange(parseInt(e.target.value));
                                console.log(value);
                            }}
                        />
                    );
                }}
            </form.fields.address.post_code.Input>
            <form.fields.name.Input>
                {({
                    value,
                    onChange,
                }: {
                    value: string;
                    onChange: (value: string) => void;
                }) => (
                    <input
                        className="border-2 border-black rounded px-4 py-2"
                        onChange={(e) => {
                            onChange(e.target.value);
                            console.log(value);
                        }}
                    />
                )}
            </form.fields.name.Input>
            <form.fields.rolls.Input>
                {({
                    items,
                    addItems,
                }: {
                    items: Array<unknown>;
                    addItems: (item: unknown) => void;
                }) => (
                    <input
                        className="border-2 border-black rounded px-4 py-2"
                        onChange={(e) => {
                            const item = e.target.value.split(', ');
                            items.push(item);
                            console.log(items);
                            addItems(items);
                        }}
                    />
                )}
            </form.fields.rolls.Input>
        </>
    );
}

export default App;
