const supabase = require("../config/supabase");

exports.getAll = async (req, res) => {
  const { data, error } = await supabase.from("scores").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.getByStudent = async (req, res) => {
  const { data, error } = await supabase.from("scores").select("*").eq("student_id", req.params.studentId);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.upsert = async (req, res) => {
  const { student_id, subject, score } = req.body;
  const { data, error } = await supabase.from("scores")
    .upsert({ student_id, subject, score, updated_at: new Date().toISOString() }, { onConflict: "student_id,subject" })
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};
