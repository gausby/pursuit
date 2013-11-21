/* globals module */
'use strict';

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
     * @param {String|Number|Boolean} value
     * @return {String}
     */
    equals: function (value) {
        return this.getScope() + ' === ' + value;
    },

    /**
     * Test for greater values
     *
     * @property dictionary.greaterThan
     * @type Function
     * @param {Number|String} value
     * @return {String}
     */
    greaterThan: function (value) {
        return this.getScope() + ' > ' + value;
    },

    /**
     * Test if the input is greater than or equal to the given value
     *
     * @property dictionary.greaterThanOrEqualTo
     * @type Function
     * @param {Number|String} value
     * @return {String}
     */
    greaterThanOrEqualTo: function (value) {
        return this.getScope() + ' >= ' + value;
    },

    /**
     * Test for lesser values
     *
     * @property dictionary.lessThan
     * @type Function
     * @param {Number|String} value
     * @return {String}
     */
    lessThan: function (value) {
        return this.getScope() + ' < ' + value;
    },

    /**
     * Test if the input is less or equal to the given value
     *
     * @property dictionary.lessThanOrEqualTo
     * @type Function
     * @param {Number|String} value
     * @return {String}
     */
    lessThanOrEqualTo: function (value) {
        return this.getScope() + ' <= ' + value;
    },

    /**
     * Test if a string contains a given substring
     *
     * @property dictionary.contains
     * @type Function
     * @param {String} value
     * @return {String}
     */
    contains: function (value) {
        return [
            // check if the key exists in the given entry and is a string
            this.call('typeOf', 'string'),
            // if the key exists, check if it contains the given value
            this.getScope() + '.indexOf('+value+') !== -1'
        ].join('&&');
    },

    /**
     * Test if a key is set to something
     *
     * Will return true for anything but null and undefined.
     *
     * @property dictionary.isSet
     * @type Function
     * @param {String|Boolean} value whether or not the key should be something
     * @return {String}
     */
    isSet: function (value) {
        var source = [
            this.call('typeOf', 'undefined'),
            this.call('typeOf', 'null')
        ].join('||');

        if (typeof value !== 'boolean') {
            // normalize the input value
            value = (value === 'true');
        }

        return (!value ? '': '!') + '('+source+')';
    },

    /**
     * Test if a key has been touched on an object. Returns true for any value
     * even null and undefined. It check the existence of a key.
     *
     * @property dictionary.hasBeenTouched
     * @type Function
     * @param {String|Boolean} value whether or not the key should be something
     * @return {String}
     */
    hasBeenTouched: function (value) {
        if (typeof value !== 'boolean') {
            // normalize the input value
            value = (value === 'true');
        }

        if (typeof this.key === 'undefined') {
            // will always be set to at least undefined if we are checking
            // on the global scope. We'll just return a Boolean.
            return !!value+'';
        }

        return (!value ? '!': '') + '('+this.key+' in '+this.scope+')';
    },

    /**
     * Test if a string starts with a given string
     *
     * @property dictionary.beginsWith
     * @type Function
     * @param {String} value
     * @return {String}
     */
    beginsWith: function (value) {
        return [
            // check if the key exists in the given entry
            this.call('typeOf', 'string'),
            // if key exists, check if it contain the given value at 0 position
            this.getScope() + '.indexOf('+value+') === 0'
        ].join('&&');
    },

    /**
     * Test if a string ends in a given string
     *
     * @property dictionary.endsWith
     * @type Function
     * @param {String} value
     * @return {String}
     */
    endsWith: function (value) {
        return [
            // check if the key exists in the given entry
            this.call('typeOf', 'string'),
            // check if it ends with the given value
            this.getScope() + '.substr(-'+(value.length-2)+') === '+value
        ].join('&&');
    },

    /**
     * Test if a value is of a given type
     *
     * @property dictionary.typeOf
     * @type Function
     * @param {String} value
     * @return {String}
     */
    typeOf: function (value) {
        var rtn = [];
        value = value.toLowerCase();

        // test for array. I haven't tested this in other envs than node
        // it is the way node itself test for arrays.
        if (value === '"array"') {
            rtn.push([
                'Object.prototype.toString.call',
                '(' + this.getScope() + ')',
                '==="[object Array]"'
            ].join(''));
        }
        else if (value === '"null"') {
            rtn.push([
                'Object.prototype.toString.call',
                '(' + this.getScope() + ')',
                '==="[object Null]"'
            ].join(''));
        }
        else {
            rtn.push('typeof ' + this.getScope() + ' === ' + value);

            if (value === '"object"') {
                rtn.push('(Boolean(' + this.getScope() + '))');
            }
        }

        return rtn.join('&&');
    },

    /**
     * Test if a value is an instance of a given object
     *
     * @property dictionary.instanceOf
     * @type Function
     * @param {Function} value
     * @return {String}
     */
    instanceOf: function (value) {
        if (! this.runTime.objectReferences) {
            this.runTime.objectReferences = [];
        }

        var index = this.runTime.objectReferences.length;
        this.runTime.objectReferences.push(value);

        return this.getScope() + ' instanceof this.objectReferences['+index+']';
    }
};

module.exports = dictionary;