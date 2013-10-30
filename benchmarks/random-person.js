/* global module require __dirname console */
'use strict';
var fs = require('fs');
var path = require('path');

var firstNamesMale = ['Michael', 'Christopher', 'Joshua', 'Matthew', 'Daniel', 'David', 'Andrew', 'Justin', 'Ryan', 'Robert', 'James', 'Nicholas', 'Joseph', 'John', 'Jonathan', 'Kevin', 'Kyle', 'Brandon', 'William', 'Eric', 'Jose', 'Steven', 'Jacob', 'Brian', 'Tyler', 'Zachary', 'Aaron', 'Alexander', 'Adam', 'Thomas', 'Richard', 'Timothy', 'Benjamin', 'Jason', 'Jeffrey', 'Sean', 'Jordan', 'Jeremy', 'Travis', 'Cody', 'Nathan', 'Mark', 'Jesse', 'Charles', 'Juan', 'Samuel', 'Patrick', 'Dustin', 'Scott', 'Stephen', 'Paul', 'Bryan', 'Luis', 'Derek', 'Austin', 'Kenneth', 'Carlos', 'Gregory', 'Alex', 'Cameron', 'Jared', 'Jesus', 'Bradley', 'Christian', 'Corey', 'Victor', 'Cory', 'Miguel', 'Tylor', 'Edward', 'Francisco', 'Trevor', 'Adrian', 'Jorge', 'Ian', 'Antonio', 'Shawn', 'Ricardo', 'Vincent', 'Edgar', 'Erik', 'Peter', 'Shane', 'Evan', 'Chad', 'Alejandro', 'Brett', 'Gabriel', 'Eduardo', 'Raymond', 'Phillip', 'Mario', 'Marcus', 'Manuel', 'George', 'Martin', 'Spencer', 'Garrett', 'Casey'];

var firstNamesFemale = ['Jessica', 'Ashley', 'Amanda', 'Brittany', 'Sarrah', 'Jennifer', 'Stephanie', 'Samantha', 'Elizabeth', 'Megan', 'Nicole', 'Lauren', 'Melissa', 'Amber', 'Michelle', 'Heather', 'Christina', 'Rachel', 'Tiffany', 'Kayla', 'Danielle', 'Vanessa', 'Rebecca', 'Laura', 'Courtney', 'Katherine', 'Chelsea', 'Kimberly', 'Sara', 'Kelsey', 'Andrea', 'Alyssa', 'Crystal', 'Maria', 'Amy', 'Alexandra', 'Erica', 'Jasmine', 'Natalie', 'Hanna', 'Angela', 'Kelly', 'Brittney', 'Mary', 'Cassandra', 'Erin', 'Victoria', 'Jacqueline', 'Jamie', 'Lindsey', 'Alicia', 'Lisa', 'Katie', 'Allison', 'Kristen', 'Cynthia', 'Anna', 'Caitlin', 'Monica', 'Christine', 'Diana', 'Erika', 'Veronica', 'Kathryn', 'Whitney', 'Brianna', 'Nancy', 'Shannon', 'Kristina', 'Lindsay', 'Kristin', 'Marissa', 'Patricia', 'Brooke', 'Brenda', 'Angelica', 'Morgan', 'Adriana', 'April', 'Ana', 'Taylor', 'Tara', 'Jordan', 'Jenna', 'Catherine', 'Alexis', 'Karen', 'Melanie', 'Natasha', 'Sandra', 'Julie', 'Bianca', 'Krystal', 'Mayra', 'Holly', 'Alexandria', 'Monique', 'Leslie', 'Katelyn'];

var surNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell', 'Long', 'Patterson', 'Hughes', 'Flores', 'Washington', 'Butler', 'Simmons', 'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Diaz', 'Hayes'];

var occupations = ['Software Architect', 'Physician Assistant', 'Management Consultant', 'Physical Therapist', 'Environmental Engineer', 'Civil Engineer', 'Database Administrator', 'Sales Director', 'Certified Public Accountant', 'Biomedical Engineer', 'Actuary', 'Dentist', 'Nurse Anesthetist', 'Risk Management Manager', 'Product Management Director', 'Healthcare Consultant', 'Information Systems Security Engineer', 'Software Engineering', 'Occupational Therapist', 'Information Technology Manager', 'Telecommunications Network Engineer', 'Environmental Health & Safety Specialist', 'Construction Project Manager', 'Network Operations Project Manager', 'Emergency Room Physician', 'Information Technology Business Analyst', 'Director of Nursing', 'Information Technology Consultant', 'Psychiatrist', 'Test Software Development Engineer', 'Information Technology Network Engineer', 'Senior Sales Executive', 'Information Technology Program Manager', 'Primary Care Physician', 'Computer and Information Scientist', 'Hospital Administrator', 'Programmer Analyst', 'Applications Engineer', 'Research & Development Manager', 'Regional Sales Manager', 'Project Engineer', 'Training Development Director', 'Human Resources Consultant', 'Speech-Language Pathologist', 'Business Development Analyst', 'Physical Therapy Director', 'Structural Engineer', 'Nursing Home Director', 'Systems Engineer', 'Healthcare Services Program Director', 'Transportation Engineer', 'Operations Research Analyst', 'Practice Administrator', 'Construction Estimator', 'Lawyer', 'Optometrist', 'Clinical Research Associate', 'Employment Recruiter', 'Intensive Care Unit Nurse', 'Information Technology Specialist', 'Marketing Consultant', 'Tax Manager', 'General Sales Manager', 'Statistician', 'Nurse Practitioner', 'Systems Administrator', 'Web Developer', 'Anesthesiologist', 'Accounting Director', 'Technical Services Manager', 'Social Worker', 'Customer Service Manager', 'Sales Account Manager', 'Rehabilitation Services Director', 'General Surgeon', 'Biotechnology Research Scientist', 'Information Technology Systems Manager', 'Auditing Manager', 'Information Technology Training Specialist', 'Outside Sales Manager', 'Category Manager', 'Practice Manager', 'Compensation Analyst', 'Public Relations Director', 'Environmental Project Manager', 'Clinical Services Director', 'Director of Communications', 'Technical Writer', 'Business Operations Manager', 'Construction Superintendent', 'Business Manager', 'Senior Product Development Scientist', 'Senior Data Analyst', 'Architect', 'Information Technology Project Coordinator', 'Web Project Manager', 'Geographic Information Systems Analyst', 'Security Director', 'Medical Case Manager', 'Obstetrician'];

var genders = ['Female', 'Male'];

function randomPerson () {
    var result = {};
    var gender = genders[Math.floor(Math.random() * genders.length)];

    result.name = {};

    if (gender === 'Female') {
        result.name.first = firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
    }
    else {
        result.name.first = firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)];
    }

    result.name.last = surNames[Math.floor(Math.random() * surNames.length)];

    result.gender = gender;
    result.age = Math.ceil(Math.random() * 100);

    result.occupation = occupations[Math.floor(Math.random() * occupations.length)];

    return result;
}

var data = [];
for (var i = 0; i < 100; i += 1) {
    data.push(randomPerson());
}

fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(data), function(err) {
    if (err) {
        throw err;
    }
    console.log('Done! Wrote results to:', path.join(__dirname,'data.json'));
});