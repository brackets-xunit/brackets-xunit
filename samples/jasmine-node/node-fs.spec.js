// generated by xUnit Thu May 16 2013 10:21:56 GMT-0400 (EDT)
// jasmine unit test for FileSysDomain.js
// brackets-xunit: includes=FileSysDomain.js
// brackets-xunit: jasmine-node
/*jslint node: true */
/*global describe, it, expect, readConfig */

var domainapi = require("./node-fs.js"),
    results = "";

describe("test readConfig()", function () {
    "use strict";
    results = domainapi.readConfig();
    it("readConfig() === brackets-xUnit jasmine-node test", function () {
        expect(results).toEqual('brackets-xUnit jasmine-node test');
    });
    
    it("Broken", function () {
        expect(false).toEqual(false);
    });
    

});
