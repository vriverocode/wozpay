import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.js'],
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls,
            },
        }),
        quasar({
            sassVariables: fileURLToPath(
                new URL('./resources/js/src/plugins/quasar/quasar-variables.sass', import.meta.url)
            )
        }),
        AutoImport({
            eslintrc: {
              enabled: true,
              filepath: './.eslintrc-auto-import.json',
            },
            imports: ['vue', 'vue-router', 'quasar'],
            vueTemplate: true,
        }),
    ],
    resolve: {
        alias: {
            '@/': __dirname + '/resources/js/src/',
            'vue': 'vue/dist/vue.esm-bundler.js'
        },
    },
    define: {
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
    },
    server: {
        // Respond to all network requests
        host: "10.10.10.69",
        port: 8021,
        strictPort: true,
        // Defines the origin of the generated asset URLs during development, this must be set to the
        // Vite dev server URL and selected port. In general, `process.env.DDEV_PRIMARY_URL` will give
        // us the primary URL of the DDEV project, e.g. "https://test-vite.ddev.site". But since DDEV
        // can be configured to use another port (via `router_https_port`), the output can also be
        // "https://test-vite.ddev.site:1234". Therefore we need to strip a port number like ":1234"
        // before adding Vites port to achieve the desired output of "https://test-vite.ddev.site:5173".

        // 👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇👇
        // Configure CORS securely for the Vite dev server to allow requests from *.ddev.site domains,
        // supports additional hostnames (via regex). If you use another `project_tld`, adjust this.
        cors: { origin: /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|10\.10\.10\.69|192\.168\.31\.20|192\.168\.1\.229|192\.168\.1\.183|192\.168\.1\.198|\[::1\])(?::\d+)?$/ },
    },
});
