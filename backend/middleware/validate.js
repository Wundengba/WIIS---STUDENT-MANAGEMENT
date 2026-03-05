// Simple validation middleware
const validateStudent = (req, res, next) => {
  const { full_name, index_number, gender, dob, parent_contact } = req.body;
  if (!full_name?.trim())     return res.status(400).json({ error: "full_name is required" });
  if (!/^\d{12}$/.test(index_number)) return res.status(400).json({ error: "index_number must be 12 digits" });
  if (!["Male","Female"].includes(gender)) return res.status(400).json({ error: "gender must be Male or Female" });
  if (!dob)                   return res.status(400).json({ error: "dob is required" });
  if (!parent_contact?.trim()) return res.status(400).json({ error: "parent_contact is required" });
  // normalize and enforce exactly 10 digits for parent contact
  const pcDigits = String(parent_contact).replace(/\D/g, "");
  if (!/^\d{10}$/.test(pcDigits)) return res.status(400).json({ error: "parent_contact must be exactly 10 digits" });
  req.body.parent_contact = pcDigits;
  next();
};

// Partial validator for PATCH updates: only validate parent_contact if present
const validateStudentPartial = (req, res, next) => {
  if (req.body.parent_contact != null) {
    const pc = String(req.body.parent_contact || "").trim();
    if (!pc) return res.status(400).json({ error: "parent_contact is required" });
    const pcDigits = pc.replace(/\D/g, "");
    if (!/^\d{10}$/.test(pcDigits)) return res.status(400).json({ error: "parent_contact must be exactly 10 digits" });
    req.body.parent_contact = pcDigits;
  }
  next();
};

const validateScores = (req, res, next) => {
  const { student_id, subject, score } = req.body;
  if (!student_id) return res.status(400).json({ error: "student_id is required" });
  if (!subject)    return res.status(400).json({ error: "subject is required" });
  if (score == null || score < 0 || score > 100)
    return res.status(400).json({ error: "score must be 0-100" });
  next();
};

const validateSelection = (req, res, next) => {
  const { student_id, choices } = req.body;
  if (!student_id)       return res.status(400).json({ error: "student_id required" });
  if (!Array.isArray(choices) || choices.length !== 7)
    return res.status(400).json({ error: "choices must be array of exactly 7 school IDs" });
  // ensure selections are unique
  const uniq = new Set(choices.filter(Boolean));
  if (uniq.size !== choices.length) return res.status(400).json({ error: "choices must be unique" });
  next();
};

module.exports = { validateStudent, validateStudentPartial, validateScores, validateSelection };
