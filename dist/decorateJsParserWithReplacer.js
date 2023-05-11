const Promise = require('bluebird');
const validate_1 = require("gettext-extractor/dist/utils/validate");
const parser_1 = require("gettext-extractor/dist/parser");
const ts = require("typescript");
const config = require('./config.js');

module.exports = function (jsParser) {

    jsParser.parseSourceFile = function(source, fileName, options = {}) {
        validate_1.Validate.required.string({ source });
        validate_1.Validate.optional.nonEmptyString({ fileName });
        this.validateParseOptions(options);

        if (!this.extractors.length) {
            throw new Error(`Missing extractor functions. Provide them when creating the parser or dynamically add extractors using 'addExtractor()'`);
        }
        if (options && options.transformSource) {
            source = options.transformSource(source);
        }

        let messages = jsParser.parseSource(source, fileName || Parser.STRING_LITERAL_FILENAME, options);
        for (let message of messages) {
            this.builder.addMessage(message);
        }

        this.stats && this.stats.numberOfParsedFiles++;
        if (messages.length) {
            this.stats && this.stats.numberOfParsedFilesWithMessages++;
        }

        return source;
    };

    jsParser.parseSource = function(source, fileName, options = {}) {
        let sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, options.scriptKind);
        return jsParser.parseNodeSource(sourceFile, sourceFile, options.lineNumberStart || 1);
    };

    jsParser.parseNodeSource = function(node, sourceFile, lineNumberStart){
        let messages = [];
        let addMessageCallback = parser_1.Parser.createAddMessageCallback(messages, sourceFile.fileName, () => {
            let location = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            return lineNumberStart + location.line;
        });
        let replaceCallExpression = function(msg){
            addMessageCallback(msg);
            jsParser.addReplaceMessageNode(msg, node, sourceFile.fileName);
        };
        for (let extractor of jsParser.extractors) {
            extractor(node, sourceFile, replaceCallExpression);
        }
        var results = ts.forEachChild(node, n => {
            messages = messages.concat(jsParser.parseNodeSource(n, sourceFile, lineNumberStart));
        });

        // парсинг и перебор строковых литералов
        if ( node.getStart() > 0 && (ts.isStringLiteral(node) || ts.isRegularExpressionLiteral(node)) ){
            let text = ts.isRegularExpressionLiteral(node) ? node.getText().slice(1) : node.text;
            let srcText = ts.createSourceFile(sourceFile.fileName, text, ts.ScriptTarget.Latest, true);
            let lineNumberStartText = lineNumberStart+ sourceFile.getLineAndCharacterOfPosition(node.getStart()).line;
            ts.forEachChild(srcText, n => {
                messages = messages.concat(jsParser.parseNodeSource(n, srcText, lineNumberStartText));
            });
        }

        return messages;
    }

    jsParser.addReplaceMessageNode = function(message, node, fileName){
        if ( !jsParser.replacements )
            jsParser.replacements = [];

        jsParser.replacements.push({ message, node, fileName });
    };

    jsParser.replaceMessageNodes = function(source, fileName, translationObj){
        if ( !jsParser.replacements ) return Promise.reject();

        return new Promise(function(resolve, reject){
            let resmsg = {};
            let translations = {};

            // transform items to { 'context:text': item }
            translationObj && translationObj.items.forEach(item => {
                translations[(item.msgctxt ? item.msgctxt+':' : '')+item.msgid] = item;
            });

            jsParser.replacements.forEach(function(item){
                if (fileName.replace(/\\/g, '/').indexOf(item.fileName) >= 0) {
                    let replaceItem = getItemToReplace(item.node, item.message, translations);
                    if (!resmsg[replaceItem.srcTxt]) {
                        resmsg[replaceItem.srcTxt] = replaceItem.dstStr;
                    }
                }
            });

            for (let srcTxt in resmsg) {
                let regTxt = new RegExp(srcTxt.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1"), 'g');
                let dstStr = resmsg[srcTxt];
                source = source.replace(regTxt, dstStr);
            }

            resolve(source);
        });
    };

    return jsParser;
};

function getItemToReplace(node, message, translations){
    let poitem = translations[(message.context ? message.context+':' : '')+message.text] || false,
        resultText;

    if ( message.textPlural )
        resultText = resolveNGettext(node, message, poitem);
    else
        resultText = resolveGettext(node, message, poitem);

    return {
        srcTxt: node.getText(),
        dstStr: resultText
    };
}

function resolveGettext(node, message, item){
    let argsNum = message.context ? 1 : 0,
        resultText;

    if (item) {
        let text = (item.nplurals > 1 ? item.msgstr[0] : item.msgstr) || item.msgid;
        let isSingleQuote = node.arguments[argsNum].getText().charCodeAt(0) === 39;
        resultText = ts.getLiteralText(ts.createLiteral(text, isSingleQuote), '', true, false);
    } else {
        resultText = node.arguments[argsNum].getText();
    }

    return resultText;
}

function resolveNGettext(node, message, item){
    let argumentsArray = item ? (item.nplurals > 1 && item.msgstr[0] ? item.msgstr : [item.msgid, item.msgid_plural]) : [];
    let allCallNames = node.expression.getText();
    let callName = !ts.isIdentifier(node.expression) ? node.expression.name.getText() : node.expression.getText();

    if ( !argumentsArray.length )
        return node.getText();

    argumentsArray = argumentsArray.map(function(el){
        return ts.getLiteralText(ts.createStringLiteral(el), '', true, false);
    });

    if ( config.calleeNames.npgettext.indexOf(callName) >= 0 ) {
        argumentsArray.unshift(''); // add content argument for ngettext function
    }

    // for number to call ngettext
    argumentsArray.push( ts.getLastChild(node).getText() );

    return allCallNames + '('+argumentsArray.join(',') + ')';
}
