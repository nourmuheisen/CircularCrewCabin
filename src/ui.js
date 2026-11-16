import {roles} from './passport-model.js';
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const number=(v,d=2)=>typeof v==='number'&&Number.isFinite(v)?v.toLocaleString('en-GB',{minimumFractionDigits:d,maximumFractionDigits:d}):'n/a';
export const percent=v=>typeof v==='number'&&Number.isFinite(v)?number(v*100)+'%':'n/a';
export const value=v=>v==null?'Not available':typeof v==='number'?number(v):esc(v);
export const icon=name=>{const paths={leaf:'<path d="M20 4C8 3 3 9 5 15s14 7 15-11Z"/><path d="M4 21 16 9"/>',cube:'<path d="m12 2 10 5-10 5L2 7l10-5Z"/><path d="M2 7v11l10 5 10-5V7M12 12v11"/>',database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',tool:'<path d="m14 6 4-4c-8-2-11 4-8 9L2 19a2 2 0 0 0 3 3l8-8c5 3 11 0 9-8l-4 4-4-4Z"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',link:'<path d="m10 7 3-3a5 5 0 0 1 7 7l-3 3M14 17l-3 3a5 5 0 0 1-7-7l3-3M8 16l8-8"/>'};return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+(paths[name]||paths.cube)+'</svg>';};
export const header=(title,builder=false)=>'<header class="masthead"><div><div class="eyebrow">'+(builder?'INTERNAL WORKSPACE':'DIGITAL PRODUCT PASSPORT')+'</div><h1>'+title+'</h1><p>Circular Crew Cabin — Demonstrator</p></div><div class="brand"><div class="assessment"><img src="assets/damen-logo.png" alt="DAMEN"><span>Assessment</span><strong>CirCab V.07</strong></div><div class="brand-claim">TOWARDS<br>MORE<br>SUSTAINABLE<br>SHIPBUILDING<span></span></div></div></header>';
export const roleSelect=role=>'<label class="role-control">View as <select id="viewer-role" aria-label="Viewer role">'+roles.map(r=>'<option '+(role===r?'selected':'')+'>'+r+'</option>').join('')+'</select><small>Prototype access view</small></label>';
// Demonstrator ordering only: preserve every source component and its navigation code.
const orderedComponents=model=>{
 const priority=['ceiling system','floating floor','window','door'];
 const rank=c=>{const name=(c.identity.name||'').toLowerCase();const index=priority.indexOf(name);return index>=0?index:/\d/.test(name)?5:4;};
 return Object.values(model.components).sort((a,b)=>rank(a)-rank(b)||(rank(a)===4?(a.identity.name||'').localeCompare(b.identity.name||''):0));
};
export const componentSelect=(model,selected='')=>'<label class="component-control">Choose a passport <select id="component-select" aria-label="Choose a passport"><option value="">Select a component or group</option>'+(model.groups||[]).filter(g=>g.componentIds.some(id=>Object.hasOwn(model.components,id))).map(g=>'<option value="/group/'+encodeURIComponent(g.id)+'">'+esc(g.name)+' (Group)</option>').join('')+orderedComponents(model).map(c=>'<option value="/scmp/'+encodeURIComponent(c.identity.code)+'" '+(selected===c.identity.code?'selected':'')+'>'+esc(c.identity.name||'Unnamed component')+'</option>').join('')+'</select></label>';
export const metric=(label,v,unit='',tip='')=>'<div class="metric" '+(tip?'title="'+esc(tip)+'"':'')+'><strong>'+v+'<small>'+unit+'</small></strong><span>'+label+'</span></div>';
export const sectionTitle=(title,subtitle='',glyph='')=>'<div class="section-title">'+(glyph?'<span class="icon-disc">'+icon(glyph)+'</span>':'')+'<div><h2>'+title+'</h2>'+(subtitle?'<p>'+subtitle+'</p>':'')+'</div></div>';
export function composition(materials){
 return materials.length?'<div class="material-mass-records">'+materials.map(m=>'<div class="bar-row"><span>'+esc(m.part||m.name||'Unnamed material')+'</span><b>'+number(m.mass)+' kg</b></div>').join('')+'</div>':'<p class="empty">No material records available.</p>';
}
export function passportDirectory(model){return '<section class="passport-directory"><h2>Component passports</h2><p>Choose an individual component or explore a group.</p>'+componentSelect(model)+'</section>';}
export const flowBars=flow=>'<div class="bars flow">'+[['Virgin Material',flow?.virginShare],['Potential Waste',flow?.wasteShare],['Linear Flow Index',flow?.lfi]].map(([name,v],i)=>'<div class="bar-row"><span>'+name+'</span><div class="bar-track"><div class="bar shade-'+i+'" style="width:'+(typeof v==='number'?Math.max(0,Math.min(100,v*100)):0)+'%"></div></div><b>'+percent(v)+'</b></div>').join('')+'</div>';
export const scorePair=(connection,tools)=>'<div class="score-pair">'+metric('Connection',percent(connection))+metric('Tools & effort',percent(tools))+'</div>';
export const detailsGrid=pairs=>'<dl class="details-grid">'+pairs.map(([label,v])=>'<div><dt>'+esc(label)+'</dt><dd>'+v+'</dd></div>').join('')+'</dl>';
export const footer=()=>'<footer>CirCab <span>Maritime Passport Prototype</span><span>Circular Crew Cabin</span></footer>';



// SLP presentation summary only. Source material records and assessments stay unchanged.
export function materialCompositionSummary(materials){
 const totals=new Map();let missing=0;
 for(const m of materials){if(typeof m.mass!=='number'||!Number.isFinite(m.mass)){missing++;continue;}const name=String(m.name||'Unnamed material').trim()||'Unnamed material';totals.set(name,(totals.get(name)||0)+m.mass);}
 const ranked=[...totals].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])),rows=ranked.slice(0,6);
 if(ranked.length>6)rows.push(['Other',ranked.slice(6).reduce((sum,row)=>sum+row[1],0)]);
 return {rows,missing};
}
export function slpComposition(materials){
 const {rows,missing}=materialCompositionSummary(materials),max=Math.max(0,...rows.map(r=>r[1]));
 return (rows.length?'<div class="slp-material-chart">'+rows.map(([name,mass])=>'<div class="bar-row"><span>'+esc(name)+'</span><div class="bar-track"><div class="bar" style="width:'+(max>0?Math.max(0,mass/max*100):0)+'%"></div></div><b>'+number(mass)+'</b></div>').join('')+'</div>':'<p class="empty">No saved material masses available.</p>')+(missing?'<p class="muted">'+missing+' material record'+(missing===1?' has':'s have')+' no saved mass; shown totals include available values only.</p>':'');
}
