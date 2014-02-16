/* brackets-xunit: qunit */
var expectation = ["SpecHelper.js*","src/Player.js","src/Song.js"];
function parseString (input) {
    //var output = input.match(/\*(?:[^*]|\*+[^*/])*\*+/);
    var commentedArea = [];
    var one = input.match(/\*(?:[^*]|\*+[^*/])*\*+/gm) || [];
    var two = input.match(/\/\/[\s\w\.\ \:\*\-\=\,]*/g) || [];
    commentedArea = one.concat(two);
    var output = [];
    for(var i=0; i < commentedArea.length; i++) {
        var myString = commentedArea[i].substr(1,commentedArea[i].length-2).trim();
        if (myString && myString.match(/brackets-xunit:\s*includes=/)) {
            var includestr = myString.match(/brackets-xunit:\s*includes=[A-Za-z0-9,\ \._\-\/\*]*/gm)[0];
            includestr = includestr.substring(includestr.indexOf('=') + 1);
            var arrItems = includestr.split(',');
            for(var j=0; j < arrItems.length; j++) {
                arrItems[j] = arrItems[j].trim();
                if (arrItems[j][0] === '*') {
                    arrItems[j] = arrItems[j].replace('*','').trim();
                }
                output.push(arrItems[j]);
            }
        }
        
    }
    return output;
    //var output = input.match(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm);
    //var output = input.match(/\/\*[\w\'\s\r\n\*]*\*\/)|(\/\/[\w\s\']*)/;
    console.log(output);
    
    
    return [];
}
test("Style 1", function() {
    deepEqual(parseString(" \
 // There will be an extension below \
 // brackets-xunit: includes= SpecHelper.js*,src/Player.js,src/Song.js \
 // did that work?"),expectation);
});

test("Style 2", function() {
    
    deepEqual(parseString(" \
 /* There will be an extension below */ \
 /* brackets-xunit: includes= SpecHelper.js*,src/Player.js,src/Song.js */ \
 /* did that work? */"),expectation);
});

test("Style 3", function() {
    deepEqual(parseString(" \
/* There will be an extension below */      \
/*                                          \
brackets-xunit: includes= SpecHelper.js*,   \
                          src/Player.js,    \
                          src/Song.js       \
*/                                          \
/* did that work? */"),expectation);
});
test("Style 4", function() {
    deepEqual(parseString(" \
/* There will be an extension below */      \
/*                                          \
* brackets-xunit: includes= SpecHelper.js*, \
*                          src/Player.js,   \
*                          src/Song.js      \
*/                                          \
/* did that work? */"),expectation);
});

