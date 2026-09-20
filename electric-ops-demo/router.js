(function(){
  const cfg=window.AppConfig;
  const home=document.querySelector('#homePage');
  const dynamic=document.querySelector('#dynamicPage');
  let openTabs=JSON.parse(sessionStorage.getItem('electric-tabs')||'null')||['#/workbench','#/person/home'];
  let historyTabs=JSON.parse(sessionStorage.getItem('electric-history')||'[]');

  function currentRoute(){return cfg.routes[location.hash]?location.hash:'#/person/home'}
  function persist(){sessionStorage.setItem('electric-tabs',JSON.stringify(openTabs));sessionStorage.setItem('electric-history',JSON.stringify(historyTabs));localStorage.setItem('electric-sidebar-collapsed',document.body.classList.contains('sidebar-collapsed')?'1':'0')}
  function navigate(route){if(location.hash===route){render()}else location.hash=route}
  function addTab(route){if(!openTabs.includes(route))openTabs.push(route);historyTabs=historyTabs.filter(x=>x!==route);historyTabs.push(route);persist()}
  function renderTabs(route){const box=document.querySelector('#quickTabs');box.innerHTML=openTabs.map(r=>{const item=cfg.routes[r];if(!item)return'';const fixed=r==='#/workbench';return `<button class="quick-tab ${r===route?'selected':''}" data-route="${r}">${item.title}${fixed?'':` <span class="tab-close" aria-label="关闭${item.title}">×</span>`}</button>`}).join('')}
  function renderMenu(route){const item=cfg.routes[route],menu=cfg.menus[item.module]||[];document.querySelector('#sideNav').innerHTML=menu.map(x=>`<button data-route="${x.route}" class="${x.route===route?'active':''}"><span><img src="${x.icon}" alt=""></span>${x.title}</button>`).join('')}
  function render(){const route=currentRoute(),item=cfg.routes[route];addTab(route);document.querySelectorAll('.primary-nav button').forEach(b=>b.classList.toggle('active',b.dataset.module===item.module));renderMenu(route);renderTabs(route);if(item.view==='home'){home.hidden=false;dynamic.hidden=true}else{home.hidden=true;dynamic.hidden=false;dynamic.innerHTML=(window.PageViews[item.view]||window.PageViews.placeholder)(route)}document.title=`${item.title} · 乌局电务智能运维`;persist()}
  function closeTab(route){if(route==='#/workbench')return;openTabs=openTabs.filter(x=>x!==route);historyTabs=historyTabs.filter(x=>x!==route);if(currentRoute()===route){const fallback=[...historyTabs].reverse().find(x=>openTabs.includes(x))||openTabs[openTabs.length-1]||'#/workbench';navigate(fallback)}else{renderTabs(currentRoute());persist()}}

  document.querySelector('.primary-nav').addEventListener('click',e=>{const b=e.target.closest('button[data-module]');if(b)navigate(cfg.moduleDefaults[b.dataset.module])});
  document.querySelector('#sideNav').addEventListener('click',e=>{const b=e.target.closest('button[data-route]');if(b)navigate(b.dataset.route)});
  document.querySelector('#quickTabs').addEventListener('click',e=>{const tab=e.target.closest('.quick-tab');if(!tab)return;if(e.target.closest('.tab-close'))closeTab(tab.dataset.route);else navigate(tab.dataset.route)});
  document.querySelector('#menuToggle').addEventListener('click',()=>{const c=document.body.classList.toggle('sidebar-collapsed');document.querySelector('#menuToggle').setAttribute('aria-expanded',String(!c));persist()});
  dynamic.addEventListener('click',e=>{
    if(e.target.closest('.order-detail'))navigate('#/work/orders/detail');
    if(e.target.closest('.back-link'))navigate('#/work/orders');
    const treeItem=e.target.closest('.org-tree li');if(treeItem){document.querySelectorAll('.org-tree li').forEach(x=>x.classList.remove('selected'));treeItem.classList.add('selected')}
    const sub=e.target.closest('.subtabs button');if(sub){sub.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('active'));sub.classList.add('active')}
    const person=e.target.closest('.person-detail');if(person)openDrawer({no:'人员档案',unit:person.dataset.name,area:'IT部门',date:'入职日期：2021-06-18',content:'高级工程师 · 群众',device:'综合评分 100分'})
    if(e.target.id==='personQuery')filterPeople();
    if(e.target.id==='personReset'){document.querySelector('#personSearch').value='';filterPeople()}
  });
  function filterPeople(){const q=(document.querySelector('#personSearch')?.value||'').trim();document.querySelectorAll('#personRows tr').forEach(tr=>tr.hidden=q&&!tr.textContent.includes(q))}
  dynamic.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='personSearch')filterPeople()});
  function normalizeGenderIcons(){document.querySelectorAll('.gender-card strong').forEach(el=>{if(el.textContent.includes('👤'))el.innerHTML=`<span class="people-icons">${'<i></i>'.repeat(5)}</span>4678<small>人</small>`})}
  function normalizeTreeIcons(){document.querySelectorAll('.org-tree li').forEach(item=>{[...item.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE&&node.textContent.trim()).forEach(node=>{const label=node.textContent.replace(/[▾▸▧　]/g,'').trim();if(!label)return;const row=document.createElement('span');row.className='tree-node-label';const icon=document.createElement('img');icon.src='assets/tree-node.png';icon.alt='';row.append(icon,document.createTextNode(label));node.replaceWith(row)})})}
  function normalizeVisuals(){normalizeGenderIcons();normalizeTreeIcons()}
  new MutationObserver(normalizeVisuals).observe(dynamic,{childList:true,subtree:true});
  window.addEventListener('hashchange',render);
  if(localStorage.getItem('electric-sidebar-collapsed')==='1')document.body.classList.add('sidebar-collapsed');
  render();
  normalizeVisuals();
})();
