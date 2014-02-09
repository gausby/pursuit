/* global require module */
'use strict';

var dictionary = require('pursuit-dictionary'),
    pursuitCore = require('pursuit-core')
;

module.exports = pursuitCore({
    dictionary: dictionary,
    negation: '!not'
}, 'function');
