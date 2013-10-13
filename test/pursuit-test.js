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

    'should be able to check for equality': function () {
        var query = pursuit({
            foo: { equals: 'bar' }
        });

        assert.isTrue(query({'foo': 'bar'}));
        refute.isTrue(query({'foo': 'baz'}));
    },

    'should be able to test for values greater than': function () {
        var query = pursuit({
            foo: { greaterThan: 5 }
        });

        assert.isTrue(query({'foo': 10}));
        assert.isTrue(query({'foo': 5.01}));
        refute.isTrue(query({'foo': 5}));
        refute.isTrue(query({'foo': 4}));
    },

    'should be able to test for values greater than or equal to': function () {
        var query = pursuit({
            foo: { greaterThanOrEqualTo: 5 }
        });

        assert.isTrue(query({'foo': 5.01}));
        assert.isTrue(query({'foo': 5}));
        refute.isTrue(query({'foo': 4}));
        refute.isTrue(query({'foo': 0}));
    },

    'should be able to test for values less than': function () {
        var query = pursuit({
            foo: { lessThan: 5 }
        });

        assert.isTrue(query({'foo': 1}));
        assert.isTrue(query({'foo': 4.99}));
        refute.isTrue(query({'foo': 5}));
        refute.isTrue(query({'foo': 10}));
    },

    'should be able to test for values less than or equal to': function () {
        var query = pursuit({
            foo: { lessThanOrEqualTo: 5 }
        });

        assert.isTrue(query({'foo': 0}));
        assert.isTrue(query({'foo': 1}));
        assert.isTrue(query({'foo': 4.99}));
        assert.isTrue(query({'foo': 5}));
        refute.isTrue(query({'foo': 5.000001}));
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
    },

    'should be able to test if a value is of a specific type': function () {
        var isString = pursuit({ foo: { typeOf: 'string' }});
        assert.isTrue(isString({'foo': 'banana'}));
        refute.isTrue(isString({'foo': (new Date())}));
        refute.isTrue(isString({'foo': 5}));

        var isNumber = pursuit({ foo: { typeOf: 'number' } });
        assert.isTrue(isNumber({'foo': 5}));
        assert.isTrue(isNumber({'foo': 0}));

        var isObject = pursuit({ foo: { typeOf: 'object' } });
        assert.isTrue(isObject({'foo': []}));
        assert.isTrue(isObject({'foo': {}}));

        refute.isTrue(isObject({'foo': 1}));
        refute.isTrue(isObject({'foo': null}));
        refute.isTrue(isObject({'foo': undefined}));

        var isBoolean = pursuit({ foo: { typeOf: 'boolean' } });
        assert.isTrue(isBoolean({foo: true}));
        assert.isTrue(isBoolean({foo: false}));

        var isUndefined = pursuit({ foo: { typeOf: 'undefined' } });
        assert.isTrue(isUndefined({foo: undefined}));
        refute.isTrue(isUndefined({foo: null}));

        var isArray = pursuit({ foo: { typeOf: 'array' } });
        assert.isTrue(isArray({foo: [undefined]}));
        refute.isTrue(isArray({foo: {}}));

        var isNull = pursuit({ foo: { typeOf: 'null' } });
        assert.isTrue(isNull({foo: null}));
        refute.isTrue(isNull({foo: undefined}));
        refute.isTrue(isNull({foo: {}}));
    },

    'should be able to test if a value is an instance of an object': function () {
        var A = function () {};
        var B = function () {};

        var test = pursuit({
            foo: { 'instanceOf': A }
        });

        assert.isTrue(test({ foo: new A() }));
        refute.isTrue(test({ foo: new B() }));
    },

    'should be able to test if multiple values are instances of multiple objects': function () {
        var A = function () {};
        var B = function () {};

        var test = pursuit({
            bar: { 'instanceOf': B },
            foo: { 'instanceOf': A }
        });

        assert.isTrue(test({ foo: (new A()), bar: (new B()) }));
        refute.isTrue(test({'foo': (new A())}));
    },

    'should be able to test if a string ends a specified substring': function () {
        var query = pursuit({
            foo: { endsWith: 'ab' }
        });

        var query2 = pursuit({
            foo: { endsWith: 'zebra' }
        });

        assert.isTrue(query({'foo': 'bab'}));
        assert.isTrue(query({'foo': 'ab'}));
        assert.isTrue(query({'foo': 'foo zab'}));
        refute.isTrue(query({'foo': 'foo'}));

        assert.isTrue(query2({'foo': 'I wish I had a zebra'}));
    },

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
    },

    'should keep its local scope when using OR blocks': function () {
        var A = function () {};
        var B = function () {};

        var query = pursuit([
            { foo: { instanceOf: A }},
            { foo: { instanceOf: B }}
        ]);

        var test = [{foo: (new A())}, {foo: (new B())}, {foo: (new A())}];
        assert.equals(test.filter(query).length, 3);
    },

    'OR blocks within a sub-scope should keep the scope': function (){
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

    'OR blocks within a sub-scope should keep the scope when inverting the result': function (){
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
    },

    'should be able to use a custom dictionary': function () {
        var dict = {
            '$eq': function (key, value, scope) {
                return scope + '['+key+'] === ' + value;
            },
            '$lt': function (key, value, scope) {
                return scope + '['+key+'] > ' + value;
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
