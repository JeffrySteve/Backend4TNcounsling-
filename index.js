const fs = require('fs');

// Load input data
let colleges = require('./colleges.json');
let students = require('./students.json');

// Step 1: Group & sort students by category and cutoff
function groupAndSortStudents(students, category) {
  return students
    .filter(s => s.category === category)
    .sort((a, b) => b.cutoff - a.cutoff); // higher cutoff first
}

let bc = groupAndSortStudents(students, "BC");
let obc = groupAndSortStudents(students, "OBC");
let scst = groupAndSortStudents(students, "SCST");

// Step 2: Allocation helper
function allocateStudent(student, colleges) {
  for (let pref of student.preferences) {
    let college = colleges.find(c => c.id === pref.collegeId);
    if (!college) continue;

    let course = college.courses.find(c => c.name === pref.courseName);
    if (!course) continue;

    if (course.seats[student.category] > 0) {
      // Allocate seat
      course.seats[student.category] -= 1;
      return { allocated: true, college: college.name, course: course.name };
    }
  }
  return { allocated: false };
}

// Step 3: Run allocation for all categories
let results = [];

[bc, obc, scst].forEach(group => {
  group.forEach(student => {
    let allocation = allocateStudent(student, colleges);
    results.push({ name: student.name, ...allocation });
  });
});

// Step 4: Save results into allocation.json
fs.writeFileSync('./allocation.json', JSON.stringify(results, null, 2));

console.log("✅ Allocation complete! Check allocation.json");
