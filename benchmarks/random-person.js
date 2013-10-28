/* global module */
'use strict';
var firstNames = ['Anders', 'Brian', 'Calle', 'Jonas', 'Peter', 'Kalle', 'Ingolf', 'Janus'];
var lastNames = ['Andersen', 'Bentsen', 'Callesen', 'Hansen', 'Halmstad', 'Jensen', 'Petersen'];
var occupations = ['Milkman', 'Fireman', 'Programmer', 'Police man', 'Ghost Buster'];

module.exports = function () {
    var result = {};

    result.age = Math.ceil(Math.random() * 100);
    result.name = {
        first: firstNames[Math.floor(Math.random() * firstNames.length)],
        last: lastNames[Math.floor(Math.random() * lastNames.length)]
    };
    result.occupation = occupations[Math.floor(Math.random() * occupations.length)];

    return result;
}
