const defaultLanguage = 'en';

const LOCALES_EXT = {
    'en': 'en_US',
    'ru': 'ru_UA',
    'uk': 'uk_UA',
    'uz': 'uz_UZ',
    'kz': 'kk_UZ',
    'pl': 'pl_PL',
};

const LOCALEDIRMAP = {
    'en': 'locale/en_US/LC_MESSAGES/',
    'ru': 'locale/ru_UA/LC_MESSAGES/',
    'uk': 'locale/uk_UA/LC_MESSAGES/',
    'uz': 'locale/uz_UZ/LC_MESSAGES/',
    'kz': 'locale/kk_KZ/LC_MESSAGES/',
    'pl': 'locale/pl_PL/LC_MESSAGES/',
};

const calleeNames = {
    gettext: ['_','$gettext','[this].$gettext'],
    pgettext: ['$pgettext','[this].$pgettext'],
    ngettext: ['$ngettext','[this].$ngettext'],
    npgettext: ['$npgettext', '[this].$npgettext']
};

const calleeFunctions = {
    // NPLURALS: 2,
    // PLURALFUNC: function pluralsFunc(n, args){
    //     return args[+ (n !== 1)];
    // },
    PLURAL: function(){
        var pluralfunc = PLURALFUNC, nplurals = NPLURALS || 2;
        return (pluralfunc)(arguments[nplurals], Array.prototype.slice.call(arguments,0, nplurals));
    },
    gettext: function(text){ return text; },
    pgettext: function(context, text){ return text; },
    ngettext: function(){ return PLURAL.apply( PLURAL, arguments ); },
    npgettext: function(context){ return PLURAL.apply( PLURAL, Array.prototype.slice.call( arguments, 1 ) ); }
};

const extractorOptions = {
    gettext: {
        arguments: {
            text: 0
        },
        // comments: {
        //     regex: false,
        //     otherLineLeading: false,
        //     sameLineLeading: false,
        //     sameLineTrailing: true,
        // },
        // content: {
        //    trimWhiteSpace: true,
        //    preserveIndentation: true,
        //    replaceNewLines: true,
        // }
    },
    pgettext: {
        arguments: {
            context: 0,
            text: 1,
        }
    },
    ngettext: {
        arguments: {
            text: 0,
            textPlural: 1,
        }
    },
    npgettext: {
        arguments: {
            context: 0,
            text: 1,
            textPlural: 2,
        }
    },
};

const optionsArray = [{
    globalName: 'gettext',
    calleeNames: calleeNames.gettext,
    calleeFuncBody: calleeFunctions.gettext,
    extractorOptions: extractorOptions.gettext,
},{
    globalName: 'pgettext',
    calleeNames: calleeNames.pgettext,
    calleeFuncBody:  calleeFunctions.pgettext,
    extractorOptions: extractorOptions.pgettext,
},{
    globalName: 'ngettext',
    calleeNames: calleeNames.ngettext,
    calleeFuncBody: calleeFunctions.ngettext,
    extractorOptions: extractorOptions.ngettext,
},{
    globalName: 'npgettext',
    calleeNames: calleeNames.npgettext,
    calleeFuncBody: calleeFunctions.npgettext,
    extractorOptions: extractorOptions.npgettext,
}];

module.exports = {
    defaultLanguage: defaultLanguage,
    localesExt: LOCALES_EXT,
    localedirmap: LOCALEDIRMAP,
    optionsArray: optionsArray,
    calleeNames: calleeNames,
    calleeFunctions: calleeFunctions,
    extractorOptions: extractorOptions,
}