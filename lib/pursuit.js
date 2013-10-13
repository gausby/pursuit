/* global require module JSON */
'use strict';

var dictionary = require('./default-dictionary');


// Two helper functions that check if an object is an array or an object.
// This code has been lifted from the node-core util module.
function isArray (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]';
}

function isObject (subject) {
    return Object.prototype.toString.call(subject) === '[object Object]';
}


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
    var scope = this || {};
    scope.dictionary = scope.dictionary || dictionary;

    /* jshint evil: true */
    return new Function(
        'entry',
        'return '+compileQuery.call(scope, query)
    ).bind(scope);
}

module.exports = Pursuit;


/**
 * @method compileQuery
 * @param {Object} query
 * @param {String} scope
 * @for Pursuit
 */
function compileQuery (query, scope) {
    var fns;
    var that = this;

    if (isArray(query)) {
        fns = query.map(function(query) {
            return '('+compileQuery.call(that, query, scope)+')';
        });

        return fns.join('||');
    }

    else if (isObject(query)){
        fns = Object.keys(query).map(function(name) {
            return compileProperty.call(that, name, query[name], scope);
        });

        return fns.join('&&') || true;
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

    scope = scope || 'entry';

    if (isArray(prop)) {
        scope = scope + '["'+name+'"]';

        return '('+[
            'typeof ' + scope + ' === "object"',
            '(' + compileQuery.call(that, prop, scope) + ')'
        ].join('&&')+')';
    }

    fns = Object.keys(prop).map(function(key) {
        if (key === '!not') {
            return '!('+compileProperty.call(that, name, prop[key], scope)+')';
        }
        // nested properties
        else if (typeof prop[key] === 'object') {
            scope = scope + '["'+name+'"]';
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
                return that.dictionary[key].call(that, JSON.stringify(name), value, scope);
            }
            else {
                return false;
            }
        }
    });

    return ! fns ? true : fns.join('&&');
}
