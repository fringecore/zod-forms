import {useReducer} from 'react';

export function useRerender() {
    const [, rerender] = useReducer((val) => val + 1, 0);
    return rerender;
}
