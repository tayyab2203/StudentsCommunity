export function calculateSkillMatchScore(viewer, student) {
  if (!viewer || !student) return 0;
  
  let score = 0;
  
  // Category match: 50% (same = 50%, different = 0%)
  if (viewer.category && student.category) {
    if (viewer.category === student.category) {
      score += 50;
    }
  }
  
  // Semester proximity: 50% (closer = higher)
  if (viewer.semester && student.semester) {
    const semesterDiff = Math.abs(viewer.semester - student.semester);
    // Maximum 8 semesters, so proximity score = 50 * (1 - diff/8)
    const proximityScore = Math.max(0, 50 * (1 - semesterDiff / 8));
    score += proximityScore;
  }
  
  return Math.round(score);
}

