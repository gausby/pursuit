/* global module require console */
'use strict';

var pursuit = require('../lib/pursuit'),
    person = require('./random-person')
;

var testSet = [];

// perhaps the tests should be done with a static data set
for (var i = 0; i < 100; i += 1) {
    testSet.push(person());
}

var query = {
    'name': {
        'last': {
            beginsWith: 'Ha',
            endsWith: 'sen'
        }
    }
};

var optimized = pursuit(query);
var nonOptimized = pursuit.call({optimize: false}, query);

module.exports = {
    name: 'Pursuit',
    tests: {
        'optimized': {
            fn: function() {
                testSet.filter(optimized);
                return;
            }
        },
        'non-optimized': {
            fn: function() {
                testSet.filter(nonOptimized);
                return;
            }
        }
    }
};