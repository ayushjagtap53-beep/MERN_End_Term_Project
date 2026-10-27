/**
 * MediFlow Clinical Triage Engine
 * Calculates patient clinical urgency score (0 - 100) and triage tier (URGENT, MEDIUM, LOW)
 * based on chief complaint, symptom severity, duration, and clinical red flags.
 */

const RED_FLAGS = [
  'chest pain',
  'shortness of breath',
  'difficulty breathing',
  'loss of consciousness',
  'sudden slurred speech',
  'coughing blood',
  'uncontrolled bleeding',
  'sudden vision loss',
  'severe allergic reaction',
  'anaphylaxis',
  'worst headache of life'
];

function calculateTriageScore({
  chiefComplaint = '',
  symptomSeverity = 5, // 1 to 10 scale
  durationDays = 1,
  preExistingConditions = [],
  patientAge = 30,
  temperatureF = 98.6
}) {
  let score = 0;
  const flaggedConcerns = [];
  const normalizedComplaint = chiefComplaint.toLowerCase();

  // 1. Red Flag Detection (Automatic Critical Boost)
  let hasRedFlag = false;
  for (const flag of RED_FLAGS) {
    if (normalizedComplaint.includes(flag)) {
      hasRedFlag = true;
      score += 50;
      flaggedConcerns.push(`High-Risk Clinical Indicator: "${flag}" detected in chief complaint`);
      break;
    }
  }

  // 2. Patient-reported Symptom Severity (Scale 1-10 -> up to 30 points)
  const severityNum = Math.min(Math.max(Number(symptomSeverity) || 1, 1), 10);
  score += Math.round(severityNum * 3);

  // 3. Acute vs Chronic Factor
  // Highly acute severe symptoms get higher urgency than stable chronic issues
  if (durationDays <= 2 && severityNum >= 7) {
    score += 15;
    flaggedConcerns.push('Acute onset (< 48h) with high reported distress');
  } else if (durationDays > 14 && severityNum >= 6) {
    score += 10;
    flaggedConcerns.push('Persistent chronic symptoms exceeding 2 weeks');
  }

  // 4. Age Vulnerability (Pediatric < 5 or Geriatric > 65)
  const age = Number(patientAge) || 30;
  if (age < 5) {
    score += 10;
    flaggedConcerns.push('Pediatric patient triage vulnerability');
  } else if (age >= 65) {
    score += 10;
    flaggedConcerns.push('Geriatric patient risk factor');
  }

  // 5. Pre-existing Comorbidities
  if (Array.isArray(preExistingConditions) && preExistingConditions.length > 0) {
    const comorbidityCount = Math.min(preExistingConditions.length, 3);
    score += comorbidityCount * 5;
    flaggedConcerns.push(`Multiple comorbidities present (${preExistingConditions.join(', ')})`);
  }

  // 6. Pyrexia / Fever Check
  const temp = Number(temperatureF) || 98.6;
  if (temp >= 102.0) {
    score += 15;
    flaggedConcerns.push(`High pyrexia recorded (${temp}°F)`);
  }

  // Cap score between 0 and 100
  score = Math.min(Math.max(score, 5), 100);

  // Determine Triage Tier
  let triageLevel = 'LOW';
  let triageColor = 'green';
  let recommendedAction = 'Standard outpatient consultation schedule.';

  if (hasRedFlag || score >= 75) {
    triageLevel = 'URGENT';
    triageColor = 'red';
    recommendedAction = 'High priority clinical queue. Doctor alerted for immediate review.';
  } else if (score >= 40) {
    triageLevel = 'MEDIUM';
    triageColor = 'amber';
    recommendedAction = 'Moderate urgency. Prioritize in doctor queue before standard checkups.';
  }

  return {
    urgencyScore: score,
    triageLevel,
    triageColor,
    recommendedAction,
    flaggedConcerns,
    evaluatedAt: new Date()
  };
}

module.exports = {
  calculateTriageScore,
  RED_FLAGS
};
