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
            
            
            
            /*var entry = ProjectManager.getSelectedItem() || DocumentManager.getCurrentDocument().file,
                contents = //If .getText() is depricated we will have to read the file - entry.read(callback)
                    DocumentManager.getCurrentDocument().getText(),
                fileInfo = FileProxy.getTestFileInfo(entry, contents),
                includes = FileProxy.parseIncludes(fileInfo.contents, fileInfo.originalPath, new Date().getTime()),
                useCodeCoverage = false,
                data = {
                    filename : entry.name,
                    jasmineTest : "jasmine-test",
                    title : 'Jasmine test - ' + entry.name,
                    includes : includes,
                    contents : DocumentManager.getCurrentDocument().getText(),
                    coverage : useCodeCoverage ? "<script src='jasmine.blanket.js'></script>" : ""
                },
                htmlFile = data.contents.match(/define\(/) ?
                        "jasmine_requirejs.html" :
                        "jasmine.html",
                apiFilePath = contents.match(/require\('\.\/[A-Za-z0-9\-]+\.js/);
            
            
            
            $.when(
                FileProxy.createDirectory(fileInfo.testPath)
            ).then(function () {
                var dfd = new $.Deferred();
                if (apiFilePath) {
                    dfd.then(FileProxy.copyFile(fileInfo.originalPath + apiFilePath, fileInfo.testPath));
                }
                dfd.resolve();
                return dfd.promise();
            }).then(function () {
                return $.when(
                  
                    FileProxy.copyFile("text!templates/jasmine/" + htmlFile, fileInfo.testPath, data),
                    FileProxy.copyFile("text!templates/jasmine/jasmine.css", fileInfo.testPath),
                    FileProxy.copyFile("text!templates/jasmine/jquery.js", fileInfo.testPath),
                    FileProxy.copyFile("text!templates/jasmine/jasmine.js", fileInfo.testPath),
                    FileProxy.copyFile("text!templates/jasmine/jasmineCompleteReporter.js", fileInfo.testPath),
                    FileProxy.copyFile("text!templates/jasmine/jasmine-html.js", fileInfo.testPath),
                    FileProxy.copyFile("text!templates/jasmine/jasmine.blanket.js", fileInfo.testPath),
                    FileProxy.copyFile("text!node/node_modules/jasmine-node/node_modules/requirejs/require.js", fileInfo.testPath)

                ).promise();
                
            }).done(function () {
                var urlToReport = fileInfo.testPath + "/" + htmlFile + (useCodeCoverage ? "?coverage=true" : "");
                MyStatusBar.setReportWindow(urlToReport);
            });*/
            
            
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

        function loadProcessDomain() {
            var path = ExtensionUtils.getModulePath(module, "node/ProcessDomain");
            var loadPromise = nodeConnection.loadDomains([path], true);
            loadPromise.fail(function () {
                console.log("[brackets-xunit] failed to load process domain");
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

        $(nodeConnection).on("process.stdout", function (event, result) {
            var pid = result.pid,
                data = result.data;
            data = data.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');
            if (_windows.hasOwnProperty(pid) === false) {
                showError("Process Error", "there is no window with pid=" + pid);
            } else {
                var _window = _windows[pid].window,
                    _time = _windows[pid].startTime,
                    elapsed = new Date() - _time;
                _window.document.getElementById("stdout-section").style.display = "block";
                _window.document.getElementById("stdout").innerHTML += data;
                _window.document.getElementById("time").innerHTML = formatTime(elapsed);
            }
        });

        $(nodeConnection).on("process.stderr", function (event, result) {
            var pid = result.pid,
                data = result.data;
            data = data.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');
            if (_windows.hasOwnProperty(pid) === false) {
                showError("Process Error", "there is no window with pid=" + pid);
            } else {
                var _window = _windows[pid].window,
                    _time = _windows[pid].startTime,
                    elapsed = new Date() - _time;
                _window.document.getElementById("stderr-section").style.display = "block";
                _window.document.getElementById("stderr").innerHTML += data;
                _window.document.getElementById("time").innerHTML = formatTime(elapsed);
            }
        });

        $(nodeConnection).on("process.exit", function (event, result) {
            var pid = result.pid,
                data = result.data;
            data = data.replace(/\n/g, '<br>');
            if (_windows.hasOwnProperty(pid) === false) {
                showError("Process Error", "there is no window with pid=" + pid);
            } else {
                var _window = _windows[pid].window,
                    _time = _windows[pid].startTime,
                    elapsed = new Date() - _time,
                    code = result.exitcode;
                _window.document.getElementById("stdout-section").style.display = "block";
                _window.document.getElementById("stdout").innerHTML += data;
                _window.document.getElementById("exitcode").innerHTML = "finished with exit code " + code;
                _window.document.getElementById("time").innerHTML = formatTime(elapsed);
            }
        });
        chain(connect, loadJasmineDomain, loadProcessDomain);
    }());
    
    exports.run = run;
});