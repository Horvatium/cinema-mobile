// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = defineConfig([
    expoConfig,
    prettier,
    {
        rules: {
            // Pravilo bi označilo axios.create(), ki je uradni način uporabe axiosa
            'import/no-named-as-default-member': 'off',
        },
    },
    {
        ignores: ['dist/*', 'android/*', 'ios/*', '.expo/*'],
    },
]);
