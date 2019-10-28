const { createFilter } = require('rollup-pluginutils');
const { GettextExtractor } =  require('gettext-extractor');
const pluralForm = require('plural-forms');
const pofile = require('pofile');
const { SourceMapGenerator } = require('source-map');

const decorateExtractorWithPlurals = require('./decorateExtractorWithPlurals.js');
const callExpressionWithLiteral = require('./callExpressionWithLiteral.js');
const decorateJsParserWithReplacer = require('./decorateJsParserWithReplacer.js');
const config = require('./config.js');

function gettext( options = {} ) {
    const filter = createFilter( options.include, options.exclude );

    const languageFiles = options.languageFiles || config.defaultLanguage;
    const language = options.language || languageFiles;

    if ( !pluralForm.hasLang(languageFiles) || !pluralForm.hasLang(language) ) {
        console.error('Language "', languageFiles, '" is undefined');
        return {};
    }

    const extractor = decorateExtractorWithPlurals(new GettextExtractor());
    const jsParser = extractor.createJsParser(config.optionsArray.map((el)=>{
        return callExpressionWithLiteral(el.calleeNames, el.extractorOptions);
    }));
    const vueParser = decorateJsParserWithReplacer(jsParser);

    let translationObj = false;

    if ( options.translations ) {
        if ( config.localedirmap[language] == undefined ) {
            console.error( 'Locale dir is not setting' );
            return {};
        }

        if ( !options.translations.endsWith('.po') ) {
            console.error( 'Translations file must by PO format' )
            return {};
        }

        let file = config.localedirmap[language] + options.translations;

        pofile.load(file, function(err, data){
            if ( err ) {
                console.error( `ERROR open ${file}` );
                return false;
            }

            translationObj = data;
        });
    }

    let sourcemap;

    return {
        name: "rollup-plugin-gettext-vue",
        options(bundleOpts) {
            sourcemap = 'sourcemap' in options ?
                options.sourcemap :
                bundleOpts.sourcemap !== false;
        },
        intro() {
            let pluralFunc = pluralForm.getPluralFunc(language);
            let nplurals = pluralForm.getNPlurals(language);
            let results = 'const PLURAL = '+config.calleeFunctions.PLURAL;

            // add glogal functions
            results = results.replace('PLURALFUNC', pluralFunc.toString()).replace('NPLURALS', nplurals);
            config.optionsArray.forEach(function(el){
                results += "\n"+'const '+el.globalName+' = '+el.calleeFuncBody;
            });

            return results;
        },
        transform(code, id) {
            if ( !filter( id ) ) return ;

            vueParser.parseSourceFile(code, id);

            return vueParser.replaceMessageNodes(code, id, translationObj)
                .then(function(source){
                    var map = sourcemap ? new SourceMapGenerator({file: id}) : '';

                    return {
                        code: source,
                        map: map.toString()
                    };
                }).catch(function(err){

                });
        },
        buildEnd(error) {
            if ( options.output ) {
                let npluralsFiles = pluralForm.getNPlurals(languageFiles);
                let headers = {
                    "Plural-Forms": pluralForm.getPluralFormsHeader(languageFiles),
                    "Language": config.localesExt[languageFiles] || languageFiles,
                };
                extractor.savePotFile(options.output, headers, npluralsFiles);
            }

            if ( options.stats ) {
                extractor.printStats();
            }
        }
    };
}

module.exports = gettext;