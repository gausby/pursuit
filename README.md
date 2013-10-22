# Pursuit - A JavaScript Object Query Language

Pursuit is a Object Query Language written for the V8 JavaScript engine. It compiles a given query into JavaScript code for optimal performance when checking many objects for certain characteristics. All compiled functions returns a boolean value, making them useful in filter functions.

This project is heavily inspired by [Mathias Buus](https://github.com/mafintosh)'s [CopenhagenJS](http://copenhagenjs.dk/) talk on [JSON query compilation](https://github.com/mafintosh/json-query-compilation).

It does use [`new Function`](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function) to compile the generated code into functional code, so take great precautions with what you trust it with. Think twice before using it to generate code on the client-side.


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


### Matchers
The following section will describe the build-in matchers. A property can have more than one check inside of it.


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


#### `instanceOf`
Will check if the input is of a given JavaScript object instance.

    var A = function () {};
    var B = function () {};

    var test = pursuit({
        foo: { instanceOf: A }
    });

    [{foo: (new A())}, {foo: (new B())}, {foo: (new A())}].filter(test); // [{foo: function() {}}, {foo: function() {}}]


#### `isSet`
Will check if the key is set on an object; value can be `true` for set; and or `false` for not set.

    var test = pursuit({
        foo: { isSet: true },
        bar: { isSet: false }
    });

    [{foo: 1}, {bar: 2}, {foo: 1, bar: 2}].filter(test); // [{foo: 1}]

**Notice**, isSet will return true if the set value is set to `undefined` or `null`.


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
If you need to test values inside of objects that has a nestet structure, such as:

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

To get all the sites with a red background color wirte this:

    var test = pursuit({
        config: {
            'background-color': {
                equals: 'red'
            }
        }
    });

    sites.filter(test); // [{ 'title': 'The Red Site', ... }]


### OR
Alternative queries can be created by using Arrays. The following will check for `bar === 5` OR `bar === 10`.

    var test = pursuit([
        { bar: {equals: 5}},
        { bar: {equals: 10}}
    ]);

    [{bar: 5}, {bar: 6}, {bar: 10}, {bar: 11}].filter(test); // [{bar: 5}, {bar: 10}]

It will check in the order they checks are written in the array, so consider the order of your checks, as it will return true as soon as it sees a match.


### Creating your own query language
It is possible to configure Pursuit with a different directory object just by passing a configuration on initialization. The following will create a matcher that will test for equality (`$eq`), less-than (`$lt`), and greater-than (`$gt`).

    var customLanguage = {
        dictionary: {
            $eq: function (value) {
                return this.getScope() +' === '+value;
            },
            $lt: function (value) {
                return this.getScope() +' < '+value;
            },
            $gt: function (value) {
                return this.getScope()+' > '+value;
            }
        }
    };

    var test = pursuit.call(customLanguage, {
        foo: { $eq: 'bar' },
        bar: { $lt: 5 },
        baz: { $gt: 10 }
    });

    console.log(test({ foo: 'bar', bar: 1, baz: 50 })); // true

More on how to extend the language in the development section.


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

Notice, these benchmarks are only usable if they are run on the same computer, because it measures the time a task takes. The parameters that could influence this vary from system to system. That said, if you run benchmarks once in a while, while trying to optimize the speed of the library, it should give you some insights. Some insights are better than none.


#### Documentation
The project uses YUIDocs that can be generated by running `grunt yuidoc`. This will create a site with documentation in a folder called `docs/` in the project root which can be served on port 8888 by typing `grunt connect:docs`. If you want to generate docs on file modification you can run `grunt watch:docs`.


### Inspecting Generated Source Code
If you need to inspect the source code generated by Pursuit, pass it a debug flag like this:

    var test = pursuit.call({ debug: true }, {
        foo: { 'equals': 'bar' }
    });

    console.log(test); // 'return entry["foo"] === "bar"'

`test` will hold a string representation of the generated source code.


### Adding new properties to the query language
Have a look in the source code and find the `directory`-object in the `default-directory.js`-file.

Adding a new property is as simple as creating a new key-value-pair. The key will be the name of your property and the value will be a function that takes one argument, `value`, and should return a string of valid JavaScript source-code. Available to this returned source code is a special variable called `entry`, which is the object that is passed to the generated matching function.

The code for the build-in `equals`-property could be (and is) written as:

    var dictionary = {
        equals: function (value) {
            return this.getScope() + ' === ' + value;
        }
    }

Within a dictionary function `this.scope` will correspond to the current scope; `this.key` will refer to the current key in the scope; a check for the existence of the parent objects will automatically be generated for you when we are dealing with nestet scopes. A convenience function called `this.getScope()` is accessable and will create the correct.

To understand what `this.key` and `value` correspond to, read the following usage example.

    var test = pursuit({
        'foo': {
            'equals': 'test'
        }
    });

The `this.key`, in the the function set in the `dictionary`, correspond in this example to `foo`, and the value to `test` as seen in the generated output.

    // The previous example will result in a function like this:
    function anonymous(entry) { return entry["foo"] === "test" }

Both `key` and `value` has been run through `JSON.stringify` before getting passed to the any of the dictionary-functions--unless the `value` is a native JavaScript regular expression or a function; these are just passed through untouched.


## License
The MIT License (MIT)

Copyright (c) 2013 Martin Gausby

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
