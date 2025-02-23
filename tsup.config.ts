import { defineConfig } from 'tsup';

export default defineConfig({
    clean: true,
    target: 'es2022',
    treeshake: true,
    minify: true,
});
