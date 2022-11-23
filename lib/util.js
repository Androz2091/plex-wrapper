"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseXML = void 0;
var xml2js = require('xml2js');
function parseXML(xmlString) {
    var parser = new xml2js.Parser();
    return new Promise(function (resolve) {
        parser.parseStringPromise(xmlString).then(function (result) {
            resolve(result);
        });
    });
}
exports.parseXML = parseXML;
