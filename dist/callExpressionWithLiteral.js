const ts = require("typescript");
const validate_1 = require("gettext-extractor/dist/utils/validate");
const content_1 = require("gettext-extractor/dist/utils/content");
const common_1 = require("gettext-extractor/dist/js/extractors/common");
const utils_1 = require("gettext-extractor/dist/js/utils");
const comments_1 = require("gettext-extractor/dist/js/extractors/comments");

module.exports = function (calleeName, options) {
    validate_1.Validate.required.argument({ calleeName });
    let calleeNames = [].concat(calleeName);
    for (let name of calleeNames) {
        if (typeof name !== 'string' || name.length === 0) {
            throw new TypeError(`Argument 'calleeName' must be a non-empty string or an array containing non-empty strings`);
        }
    }
    common_1.validateOptions(options);
    content_1.validateContentOptions(options);
    let contentOptions = {
        trimWhiteSpace: false,
        preserveIndentation: true,
        replaceNewLines: false
    };
    if (options.content) {
        if (options.content.trimWhiteSpace !== undefined) {
            contentOptions.trimWhiteSpace = options.content.trimWhiteSpace;
        }
        if (options.content.preserveIndentation !== undefined) {
            contentOptions.preserveIndentation = options.content.preserveIndentation;
        }
        if (options.content.replaceNewLines !== undefined) {
            contentOptions.replaceNewLines = options.content.replaceNewLines;
        }
    }
    return (node, sourceFile, addMessage) => {
        if (node.kind === ts.SyntaxKind.CallExpression) {
            let callExpression = node;
            let matches = calleeNames.reduce((matchFound, name) => (matchFound || utils_1.JsUtils.calleeNameMatchesCallExpression(name, callExpression)), false);
            if (matches) {
                let message = extractArguments(callExpression, options.arguments, contentOptions);
                if (message) {
                    message.comments = comments_1.JsCommentUtils.extractComments(callExpression, sourceFile, options.comments);
                    addMessage(message);
                }
            }
        }
    };
}

function extractArguments(callExpression, argumentMapping, contentOptions) {
    let callArguments = callExpression.arguments;
    let textArgument = callArguments[argumentMapping.text], textPluralArgument = callArguments[argumentMapping.textPlural], contextArgument = callArguments[argumentMapping.context];

    // for literal
    if ( textArgument && !isTextLiteral(textArgument) )
        textArgument = createStringLiteral(textArgument.getText());

    if ( textPluralArgument && !isTextLiteral(textPluralArgument) )
        textPluralArgument = createStringLiteral(textPluralArgument.getText());

    textArgument = checkAndConcatenateStrings(textArgument);
    textPluralArgument = checkAndConcatenateStrings(textPluralArgument);
    let textPluralValid = typeof argumentMapping.textPlural !== 'number' || isTextLiteral(textPluralArgument);
    if (isTextLiteral(textArgument) && textPluralValid) {
        let message = {
            text: content_1.normalizeContent(textArgument.text, contentOptions)
        };
        if (isTextLiteral(textPluralArgument)) {
            message.textPlural = content_1.normalizeContent(textPluralArgument.text, contentOptions);
        }
        if (isTextLiteral(contextArgument)) {
            message.context = content_1.normalizeContent(contextArgument.text, contentOptions);
        }
        return message;
    }
    return null;
}
function isTextLiteral(expression) {
    return expression && (expression.kind === ts.SyntaxKind.StringLiteral || expression.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral);
}
function isParenthesizedExpression(expression) {
    return expression && expression.kind === ts.SyntaxKind.ParenthesizedExpression;
}
function isBinaryExpression(expression) {
    return expression && expression.kind === ts.SyntaxKind.BinaryExpression;
}
function createStringLiteral(text) {
    const node = ts.createNode(ts.SyntaxKind.StringLiteral, -1, -1);
    node.text = text;
    return node;
}
function getAdditionExpression(expression) {
    while (isParenthesizedExpression(expression)) {
        expression = expression.expression;
    }
    if (isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.PlusToken) {
        return expression;
    }
    return null;
}
function checkAndConcatenateStrings(expression) {
    let addition;
    if (!expression || !(addition = getAdditionExpression(expression))) {
        return expression;
    }
    let concatenated = createStringLiteral('');
    if (processStringAddition(addition, concatenated)) {
        return concatenated;
    }
    return expression;
}
function processStringAddition(expression, concatenated) {
    let addition;
    if (isTextLiteral(expression.left)) {
        concatenated.text += expression.left.text;
    }
    else if (addition = getAdditionExpression(expression.left)) {
        if (!processStringAddition(addition, concatenated)) {
            return false;
        }
    }
    else {
        return false;
    }
    if (isTextLiteral(expression.right)) {
        concatenated.text += expression.right.text;
        return true;
    }
    else if (addition = getAdditionExpression(expression.right)) {
        return processStringAddition(addition, concatenated);
    }
    else {
        return false;
    }
}



function getContextNode(node) {
    if (node.kind === 268 /* JsxAttributes */ && !ts.isJsxSelfClosingElement(node.parent)) {
        return node.parent.parent; // Needs to be the root JsxElement, so it encompasses the attributes _and_ the children (which are essentially part of the attributes)
    }
    return node;
}