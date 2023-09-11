# zod-forms
[![npm version](https://shields.io/npm/v/zod-forms.svg)](https://www.npmjs.com/package/zod-forms)
[![npm downloads](https://shields.io/npm/dm/zod-forms.svg)](https://www.npmjs.com/package/zod-forms)
[![license](https://shields.io/npm/l/zod-forms.svg)](https://www.npmjs.com/package/zod-forms)


Zod Forms is a library for building forms in React using [Zod](https://zod.dev/) for validation.

# Usage
To use `zod-forms` you need to create a form schema using Zod. The schema is a plain object with keys corresponding to the form fields and values corresponding to the validation rules. For example:
```typescript
import z from 'zod';

export const demoSchema = z.object({
    name: z
        .string()
        .nonempty('Name is required')
        .min(2, {message: 'Must be 2 or more characters long'}),
    age: z.number(),
});

```
For more information on Zod validation rules see the [Zod documentation](https://zod.dev/?id=basic-usage).

You can then use the `useZodForm` hook to create a form component.
Here is a simple example:
```typescript jsx
import React from 'react';
import {useZodForm} from 'zod-forms';
import {demoSchema} from './DemoSchema';

export function TestComponent() {
    const {Form} = useZodForm(demoSchema);

    return (
        <div>
            <Form.Fields.name.Input>
                <input placeholder="Your Name" />
            </Form.Fields.name.Input>
            <Form.Fields.age.Input>
                <input placeholder="Your Age" />
            </Form.Fields.age.Input>
        </div>
    );
}
```
