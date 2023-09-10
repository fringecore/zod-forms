import * as z from 'zod';

export const demoSchema = z.object({
    name: z
        .string()
        .nonempty('Name is required')
        .min(2, {message: 'Must be 2 or more characters long'}),

    age: z.number(),

    address: z.object({
        street: z.string(),
        post_code: z.number(),
    }),

    is_student: z.boolean(),

    email: z.string().email(),
});
