const fs = require('fs');
let file = fs.readFileSync('src/pages/admin/ClinicSettings.tsx', 'utf8');
file = file.replace(/className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none"/g, 'className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none placeholder:text-slate-400 placeholder:opacity-[0.45] transition-all"');
file = file.replace(/className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none max-w-md"/g, 'className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-600 outline-none placeholder:text-slate-400 placeholder:opacity-[0.45] transition-all max-w-md"');
fs.writeFileSync('src/pages/admin/ClinicSettings.tsx', file);
