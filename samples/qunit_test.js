/* brackets-xunit: qunit */
/*brackets-xunit: includes=qunit_test_js.js* */

test( "My First Test", function() {
    equal( greeting("Adam"), "Hello person called Adam", "Warm and fuzzies" );
});

test( "My Second Test", function() {
    equal( greeting("Bob"), "Hello Error", "Ooops" );
});






