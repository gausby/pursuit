/* global module require console */
'use strict';

var pursuit = require('../lib/pursuit'),
    testSet = require('./data.json')
;

var query = [
    {
        'name': {
            'last': {
                beginsWith: 'P',
                endsWith: 'son'
            }
        },
        'age': {
            greaterThanOrEqualTo: 21,
            lessThan: 68
        },
        'gender': {
            equals: 'Female'
        },
        'occupation': { equals: 'Rehabilitation Services Director' }
    },
    {
        'name': { first: {equals: 'Ian' } },
        'age': { greaterThanOrEqualTo: 21, lessThan: 90 },
        'gender': { equals: 'Male' },
        'occupation': { contains: 'Business' }
    }
];

var optimized = pursuit(query);

module.exports = {
    name: 'Pursuit',
    onComplete: function() {
        console.log(
            'Items found:', testSet.filter(optimized).length
        );
    },
    tests: {
        'optimized': {
            fn: function() {
                testSet.filter(optimized);
                return;
            }
        }
    }
};
