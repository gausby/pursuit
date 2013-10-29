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
    var local = this || {};
    local.dictionary = local.dictionary || dictionary;
    local.entry = local.entry || 'entry';
    local.negation = local.negation || '!not';
    local.runTime = {};

    if (typeof local.optimize !== 'boolean') {
        local.optimize = true;
    }

    local.getScope = function (key) {
        key = key || local.key;
        if (local.scope) {
            return local.scope + '['+key+']';
        }
        else {
            return local.entry;
        }
    };

    local.call = function (key, value) {
        var obj = {};
        obj[key] = value;
        return dictionaryLookUp.call(local, obj, key, this.key);
    };

    var source = 'return ' + (compileQuery.call(local, query) || true);

    if (local.debug) {
        return 'function anonymous('+local.entry+') { '+source+' }';
    }
    else {
        /* jshint evil: true */
        return new Function(local.entry, source).bind(local.runTime);
    }
}

module.exports = Pursuit;


/**
 * Sort out empty values in an array by using the array.filter
 * function. This is used throughout the code to normalize quires
 * that contain code that does nothing.
 *
 * @method filterOutEmpty
 * @param {String|Undefined}
 * @for Pursuit
 */
function filterOutEmpty(item) {
    return !!item;
}


function handleProperty(query, scope) {
    return function (name) {
        var result = compileProperty.call(this, name, query[name], scope);
        return result;
    };
}


function handleSubQuery(scope) {
    return function (query) {
        return compileQuery.call(this, query, scope);
    };
}


/**
 * @method compileQuery
 * @param {Object|Array} query
 * @param {String} scope
 * @for Pursuit
 */
function compileQuery (query, scope) {
    // Arrays are treated as OR
    if (isArray(query)) {
        return query
            .map(handleSubQuery(scope), this)
            .filter(filterOutEmpty)
            .join('||')
        ;
    }
    // Objects are treated as AND
    else if (typeof query === 'object') {
        return Object.keys(query)
            .map(handleProperty(query, scope), this)
            .filter(filterOutEmpty)
            .join('&&')
        ;
    }

    return undefined;
}


function optimize (source, type) {
    var tokens = {},
        oneTrickPonies = {}
    ;

    type = { 'or': '||', 'and': '&&' }[type] || '||';

    source
        .filter(filterOutEmpty)
        .map(function(token) {
            // split the tokens
            return token.split('&&');
        })
        .forEach(function(token) {
            if (token[0] && token[1]) {
                // the token had an AND-clause, find the other checks
                // with the same AND-clause and join them together in
                // the same array.
                if (!isArray(tokens[token[0]])) {
                    tokens[token[0]] = [];
                }

                tokens[token[0]].push(
                    token.slice(1).filter(filterOutEmpty).join('&&')
                );
            }
            else {
                // check did not have an and clause. There is no one to
                // join it together with. Add it to the list of one
                // trick ponies
                oneTrickPonies[token[0]] = true;
            }
        })
    ;

    // string together the optimized pieces of code
    return Object.keys(oneTrickPonies).concat(
        Object.keys(tokens)
            .map(function(item) {

                if (tokens[item].length === 0) {
                    return item;
                }
                else if (tokens[item].length === 1) {
                    return [item, tokens[item].join(type)].join('&&');
                }
                else {
                    return [item,'('+tokens[item].join(type)+')'].join('&&');
                }
            })
    );
}


/**
 * @method compileProperty
 * @param {String|Undefined} name
 * @param {Object} prop
 * @param {Undefined|String} [scope=entry]
 * @for Pursuit
 */
function compileProperty (name, property, scope) {
    var fns,
        safeName = JSON.stringify(name),
        source // variable to store source in
    ;

    // set scope, default is `entry`
    scope = scope || this.entry;
    // expose the scope to the directory functions
    this.scope = scope;

    // root level negation
    if (name === this.negation) {
        return '!('+ compileQuery.call(this, property, scope) +')';
    }

    else if (isArray(property)) {
        var propertyArray = function(property) {
            return compileProperty.call(this, name, property, scope);
        };

        source = property.map(propertyArray, this);
        source = this.optimize ? optimize(source, 'or') : source;

        return source.length > 1 ? '('+source.join('||')+')' : source.join('||');
    }

    else if (typeof property === 'object') {
        fns = Object.keys(property).map(function(key) {
            var source;

            if (key === this.negation) {
                source = compileProperty.call(this, name, property[key], scope);

                return source ? '!('+source+')' : undefined;
            }
            // nested properties
            else if (typeof property[key] === 'object' && Object.keys(property[key]).length > 0) {
                var subScope = name ? scope+'['+safeName+']' : scope;

                // compile the nested property with the given scope
                source = compileProperty.call(this, key, property[key], subScope);

                if (source) {
                    // make sure the input object has a nested object
                    return 'typeof '+subScope+' === "object"&&' + source;
                }
                else {
                    return undefined;
                }
            }
            else {
                return dictionaryLookUp.call(this, property, key, safeName);
            }
        }, this).filter(filterOutEmpty);

        source = this.optimize ? optimize(fns, 'and') : fns;

        return (fns.length > 0) ? source.join('&&') : undefined;
    }

    return undefined;
}

function dictionaryLookUp (property, key, name) {
    var value, source;
    property = property[key];

    if (property instanceof RegExp || typeof property === 'function') {
        value = property;
    }
    else {
        value = JSON.stringify(property);
    }

    if (key in this.dictionary) {
        // expose key to matcher function
        this.key = name;
        source = this.dictionary[key].call(this, value);

        if (typeof source === 'string') {
            return source;
        }
        else if (source instanceof Error) {
            throw source;
        }
        else {
            throw new Error(
                'A dictionary function should return a string.'
            );
        }
    }
    else {
        // key not found in dictionary
        throw new Error([
            '\''+key+'\'','is not a valid keyword, use one of:',
            Object.keys(this.dictionary).join(', ')
        ].join(' '));
    }
}