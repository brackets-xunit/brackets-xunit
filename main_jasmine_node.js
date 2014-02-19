/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global brackets, define, $ */
define(function (require, exports, module) {
    'use strict';
    
    var ProjectManager      = brackets.getModule("project/ProjectManager"),
        DocumentManager     = brackets.getModule("document/DocumentManager"),
        FileSystem          = brackets.getModule("filesystem/FileSystem"),
        FileUtils           = brackets.getModule("file/FileUtils"),
        //moduledir           = FileUtils.getNativeModuleDirectoryPath(module),
        Dialogs             = brackets.getModule("widgets/Dialogs"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        MyStatusBar         = require("MyStatusBar"),
        FileProxy           = require("FileProxy"),
        NodeConnection      = brackets.getModule("utils/NodeConnection"),
        _windows            = {},
        moduledir           = FileUtils.getNativeModuleDirectoryPath(module),
        templateFile        = FileSystem.getFileForPath(moduledir + '/templates/jasmine/jasmineNodeReportTemplate.html'),
        reportJasNodeFile   = FileSystem.getFileForPath(moduledir + '/node/reports/jasmineReport.html'),
        nodeConnection,
        run = function () {
            var entry = ProjectManager.getSelectedItem() || DocumentManager.getCurrentDocument().file,
                path = entry.fullPath;
            
            
            
            
            nodeConnection.domains.jasmine.runTest(path)
                .fail(function (err) {
                    console.log("[brackets-jasmine] error running file: " + entry.fullPath + " message: " + err.toString());
                    Dialogs.showModalDialog(
                        Dialogs.DIALOG_ID_ERROR,
                        "Jasmine Error",
                        "The test file contained an error: " + err.toString()
                    );
                });
            
            
            
        };
    
    /* display a modal dialog
     * title: string
     * message: string
     */
    function showError(title, message) {
        Dialogs.showModalDialog(
            Dialogs.DIALOG_ID_ERROR,
            title,
            message
        );
    }

    // converts time in ms to a more readable string format
    // e.g. 1h 10m 30.2s
    function formatTime(ms) {
        var result = "",
            secs = ms / 1000;
        if (secs >= 60 * 60 * 24 * 365) {
            result = (Math.floor(secs / (60 * 60 * 24 * 365))) + "y ";
            secs = secs % (60 * 60 * 24 * 365);
        }
        if (secs >= 60 * 60 * 24) {
            result = (Math.floor(secs / (60 * 60 * 24))) + "d ";
            secs = secs % (60 * 60 * 24);
        }
        if (secs >= 60 * 60) {
            result = result + (Math.floor(secs / (60 * 60))) + "h ";
            secs = secs % (60 * 60);
        }
        if (secs >= 60) {
            result = result + (Math.floor(secs / 60)) + "m ";
            secs = secs % 60;
        }
        if (result === "" || secs > 0) {
            result = result + Math.round(10 * secs) / 10 + "s";
        }
        if (result[result.length - 1] === " ") {
            result = result.substring(0, result.length - 1);
        }
        return result;
    }
            
            
            
            
            
            
            
                        
    (function () {
        nodeConnection = new NodeConnection();
        function connect() {
            var connectionPromise = nodeConnection.connect(true);
            connectionPromise.fail(function () {
                console.error("[brackets-xunit] failed to connect to node");
            });
            return connectionPromise;
        }

        function loadJasmineDomain() {
            var path = ExtensionUtils.getModulePath(module, "node/JasmineDomain");
            var loadPromise = nodeConnection.loadDomains([path], true);
            loadPromise.fail(function () {
                console.log("[brackets-xunit] failed to load jasmine domain");
            });
            return loadPromise;
        }

        // chain: connects multiple function calls together,  the functions must return Deferred objects
        function chain() {
            var functions = Array.prototype.slice.call(arguments, 0);
            if (functions.length > 0) {
                var firstFunction = functions.shift();
                var firstPromise = firstFunction.call();
                firstPromise.done(function () {
                    chain.apply(null, functions);
                });
            }
        }
        $(nodeConnection).on("jasmine.update", function (evt, jsondata) {
            if (jsondata.length > 5 && jsondata.substring(0, 6) === 'Error:') {
                Dialogs.showModalDialog(
                    Dialogs.DIALOG_ID_ERROR,
                    "Jasmine Node Error",
                    jsondata.substring(7)
                );
            } else {
                FileUtils.readAsText(templateFile).done(function (text) {

                    jsondata = jsondata.replace(/'/g, "");

                    var jdata = JSON.parse(jsondata);
                    var totaltime = 0;
                    var i;
                    for (i = 0; i < jdata.length; i++) {
                        totaltime = totaltime + parseFloat(jdata[i].time);
                    }
                    var html = Mustache.render(text, {jsondata: jsondata, time: totaltime});
                    FileUtils.writeText(reportJasNodeFile, html).done(function () {
                        window.open(reportJasNodeFile.fullPath);
                    });
                });
            }
        });

        
        chain(connect, loadJasmineDomain);
    }());
    
    exports.run = run;
});