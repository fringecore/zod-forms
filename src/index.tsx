import React from 'react';
import {demoSchema} from './DemoSchema';
import {useZodForm} from './useZodForm';

export function TestComponent() {
    const {Form} = useZodForm(demoSchema);

    return (
        <div>
            <Form.Fields.name.Input>
                <input placeholder="Your Name" />
            </Form.Fields.name.Input>
        </div>
    );
}
