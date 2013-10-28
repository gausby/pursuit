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
        assert.isFunction(pursuit({}));
    },

    'should return a string of source code if debug is true': function () {
        var query = pursuit.call({ debug: true }, {});

        assert.isString(query);
        assert.equals(query, 'function anonymous(entry) { return true }');
    },

    'should be able to use a custom dictionary': function () {
        refute.exception(function () {
            var custom = {
                '$eq': function (value) {
                    return this.getScope() + ' === ' + value;
                },
                '$lt': function (value) {
                    return this.getScope() + ' > ' + value;
                }
            };

            var test = pursuit.call({ dictionary: custom }, {
                foo: { '$eq': 'bar' },
                test: { '$lt': 5 }
            });

            var obj = [
                {foo: 'bar', test: 2},
                {foo: 'bar', test: 6},
                {foo: 'baz', test: 2}
            ];

            assert.equals(obj.filter(test).length, 1);
        });
    }
});

buster.testCase('Pursuit error handling', {
    'should throw an error if a key is not in the dictionary': function () {
        var setup = { dictionary: {} };
        assert.exception(function() {
            pursuit.call(setup, {
                foo: { bar: 'test' }
            });
        });
    },

    'should throw an error if a dictionary key returns an error': function () {
        var setup = {
            dictionary : {
                bar: function (value) {
                    if (value === '"tata"') {
                        return new Error('\''+value+'\' is not a valid value.');
                    }
                    else {
                        return 'true';
                    }
                }
            }
        };

        assert.exception(function() {
            pursuit.call(setup, {
                foo: { bar: 'tata' }
            });
        });
    },

    'should throw an error if a dictionary function returns something else than a string': function () {
        assert.exception(function() {
            var setup = {
                dictionary: {
                    bar: function (value) { return true; }
                }
            };
            pursuit.call(setup, { foo: { bar: 'baz' }});
        });
    }
});

buster.testCase('Pursuit nesting', {
    setUp: function () {
        // setup a dictionary so we don't rely on the defualt one
        // for the tests
        this.setup = {
            dictionary: {
                'equals': function (value) {
                    return this.getScope() + ' === '+value;
                }
            }
        };
    },

    'should be able check on values nested two levels deep': function () {
        var setup = this.setup;
        refute.exception(function () {
            var query = pursuit.call(setup, {
                foo: { bar: { equals: 'baz' }}
            });

            assert.isTrue(query({ foo: { bar: 'baz' }}));
            refute.isTrue(query({ foo: { bar: 'bar' }}));
        });
    },

    'should be able check on values nested three (or more) levels deep': function () {
        var setup = this.setup;
        refute.exception(function () {
            var query = pursuit.call(setup, {
                foo: { bar: { baz: { equals: 'toto' }}}
            });

            assert.isTrue(query({ foo: { bar: { baz: 'toto' }}}));
            refute.isTrue(query({ foo: { bar: { baz: 'tata' }}}));
        });
    }
});

buster.testCase('Pursuit OR-blocks', {
    setUp: function () {
        // setup a dictionary so we don't rely on the defualt one
        // for the tests
        this.setup = {
            dictionary: {
                'equals': function (value) {
                    return this.getScope() + ' === '+value;
                }
            }
        };
    },

    'should be able to do OR blocks on keys': function () {
        // should be able to compile:
        var setup = this.setup;
        refute.exception(function () {
            var query = pursuit.call(setup, {
                foo: [
                    { equals: 'toto' },
                    { equals: 'titi' }
                ]
            });

            assert.isTrue(query({foo: 'toto'}));
            assert.isTrue(query({foo: 'titi'}));
            refute.isTrue(query({foo: 'tata'}));
        });
    },

    'should keep its local scope': function () {
        var setup = this.setup;
        refute.exception(function () {
            var query = pursuit.call(setup, [
                { foo: { equals: 'bar' }},
                { foo: { equals: 'baz' }}
            ]);

            var test = [{foo: 'bar'}, {foo: 'baz'}, {foo: 'bar'}];
            assert.equals(test.filter(query).length, 3);
        });
    },

    'should keep the scope within a sub-scope': function () {
        var setup = this.setup;
        refute.exception(function () {
            var query = pursuit.call(setup, {
                foo: {
                    bar: [
                        { baz: { equals: 'toto' }},
                        { baz: { equals: 'titi' }}
                    ]
                }
            });

            assert.isTrue(query({foo: { bar: { baz: 'toto' }}}));
            assert.isTrue(query({foo: { bar: { baz: 'titi' }}}));
            refute.isTrue(query({foo: { bar: { baz: 'tata' }}}));
        });
    },

    'should keep its scope after visiting a nested property': function () {
        var setup = this.setup;

        refute.exception(function () {
            var query = pursuit.call(setup, {
                foo: {
                    bar: [{equals: 'titi'}, {equals: 'tata'}],
                    baz: {equals: 'toto'}
                }
            });

            var test = [
                {foo: {bar: 'titi', baz: 'toto'}},
                {foo: {bar: 'tata', baz: 'toto'}},
                {foo: {bar: 'titi'}}
            ];

            assert.equals(test.filter(query).length, 2);
        });
    },

    'should keep the scope when inverting the result within a sub-scope': function () {
        var setup = this.setup;
        refute.exception(function () {
            var query = pursuit.call(setup, {
                foo: { bar: { '!not': [
                    {baz: {equals: 'toto'}},
                    {baz: {equals: 'titi'}}
                ]}}
            });

            assert.isTrue(query({foo: { bar: { baz: 'tata' }}}));
            refute.isTrue(query({foo: { bar: { baz: 'toto' }}}));
            refute.isTrue(query({foo: { bar: { baz: 'titi' }}}));
        });
    }
});

buster.testCase('Pursuit negation', {
    setUp: function () {
        // setup a dictionary so we don't rely on the defualt one
        // for the tests
        this.setup = {
            dictionary: {
                'equals': function (value) {
                    return this.getScope() + ' === '+value;
                }
            }
        };
    },

    'should work in root level': function () {
        var setup = this.setup;
        refute.exception(function () {
            var query = pursuit.call(setup, {
                '!not': { foo: { equals: 'tata' }}
            });

            refute.isTrue(query({ foo: 'tata' }));
            assert.isTrue(query({ foo: 'titi' }));
            assert.isTrue(query({ foo: 'toto' }));
        });
    },

    'should work in root level with OR-statements': function () {
        var setup = this.setup;
        refute.exception(function () {
            var query = pursuit.call(setup, {
                '!not': [
                    { foo: { equals: 'toto' }},
                    { foo: { equals: 'tata' }}
                ]
            });

            assert.isTrue(query({ foo: 'titi' }));
            refute.isTrue(query({ foo: 'toto' }));
            refute.isTrue(query({ foo: 'tata' }));
        });
    },

    'should work with double negation': function () {
        var setup = this.setup;
        refute.exception(function () {
            var query = pursuit.call(setup, {
                '!not': { '!not': { foo: { equals: 'tata' }}}
            });

            assert.isTrue(query({ foo: 'tata' }));
            refute.isTrue(query({ foo: 'titi' }));
            refute.isTrue(query({ foo: 'toto' }));
        });
    }
});

buster.testCase('Pursuit optimization', {
    // I might need to rephrase the name of this test...
    'should handle empty checks along with non-empty': function () {
        refute.exception(function() {
            pursuit({
                foo: {
                    bar: [
                        {beginsWith: 'tata' },
                        {isSet: true },
                        {endsWith: 'titi' },
                        {equals: 'toto' }
                    ]
                }
            });
        });
    }
});
