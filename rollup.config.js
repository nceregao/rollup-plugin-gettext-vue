import vue from 'rollup-plugin-vue';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import requireContext from 'rollup-plugin-require-context';
// import gettext from 'rollup-plugin-gettext-vue';
const gettext = require('./dist/index.js'); // если плагин находится не в папке node_modules

var locales = ['uk','ru'];

const plugins = (ln) => [
    resolve(),
    commonjs(),
    requireContext(),
    gettext({
        exclude: 'node_modules/**',
        include: '**/*@(vue|js)',
        languageFiles: 'uk',
        language: ln,
        translations: 'messages.po',
    }),
    vue({
        template: {
            isProduction: false,
            compilerOptions: { preserveWhitespace: false }
        }
    })
];

export default locales.map((ln) => {
    return {
        input: './example/app.js',
        plugins: plugins(ln),
        output: {
            globals : { vue: 'Vue' },
            external: ['vue'],
            file: 'example/dist/app.'+ln+'.js',
            format: 'iife',
            name: 'WUJS',
        }
    }
});
