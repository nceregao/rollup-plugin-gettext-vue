const glob = require("glob");
const fs = require("fs");

const { GettextExtractor } =  require('gettext-extractor');
const pluralForm = require('plural-forms');

const decorateExtractorWithPlurals = require('./dist/decorateExtractorWithPlurals.js');
const callExpressionWithLiteral = require('./dist/callExpressionWithLiteral.js');
const decorateJsParserWithReplacer = require('./dist/decorateJsParserWithReplacer.js');
const config = require('./dist/config.js');


const extractor = decorateExtractorWithPlurals(new GettextExtractor());
const jsParser = extractor.createJsParser(config.optionsArray.map((el)=>{
    return callExpressionWithLiteral(el.calleeNames, el.extractorOptions);
}));
const vueParser = decorateJsParserWithReplacer(jsParser);


const languageFiles = 'en';
const output = 'locale/messages.pot';
const pattern = './example/**/*.@(js|vue)';


for (let fileName of glob.sync(pattern)) {
    vueParser.parseSourceFile(fs.readFileSync(fileName).toString(), fileName);
}


let npluralsFiles = pluralForm.getNPlurals(languageFiles);
let headers = {
    "Plural-Forms": pluralForm.getPluralFormsHeader(languageFiles),
    "Language": languageFiles
};

extractor.savePotFile(output, headers, npluralsFiles);
extractor.printStats();