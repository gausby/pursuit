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