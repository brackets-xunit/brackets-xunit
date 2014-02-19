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
                path = entry.fullPath,
                args = [],
                text = DocumentManager.getCurrentDocument().getText(),
                argsmatch = text.match(/brackets-xunit:\s*args=\S+/),
                argsstr = '',
                argsout = '';

            if (argsmatch !== null && argsmatch.length > 0) {
                argsstr = argsmatch[0].substring(argsmatch[0].indexOf("=") + 1);
                args = argsstr.split(',');
                argsout = '';
                var i;
                for (i = 0; i < args.length; i++) {
                    argsout = argsout + args[i] + " ";
                }
            }
            nodeConnection.domains.process.spawnSession({executable: path, args: args, cacheTime: 100}).done(function (status) {
                var template = require("text!templates/process.html"),
                    html = Mustache.render(template, { path: path, title: "script - " + path, args: argsout}),
                    newWindow = window.open("about:blank", null, "width=600,height=200");
                newWindow.document.write(html);
                newWindow.document.getElementById("exitcode").innerHTML = "running with pid " + status.pid;
                newWindow.focus();
                _windows[status.pid] = {window: newWindow, startTime: new Date(), type: "script"};
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
        chain(connect, loadProcessDomain);
    }());
    
    exports.run = run;
});