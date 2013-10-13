/* global require module JSON */
'use strict';

var dictionary = require('./default-dictionary'),
    isArray = require('util').isArray
;


/**
 * Will compile a object query language into source, for better
 * performance when checking values on massive amounts of objects.
 *
 * @class Pursuit
 * @static
 * @param {Object} query The query that will be compiled to source
 * @return {Function} a function that will take an object as an
 *   argument and return a boolean value if given criteria are met.
 */
function Pursuit (query) {
    var localScope = this || {};
    localScope.dictionary = localScope.dictionary || dictionary;
    localScope.entry = localScope.entry || 'entry';
    localScope.negation = localScope.negation || '!not';

    /* jshint evil: true */
    return new Function(
        localScope.entry,
        'return '+compileQuery.call(localScope, query)
    ).bind(localScope);
}

module.exports = Pursuit;


/**
 * @method compileQuery
 * @param {Object} query
 * @param {String} scope
 * @for Pursuit
 */
function compileQuery (query, scope) {
    var that = this;

    if (isArray(query)) {
        return query.map(function(query) {
            return '('+compileQuery.call(that, query, scope)+')';
        }).join('||');
    }

    else if (typeof query === 'object') {
        return Object.keys(query).map(function(name) {
            return compileProperty.call(that, name, query[name], scope);
        }).join('&&') || true;
    }

    return true;
}


/**
 * @method compileProperty
 * @param {String} name
 * @param {Object} prop
 * @param {Undefined|String} [scope=entry]
 * @for Pursuit
 */
function compileProperty (name, prop, scope) {
    var fns,
        that = this
    ;

    scope = scope || that.entry;

    if (isArray(prop)) {
        scope += '["'+name+'"]';

        return '('+[
            'typeof ' + scope + ' === "object"',
            '(' + compileQuery.call(that, prop, scope) + ')'
        ].join('&&')+')';
    }

    fns = Object.keys(prop).map(function(key) {
        if (key === that.negation) {
            return '!('+compileProperty.call(that, name, prop[key], scope)+')';
        }
        // nested properties
        else if (typeof prop[key] === 'object') {
            scope += '["'+name+'"]';

            return '(' + [
                // test if the input object has a nested object
                'typeof ' + scope + ' === "object"',
                // compile the property with the given scope
                compileProperty.call(that, key, prop[key], scope)
            ].join('&&') + ')';
        }
        else {
            var value;

            if (prop[key] instanceof RegExp || (typeof prop[key] === 'function')) {
                value = prop[key];
            }
            else {
                value = JSON.stringify(prop[key]);
            }

            if (key in that.dictionary) {
                name = JSON.stringify(name);
                return that.dictionary[key].call(that, name, value, scope);
            }
            else {
                return false;
            }
        }
    });

    return ! fns ? true : fns.join('&&');
}
