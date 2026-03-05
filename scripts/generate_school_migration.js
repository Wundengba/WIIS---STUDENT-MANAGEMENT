const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const schoolsFile = path.join(workspaceRoot, 'frontend', 'src', 'data', 'schools.js');
const outFile = path.join(workspaceRoot, 'supabase', 'migrations', '20260304124033_load-all-schools.sql');

const src = fs.readFileSync(schoolsFile, 'utf8');
const marker = 'const _ALL_SCHOOLS = ';
const start = src.indexOf(marker);
if (start === -1) {
  console.error('Could not find _ALL_SCHOOLS declaration in', schoolsFile);
  process.exit(1);
}
const arrStart = src.indexOf('[', start);
const arrEnd = src.indexOf('];', arrStart);
if (arrStart === -1 || arrEnd === -1) {
  console.error('Could not locate array bounds');
  process.exit(1);
}
const arrText = src.slice(arrStart, arrEnd + 1);
let schools;
try {
  // evaluate the array literal safely
  schools = eval(arrText); // array of objects
} catch (err) {
  console.error('Failed to eval schools array:', err);
  process.exit(1);
}

function escapeSql(s){
  return (s || '').replace(/'/g, "''");
}

let sql = "-- Delete sample schools and insert all real schools (956 total)\n";
sql += "DELETE FROM schools;\n\n";
const batchSize = 100;
for (let i=0;i<schools.length;i+=batchSize){
  const batch = schools.slice(i,i+batchSize);
  sql += "INSERT INTO schools (id, name, category, region) VALUES\n";
  sql += batch.map(s => `(${s.id},'${escapeSql(s.name)}','${escapeSql(s.category)}','${escapeSql(s.region)}')`).join(',\n');
  sql += ";\n\n";
}

fs.writeFileSync(outFile, sql, 'utf8');
console.log('Wrote batched migration to', outFile);
console.log('Rows written:', schools.length);
