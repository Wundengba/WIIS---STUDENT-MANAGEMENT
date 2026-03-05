export const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
export const today = () => new Date().toISOString().split("T")[0];

export function getGrade(score) {
  const s = Number(score);
  if (s >= 80) return "A1"; if (s >= 70) return "B2"; if (s >= 60) return "B3";
  if (s >= 55) return "C4"; if (s >= 50) return "C5"; if (s >= 45) return "C6";
  if (s >= 40) return "D7"; if (s >= 35) return "E8"; return "F9";
}

export const gradeChipStyle = s => {
  const n = Number(s);
  if (n >= 90) return { bg: "#f3f4f6", col: "#000000" };
  if (n >= 70) return { bg: "#dcfce7", col: "#166534" };
  if (n >= 50) return { bg: "#fef3c7", col: "#92400e" };
  return { bg: "#fee2e2", col: "#991b1b" };
};

export const statusChipStyle = s =>
  s === "approved" ? { bg: "#dcfce7", col: "#166534" } :
  s === "rejected" ? { bg: "#fee2e2", col: "#991b1b" } :
                     { bg: "#fef3c7", col: "#92400e" };

export function getScoreAggregate(score) {
  const s = Number(score);
  if (s >= 90) return 1;
  if (s >= 80) return 2;
  if (s >= 75) return 3;
  if (s >= 70) return 4;
  if (s >= 65) return 5;
  if (s >= 60) return 6;
  if (s >= 55) return 7;
  if (s >= 50) return 8;
  return 9;
}

export const average = nums =>
  nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;

export function validateSelections(choices, schools) {
  if (choices.length !== 7) return "Select exactly 7 schools.";
  const catA = choices.filter(id => schools.find(s => String(s.id) === String(id))?.category === "A").length;
  const catB = choices.filter(id => schools.find(s => String(s.id) === String(id))?.category === "B").length;
  const catC = 7 - catA - catB;

  const allowed = (
    (catA === 0 && catB === 0 && catC === 7) || // 7 CAT C
    (catA === 1 && catB === 0 && catC === 6) || // 1 CAT A + 6 CAT C
    (catA === 0 && catB === 1 && catC === 6) || // 1 CAT B + 6 CAT C
    (catA === 0 && catB === 2 && catC === 5) || // 2 CAT B + 5 CAT C
    (catA === 1 && catB === 2 && catC === 4)    // 1 CAT A + 2 CAT B + 4 CAT C
  );

  if (!allowed) return "Invalid category combination. Allowed: 7 CAT C; 1A+6C; 1B+6C; 2B+5C; 1A+2B+4C.";
  return null;
}

export const isValidGhanaPhone = num => /^0[235]\d{8}$/.test(num);
