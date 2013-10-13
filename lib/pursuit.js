/* global require module JSON */
'use strict';

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
    var scope = {};

    /* jshint evil: true */
    return new Function(
        'entry',
        'return '+compileQuery.call(scope, query)
    ).bind(scope);
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
     * @param {String} key
     * @param {String} value
     * @param {String} scope
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
     * @param {String} key
     * @param {String} value
     * @param {String} scope
     * @return {String}
     */
    endsWith: function (key, value, scope) {
        var rtn = '';

        // check if the key exists in the given entry
        rtn += '('+key+' in '+scope+') && ';

        // if key exists, check if it ends with the given value
        rtn += scope+'['+key+'].substr(-'+(value.length-2)+') === '+value;

        return '('+ rtn +')';
    },

    /**
     * Test if a value is of a given type
     *
     * @property dictionary.typeOf
     * @type Function
     * @param {String} key
     * @param {String} value
     * @param {String} scope
     * @return {String}
     */
    typeOf: function (key, value, scope) {
        var rtn = [];
        value = value.toLowerCase();

        // test for array. I haven't tested this in other envs than node
        // it is the way node itself test for arrays.
        if (value === '"array"') {
            rtn.push([
                'Object.prototype.toString.call',
                '('+scope + '['+key+'])',
                '==="[object Array]"'
            ].join(''));
        }
        else if (value === '"null"') {
            rtn.push([
                'Object.prototype.toString.call',
                '('+scope + '['+key+'])',
                '==="[object Null]"'
            ].join(''));
        }
        else {
            rtn.push('typeof ' + scope + '['+key+'] === ' + value);

            if (value === '"object"') {
                rtn.push('(Boolean(' + scope + '['+key+']))');
            }
        }

        return rtn.join('&&');
    },

    /**
     * Test if a value is an instance of a given object
     *
     * @property dictionary.instanceOf
     * @type Function
     * @param {String} key
     * @param {Function} value
     * @param {String} scope
     * @return {String}
     */
    instanceOf: function (key, value, scope) {
        if (! this.objectReferences) {
            this.objectReferences = [];
        }

        var index = this.objectReferences.length;
        this.objectReferences.push(value);

        return scope+'['+key+'] instanceof this.objectReferences['+index+']';
    }
};


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

            if (key in dictionary) {
                return dictionary[key].call(that, JSON.stringify(name), value, scope);
            }
            else {
                return false;
            }
        }
    });

    return ! fns ? true : fns.join('&&');
}
