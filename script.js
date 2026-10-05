/* ============================================================
   SMART WI BUILDER — script.js
   GIC Updated: 4-page structure, Landscape P4+, Editable Header,
   Step labels fully visible, localStorage history
============================================================ */

/* ============================================================
   10 PROCESS TEMPLATES
============================================================ */
const TEMPLATES = [
  {
    id:'incoming_inspection', icon:'🔍', name:'Incoming Inspection',
    description:'Visual and dimensional inspection of incoming raw material or components at the receiving dock before storage.',
    steps:5,
    hints:['Verify supplier name and PO number on delivery note','Count and record quantity received vs. order quantity','Perform visual inspection — check for damage, rust, or defects','Measure critical dimensions using vernier caliper / gauge','Apply PASS / HOLD / REJECT label and move to designated zone']
  },
  {
    id:'machine_setup', icon:'⚙️', name:'Machine Setup',
    description:'Pre-production machine setup and first-article verification for CNC or conventional machining operations.',
    steps:5,
    hints:['Load correct program / G-code from USB or network drive','Mount and clamp workpiece in fixture; check datum surfaces','Install specified cutting tool; set tool offsets in controller','Run dry cycle (air cut) and verify tool path clearances','Produce first article and verify all dimensions vs. drawing']
  },
  {
    id:'packing', icon:'📦', name:'Packing & Labelling',
    description:'Standard packing and labelling process for finished goods before dispatch to customer or warehouse.',
    steps:5,
    hints:['Confirm product code and revision on traveller / job card','Place anti-static or protective foam/wrap around part','Place part(s) in correct box size with dividers if required','Apply correct product label with barcode; verify scan','Seal box, apply shipping label, and stack on dispatch pallet']
  },
  {
    id:'visual_weld', icon:'🔦', name:'Visual Weld Inspection',
    description:'Post-weld visual inspection to verify weld quality before proceeding to NDT or surface treatment.',
    steps:5,
    hints:['Clean weld area with wire brush; remove slag and spatter','Verify weld is in correct position and joint geometry','Inspect for surface cracks, undercuts, or porosity using bright light','Measure weld bead width and throat with weld gauge','Record result on inspection report; stamp if conforming']
  },
  {
    id:'calibration', icon:'📐', name:'Gauge Calibration Check',
    description:'Periodic in-process calibration verification for measuring instruments used on the shop floor.',
    steps:5,
    hints:['Retrieve gauge from storage; verify calibration due date on sticker','Clean measuring faces with lint-free cloth','Zero gauge using calibrated master / block; record zero reading','Measure certified reference standard and record reading','If within tolerance, update calibration sticker; otherwise quarantine']
  },
  {
    id:'assembly', icon:'🔩', name:'Sub-Assembly Process',
    description:'Step-by-step mechanical sub-assembly of a multi-component product following engineering bill of materials.',
    steps:10,
    hints:['Collect all components per BOM; verify part numbers and quantities','Inspect all mating surfaces for burrs or damage before assembly','Apply specified thread-locking compound (e.g. Loctite 243) to fasteners','Insert bearing into housing using press; verify flush / seating depth','Fit shaft through bearing; ensure smooth rotation without binding','Install snap ring / circlip using correct pliers; confirm seating','Mount bracket sub-assembly; align holes and insert bolts hand-tight','Torque all fasteners to specified value using calibrated torque wrench','Apply identification stamp / engraving per drawing callout','Complete assembly checklist and attach to traveller; transfer to QC hold']
  },
  {
    id:'paint_coating', icon:'🎨', name:'Paint & Coating Process',
    description:'Full powder coating / liquid paint process from surface preparation through curing and final inspection.',
    steps:10,
    hints:['Degrease component in solvent tank; rinse with DI water; air dry','Abrasive blast to Sa 2.5 profile; verify surface profile with testex tape','Apply chemical conversion coating (e.g. iron phosphate); rinse and dry','Mask all threaded holes, bores and critical surfaces with caps / tape','Hang component on conveyor / rack; verify grounding of rack','Apply primer coat at recommended film thickness (wet film gauge)','Cure primer in oven at specified temperature and time; allow to cool','Apply top coat; measure wet film thickness; adjust gun settings if needed','Cure top coat in oven per paint manufacturer specification','Inspect: adhesion cross-hatch test, thickness reading, visual for sags/runs']
  },
  {
    id:'pcb_assembly', icon:'🔌', name:'PCB Assembly (SMT)',
    description:'Surface-mount technology PCB assembly process from solder paste printing to final AOI inspection.',
    steps:10,
    hints:['Load bare PCB into solder paste printer; set stencil alignment fiducials','Print solder paste; inspect print quality under magnification (3D SPI)','Load component reels into pick-and-place machine; verify part codes','Run pick-and-place program; monitor placement accuracy via vision system','Inspect first article placement before bulk run; adjust offsets if needed','Load populated board into reflow oven; verify thermal profile settings','Run reflow; monitor peak temperature and time above liquidus','Cool board; perform visual inspection — check for bridges, tombstoning','Run board through AOI machine; review all flagged defects on screen','Rework defects using soldering iron / hot-air station; re-inspect; log result']
  },
  {
    id:'welding', icon:'🔥', name:'MIG / TIG Welding',
    description:'Complete welding operation including fit-up, tacking, welding, distortion control, and post-weld checks.',
    steps:10,
    hints:['Confirm WPS (Welding Procedure Specification) revision and joint type','Check welder qualification certificate is current for this process','Set machine parameters: wire feed rate, voltage, gas flow per WPS','Clean base material joint area — degrease and wire brush to bare metal','Fit up and clamp components in jig; check gap and alignment with feeler gauge','Tack weld at intervals specified in WPS; check for distortion after tacking','Weld root pass; inter-pass temperature must not exceed WPS limit (use pyrometer)','Weld fill and cap passes; maintain inter-pass temperature between passes','Remove spatter; allow weld to cool to ambient before final visual inspection','Record weld traveller: heat number, welder stamp, WPS ref, inspection result']
  },
  {
    id:'final_inspection', icon:'✅', name:'Final Inspection & Release',
    description:'Comprehensive final quality inspection and document release before goods are dispatched to the customer.',
    steps:10,
    hints:['Retrieve product and associated traveller / job card from production','Verify all previous operation sign-offs are complete on traveller','Compare part against approved drawing — all dimensions within tolerance','Check surface finish requirement (Ra value) using surface roughness tester','Verify part marking / engraving matches customer drawing callout exactly','Perform functional test or pressure/leak test per test procedure','Verify correct assembly of all sub-components per BOM (no missing items)','Photograph key features for customer FAI / PPAP record if required','Complete Certificate of Conformance; sign and date by authorised inspector','Apply PASS label; update ERP / MES; release to packing / dispatch']
  }
];

/* ============================================================
   STATE
============================================================ */
function todayStr(){ return new Date().toISOString().slice(0,10); }

let doc = freshDoc();
let selectedTemplate = null;

function freshDoc(){
  return {
    id:null, templateId:null,
    meta:{ company:'', product:'', docNo:'', rev:'00', date:todayStr() },
    reviewRows:[ {dept:'Manufacturing Engineering (PL)', checkedBy:'', sign:''}, {dept:'Manufacturing Engineering (AE)', checkedBy:'', sign:''}, {dept:'ME/SOO (PBL/6)', checkedBy:'', sign:''}, {dept:'Production', checkedBy:'', sign:''} ],
    docPath:'',
    revHistory:[ {sNo:'00', description:'', date:'', preparedBy:''} ],
    catPns:[ {slNo:'1', catId:'', description:''} ],
    variantColumns:['MAC Address','PTR','PCB Assembly','PCB Rev','Selector'],
    variantRows:[ ['','','','',''] ],
    flowLegend:'Base Assembly',
    flowSteps:['START','PCB Cleaning & Pre-assembly (PCB)','Install specific components & perform functional test','TopSide Soldering','Transformer Fitting','Dimensional checking & packing'],
    steps:[],
    status:'draft', createdAt:null
  };
}

/* ============================================================
   VIEW SWITCHING
============================================================ */
function switchView(v){
  ['builder','preview','history'].forEach(n=>{
    document.getElementById('view-'+n).classList.toggle('hidden', v!==n);
  });
  document.getElementById('tabBuilder').classList.toggle('active', v==='builder');
  document.getElementById('tabHistory').classList.toggle('active', v==='history');
  if(v==='history') renderHistoryList();
}

/* ============================================================
   TOAST / MODAL
============================================================ */
let toastTimer;
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2600);
}
function showConfirm(msg,cb,label){
  document.getElementById('modalMsg').textContent=msg;
  const btn=document.getElementById('modalConfirmBtn');
  btn.textContent=label||'Confirm';
  btn.onclick=()=>{ closeModal(); cb(); };
  document.getElementById('modalBg').classList.remove('hidden');
}
function closeModal(){ document.getElementById('modalBg').classList.add('hidden'); }

/* ============================================================
   META FIELDS
============================================================ */
['inCompany','inProduct','inDocNo','inRev','inDate'].forEach(id=>{
  document.getElementById(id).addEventListener('input',e=>{
    const map={inCompany:'company',inProduct:'product',inDocNo:'docNo',inRev:'rev',inDate:'date'};
    doc.meta[map[id]]=e.target.value;
  });
});
document.getElementById('inDate').value=todayStr();
doc.meta.date=todayStr();

document.getElementById('inDocPath').addEventListener('input',e=>{ doc.docPath=e.target.value; });
document.getElementById('inLegend').addEventListener('input',e=>{ doc.flowLegend=e.target.value; });

/* ============================================================
   PAGE 1 — DOCUMENT REVIEW ROWS
============================================================ */
function renderReviewRows(){
  const wrap=document.getElementById('reviewRows');
  wrap.innerHTML='';
  doc.reviewRows.forEach((row,i)=>{
    const div=document.createElement('div');
    div.className='edit-table-row';
    div.innerHTML=`
      <input value="${esc(row.dept)}" placeholder="Department" oninput="doc.reviewRows[${i}].dept=this.value">
      <input value="${esc(row.checkedBy)}" placeholder="Checked By" oninput="doc.reviewRows[${i}].checkedBy=this.value">
      <input value="${esc(row.sign)}" placeholder="Digital Sign" oninput="doc.reviewRows[${i}].sign=this.value">
      <button class="row-del-btn" onclick="delReviewRow(${i})">✕</button>
    `;
    wrap.appendChild(div);
  });
}
function addReviewRow(){
  doc.reviewRows.push({dept:'',checkedBy:'',sign:''});
  renderReviewRows();
}
function delReviewRow(i){
  doc.reviewRows.splice(i,1);
  renderReviewRows();
}

/* ============================================================
   PAGE 1 — REVISION HISTORY ROWS
============================================================ */
function renderRevHistoryRows(){
  const wrap=document.getElementById('revHistoryRows');
  wrap.innerHTML='';
  doc.revHistory.forEach((row,i)=>{
    const div=document.createElement('div');
    div.className='edit-table-row';
    div.innerHTML=`
      <input style="max-width:60px;" value="${esc(row.sNo)}" placeholder="S.No" oninput="doc.revHistory[${i}].sNo=this.value">
      <input style="flex:2;" value="${esc(row.description)}" placeholder="Description" oninput="doc.revHistory[${i}].description=this.value">
      <input value="${esc(row.date)}" placeholder="Date" oninput="doc.revHistory[${i}].date=this.value">
      <input value="${esc(row.preparedBy)}" placeholder="Prepared By" oninput="doc.revHistory[${i}].preparedBy=this.value">
      <button class="row-del-btn" onclick="delRevRow(${i})">✕</button>
    `;
    wrap.appendChild(div);
  });
}
function addRevHistoryRow(){
  doc.revHistory.push({sNo:String(doc.revHistory.length),description:'',date:'',preparedBy:''});
  renderRevHistoryRows();
}
function delRevRow(i){ doc.revHistory.splice(i,1); renderRevHistoryRows(); }

/* ============================================================
   PAGE 2 — CAT / PN ROWS
============================================================ */
function renderCatPnRows(){
  const wrap=document.getElementById('catPnRows');
  wrap.innerHTML='';
  doc.catPns.forEach((row,i)=>{
    const div=document.createElement('div');
    div.className='edit-table-row';
    div.innerHTML=`
      <input style="max-width:55px;" value="${esc(row.slNo)}" placeholder="Sl" oninput="doc.catPns[${i}].slNo=this.value">
      <input value="${esc(row.catId)}" placeholder="CAT / Part No." oninput="doc.catPns[${i}].catId=this.value">
      <input style="flex:2;" value="${esc(row.description)}" placeholder="Description" oninput="doc.catPns[${i}].description=this.value">
      <button class="row-del-btn" onclick="delCatRow(${i})">✕</button>
    `;
    wrap.appendChild(div);
  });
}
function addCatPnRow(){
  doc.catPns.push({slNo:String(doc.catPns.length+1),catId:'',description:''});
  renderCatPnRows();
}
function delCatRow(i){ doc.catPns.splice(i,1); renderCatPnRows(); }

/* ============================================================
   PAGE 2 — VARIANT CHART
============================================================ */
function renderVariantChart(){
  // Header row of column name inputs
  const hRow=document.getElementById('variantHeaderRow');
  hRow.innerHTML='<span style="font-size:11px;color:var(--ink-soft);width:30px;flex-shrink:0;">#</span>';
  doc.variantColumns.forEach((col,ci)=>{
    const inp=document.createElement('input');
    inp.className='var-col-head';
    inp.value=col;
    inp.placeholder='Column name';
    inp.oninput=()=>{ doc.variantColumns[ci]=inp.value; };
    hRow.appendChild(inp);
  });
  const delBtn=document.createElement('button');
  delBtn.className='row-del-btn';
  delBtn.textContent='− Col';
  delBtn.onclick=()=>{
    if(doc.variantColumns.length>1){
      doc.variantColumns.pop();
      doc.variantRows.forEach(r=>r.pop());
      renderVariantChart();
    }
  };
  hRow.appendChild(delBtn);

  // Data rows
  const dWrap=document.getElementById('variantDataRows');
  dWrap.innerHTML='';
  doc.variantRows.forEach((row,ri)=>{
    const div=document.createElement('div');
    div.className='edit-table-row';
    div.innerHTML=`<span style="font-size:11px;font-family:monospace;color:var(--ink-soft);width:30px;flex-shrink:0;">${ri+1}</span>`;
    doc.variantColumns.forEach((_,ci)=>{
      const inp=document.createElement('input');
      inp.value=row[ci]||'';
      inp.placeholder='—';
      inp.oninput=()=>{ doc.variantRows[ri][ci]=inp.value; };
      div.appendChild(inp);
    });
    const del=document.createElement('button');
    del.className='row-del-btn'; del.textContent='✕';
    del.onclick=()=>{ doc.variantRows.splice(ri,1); renderVariantChart(); };
    div.appendChild(del);
    dWrap.appendChild(div);
  });
}
function addVariantColumn(){
  doc.variantColumns.push('Column '+(doc.variantColumns.length+1));
  doc.variantRows.forEach(r=>r.push(''));
  renderVariantChart();
}
function addVariantRow(){
  doc.variantRows.push(doc.variantColumns.map(()=>''));
  renderVariantChart();
}

/* ============================================================
   PAGE 3 — FLOW STEPS
============================================================ */
function renderFlowSteps(){
  const wrap=document.getElementById('flowStepsWrap');
  wrap.innerHTML='';
  doc.flowSteps.forEach((step,i)=>{
    const div=document.createElement('div');
    div.className='flow-step-row';
    div.innerHTML=`
      <span style="font-family:monospace;font-size:12px;color:var(--ink-soft);width:22px;">${i+1}.</span>
      <input value="${esc(step)}" placeholder="Flow node label" oninput="doc.flowSteps[${i}]=this.value">
      <button class="row-del-btn" onclick="delFlowStep(${i})">✕</button>
    `;
    wrap.appendChild(div);
  });
}
function addFlowStep(){
  doc.flowSteps.push('');
  renderFlowSteps();
}
function delFlowStep(i){ doc.flowSteps.splice(i,1); renderFlowSteps(); }

/* ============================================================
   TEMPLATE SELECTION
============================================================ */
function renderTemplateGrid(){
  const grid=document.getElementById('templateGrid');
  grid.innerHTML='';
  TEMPLATES.forEach(tpl=>{
    const card=document.createElement('div');
    card.className='template-card';
    card.id='tpl-'+tpl.id;
    card.innerHTML=`
      <span class="tc-icon">${tpl.icon}</span>
      <div class="tc-name">${tpl.name}</div>
      <div class="tc-desc">${tpl.description}</div>
      <span class="tc-badge">${tpl.steps} steps</span>
      <div class="selected-tick">✓</div>
    `;
    card.onclick=()=>selectTemplate(tpl.id);
    grid.appendChild(card);
  });
}

function selectTemplate(id){
  document.querySelectorAll('.template-card').forEach(c=>c.classList.remove('selected'));
  selectedTemplate=TEMPLATES.find(t=>t.id===id);
  if(!selectedTemplate) return;
  document.getElementById('tpl-'+id).classList.add('selected');
  doc.templateId=id;
  doc.steps=selectedTemplate.hints.map(h=>({image:null,content:h}));
  renderStepEditor();
  document.getElementById('step6Label').style.display='flex';
  document.getElementById('actionsRow').style.display='flex';
  setTimeout(()=>document.getElementById('builderSteps').scrollIntoView({behavior:'smooth',block:'start'}),120);
}

/* ============================================================
   STEP EDITOR (Page 4+)
============================================================ */
function renderStepEditor(){
  const wrap=document.getElementById('builderSteps');
  wrap.innerHTML='';
  if(!selectedTemplate) return;
  const block=document.createElement('div');
  block.className='process-block';
  block.innerHTML=`
    <div class="process-block-head">
      <div>
        <h3>${selectedTemplate.icon} ${selectedTemplate.name}</h3>
        <div class="proc-meta">${selectedTemplate.steps} steps · Upload images &amp; edit descriptions below</div>
      </div>
    </div>
    <div class="process-desc-row">
      <strong>Process Overview</strong>${selectedTemplate.description}
    </div>
    <div class="step-grid" id="stepGridMain"></div>
  `;
  wrap.appendChild(block);
  const grid=document.getElementById('stepGridMain');
  doc.steps.forEach((step,sIdx)=>{
    const card=document.createElement('div');
    card.className='step-card';
    const fid=`file-s-${sIdx}`;
    card.innerHTML=`
      <span class="step-tag">STEP ${sIdx+1}</span>
      <div class="thumb" id="thumb-${sIdx}" onclick="document.getElementById('${fid}').click()">
        ${step.image
          ? `<img src="${step.image}" alt="Step ${sIdx+1}">`
          : `<span class="thumb-icon">📷</span><span>Tap to add image</span>`}
      </div>
      <input type="file" id="${fid}" accept="image/*" onchange="onFileChosen(this,${sIdx})">
      <textarea maxlength="300" placeholder="Describe this step…" oninput="onContentInput(this,${sIdx})">${esc(step.content)}</textarea>
      <div class="char-count" id="cc-${sIdx}">${step.content.length}/300</div>
    `;
    grid.appendChild(card);
  });
}
function onContentInput(el,sIdx){ doc.steps[sIdx].content=el.value; document.getElementById('cc-'+sIdx).textContent=`${el.value.length}/300`; }
function onFileChosen(input,sIdx){
  const file=input.files[0]; if(!file) return;
  resizeImage(file,dataUrl=>{
    doc.steps[sIdx].image=dataUrl;
    const t=document.getElementById('thumb-'+sIdx);
    t.innerHTML=`<img src="${dataUrl}" alt="Step ${sIdx+1}">`;
  });
}
function resizeImage(file,cb){
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      const maxW=1000; let w=img.width,h=img.height;
      if(w>maxW){h=Math.round(h*maxW/w);w=maxW;}
      const c=document.createElement('canvas'); c.width=w; c.height=h;
      c.getContext('2d').drawImage(img,0,0,w,h);
      cb(c.toDataURL('image/jpeg',0.85));
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}

/* ============================================================
   RESET
============================================================ */
function resetBuilder(){
  showConfirm('Clear all fields and start fresh?',()=>{
    doc=freshDoc(); selectedTemplate=null;
    ['inCompany','inProduct','inDocNo','inRev'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('inDate').value=todayStr(); doc.meta.date=todayStr();
    document.getElementById('inDocPath').value='';
    document.getElementById('inLegend').value='';
    document.querySelectorAll('.template-card').forEach(c=>c.classList.remove('selected'));
    document.getElementById('builderSteps').innerHTML='';
    document.getElementById('step6Label').style.display='none';
    document.getElementById('actionsRow').style.display='none';
    renderReviewRows(); renderRevHistoryRows(); renderCatPnRows(); renderVariantChart(); renderFlowSteps();
    toast('Cleared. Ready for a new work instruction.');
  },'Clear All');
}

/* ============================================================
   GENERATE
============================================================ */
function generateDocument(){
  if(!doc.meta.company.trim()){ toast('Enter company name.'); document.getElementById('inCompany').focus(); return; }
  if(!doc.meta.docNo.trim()){ toast('Enter document number.'); document.getElementById('inDocNo').focus(); return; }
  if(!selectedTemplate){ toast('Select a process template.'); return; }
  if(!doc.createdAt) doc.createdAt=Date.now();
  if(!doc.id) doc.id='wi_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
  renderPreview();
  saveToLocalStorage();
  switchView('preview');
  toast('Full WI generated! Scroll to review, then download PDF.');
}

/* ============================================================
   RENDER PREVIEW — 4 pages
============================================================ */
function renderPreview(){
  const tpl=selectedTemplate||TEMPLATES.find(t=>t.id===doc.templateId)||{name:'Work Instruction',icon:'📋',description:'',steps:doc.steps.length};
  document.getElementById('previewTitle').textContent=`${doc.meta.company} — ${doc.meta.docNo} (Rev ${doc.meta.rev})`;
  const pagesEl=document.getElementById('previewPages');
  pagesEl.innerHTML='';

  /* ---- PAGE 1: Portrait — Header + Review + Path + Rev History ---- */
  const p1=document.createElement('div');
  p1.className='wi-page portrait'; p1.id='wi-page-0';
  p1.innerHTML=`
    <div class="wi-top-strip">
      <div class="company-name">${esc(doc.meta.company)||'—'}</div>
      <div class="stage-line">${esc(doc.meta.product)||''}</div>
      <div class="doc-ref">Document number: ${esc(doc.meta.docNo)} &nbsp;|&nbsp; Rev: ${esc(doc.meta.rev)} &nbsp;|&nbsp; Date: ${esc(doc.meta.date)}</div>
    </div>

    <div class="wi-block-title">Document Review</div>
    <table class="wi-review-table">
      <thead><tr><th style="width:34%">Department</th><th>Checked By</th><th>Digital Signature</th></tr></thead>
      <tbody>
        ${doc.reviewRows.map(r=>`<tr><td class="label-cell">${esc(r.dept)}</td><td>${esc(r.checkedBy)||'&nbsp;'}</td><td>${esc(r.sign)||'&nbsp;'}</td></tr>`).join('')}
      </tbody>
    </table>

    <div class="wi-block-title" style="margin-top:0;">Document Path</div>
    <div class="wi-path-box">${esc(doc.docPath)||'—'}</div>

    <div class="wi-block-title">Document Revision History (the last 3 records only)</div>
    <table class="wi-rev-table">
      <thead><tr><th style="width:50px">S.No.</th><th>Description</th><th style="width:100px">Date</th><th>Prepared By</th></tr></thead>
      <tbody>
        ${doc.revHistory.map(r=>`<tr><td>${esc(r.sNo)}</td><td>${esc(r.description)||'&nbsp;'}</td><td>${esc(r.date)||'&nbsp;'}</td><td>${esc(r.preparedBy)||'&nbsp;'}</td></tr>`).join('')}
      </tbody>
    </table>

    <div class="wi-footer"><span>${esc(doc.meta.docNo)} / Rev ${esc(doc.meta.rev)}</span><span>${esc(doc.meta.company)}</span><span>Page 1</span></div>
  `;
  pagesEl.appendChild(p1);

  /* ---- PAGE 2: Portrait — Applicable CAT/PNs + Variant Chart ---- */
  const p2=document.createElement('div');
  p2.className='wi-page portrait'; p2.id='wi-page-1';
  const varHead=doc.variantColumns.map(c=>`<th>${esc(c)}</th>`).join('');
  const varBody=doc.variantRows.map(r=>`<tr>${r.map(cell=>`<td>${esc(cell)||'&nbsp;'}</td>`).join('')}</tr>`).join('');
  p2.innerHTML=`
    <div class="wi-top-strip">
      <div class="company-name">${esc(doc.meta.company)||'—'}</div>
      <div class="stage-line">${esc(doc.meta.product)||''}</div>
      <div class="doc-ref">Document number: ${esc(doc.meta.docNo)} &nbsp;|&nbsp; Rev: ${esc(doc.meta.rev)} &nbsp;|&nbsp; Date: ${esc(doc.meta.date)}</div>
    </div>

    <div class="wi-block-title">Applicable CAT / Part Numbers</div>
    <table class="wi-cat-table">
      <thead><tr><th style="width:50px">Sl. No.</th><th style="width:160px">CAT / Part No.</th><th>Description</th></tr></thead>
      <tbody>${doc.catPns.map(r=>`<tr><td>${esc(r.slNo)}</td><td>${esc(r.catId)||'&nbsp;'}</td><td>${esc(r.description)||'&nbsp;'}</td></tr>`).join('')}</tbody>
    </table>

    <div class="wi-block-title" style="margin-top:12px;">Variant Chart</div>
    <table class="wi-variant-table">
      <thead><tr>${varHead}</tr></thead>
      <tbody>${varBody}</tbody>
    </table>

    <div class="wi-footer"><span>${esc(doc.meta.docNo)} / Rev ${esc(doc.meta.rev)}</span><span>${esc(doc.meta.company)}</span><span>Page 2</span></div>
  `;
  pagesEl.appendChild(p2);

  /* ---- PAGE 3: Portrait — Process Flow Chart ---- */
  const p3=document.createElement('div');
  p3.className='wi-page portrait'; p3.id='wi-page-2';
  const flowNodes=doc.flowSteps.map((s,i)=>`
    ${i>0?'<div class="wi-flow-arrow"></div>':''}
    <div class="wi-flow-node">${esc(s)}</div>
  `).join('');
  p3.innerHTML=`
    <div class="wi-top-strip">
      <div class="company-name">${esc(doc.meta.company)||'—'}</div>
      <div class="stage-line">${esc(doc.meta.product)||''}</div>
      <div class="doc-ref">Document number: ${esc(doc.meta.docNo)} &nbsp;|&nbsp; Rev: ${esc(doc.meta.rev)} &nbsp;|&nbsp; Date: ${esc(doc.meta.date)}</div>
    </div>
    <div class="wi-block-title">Process Flow Chart</div>
    <div class="wi-flow-wrap">
      <div class="wi-flow-legend">User Legend: ${esc(doc.flowLegend)||'—'}</div>
      <div class="wi-flow-grid">${flowNodes}</div>
    </div>
    <div class="wi-footer"><span>${esc(doc.meta.docNo)} / Rev ${esc(doc.meta.rev)}</span><span>${esc(doc.meta.company)}</span><span>Page 3</span></div>
  `;
  pagesEl.appendChild(p3);

  /* ---- PAGE 4+: LANDSCAPE — Step-by-step WI (4 cols per page) ---- */
  const COLS=4;
  const chunks=[];
  for(let i=0;i<doc.steps.length;i+=COLS) chunks.push(doc.steps.slice(i,i+COLS));
  const totalWiPages=chunks.length;

  chunks.forEach((chunk,ci)=>{
    const stepOffset=ci*COLS;
    const page=document.createElement('div');
    page.className='wi-page landscape'; page.id=`wi-page-${ci+3}`;
    page.innerHTML=`
      <div class="wi-landscape-header">
        <div class="lh-company">
          <div class="lbl">Company</div>
          <div class="val">${esc(doc.meta.company)||'—'}</div>
          <div class="stage">${esc(doc.meta.product)||''}</div>
        </div>
        <div class="lh-meta">
          <div class="row">
            <div class="cell"><span class="lbl">Document No.</span><span class="val">${esc(doc.meta.docNo)||'—'}</span></div>
            <div class="cell"><span class="lbl">Rev</span><span class="val">${esc(doc.meta.rev)||'—'}</span></div>
          </div>
          <div class="row">
            <div class="cell"><span class="lbl">Date</span><span class="val">${esc(doc.meta.date)||'—'}</span></div>
            <div class="cell"><span class="lbl">Page</span><span class="val">${ci+4} / ${totalWiPages+3}</span></div>
          </div>
        </div>
      </div>
      <div class="wi-title-bar">
        <span>${tpl.icon} ${esc(tpl.name).toUpperCase()}</span>
        <span style="font-size:10px;opacity:.75;font-family:'IBM Plex Mono';">WORK INSTRUCTION</span>
      </div>
      ${ci===0?`<div class="wi-proc-desc">${esc(tpl.description)}</div>`:''}
      <div class="wi-body">
        <div class="wi-step-grid-landscape">
          ${chunk.map((s,j)=>`
            <div class="wi-step">
              <div class="num">STEP ${stepOffset+j+1} — ${esc(tpl.name)}</div>
              ${s.image
                ? `<img src="${s.image}" alt="Step ${stepOffset+j+1}">`
                : `<div class="noimg">No image uploaded</div>`}
              <div class="content">${esc(s.content)||'<span style="color:#bbb;font-size:10px;">No description</span>'}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="wi-footer">
        <span>${esc(doc.meta.docNo)} / Rev ${esc(doc.meta.rev)}</span>
        <span>${esc(doc.meta.company)}</span>
        <span>Page ${ci+4} of ${totalWiPages+3}</span>
      </div>
    `;
    pagesEl.appendChild(page);
  });
}

/* ============================================================
   PDF EXPORT — Landscape for pages 4+
============================================================ */
async function exportPDF(){
  toast('Building PDF — please wait…');
  try{
    const { jsPDF }=window.jspdf;
    const pageEls=document.querySelectorAll('.wi-page');

    for(let i=0;i<pageEls.length;i++){
      const isLandscape=pageEls[i].classList.contains('landscape');
      const orientation=isLandscape?'l':'p';
      const pdf_page_w=isLandscape?297:210;
      const pdf_page_h=isLandscape?210:297;
      const margin=8;
      const usableW=pdf_page_w-margin*2;

      if(i===0){
        var pdf=new jsPDF({ orientation, unit:'mm', format:'a4' });
      } else {
        pdf.addPage('a4', orientation);
      }

      const canvas=await html2canvas(pageEls[i],{scale:2,useCORS:true,backgroundColor:'#ffffff',logging:false});
      const imgData=canvas.toDataURL('image/jpeg',0.93);
      const imgH=(canvas.height*usableW)/canvas.width;
      pdf.addImage(imgData,'JPEG',margin,margin,usableW,imgH);
    }

    const fname=(doc.meta.docNo||'work-instruction').replace(/[^a-zA-Z0-9_-]/g,'_');
    pdf.save(`${fname}.pdf`);
    toast('PDF downloaded successfully.');
  }catch(err){
    toast('PDF export failed. Please try again.');
    console.error(err);
  }
}

/* ============================================================
   WORD EXPORT
============================================================ */
function exportWord(){
  const tpl=selectedTemplate||TEMPLATES.find(t=>t.id===doc.templateId)||{name:'Work Instruction',icon:'',description:''};
  const COLS=4;
  let stepRows='';
  for(let i=0;i<doc.steps.length;i+=COLS){
    const chunk=doc.steps.slice(i,i+COLS);
    stepRows+=`<tr>${chunk.map((s,j)=>`
      <td style="width:25%;vertical-align:top;padding:8px;border:1px solid #ccc;">
        <p style="margin:0 0 4px;font-family:Calibri;font-size:10pt;font-weight:bold;">STEP ${i+j+1}</p>
        ${s.image?`<img src="${s.image}" style="width:160px;height:auto;display:block;margin-bottom:6px;">`:'<p style="color:#999;font-size:9pt;">No image</p>'}
        <p style="font-size:10pt;font-family:Calibri;margin:0;">${esc(s.content)||'—'}</p>
      </td>`).join('')}</tr>`;
  }
  const html=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${esc(doc.meta.docNo)}</title></head>
<body style="font-family:Calibri;">
<h2>${esc(doc.meta.company)}</h2>
<table border="1" cellspacing="0" cellpadding="5" style="border-collapse:collapse;width:100%;font-size:10pt;margin-bottom:10px;">
<tr><td><b>Doc No.</b></td><td>${esc(doc.meta.docNo)}</td><td><b>Rev</b></td><td>${esc(doc.meta.rev)}</td><td><b>Date</b></td><td>${esc(doc.meta.date)}</td></tr>
</table>
<h3>${tpl.icon} ${esc(tpl.name)}</h3>
<p>${esc(tpl.description)}</p>
<table border="1" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;">${stepRows}</table>
</body></html>`;
  const blob=new Blob(['\ufeff',html],{type:'application/msword'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=`${(doc.meta.docNo||'wi').replace(/[^a-zA-Z0-9_-]/g,'_')}.doc`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Word document downloaded.');
}

/* ============================================================
   HISTORY — localStorage
============================================================ */
function getIndex(){ try{ return JSON.parse(localStorage.getItem('wi:index')||'[]'); }catch(e){return[];} }
function setIndex(list){ try{ localStorage.setItem('wi:index',JSON.stringify(list)); }catch(e){} }

function saveToLocalStorage(){
  try{
    localStorage.setItem('wi:doc:'+doc.id,JSON.stringify(doc));
    const list=getIndex();
    const tpl=selectedTemplate||TEMPLATES.find(t=>t.id===doc.templateId);
    const entry={id:doc.id,company:doc.meta.company,docNo:doc.meta.docNo,rev:doc.meta.rev,date:doc.meta.date,templateName:tpl?tpl.name:'Custom',templateIcon:tpl?tpl.icon:'📋',steps:doc.steps.length,status:doc.status||'draft',createdAt:doc.createdAt};
    const idx=list.findIndex(d=>d.id===doc.id);
    if(idx>-1) list[idx]=entry; else list.unshift(entry);
    setIndex(list);
  }catch(e){ toast('Could not save to history.'); }
}

function renderHistoryList(){
  const wrap=document.getElementById('historyList');
  const list=getIndex();
  if(!list.length){
    wrap.innerHTML=`<div class="empty-state"><h3>No saved work instructions yet</h3><p>Documents you generate will appear here.</p></div>`;
    return;
  }
  list.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  wrap.innerHTML=list.map(d=>`
    <div class="history-card">
      <div class="info">
        <h3>${d.templateIcon||'📋'} ${esc(d.company)||'Untitled'} <span class="mono" style="font-size:11px;color:var(--ink-soft);">${esc(d.docNo)}</span></h3>
        <div class="sub">${esc(d.templateName)} · Rev ${esc(d.rev)} · ${esc(d.date)} · ${d.steps} steps</div>
      </div>
      <div class="btns">
        <span class="pill ${d.status}">${d.status}</span>
        <button class="icon-btn" onclick="cycleStatus('${d.id}')">Set Status</button>
        <button class="icon-btn" onclick="openHistoryDoc('${d.id}')">Open</button>
        <button class="icon-btn" style="color:var(--rust);" onclick="confirmDelete('${d.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function cycleStatus(id){
  try{
    const raw=localStorage.getItem('wi:doc:'+id); if(!raw) return;
    const d=JSON.parse(raw);
    const order=['draft','pass','failed'];
    d.status=order[(order.indexOf(d.status)+1)%order.length];
    localStorage.setItem('wi:doc:'+id,JSON.stringify(d));
    const list=getIndex(); const i=list.findIndex(x=>x.id===id);
    if(i>-1){list[i].status=d.status; setIndex(list);}
    renderHistoryList();
  }catch(e){ toast('Could not update status.'); }
}

function openHistoryDoc(id){
  try{
    const raw=localStorage.getItem('wi:doc:'+id);
    if(!raw){toast('Document not found.');return;}
    doc=JSON.parse(raw);
    selectedTemplate=TEMPLATES.find(t=>t.id===doc.templateId)||null;
    renderPreview(); switchView('preview'); toast('Document loaded.');
  }catch(e){ toast('Could not open document.'); }
}

function confirmDelete(id){ showConfirm('Delete this work instruction permanently?',()=>deleteDoc(id),'Delete'); }
function deleteDoc(id){
  try{
    localStorage.removeItem('wi:doc:'+id);
    const list=getIndex().filter(d=>d.id!==id); setIndex(list);
    toast('Deleted.'); renderHistoryList();
  }catch(e){ toast('Delete failed.'); }
}

/* ============================================================
   UTILS
============================================================ */
function esc(str){
  return String(str==null?'':str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ============================================================
   INIT
============================================================ */
renderTemplateGrid();
renderReviewRows();
renderRevHistoryRows();
renderCatPnRows();
renderVariantChart();
renderFlowSteps();
