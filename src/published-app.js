import {connectionMap,bindConnectionMap} from './views/connection-map.js';
import {slp} from './views/slp.js';
import {scmp} from './views/scmp.js';
import {navigation,groupView} from './published-views.js';
const app=document.querySelector('#app'),state={layer:'All',role:'Public',tab:'Overview'};let model,lastCode;
function render(){
 let parts=location.hash.slice(1).split('/'),id;try{id=decodeURIComponent(parts[2]||'');}catch{id='';}
 if(parts[1]==='connections'){app.innerHTML=connectionMap();}
 else if(parts[1]==='scmp'){if(id!==lastCode)state.tab='Overview';lastCode=id;app.innerHTML=navigation(model)+scmp(model,state,id);}
 else if(parts[1]==='group')app.innerHTML=groupView(model,id);
 else if(parts[1]==='cabin'&&id!==model.meta.cabinId)app.innerHTML='<main><h1>Cabin not available</h1>'+navigation(model)+'</main>';
 else app.innerHTML=navigation(model)+slp(model,state);
 bindConnectionMap(model);
 document.querySelectorAll('[data-layer]').forEach(b=>b.onclick=()=>{state.layer=b.dataset.layer;render();});
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;render();});
 const group=document.querySelector('#group-select');if(group)group.onchange=()=>{if(group.value)location.hash='/group/'+encodeURIComponent(group.value);};
 const select=document.querySelector('#component-select');if(select)select.onchange=()=>{if(select.value)location.hash=select.value;};
 const role=document.querySelector('#viewer-role');if(role)role.onchange=()=>{state.role=role.value;render();};
}
fetch('data/passport.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(m=>{model=m;render();window.addEventListener('hashchange',render);}).catch(()=>{app.innerHTML='<main><h1>Published passport unavailable</h1><p>Serve this package through a static HTTP(S) server; check that data/passport.json is present.</p></main>';});
