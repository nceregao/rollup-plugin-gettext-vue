import vue from 'rollup-plugin-vue';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import requireContext from 'rollup-plugin-require-context';
// import gettext from 'rollup-plugin-gettext-vue';
const gettext = require('./dist/index.js'); // если плагин находится не в папке node_modules

const plugins = [
    resolve(),
    commonjs(),
    requireContext(),
    gettext({
        exclude: 'node_modules/**',
        include: '**/*@(vue|js)',
        languageFiles: 'uk',
        language: 'ru',
        translations: 'messages.po',
        stats: true
    }),
    vue({
        template: {
            isProduction: false,
            compilerOptions: { preserveWhitespace: false }
        }
    })
];

export default {
    input: './example/app.js',
    plugins,
    output: {
        globals : { vue: 'Vue' },
        external: ['vue'],
        file: 'example/dist/app.js',
        format: 'iife',
        name: 'WUJS',
    }
};