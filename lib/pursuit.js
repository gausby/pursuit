/* global require module JSON */
'use strict';


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
    /* jshint evil: true */
    return new Function('entry', 'return '+compileQuery(query));
}

module.exports = Pursuit;


/**
 *
 */
var dictionary = {
    /**
     * Test for equality
     */
    equals: function (key, value) {
        return 'entry['+key+'] === ' + value;
    }
};


/**
 * @method compileQuery
 * @for Pursuit
 */
function compileQuery (query) {
    var fns;

    if (Object.prototype.toString.call(query) === '[object Array]') {
        fns = query.map(function(query) {
            return '('+compileQuery(query)+')';
        });

        return fns.join('||');
    }

    else if (Object.prototype.toString.call(query) === '[object Object]'){
        fns = Object.keys(query).map(function(name) {
            return compileProperty(name, query[name]);
        });

        return fns.join('&&') || true;
    }

    return true;
}


/**
 * @method compileProperty
 * @for Pursuit
 */
function compileProperty (name, prop) {
    var fns,
        propertyName = JSON.stringify(name)
    ;

    fns = Object.keys(prop).map(function(key) {
        if (key === 'not') {
            return '(!'+compileProperty(name, prop[key])+')';
        }
        else {
            var value;

            if (prop[key] instanceof RegExp) {
                value = prop[key];
            }
            else {
                value = JSON.stringify(prop[key]);
            }

            return (key in dictionary) ? dictionary[key](propertyName, value) : false;
        }
    });

    return ! fns ? true : fns.join('&&');
}
