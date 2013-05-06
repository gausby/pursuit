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
    }

});