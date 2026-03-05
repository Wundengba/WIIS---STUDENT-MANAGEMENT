const supabase = require("../config/supabase");

exports.getAll = async (req, res) => {
  const { data, error } = await supabase.from("selections").select("*, students(full_name, index_number)").order("submitted_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.getByStudent = async (req, res) => {
  const { data, error } = await supabase.from("selections").select("*").eq("student_id", req.params.studentId).single();
  if (error) return res.status(404).json({ error: "No selection found" });
  res.json(data);
};

exports.submit = async (req, res) => {
  const { student_id, choices } = req.body;

  if (!Array.isArray(choices)) return res.status(400).json({ error: "choices must be an array" });
  if (choices.length !== 7) return res.status(400).json({ error: "Select exactly 7 schools." });

  // ensure selections are unique
  const uniq = new Set(choices.filter(Boolean));
  if (uniq.size !== choices.length) return res.status(400).json({ error: "Duplicate schools selected." });

  // Validate categories server-side by fetching the selected schools
  const { data: selectedSchools, error: fetchErr } = await supabase
    .from("schools").select("id, category").in("id", choices);
  if (fetchErr) return res.status(500).json({ error: fetchErr.message });
  if (!selectedSchools || selectedSchools.length !== 7)
    return res.status(400).json({ error: "Some selected schools were not found." });

  const catA = selectedSchools.filter(s => s.category === "A").length;
  const catB = selectedSchools.filter(s => s.category === "B").length;
  const catC = 7 - catA - catB;
  const allowed = (
    (catA === 0 && catB === 0 && catC === 7) ||
    (catA === 1 && catB === 0 && catC === 6) ||
    (catA === 0 && catB === 1 && catC === 6) ||
    (catA === 0 && catB === 2 && catC === 5) ||
    (catA === 1 && catB === 2 && catC === 4)
  );
  if (!allowed) return res.status(400).json({ error: "Invalid category combination. Allowed: 7 CAT C; 1A+6C; 1B+6C; 2B+5C; 1A+2B+4C." });
  // Prevent changes if already approved
  const { data: existing, error: getErr } = await supabase.from("selections").select("id,status").eq("student_id", student_id).single();
  if (getErr && getErr.code !== "PGRST116") { /* PGRST116 = no rows? keep generic handling */ }
  if (existing && existing.status === "approved")
    return res.status(400).json({ error: "Selection already approved; cannot change." });

  const { data, error } = await supabase.from("selections")
    .upsert({ student_id, choices, status: "pending", submitted_at: new Date().toISOString() }, { onConflict: "student_id" })
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.removeByStudent = async (req, res) => {
  const studentId = req.params.studentId;
  const { data: existing, error: getErr } = await supabase.from("selections").select("id,status").eq("student_id", studentId).single();
  if (getErr) return res.status(404).json({ error: "No selection found" });
  if (existing.status === "approved") return res.status(400).json({ error: "Selection already approved; cannot clear." });
  const { error } = await supabase.from("selections").delete().eq("student_id", studentId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
};

exports.review = async (req, res) => {
  const { status, reason } = req.body;
  if (!["approved","rejected"].includes(status))
    return res.status(400).json({ error: "status must be approved or rejected" });
  const { data, error } = await supabase.from("selections")
    .update({ status, reason: reason || null, reviewed_at: new Date().toISOString() })
    .eq("id", req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.updateChoices = async (req, res) => {
  const { choices } = req.body;
  const selectionId = req.params.id;
  
  // Validate choices is an array
  if (!Array.isArray(choices)) return res.status(400).json({ error: "choices must be an array" });
  
  // Only allow admins to remove schools from approved selections
  const { data: existing, error: getErr } = await supabase.from("selections").select("id,status").eq("id", selectionId).single();
  if (getErr) return res.status(404).json({ error: "Selection not found" });
  if (existing.status !== "approved") return res.status(400).json({ error: "Can only modify approved selections" });
  
  // Update the choices
  const { data, error } = await supabase.from("selections")
    .update({ choices })
    .eq("id", selectionId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
