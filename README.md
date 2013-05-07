# Pursuit - A JavaScript Object Query Language

Pursuit is a Object Query Language written for JavaScript. It compiles a given query into JavaScript code for optimal performance when checking many objects for certain characteristics. All compiled functions returns a boolean value, making them useful in filter functions.

This project is heavily inspired by [Mathias Buus](https://github.com/mafintosh)'s [CopenhagenJS](http://copenhagenjs.dk/) talk on [JSON query compilation](https://github.com/mafintosh/json-query-compilation).


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


### Adding new properties to the query language
Have a look in the source code and find the `directory`-object.

Adding a new property is as simple as creating a new key-value-pair. The key will be the name of your property and the value will be a function that takes two arguments, `key` and `value`, and returns a string of JavaScript source-code. Available to this returned source code is a special variable called `entry`, which is the object that is passed to the generated matching function.

The code for the `equals` property could be (and is) written as:

    var dictionary = {
        // ...
        equals: function (key, value) {
            return 'entry['+key+'] === ' + value;
        }
        // ...
    }

To understand what `key` and `value` correspond to, read the following usage example.

    var test = pursuit({
        'foo': {
            'equals': 'test'
        }
    });

The `key`, in the the function set in the `dictionary`, correspond in this example to `foo`, and the value to `test`, as seen in the generated output.

    pursuit({
        'foo': {
            'equals': 'test'
        }
    }).toString();

    // Will return the string:
    // function anonymous(entry) {
    // return entry["foo"] === "test"
    // }

Both `key` and `value` has been run through `JSON.stringify` before getting passed to the any of the dictionary-functions--unless the `value` is a native JavaScript regular expression; these are just passed through untouched.


## License
The MIT License (MIT)

Copyright (c) 2013 Martin Gausby

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
