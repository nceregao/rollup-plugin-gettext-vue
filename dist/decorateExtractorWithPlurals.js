const fs = require("fs");
const pofile = require("pofile");
const validate_1 = require("gettext-extractor/dist/utils/validate");

module.exports = function (extractor) {

    extractor.getPotString = function(headers = {}, nplurals) {
        validate_1.Validate.optional.object({ headers });
        let po = new pofile();
        po.items = this.getPofileItems(nplurals);
        po.headers = Object.assign({ 'Content-Type': 'text/plain; charset=UTF-8' }, headers);
        return po.toString();
    }

    extractor.savePotFile = function(fileName, headers, nplurals) {
        validate_1.Validate.required.nonEmptyString({ fileName });
        validate_1.Validate.optional.object({ headers });
        fs.writeFileSync(fileName, this.getPotString(headers, nplurals));
    }

    extractor.savePotFileAsync = function(fileName, headers, nplurals) {
        validate_1.Validate.required.nonEmptyString({ fileName });
        validate_1.Validate.optional.object({ headers });
        return new Promise((resolve, reject) => {
            fs.writeFile(fileName, this.getPotString(headers, nplurals), (error) => {
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
    }

    extractor.getPofileItems = function(nplurals) {
        return this.getMessages().map(message => {
            let item = new pofile.Item({nplurals: nplurals});
            item.msgid = message.text;
            item.msgid_plural = message.textPlural;
            item.msgctxt = message.context;
            item.references = message.references.map(r => { return r.replace(process.cwd(), '.') }).sort((a, b) => a.localeCompare(b));
            item.extractedComments = message.comments;
            return item;
        });
    }

    return extractor;
}
