/*jslint maxlen:140*/
/* global require */
'use strict';

var buster = require('buster'),
    pursuit = require('../lib/pursuit')
;

var assert = buster.referee.assert;
var refute = buster.referee.refute;

buster.testCase('Pursuit', {
    'should compile a query language into a JavaScript function': function () {
        assert.isFunction(pursuit({
            test: { equals: 'test' }
        }));
    },

    'should return a string of source code if debug is true': function () {
        var query = pursuit.call({ debug: true }, {
            'foo': { equals: 'bar' }
        });

        assert.isString(query);
        assert.equals(query, 'return entry["foo"] === "bar"');
    }
});

buster.testCase('Pursuit nesting', {
    'should be able check on values nested two levels deep': function () {
        var query = pursuit({
            config: {
                type: {
                    equals: 'test'
                }
            }
        });

        // in this case object.config.type should be `test`
        assert.isTrue(query({
            foo: 'bar',
            config: {
                type: 'test'
            }
        }));
    },

    'should be able check on values nested three (or more) levels deep': function () {
        var query = pursuit({
            foo: {
                bar: {
                    baz: {
                        equals: ':)'
                    }
                }
            }
        });

        // foo.bar.baz should be `:)`
        assert.isTrue(query({
            foo: {
                bar: {
                    baz: ':)'
                }
            }
        }));
    }
});

buster.testCase('Pursuit OR-blocks', {
    'should keep its local scope': function () {
        var A = function () {};
        var B = function () {};

        var query = pursuit([
            { foo: { instanceOf: A }},
            { foo: { instanceOf: B }}
        ]);

        var test = [{foo: (new A())}, {foo: (new B())}, {foo: (new A())}];
        assert.equals(test.filter(query).length, 3);
    },

    'should keep the scope within a sub-scope': function (){
        var query = pursuit({
            a: {
                b: [
                    {c: {equals: 'c'}},
                    {c: {equals: 'd'}}
                ]
            }
        });

        assert.isTrue(query({a: { b: { c: 'c' }}}));
        assert.isTrue(query({a: { b: { c: 'd' }}}));
        refute.isTrue(query({a: { b: { c: 'e' }}}));
    },

    'should keep the scope when inverting the result within a sub-scope': function (){
        var query = pursuit({
            a: {
                b: {
                    '!not': [
                        {c: {equals: 'c'}},
                        {c: {equals: 'd'}}
                    ]
                }
            }
        });

        assert.isTrue(query({a: { b: { c: 'e' }}}));
        refute.isTrue(query({a: { b: { c: 'c' }}}));
        refute.isTrue(query({a: { b: { c: 'd' }}}));
    }
});

buster.testCase('Pursuit custom dictionary', {
    'should be able to use a custom dictionary': function () {
        var dict = {
            '$eq': function (value) {
                return this.getScope() + ' === ' + value;
            },
            '$lt': function (value) {
                return this.getScope() + ' > ' + value;
            }
        };

        var test = pursuit.call({ dictionary: dict }, {
            foo: { '$eq': 'bar' },
            test: { '$lt': 5 }
        });

        var obj = [
            {foo: 'bar', test: 2},
            {foo: 'bar', test: 6},
            {foo: 'baz', test: 2}
        ];

        assert.equals(obj.filter(test).length, 1);
    }
});


buster.testCase('Pursuit negation', {

    'should work in root level': function (){
        var query = pursuit({ '!not': { foo: { equals: 'foo'}} });

        assert.isTrue(query({ foo: 'baz' }));
        refute.isTrue(query({ foo: 'foo' }));
        assert.isTrue(query({ foo: 'bar' }));
    },

    'should work in root level with OR statement': function (){
        var query = pursuit({
            '!not': [
                { foo: { equals: 'foo' }},
                { foo: { equals: 'bar' }}
            ]
        });

        assert.isTrue(query({ foo: 'baz' }));
        refute.isTrue(query({ foo: 'foo' }));
        refute.isTrue(query({ foo: 'bar' }));
    }
});
