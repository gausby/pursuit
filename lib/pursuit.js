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
 * When parsing the properties it will use this dictionary object to
 * generate the source code.
 *
 * Each key in the dictionary correspond to a property, making it easy
 * to extend the language with new property types.
 *
 * @property dictionary
 * @type Object
 * @private
 */
var dictionary = {
    /**
     * Test for equality
     *
     * @property dictionary.equals
     * @type Function
     * @return {String}
     */
    equals: function (key, value) {
        return 'entry['+key+'] === ' + value;
    },

    /**
     * Test for greater values
     *
     * @property dictionary.greater
     * @type Function
     * @return {String}
     */
    greater: function (key, value) {
        return 'entry['+key+'] > ' + value;
    },

    /**
     * Test for lesser values
     *
     * @property dictionary.lesser
     * @type Function
     * @return {String}
     */
    lesser: function (key, value) {
        return 'entry['+key+'] < ' + value;
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
