import {header,roleSelect,componentSelect,sectionTitle,metric,slpComposition,flowBars,percent,number,esc,footer} from '../ui.js';

// Set to 'assets/cabin-demonstrator.png' when the actual cabin image is supplied.
const cabinImage = '';
const cabinVisual = (image=cabinImage) => '<figure class="cabin-visual">'+(image
 ? '<img src="'+esc(image)+'" alt="Circular Crew Cabin — Demonstrator">'
 : '<div class="cabin-placeholder"><svg aria-hidden="true" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="8" width="38" height="32" rx="3"/><circle cx="16" cy="18" r="3"/><path d="m6 34 11-10 8 7 7-9 10 12"/></svg><span>Circular Crew Cabin — Demonstrator</span></div>')+'</figure>';

export function slp(model,state){
 const layer=state.layer==='All'?'Cabin total':state.layer,selected=model.slp.layers[layer]||{},flow=selected.flow;
 const components=Object.values(model.components).filter(c=>state.layer==='All'||c.identity.layer===state.layer),materials=model.materials.filter(m=>state.layer==='All'||m.layer===state.layer);
 return header('Ship Lifecycle Passport')+'<main class="slp cabin-overview">'+
 '<div class="cabin-navigation">'+componentSelect(model)+'<a class="cabin-map-link" href="#/connections">Component Connection Map →</a></div>'+
 '<div class="toolbar layer-toolbar"><div class="layer-picker"><span>View by layer:</span>'+['All','Services','Skin','Space Plan','Stuff'].map(l=>'<button data-layer="'+l+'" aria-pressed="'+(state.layer===l)+'" class="pill '+(state.layer===l?'selected':'')+'">'+l+'</button>').join('')+'</div>'+roleSelect(state.role)+'</div>'+
 (model.meta.published&&!model.cabinAssessmentIncluded?'<p class="access-note">Cabin assessment summaries were not published. No scores have been recalculated for this selection.</p>':'')+
 '<div class="cabin-hero">'+cabinVisual(model.cabinImage?.filePath||cabinImage)+'<div class="cabin-assessment">'+
 '<div class="cabin-facts">'+metric('Total mass (kg)',number(flow?.mass))+metric('Components',String(components.length))+metric('Data maturity',esc(model.meta.dataMaturity.label),'','Configured prototype attribute. Current-practice data currently available to the passport.')+'</div>'+
 '<div class="cabin-scores"><section class="cabin-mci">'+sectionTitle('Material Circularity Index','Saved assessment · '+esc(layer))+'<div class="primary-value">'+percent(flow?.mci)+'</div><span class="cabin-metric-caption">MCI · Inflow, use and outflow</span></section>'+
 '<section class="cabin-detach">'+sectionTitle('Detachability')+'<div class="score-pair">'+metric('Connection · DPc',percent(selected.disassembly?.connection))+metric('Tools & effort · DI',percent(selected.disassembly?.tools))+'</div><p class="cabin-score-note">Connection type and accessibility · Tools required and disassembly effort</p></section></div>'+
 '<section class="cabin-flow">'+sectionTitle('Material Flow Indicators','Saved assessment values · '+esc(layer))+flowBars(flow)+'</section></div></div>'+
 '<div class="cabin-detail-grid"><section class="slp-composition">'+sectionTitle('Material Composition','Top 6 materials by mass (kg) · remaining materials in Other')+slpComposition(materials)+'</section>'+
 '<section class="hotspots">'+sectionTitle('Detachability Hotspots','Cabin-wide ranked interfaces · Lower DPc means more difficult detachability')+'<div class="cabin-list-heading"><span>Rank / connection</span><span>DPc · Connection</span></div><ol class="cabin-hotspot-list">'+model.slp.detachabilityHotspots.slice().sort((a,b)=>a.rank-b.rank).map(h=>'<li><span class="rank">'+esc(h.rank)+'</span><span class="cabin-interface-name">'+esc(h.interface)+'</span><strong>'+percent(h.connection)+'</strong></li>').join('')+'</ol></section></div></main>'+footer();
}
