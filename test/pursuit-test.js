/*jslint maxlen:140*/
/* global require */
'use strict';

var buster = require('buster'),
    pursuit = require('../lib/pursuit')
;

var assert = buster.assertions.assert;
var refute = buster.assertions.refute;

buster.testCase('Pursuit', {
    'should compile a query language into a JavaScript function': function () {
        assert.isFunction(pursuit({
            test: { equals: 'test' }
        }));
    },

    'should return a function that returns true if no query is given': function () {
        assert.equals(pursuit({}).toString(), 'function anonymous(entry) {\nreturn true\n}');
    },

    'should make Arrays into OR statements': function () {
        assert.equals(
            pursuit([
                [{ bar: { equals: 'baz' }},{ baz: { equals: 'foo' }}],
                { foo: { equals: 'bar' }}
            ]).toString(),
            'function anonymous(entry) {\nreturn ((entry["bar"] === "baz")||(entry["baz"] === "foo"))||(entry["foo"] === "bar")\n}'
        );
    },

    'should be able to check for equality': function () {
        var query = pursuit({
            foo: { equals: 'bar' }
        });

        assert.isTrue(query({'foo': 'bar'}));
        refute.isTrue(query({'foo': 'baz'}));
    },

    'should be able to test for values greater than': function () {
        var query = pursuit({
            foo: { greater: 5 }
        });

        assert.isTrue(query({'foo': 10}));
        assert.isTrue(query({'foo': 5.01}));
        refute.isTrue(query({'foo': 5}));
        refute.isTrue(query({'foo': 4}));
    },

    'should be able to test for values lesser than': function () {
        var query = pursuit({
            foo: { lesser: 5 }
        });

        assert.isTrue(query({'foo': 1}));
        assert.isTrue(query({'foo': 4.99}));
        refute.isTrue(query({'foo': 5}));
        refute.isTrue(query({'foo': 10}));
    },

    'should be able to test if a string contains a specified substring': function () {
        var query = pursuit({
            foo: { contains: 'b' }
        });

        assert.isTrue(query({'foo': 'abc'}));
        assert.isTrue(query({'foo': 'cab'}));
        assert.isTrue(query({'foo': 'bac'}));
        refute.isTrue(query({'foo': 'acd'}));
    },

    'should be able to test if a string starts with a given string': function () {
        var query = pursuit({
            foo: { beginsWith: 'b' }
        });

        var query2 = pursuit({
            foo: { beginsWith: 'zebra' }
        });

        assert.isTrue(query({'foo': 'banana'}));
        assert.isTrue(query({'foo': 'balloons are fun'}));
        assert.isTrue(query({'foo': 'back in the bay area'}));
        assert.isTrue(query2({'foo': 'zebras can handle quite some attention from other zebras.'}));
        refute.isTrue(query({'foo': 'apples are healthy'}));
    }

});

buster.testCase('Claims made in the README.md', {
    'in the usage section': function () {
        var test = pursuit({
            'foo': { equals: 'bar' }
        });

        assert.isTrue(test({ 'foo': 'bar' }));
        refute.isTrue(test({ 'foo': 'baz' }));
        refute.isTrue(test({ 'baz': 'foo' }));

        var inputList = [
            { 'foo': 'bar', value: 1 },
            { 'foo': 'baz', value: 2 },
            { 'foo': 'bar', value: 3 }
        ];
        var returnList = [{ 'foo': 'bar', value: 1 }, { 'foo': 'bar', value: 3 }];

        assert.equals(inputList.filter(test), returnList);
    }
});