// Graph and simulation are presentation-only; source records are never mutated.
export function connectionGraph(model){
 const lookup=model.components||{},nodesById=new Map(),edges=[],issues=[];
 const records=model.connectionMapRecords??model.detachability??[];
 const valid=id=>typeof id==='string'&&id===id.trim()&&id!=='NOT ATTACHED'&&(Object.hasOwn(lookup,id)||id==='SHIP STRUCTURE'||/^(SK|SV|SP|ST)-[A-Z0-9]+-\d+$/.test(id));
 for(const [index,r] of records.entries()){
  const source=r.provenance||r.source||{};
  if(source.sheet&&source.sheet!=='Detachability'){issues.push({record:r,source,message:'Not a Detachability record'});continue;}
  if(!valid(r.componentCode)||!valid(r.attachedTo)||r.componentCode===r.attachedTo){issues.push({record:r,source,message:r.attachedTo==='NOT ATTACHED'?'Recorded as not attached':'Invalid or missing connection endpoint'});continue;}
  for(const id of [r.componentCode,r.attachedTo])if(!nodesById.has(id)){
   const identity=lookup[id]?.identity,name=identity?.name||(id==='SHIP STRUCTURE'?'Ship structure':id===r.componentCode?r.componentName||id:id);
   const group=(model.groups||[]).find(g=>g.componentIds.includes(id))?.name||identity?.functionalGroup||(/wall/i.test(name)?name.replace(/\s+\d.*$/,'')+' family':identity?.layer||'Other referenced components');
   nodesById.set(id,{id,name,layer:identity?.layer|| (id===r.componentCode?r.layer:r.attachedLayer)||'',group,unresolved:!identity&&id!=='SHIP STRUCTURE',x:0,y:0,vx:0,vy:0});
  }
  // Undirected endpoint ordering. Distinct source rows remain independently inspectable.
  const [a,b]=[r.componentCode,r.attachedTo].sort();edges.push({id:'interface-'+index,a,b,record:r,source});
 }
 const nodes=[...nodesById.values()].sort((a,b)=>a.id.localeCompare(b.id)),groups=[...new Set(nodes.map(n=>n.group))].sort();
 const neighbours=new Map(nodes.map(n=>[n.id,new Set()]));for(const e of edges){neighbours.get(e.a).add(e.b);neighbours.get(e.b).add(e.a);}
 // Deterministic topology traversal seeds the physics; no physical coordinates are claimed.
 const remaining=new Set(nodes.map(n=>n.id)),ordered=[];
 while(remaining.size){const first=[...remaining].sort((a,b)=>neighbours.get(a).size-neighbours.get(b).size||a.localeCompare(b))[0],queue=[first];remaining.delete(first);while(queue.length){const id=queue.shift();ordered.push(nodesById.get(id));for(const next of [...neighbours.get(id)].sort())if(remaining.delete(next))queue.push(next);}}
 const radius=groups.length>1?Math.max(160,Math.sqrt(nodes.length)*48):0;
 groups.forEach((group,gi)=>{const members=ordered.filter(n=>n.group===group),angle=gi*Math.PI*2/groups.length;members.forEach((n,i)=>{const local=i*2.399963229728653,r=40*Math.sqrt(i+1);n.x=Math.cos(angle)*radius+Math.cos(local)*r;n.y=Math.sin(angle)*radius+Math.sin(local)*r;});});
 const pairs=new Map();for(const e of edges){const key=JSON.stringify([e.a,e.b]);if(!pairs.has(key))pairs.set(key,[]);pairs.get(key).push(e);}for(const list of pairs.values())list.forEach((e,i)=>{e.curve=(i-(list.length-1)/2)*22;});
 return {nodes,edges,issues,groups};
}
export function createMapSimulation(graph,initialHeat=1){
 const nodes=graph.nodes,byId=new Map(nodes.map(n=>[n.id,n])),links=[...new Map(graph.edges.map(e=>[JSON.stringify([e.a,e.b]),e])).values()];let heat=initialHeat;
 return {reheat(){heat=1;},tick(){
  if(!nodes.length)return false;
  const force=nodes.map(()=>({x:0,y:0})),indices=new Map(nodes.map((n,i)=>[n.id,i]));
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
   let dx=nodes[j].x-nodes[i].x,dy=nodes[j].y-nodes[i].y;if(Math.abs(dx)+Math.abs(dy)<.01){dx=.1*(j-i);dy=.1;}
   const d=Math.hypot(dx,dy),repel=Math.min(8,3800/(d*d));let fx=dx/d*repel,fy=dy/d*repel;
   // Label-sized elliptical collision keeps compact circles and their labels legible.
   const ellipse=Math.hypot(dx/175,dy/58);if(ellipse<1){fx+=dx/d*(1-ellipse)*5;fy+=dy/d*(1-ellipse)*5;}
   force[i].x-=fx;force[i].y-=fy;force[j].x+=fx;force[j].y+=fy;
  }
  for(const e of links){const a=byId.get(e.a),b=byId.get(e.b),dx=b.x-a.x,dy=b.y-a.y,d=Math.max(.01,Math.hypot(dx,dy)),f=(d-145)*.035;const i=indices.get(a.id),j=indices.get(b.id);force[i].x+=dx/d*f;force[i].y+=dy/d*f;force[j].x-=dx/d*f;force[j].y-=dy/d*f;}
  const centers=new Map();for(const n of nodes){const c=centers.get(n.group)||{x:0,y:0,count:0};c.x+=n.x;c.y+=n.y;c.count++;centers.set(n.group,c);}
  nodes.forEach((n,i)=>{const c=centers.get(n.group);force[i].x+=(c.x/c.count-n.x)*.006-n.x*.001;force[i].y+=(c.y/c.count-n.y)*.0015-n.y*.001;
   if(n.fx!=null){n.x=n.fx;n.y=n.fy;n.vx=n.vy=0;}else{n.vx=(n.vx+force[i].x*heat)*.73;n.vy=(n.vy+force[i].y*heat)*.73;n.x+=n.vx;n.y+=n.vy;}});
  heat*=.978;return heat>.006;
 }};
}
export const connectionColour=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1?`hsl(${Math.round(12+v*130)} 30% ${Math.round(46-v*12)}%)`:'#929b97';
export const nodeColours=['#7ca990','#94a9c1','#b3a17f','#aa97b3','#8bb4b4','#b99b98'];
