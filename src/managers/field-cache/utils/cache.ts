export function cache<T>(fn: () => Promise<T>): () => Promise<T> {
    let value: Promise<T>;

    return async function cache() {
        if (value) {
            return value;
        }

        value = fn();
        return value;
    };
}