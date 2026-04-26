export interface Violation {
  id: string;
  impact?: 'minor' | 'moderate' | 'serious' | 'critical' | null;
  tags: string[];
  description: string;
  help: string;
  helpUrl: string;
  nodes: any[];
}

export function calculateScore(violations: any[]) {
  // Base score
  let score = 100;
  
  // Weights for different impact levels
  const weights: Record<string, number> = {
    critical: 10,
    serious: 5,
    moderate: 2,
    minor: 1
  };

  const counts: Record<string, number> = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0
  };

  violations.forEach(v => {
    const impact = (v.impact || 'minor') as string;
    if (impact in counts) {
      counts[impact] = (counts[impact] || 0) + 1;
      score -= (weights[impact] || 0);
    }
  });

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  return {
    score,
    counts
  };
}
