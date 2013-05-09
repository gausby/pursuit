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
    equals: function (key, value, scope) {
        return scope + '['+key+'] === ' + value;
    },

    /**
     * Test for greater values
     *
     * @property dictionary.greaterThan
     * @type Function
     * @return {String}
     */
    greaterThan: function (key, value, scope) {
        return scope + '['+key+'] > ' + value;
    },

    /**
     * Test if the input is greater than or equal to the given value
     *
     * @property dictionary.greaterThanOrEqualTo
     * @type Function
     * @return {String}
     */
    greaterThanOrEqualTo: function (key, value, scope) {
        return scope + '['+key+'] >= ' + value;
    },

    /**
     * Test for lesser values
     *
     * @property dictionary.lessThan
     * @type Function
     * @return {String}
     */
    lessThan: function (key, value, scope) {
        return scope + '['+key+'] < ' + value;
    },

    /**
     * Test if the input is less or equal to the given value
     *
     * @property dictionary.lessThanOrEqualTo
     * @type Function
     * @return {String}
     */
    lessThanOrEqualTo: function (key, value, scope) {
        return scope + '['+key+'] <= ' + value;
    },

    /**
     * Test if a string contains a given substring
     *
     * @property dictionary.contains
     * @type Function
     * @return {String}
     */
    contains: function (key, value, scope) {
        var rtn = '';
        // check if the key exists in the given entry
        rtn += '('+key+' in '+scope+') && ';
        // if the key exists, check if it contains the given value
        rtn += scope+'['+key+'].indexOf('+value+') !== -1';

        return '('+ rtn +')';
    },

    /**
     * Test if a string starts a given string
     *
     * @property dictionary.beginsWith
     * @type Function
     * @return {String}
     */
    beginsWith: function (key, value, scope) {
        var rtn = '';
        // check if the key exists in the given entry
        rtn += '('+key+' in '+scope+') && ';
        // if key exists, check if it contain the given value at 0 position
        rtn += scope+'['+key+'].indexOf('+value+') === 0';

        return '('+ rtn +')';
    },

    /**
     * Test if a string ends in a given string
     *
     * @property dictionary.endsWith
     * @type Function
     * @return {String}
     */
    endsWith: function (key, value, scope) {
        var rtn = '';

        // check if the key exists in the given entry
        rtn += '('+key+' in '+scope+') && ';

        // if key exists, check if it ends with the given value
        rtn += scope+'['+key+'].substr(-'+(value.length-2)+') === '+value;

        return '('+ rtn +')';
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
 * @param name
 * @param prop
 * @param [scope=entry]
 * @for Pursuit
 */
function compileProperty (name, prop, scope) {
    var fns,
        propertyName = JSON.stringify(name)
    ;

    if (! scope) {
        scope = 'entry';
    }

    fns = Object.keys(prop).map(function(key) {
        if (key === 'not') {
            return '(!'+compileProperty(name, prop[key])+')';
        }
        else {
            var value;

            if (prop[key] instanceof RegExp) {
                value = prop[key];
            }

            // nested properties
            else if (typeof prop[key] === 'object') {

                return '(' + [
                    // test if the input object has a nested object
                    'typeof ' + scope + '["'+name+'"]' + ' === "object"',
                    // compile the property with the given scope
                    compileProperty(key, prop[key], scope+'["'+name+'"]')
                ].join('&&') + ')';
            }

            else {
                value = JSON.stringify(prop[key]);
            }

            if (key in dictionary) {
                return dictionary[key](propertyName, value, scope);
            }
            else {
                return false;
            }
        }
    });

    return ! fns ? true : fns.join('&&');
}
