import {z, ZodObject} from 'zod';
import {RootFieldsType} from './types/CoreTypes';
import {DeepPartial} from './types/DeepPartial';
import {useCallback} from 'react';
import {DataSymbol, EmittersSymbol, EmitterSymbol} from './symbols';
import {recursiveEmit} from './utils/recursiveEmit';

export const useSetFormData = <SCHEMA extends ZodObject<any>>(
    form: RootFieldsType<SCHEMA>,
) => {
    return useCallback(
        (
            data:
                | DeepPartial<z.infer<SCHEMA>>
                | ((
                      data: DeepPartial<z.infer<SCHEMA>>,
                  ) => DeepPartial<z.infer<SCHEMA>>),
        ) => {
            const dataObject = form[DataSymbol];

            Object.assign(
                dataObject,
                data instanceof Function ? data(dataObject) : data,
            );

            recursiveEmit(form[EmittersSymbol]);
        },
        [form],
    );
};
