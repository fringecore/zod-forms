import {useZodForm} from '../../../packages/zod-forms/src';
import z from 'zod';

const schema = z.object({
    name: z.string(),
    address: z.object({
        is_permanent: z.boolean(),
    }),
});

function App() {
    const {form} = useZodForm(schema);

    return (
        <>
            {/*<form.fields.address.is_permanent.Input>
                {({value, onChange}: {value: boolean, onChange: (value: boolean) => void}) => {
                    return (
                        <div onClick={() => onChange(!value)}>
                            {value ? <>✅</> : <>☐</>}
                        </div>
                    );
                }}
            </form.fields.address.is_permanent.Input>*/}
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
        </>
    );
}

export default App;
