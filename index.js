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

// Sort categories independently for fair allocation
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

  // If no preference matched
  return { allocated: false, college: null, course: null };
}

// Step 3: Track allocation results in a map { studentId -> allocation }
let allocationMap = {};

// Process category by category (sorted)
[bc, obc, scst].forEach(group => {
  group.forEach(student => {
    allocationMap[student.id] = allocateStudent(student, colleges);
  });
});

// Step 4: Rebuild results in the **original order**
let results = students.map(student => {
  let allocation = allocationMap[student.id];
  return { name: student.name, ...allocation };
});

// Step 5: Save results into allocation.json
fs.writeFileSync('./allocation.json', JSON.stringify(results, null, 2));

console.log("✅ Allocation complete! Check allocation.json");
