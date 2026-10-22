(function(){
  const cats=['规章制度','技术文档','培训资料','应急预案','图纸资料','视频影像'];
  const icons={pdf:'PDF',doc:'DOC',xls:'XLS',img:'IMG',video:'MP4',ppt:'PPT'};
  const files=[
    {name:'信号设备维护管理细则（2026版）',cat:'规章制度',type:'pdf',size:'2.4 MB',owner:'安全科',date:'2026-10-18'},
    {name:'ZPW-2000 轨道电路技术说明书',cat:'技术文档',type:'doc',size:'1.8 MB',owner:'技术科',date:'2026-10-15'},
    {name:'道岔转换设备检修作业指导书',cat:'技术文档',type:'pdf',size:'3.1 MB',owner:'技术科',date:'2026-10-12'},
    {name:'新工入职培训课件（第一讲）',cat:'培训资料',type:'ppt',size:'12.6 MB',owner:'人教科',date:'2026-10-10'},
    {name:'联锁试验专项培训视频',cat:'培训资料',type:'video',size:'86 MB',owner:'人教科',date:'2026-10-08'},
    {name:'成渝中线防洪应急预案',cat:'应急预案',type:'doc',size:'1.2 MB',owner:'应急办',date:'2026-10-20'},
    {name:'成都东站信号平面布置图',cat:'图纸资料',type:'img',size:'5.7 MB',owner:'调度中心',date:'2026-09-28'},
    {name:'龙兴信号工区设备台账表',cat:'技术文档',type:'xls',size:'640 KB',owner:'设备科',date:'2026-09-25'},
    {name:'秋季设备鉴定汇总表',cat:'技术文档',type:'xls',size:'512 KB',owner:'设备科',date:'2026-09-22'},
    {name:'应急抢修演练记录（Q3）',cat:'应急预案',type:'pdf',size:'2.0 MB',owner:'应急办',date:'2026-09-19'},
    {name:'信号机灯光电路原理图',cat:'图纸资料',type:'img',size:'3.3 MB',owner:'技术科',date:'2026-09-15'},
    {name:'天窗修管理办法',cat:'规章制度',type:'pdf',size:'1.5 MB',owner:'安全科',date:'2026-09-10'}
  ];
  const state={cat:'',keyword:''};
  function filtered(){return files.filter(f=>(!state.cat||f.cat===state.cat)&&(!state.keyword||f.name.includes(state.keyword)))}
  function cards(){return `<section class="lib-grid">${filtered().map(f=>`<article class="lib-card"><div class="lib-icon lib-${f.type}">${icons[f.type]}</div><div class="lib-info"><b title="${f.name}">${f.name}</b><div class="lib-meta"><span class="lib-cat">${f.cat}</span><span>${f.size}</span></div><div class="lib-foot"><span>${f.owner} · ${f.date}</span><button class="lib-dl" data-lib="${f.name.replace(/"/g,'&quot;')}">下载</button></div></div></article>`).join('')||'<div class="lib-empty">没有匹配的资料文件</div>'}`}
  function stats(){return `<section class="lib-stats">${cats.map(c=>`<article><span>${c}</span><strong>${files.filter(f=>f.cat===c).length}</strong></article>`).join('')}<article class="lib-total"><span>资料总数</span><strong>${files.length}</strong></article></section>`}
  function page(){return `<div class="lib-page"><header class="lib-heading"><div><h1>资料库</h1><p>规章制度、技术文档、培训与应急资料的统一归档与检索</p></div><span>数据更新：2026-10-20</span></header>${stats()}<section class="lib-toolbar"><div class="lib-tabs">${['',...cats].map(c=>`<button class="lib-tab ${state.cat===c?'active':''}" data-lib-cat="${c}">${c||'全部'}</button>`).join('')}</div><div class="lib-search"><input id="libSearch" placeholder="搜索资料名称..." value="${state.keyword}"><button id="libSearchBtn">搜索</button></div></section>${cards()}</div>`}
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-lib-cat]')){state.cat=e.target.closest('[data-lib-cat]').dataset.libCat;const root=document.querySelector('.lib-page');if(root){root.querySelector('.lib-tabs').innerHTML=['',...cats].map(c=>`<button class="lib-tab ${state.cat===c?'active':''}" data-lib-cat="${c}">${c||'全部'}</button>`).join('');root.querySelector('.lib-grid').outerHTML=cards()}return}
    if(e.target.id==='libSearchBtn'){state.keyword=document.querySelector('#libSearch').value.trim();const root=document.querySelector('.lib-page');if(root)root.querySelector('.lib-grid').outerHTML=cards();return}
    if(e.target.closest('[data-lib]')){const name=e.target.closest('[data-lib]').dataset.lib;if(window.toast)window.toast(`开始下载：${name}`);else alert(`开始下载：${name}`)}});
  document.addEventListener('input',e=>{if(e.target.id==='libSearch'){state.keyword=e.target.value.trim();const root=document.querySelector('.lib-page');if(root)root.querySelector('.lib-grid').outerHTML=cards()}});
  window.PageViews.library=page;
})();
