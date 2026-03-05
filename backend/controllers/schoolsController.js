const supabase = require('../config/supabase');

exports.getAll = async (req, res) => {
  const { data, error } = await supabase.from('schools').select('*').order('id', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
