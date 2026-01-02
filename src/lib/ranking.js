export function calculateRankingScore(user, messageCount = 0) {
  // Primary: Profile completion % (0-100)
  const completionScore = user.profileCompletionPercent || 0;
  
  // Secondary: Recently active (days since last update, inverted)
  const daysSinceUpdate = user.updatedAt 
    ? Math.floor((Date.now() - new Date(user.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  const recencyScore = Math.max(0, 100 - daysSinceUpdate * 2); // Decay by 2 points per day
  
  // Tertiary: Most contacted (message count, normalized)
  const contactScore = Math.min(100, messageCount * 5); // 5 points per message, max 100
  
  // Weighted combination
  // Primary: 50%, Secondary: 30%, Tertiary: 20%
  const finalScore = 
    completionScore * 0.5 +
    recencyScore * 0.3 +
    contactScore * 0.2;
  
  return finalScore;
}

export function sortUsersByRanking(users, messageCounts = {}) {
  return users.sort((a, b) => {
    const scoreA = calculateRankingScore(a, messageCounts[a._id] || 0);
    const scoreB = calculateRankingScore(b, messageCounts[b._id] || 0);
    
    if (scoreB !== scoreA) {
      return scoreB - scoreA; // Descending
    }
    
    // Tie-breaker: Most recent update
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  });
}

