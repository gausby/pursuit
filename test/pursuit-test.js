/*jslint maxlen:140*/
/* global require */
'use strict';

var buster = require('buster'),
    pursuit = require('../lib/pursuit')
;

var assert = buster.assert;
var refute = buster.refute;

buster.testCase('Pursuit', {
    'should return a function': function() {
        assert.isFunction(pursuit);
    },
    'should be able to match objects': function () {
        var matcher = pursuit({foo: {equals: 'bar'}});
        assert.isTrue(matcher({foo: 'bar'}));
    }
});
