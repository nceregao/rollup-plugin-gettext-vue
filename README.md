# rollup-plugin-gettext-vue

Is a plugin to translate js, vue files with [`gettext`](http://www.labri.fr/perso/fleury/posts/programming/a-quick-gettext-tutorial.html). It relies on the [`gettext-extractor`](https://github.com/lukasgeiter/gettext-extractor).

## Installation

You must copy folder to ./node_modules/rollup-plugin-gettext-vue

## Configuration rollup config

```javascript
import vue from 'rollup-plugin-vue';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import requireContext from 'rollup-plugin-require-context';
import gettext from 'rollup-plugin-gettext-vue';

const plugins = [
    resolve(),
    commonjs(),
    requireContext(),
    gettext({
        exclude: 'node_modules/**',
        include: '**/*@(vue|js)',
        languageFiles: 'uk',
        output: './locale/messages.pot',
        language: 'ru',
        translations: 'messages.po',
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
```

### Options

`options.include: '**/*@(vue|js)'`

`options.exclude: 'node_modules/**'`

Patterns of files for filter. Both of which can be a minimatch pattern or an array of minimatch patterns. If options.include is omitted or of zero length, files should be included by default; otherwise they should only be included if the ID matches one of the patterns.

`options.languageFiles: 'en'`

Default: 'en'. The source language.

`options.output: string`

Path to pot file with found messages

`options.language: 'uk'`

Translation language. You can use "uk", "ru", "en"

`options.translations: string`

Name of file with translations in po format. The file must be in ./locale/uk_UA/LC_MESSAGES/* .
uk_UA is the name of the folder that will be obtained from short name options.language.


## Configuration rollup with multiple languages

```javascript
import vue from 'rollup-plugin-vue';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import requireContext from 'rollup-plugin-require-context';

const extractor = require('./dist/index.js');

var locales = ['uk','ru'];

const plugins = (ln) => [
    resolve(),
    commonjs(),
    requireContext(),
    extractor({
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
```

## Usage example in js files

```javascript
// formatted strings
const name = _('Mike');
const text = gettext(`Hello ${name}`);

// plurals (works for en locale out of the box)
const n = 5;
const msg = ngettext(`${ n } task left`, `${ n } tasks left`, n);

// context formatted strings
const chelloMike = pgettext('context', `Hello ${name}`);

// context plurals (works for en locale out of the box)
const msg = npgettext('context', `${ n } task left`, `${ n } tasks left`, n);
```

## Basic installation with vue components

For using in vue components files add mixin methods

```javascript
Vue.use(function(Vue){
    Vue.prototype.$gettext = gettext;
    Vue.prototype.$pgettext = pgettext;
    Vue.prototype.$ngettext = ngettext;
    Vue.prototype.$npgettext = npgettext;
});
```

### Usage example in vue components template

```html
<template>
    <div>
        {{_('Test')}}
        <br>
        {{$gettext('Test')}}
        <br>
        {{$pgettext('context', 'Test')}}
        <br>
        {{$ngettext(`${n} test`, `${n} tests`, n)}}
        <br>
        {{$ngettext('context', `${n} test`, `${n} tests`, n)}}
    </div>
</template>
```

### Usage example in vue components options and methods

```javascript
export default
{
    mounted() {
        const text = this.$gettext(`Hello ${name}`);

        // plurals (works for en locale out of the box)
        const n = 5;
        const msg = this.$ngettext(`${ n } task left`, `${ n } tasks left`, n);

        // context formatted strings
        const chelloMike = this.$pgettext('context', `Hello ${name}`);

        // context plurals (works for en locale out of the box)
        const msg = this.$npgettext('context', `${ n } task left`, `${ n } tasks left`, n);
    }
};
```


## Create translations po files

You can use the [`msginit`](https://www.gnu.org/software/gettext/manual/html_node/msginit-Invocation.html) program to create and merge po files.

Create po file

```bash
msginit --input=messages.pot --no-translator --locale=uk_UA --output-file=uk_UA/LC_MESSAGES/translations.po
```

Merge po file

```bash
msgmerge -o "uk_UA/LC_MESSAGES/translations.po" "uk_UA/LC_MESSAGES/translations.po" "messages.pot"
```


## Configuration aliases

For usage another aliases of name gettext, pgettext, ngettext, npgettext you can add name of alias in file config.js

```javascript
const calleeNames = {
    gettext: ['_','$gettext','[this].$gettext'],
    pgettext: ['$pgettext','[this].$pgettext'],
    ngettext: ['$ngettext','[this].$ngettext'],
    npgettext: ['$npgettext', '[this].$npgettext']
};
```

## Compile info

The gettext, ngettext, pgettext, npgettext functions will be added to the resulting bundle. Function calls gettext and pgettext will be replaced to the translated strings in the resulting bundle.
