# Pursuit - A Fast JavaScript Object Property Matching Language

Pursuit is a fast Object Property Matching Language written for Node. It compiles a given query into JavaScript code for optimal performance when checking many objects for certain characteristics. All compiled functions returns a boolean value, making them useful in filter functions.

This package is a distribution that combines [Pursuit Core](https://github.com/gausby/pursuit-core/) with [Pursuit Dictionary](https://github.com/gausby/pursuit-dictionary/). Look at these projects if you want a custom language with other properties than this.

It is used as the default Object Matcher in the [Ecoule](https://github.com/gausby/ecoule)-framework.

This project is heavily inspired by [Mathias Buus](https://github.com/mafintosh)'s [CopenhagenJS](http://copenhagenjs.dk/) talk on [JSON query compilation](https://github.com/mafintosh/json-query-compilation).

It does use [`new Function`](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function) to compile the generated code into functional code, so take great precautions with what you trust it with. Think twice before using it to generate code on the client-side.

**Notice:** From 0.3.0 `instanceOf` is no longer supported, and the interface has been changed a bit. Look into Pursuit Core if you customize the language.


## Usage

To create a function that test for a key called `foo` with the value of `bar`.

    var pursuit = require('pursuit');

    var test = pursuit({
        'foo': { equals: 'bar' }
    });

`test` will now hold a function that takes an object as an argument. It will return true if the input object has a key called `foo` that has the value of `bar`, and false otherwise.

    test({ 'foo': 'bar' }); // true
    test({ 'foo': 'baz' }); // false
    test({ 'baz': 'foo' }); // false

This can easily be used in filter functions, as such:

    var objList = [
        { 'foo': 'bar', value: 1 },
        { 'foo': 'baz', value: 2 },
        { 'foo': 'bar', value: 3 }
    ];

    objList.filter(test); // [{ 'foo': 'bar', value: 1 }, { 'foo': 'bar', value: 3 }]

A matcher can have more than one check inside of it, such as this:

    var test = pursuit({
        name: { beginsWith: 'A' },
        age: {
            greaterThanOrEqualTo: 21,
            lessThan: 35
        }
    });

This would create a function that returns true for all the objects that has a key called `name` whose value begins with an upper-case A, and has an `age`-key with a value between 21 and 35.


### Matchers
The following section will describe the build-in matchers.


#### `equals`
Will check for equality.

    var test = pursuit({
        foo: {
            equals: 5
        }
    });

    [{foo: 0}, {foo: 5}, {foo: 10}].filter(test); // [{foo: 5}]

Comparison can be done with any type that can be compared using the `===` operator.

    var test = pursuit({
        foo: {
            equals: 'bar'
        }
    });

    [{foo: 'foo'}, {foo: 'bar'}, {foo: 'baz'}].filter(test); // [{foo: 'bar'}]


#### `greaterThan`
Will check if a number (or any other type that can be compared with the `>` operator) is greater than the compiled value.

    var test = pursuit({
        foo: { greaterThan: 5 }
    });

    [{foo: 0}, {foo: 5}, {foo: 10}].filter(test); // [{foo: 10}]


#### `greaterThanOrEqualTo`
Will check if a number (or any other type that can be compared with the `>=` operator) is greater than, or equal to, the compiled value.

    var test = pursuit({
        foo: { greaterThanOrEqualTo: 5 }
    });

    [{foo: 0}, {foo: 5}, {foo: 10}].filter(test); // [{foo: 5}, {foo: 10}]


#### `lessThan`
Will check if a number (or any other type that can be compared with the `<` operator) is less than the compiled value.

    var test = pursuit({
        foo: { lessThan: 5 }
    });

    [{foo: 0}, {foo: 5}, {foo: 10}].filter(test); // [{foo: 0}]


#### `lessThanOrEqualTo`
Will check if a number (or any other type that can be compared with the `<=` operator) is less than, or equal to, the compiled value.

    var test = pursuit({
        foo: { lessThanOrEqualTo: 5 }
    });

    [{foo: 0}, {foo: 5}, {foo: 10}].filter(test); // [{foo: 0}, {foo: 5}]


#### `contains`
Will check if a string contains the given value.

    var test = pursuit({
        foo: { contains: 'b' }
    });

    [{foo: 'abc'}, {foo: 'bac'}, {foo: 'acd'}].filter(test); // [{foo: 'abc'}, {foo: 'bac'}]


#### `beginsWith`
Will check if a string begins with the given value.

    var test = pursuit({
        foo: { beginsWith: 'ba' }
    });

    [{foo: 'abc'}, {foo: 'bac'}, {foo: 'acd'}].filter(test); // [{foo: 'bac'}]


#### `endsWith`
Will check if a string ends with the given value.

    var test = pursuit({
        foo: { endsWith: 'ac' }
    });

    [{foo: 'abc'}, {foo: 'bac'}, {foo: 'acd'}].filter(test); // [{foo: 'bac'}]


#### `typeOf`
Will check if the input is of a certain JavaScript type.

    var test = pursuit({
        foo: { typeOf: 'string' }
    });

    [{foo: 'abc'}, {foo: 5}, {foo: false}].filter(test); // [{foo: 'abc'}]

It can check for the following types: `string`, `number`, `object`, `boolean`, `array`, and `null`.

The test for `object` does not return true for `null` values. At the time being `object` return true for arrays. I do not know if it should stay that way.


#### `isSet`
Will check if the key is set to a value (everything but `null` or `undefined`) on an object; value can be `true` for set; and or `false` for not set.

    var test = pursuit({
        foo: { isSet: true },
        bar: { isSet: false }
    });


    [{foo: 1}, {bar: 2}, {foo: 3, bar: null}].filter(test) // [{foo: 1}, {foo: 3, bar: null}]

**Notice**, `isSet` will return true if the set value is set to anything but `undefined` or `null`. Falsy values like `0`, `false` and `""` (the empty string) will return `true`.


#### `hasBeenTouched`
Will check if a key has been set on an object. It will return true even if the value is set to `undefined` or `null`. It will always return `true` (or `false` if set to check if a value has not been touched) if the key is the root object:

    var test = pursuit({ hasBeenTouched: true });
    test(undefined); // true

It is more useful in nested objects.

    var test = pursuit({ foo: { hasBeenTouched: true }});
    [{foo: null, bar: 1}, { bar: 1 }, {foo: 2}].filter(test); // [{foo: null, bar: 1}, {foo: 2}]

In most cases you would use the `isSet` function that return true for any value except undefined or null.


### `!not`
By using the `!not` property you can invert the result of any check.

    var test = pursuit({
        foo: {
            '!not': { equals: 'bac' }
        }
    });

    [{foo: 'abc'}, {foo: 'bac'}, {foo: 'acd'}].filter(test); // [{foo: 'abc'}, {foo: 'acd'}]

Notice: The not-operator is prefixed with a bang. This makes it possible to use the word `not` as the name of a key, if you are testing properties in a nestet object, in your input object.


### Nested objects
The language supports testing on values inside of objects that has a nestet structure, such as:

    var sites = [
        {
            'title': 'The Red Site',
            config: {
                'background-color': 'red'
            }
        },
        {
            'title': 'The Blue Site',
            config: {
                'background-color': 'blue'
            }
        }
    ];

To get all the sites with a red background color construct your query like this:

    var test = pursuit({
        config: {
            'background-color': {
                equals: 'red'
            }
        }
    });

    sites.filter(test); // [{'title': 'The Red Site', config: { 'background-color': 'red' } }]


### OR
Alternative queries can be created by using Arrays. The following will check for `bar === 5` OR `bar === 10`.

    var test = pursuit([
        { bar: {equals: 5}},
        { bar: {equals: 10}}
    ]);

    [{bar: 5}, {bar: 6}, {bar: 10}, {bar: 11}].filter(test); // [{bar: 5}, {bar: 10}]

It will check in the order they checks are written in the array, so consider the order of your checks, as it will return true as soon as it sees a match.


## Development
After cloning the project you will have to run `npm install` in the project root. This will install the various grunt plugins and other dependencies.


### QA tools
The QA tools rely on the [Grunt](http://gruntjs.com) task runner. To run any of these tools, you will need the grunt-cli installed globally on your system. This is easily done by typing the following in a terminal.

    $ npm install grunt-cli -g

The unit tests will need the [Buster](http://busterjs.org/) unit test framework.

    $ npm install -g buster

These two commands will install the buster and grunt commands on your system. These can be removed by typing `npm uninstall buster -g` and `npm uninstall grunt-cli -g`.


#### Unit Tests
If you haven't all ready install the Grunt CLI tools and have a look at the grunt configuration file in the root of the project.

When developing you want to run the script watcher. Navigate to the project root and type the following in your terminal.

    $ grunt watch:scripts

This will run the jshint and tests each time a file has been modified.


#### Benchmarks
You can run the benchmarks by running `grunt benchmark`. This will output some simple benchmarks to `*project-root*/benchmark`.

The tests use a static data set, data.json, located in the benchmark folder. If you want a bigger data set a new one can be created by changing the number of times the random person generator is run in the `random-person.js`-file and run it by typing `node random-person.js` in a terminal.


## License
The MIT License (MIT)

Copyright (c) 2014 Martin Gausby

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
