export function createEmitter() {
    const listeners = new Set<() => void>();

    return {
        addListener: (listener: () => void) => {
            listeners.add(listener);
        },
        removeListener: (listener: () => void) => {
            listeners.delete(listener);
        },
        emit: () => {
            listeners.forEach((listener) => {
                listener();
            });
        },
    };
}

export type Emitter = ReturnType<typeof createEmitter>;
