import {useZodForm} from 'zod-forms';
import z from 'zod';

const schema = z.object({
    address: z.object({
        is_permanent: z.boolean(),
    }),
});

function App() {
    const form = useZodForm(schema);

    return (
        <>
            <form.fields.address.is_permanent.Input>
                {({value, onChange}) => {
                    return (
                        <div onClick={() => onChange(!value)}>
                            {value ? <>✅</> : <>☐</>}
                        </div>
                    );
                }}
            </form.fields.address.is_permanent.Input>
        </>
    );
}

export default App;
