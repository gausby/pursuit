/*jslint maxlen:140*/
/* global require */
'use strict';

var buster = require('buster'),
    pursuit = require('../lib/pursuit')
;

var assert = buster.assert;
var refute = buster.refute;

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
    },

    'usage: equals': function () {
        var test = pursuit({
            foo: {
                equals: 5
            }
        });

        assert.equals(
            [{foo: 0}, {foo: 5}, {foo: 10}].filter(test),
            [{foo: 5}]
        );

        var test2 = pursuit({
            foo: {
                equals: 'bar'
            }
        });

        assert.equals(
            [{foo: 'foo'}, {foo: 'bar'}, {foo: 'baz'}].filter(test2),
            [{foo: 'bar'}]
        );

    },

    'usage: greaterThan': function () {
        var test = pursuit({
            foo: {
                greaterThan: 5
            }
        });

        assert.equals(
            [{foo: 0}, {foo: 5}, {foo: 10}].filter(test),
            [{foo: 10}]
        );
    },

    'usage: greaterThanOrEqualTo': function () {
        var test = pursuit({
            foo: { greaterThanOrEqualTo: 5 }
        });

        assert.equals(
            [{foo: 0}, {foo: 5}, {foo: 10}].filter(test),
            [{foo: 5}, {foo: 10}]
        );
    },

    'usage: lessThan': function () {
        var test = pursuit({
            foo: { lessThan: 5 }
        });

        assert.equals(
            [{foo: 0}, {foo: 5}, {foo: 10}].filter(test),
            [{foo: 0}]
        );
    },

    'usage: lessThanOrEqualTo': function () {
        var test = pursuit({
            foo: { lessThanOrEqualTo: 5 }
        });

        assert.equals(
            [{foo: 0}, {foo: 5}, {foo: 10}].filter(test),
            [{foo: 0}, {foo: 5}]
        );
    },

    'usage: contains': function () {
        var test = pursuit({
            foo: { contains: 'b' }
        });

        assert.equals(
            [{foo: 'abc'}, {foo: 'bac'}, {foo: 'acd'}].filter(test),
            [{foo: 'abc'}, {foo: 'bac'}]
        );
    },

    'usage: beginsWith': function () {
        var test = pursuit({
            foo: { beginsWith: 'ba' }
        });

        assert.equals(
            [{foo: 'abc'}, {foo: 'bac'}, {foo: 'acd'}].filter(test),
            [{foo: 'bac'}]
        );
    },

    'usage: endsWith': function () {
        var test = pursuit({
            foo: { endsWith: 'ac' }
        });

        assert.equals(
            [{foo: 'abc'}, {foo: 'bac'}, {foo: 'acd'}].filter(test),
            [{foo: 'bac'}]
        );
    },

    'usage: typeOf': function () {
        var test = pursuit({
            foo: { typeOf: 'string' }
        });

        assert.equals(
            [{foo: 'abc'}, {foo: 5}, {foo: false}].filter(test),
            [{foo: 'abc'}]
        );
    },

    'usage: instanceOf': function () {
        var A = function () {};
        var B = function () {};

        var test = pursuit({
            foo: { instanceOf: A }
        });

        assert.equals(
            [{foo: (new A())}, {foo: (new B())}, {foo: (new A())}].filter(test),
            [{foo: (new A())}, {foo:  (new A())}]
        );
    },

    'usage: isSet': function () {
        var test = pursuit({
            foo: { isSet: true },
            bar: { isSet: false }
        });

        assert.equals(
            [{foo: 1}, {bar: 2}, {foo: 3, bar: null}].filter(test),
            [{foo: 1}, {foo: 3, bar: null}]
        );
    },

    'usage: hasBeenTouched' : function () {
        var test = pursuit({ hasBeenTouched: true });
        assert.isTrue(test(undefined)); // true

        var test2 = pursuit({ foo: { hasBeenTouched: true }});
        assert.equals(
            [{foo: null, bar: 1}, { bar: 1 }, {foo: 2}].filter(test2),
            [{foo: null, bar: 1}, {foo: 2}]
        );
    },

    'usage: !not': function () {
        var test = pursuit({
            foo: {
                '!not': { equals: 'bac' }
            }
        });

        assert.equals(
            [{foo: 'abc'}, {foo: 'bac'}, {foo: 'acd'}].filter(test),
            [{foo: 'abc'}, {foo: 'acd'}]
        );
    },

    'usage: nesting': function () {
        var sites = [
            {
                'title': 'The Red Site',
                config: { 'background-color': 'red' }
            },
            {
                'title': 'The Blue Site',
                config: { 'background-color': 'blue' }
            }
        ];


        var test = pursuit({
            config: {
                'background-color': { equals: 'red' }
            }
        });

        assert.equals(
            sites.filter(test),
            [{
                'title': 'The Red Site',
                config: { 'background-color': 'red' }
            }]
        );
    },

    'usage: OR': function () {
        var test = pursuit([
            { bar: {equals: 5}},
            { bar: {equals: 10}}
        ]);

        assert.equals(
            [{bar: 5}, {bar: 6}, {bar: 10}, {bar: 11}].filter(test),
            [{bar: 5}, {bar: 10}]
        );
    },

    'usage: Creating your own query language': function () {
        var customLanguage = {
            dictionary: {
                $eq: function (value) {
                    return this.getScope() +' === '+value;
                },
                $lt: function (value) {
                    return this.getScope() +' < '+value;
                },
                $gt: function (value) {
                    return this.getScope()+' > '+value;
                }
            }
        };

        var test = pursuit.call(customLanguage, {
            foo: { $eq: 'bar' },
            bar: { $lt: 5 },
            baz: { $gt: 10 }
        });

        assert.isTrue(test({ foo: 'bar', bar: 1, baz: 50 }));
    },

    'Usage: Disabling Source Optimization': function () {
        var query = {
            foo: [{ contains: 'bar' }, { contains: 'baz' }],
            bar: { equals: 'bar' }
        };

        assert.equals(pursuit.call({optimize: false, debug: true}, query), [
            'function anonymous(entry) { return (entry&&',
            'typeof entry["foo"] === "string"&&entry["foo"].indexOf("bar") !== -1||',
            'entry&&typeof entry["foo"] === "string"&&',
            'entry["foo"].indexOf("baz") !== -1)&&',
            'entry&&entry["bar"] === "bar" }'
        ].join(''));

        assert.equals(pursuit.call({debug: true}, query), [
            'function anonymous(entry) { return entry&&(entry["bar"] === "bar"&&',
            '(typeof entry["foo"] === "string"&&entry["foo"].indexOf("bar") !== -1||',
            'typeof entry["foo"] === "string"&&entry["foo"].indexOf("baz") !== -1)) }'
        ].join(''));
    },

    'Development: Calling Other Dictionary Functions From Within a Dictionary Function': function() {
        var dictionary = {
            typeOf: function (value) {
                return 'typeof '+this.getScope() + ' === ' + value;
            },
            contains: function (value) {
                return [
                    // check if the key exists in the given entry and is a string
                    this.call('typeOf', 'string'),
                    // if the key exists, check if it contains the given value
                    this.getScope() + '.indexOf('+value+') !== -1'
                ].join('&&');
            }
        };

        assert.equals(
            pursuit.call({ dictionary: dictionary, debug: true }, {'foo': { contains: 'bar' } }),
            [
                'function anonymous(entry) { return entry',
                'typeof entry["foo"] === "string"',
                'entry["foo"].indexOf("bar") !== -1 }'
            ].join('&&')
        );
    },

    'Development: Inspecting Generated Source Code': function () {
        var test = pursuit.call({ debug: true }, {
            foo: { 'equals': 'bar' }
        });

        assert.equals(
            test,
            'function anonymous(entry) { return entry&&entry["foo"] === "bar" }'
        );
    }
});
