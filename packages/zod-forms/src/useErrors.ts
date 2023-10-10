import {ZodError, ZodObject} from 'zod';

export const useErrors = <SCHEMA_TYPE extends ZodObject<any>>(
    schema: SCHEMA_TYPE,
    data: any,
) => {
    try {
        schema.parse(data);
    } catch (error) {
        if (error instanceof ZodError) {
            return error
        } else {
            console.error('Unexpected error:', error);
        }
    }
};
