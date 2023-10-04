export class Emitter {
    private listeners = new Set<() => void>();

    get listenerCount() {
        return this.listeners.size;
    }

    addListener(listener: () => void) {
        this.listeners.add(listener);
    }

    removeListener(listener: () => void) {
        this.listeners.delete(listener);
    }

    emit() {
        this.listeners.forEach((listener) => {
            listener();
        });
    }
}

export function createEmitter() {
    return new Emitter();
}
