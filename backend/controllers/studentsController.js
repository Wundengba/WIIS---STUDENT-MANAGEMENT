const supabase = require("../config/supabase");

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    
    const fileName = `${Date.now()}_${req.file.originalname}`;
    const { data, error } = await supabase.storage
      .from("student-photos")
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
    
    if (error) return res.status(400).json({ error: error.message });
    
    const { data: { publicUrl } } = supabase.storage
      .from("student-photos")
      .getPublicUrl(fileName);
    
    res.json({ photoUrl: publicUrl, fileName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.getOne = async (req, res) => {
  const { data, error } = await supabase.from("students").select("*").eq("id", req.params.id).single();
  if (error) return res.status(404).json({ error: "Student not found" });
  res.json(data);
};

exports.create = async (req, res) => {
  const { full_name, index_number, gender, dob, parent_contact, photo_url } = req.body;
  const { data, error } = await supabase.from("students").insert({ full_name, index_number, gender, dob, parent_contact, photo_url }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

exports.update = async (req, res) => {
  const { data, error } = await supabase.from("students").update(req.body).eq("id", req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.remove = async (req, res) => {
  const { error } = await supabase.from("students").delete().eq("id", req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Student deleted" });
};
