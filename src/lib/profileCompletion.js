export function calculateProfileCompletion(user, projectCount = 0) {
  let completion = 0;
  
  // Name: 10%
  if (user.name && user.name.trim().length > 0) {
    completion += 10;
  }
  
  // Email: 10%
  if (user.email && user.email.trim().length > 0) {
    completion += 10;
  }
  
  // Image: 15%
  if (user.image && user.image.trim().length > 0) {
    completion += 15;
  }
  
  // Category: 15%
  if (user.category && user.category.trim().length > 0) {
    completion += 15;
  }
  
  // Semester: 15%
  if (user.semester && user.semester > 0) {
    completion += 15;
  }
  
  // Bio: 20%
  if (user.bio && user.bio.trim().length > 0) {
    completion += 20;
  }
  
  // At least one project: 15%
  if (projectCount > 0) {
    completion += 15;
  }
  
  return Math.min(100, completion);
}

