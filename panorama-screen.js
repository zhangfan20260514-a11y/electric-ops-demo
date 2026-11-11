(function(){
  const alarms=['接触网异物告警','轨道电路异常','道岔表示缺口','信号机灯丝告警'];
  const table=(type)=>`<table class="ps-table"><thead><tr>${(type==='alarm'?['序号','告警名称','告警类型','标题','状态']:['序号','当日派工单','当日销号单','作业人数']).map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${Array.from({length:4},(_,i)=>type==='alarm'?`<tr><td><i>${i+1}</i></td><td>${alarms[i]}</td><td>${['设备','环境','通信','电源'][i]}告警</td><td>待核查</td><td><span>处理中</span></td></tr>`:`<tr><td><i>${i+1}</i></td><td>${works[i]}维修</td><td>${i+1}项</td><td>${6+i*2}人</td></tr>`).join('')}</tbody></table>`;
  const works=['成都端站','示例一站','示例三站','重庆端站'];
  const donut=(title,total='6,832')=>`<section class="ps-panel ps-donut-panel"><h3>${title}</h3><div class="ps-donut-box"><div class="ps-donut"><div><b>${total}</b><small>合计</small></div></div><span class="l1">分类一: 450</span><span class="l2">分类二: 76</span><span class="l3">分类三: 87</span><span class="l4">分类四: 76</span><span class="l5">分类五: 23</span></div></section>`;
  const bars=(title,values=[142,171,198])=>`<section class="ps-panel ps-bar-panel"><h3>${title}</h3><div class="ps-bars" role="img" aria-label="${title}"><div class="ps-y"><span>200</span><span>150</span><span>100</span><span>50</span><span>0</span></div>${values.map((v,i)=>`<button class="ps-bar" style="--v:${v}" data-value="${v}" aria-label="${['优良 100','合格 86-100（不含）','不合格 86以下'][i]} ${v}"><i></i><span>${['优良 100','合格 86-100（不含）','不合格 86以下'][i]}</span></button>`).join('')}<output class="ps-chart-tip"></output></div></section>`;

  /* ================= 维修作业模块：层级数据 + 分组柱状图 + 下钻 ================= */
  // 组织树：局 -> 段 -> 车间 -> 工区 -> 车站
  const ORG_TREE={name:'成都局',level:'局',children:[
    {name:'成都电务段',level:'段',children:[
      {name:'成都信号车间',level:'车间',children:[
        {name:'成都工区',level:'工区',children:[{name:'成都站',level:'车站'},{name:'简州站',level:'车站'}]},
        {name:'乐至工区',level:'工区',children:[{name:'乐至站',level:'车站'},{name:'安岳站',level:'车站'}]}]},
      {name:'重庆西车载车间',level:'车间',children:[
        {name:'大足工区',level:'工区',children:[{name:'大足石刻站',level:'车站'},{name:'铜梁站',level:'车站'}]},
        {name:'重庆西工区',level:'工区',children:[{name:'重庆西站',level:'车站'}]}]}]},
    {name:'重庆电务段',level:'段',children:[
      {name:'重庆信号车间',level:'车间',children:[
        {name:'重庆北工区',level:'工区',children:[{name:'重庆北站',level:'车站'}]},
        {name:'科学城工区',level:'工区',children:[{name:'重庆科学城站',level:'车站'}]}]},
      {name:'重庆车载车间',level:'车间',children:[
        {name:'璧山工区',level:'工区',children:[{name:'璧山站',level:'车站'},{name:'永川东站',level:'车站'}]}]}]}]};

  // 伪随机（基于站名，保证每次渲染一致）
  function seeded(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);return((h^=h>>>16)>>>0)/4294967296}}
  // 叶子节点生成派工单明细：主派工单 -> 子派工单[车间确认状态] + 作业人数
  const leafCache={};
  function leafOrders(name){
    if(leafCache[name])return leafCache[name];
    const rnd=seeded(name+'#workorders');
    const mainCount=2+Math.floor(rnd()*4); // 2~5 张主派工单
    const list=Array.from({length:mainCount},(_,i)=>{
      const subCount=1+Math.floor(rnd()*3); // 1~3 张子派工单
      // 销号规则：主派工单下所有子派工单车间确认状态=车间确认 => 该主派工单当日销号
      const allConfirmed=rnd()<0.55;
      const children=Array.from({length:subCount},(_,j)=>({
        id:`${name}-Z${i+1}${String.fromCharCode(65+j)}`,
        confirmed:allConfirmed?true:rnd()<0.4,
        persons:2+Math.floor(rnd()*4) // 每张子派工单 2~5 人
      }));
      return{id:`${name}-P${i+1}`,children,persons:1+Math.floor(rnd()*3)}; // 主派工单负责人 1~3 人
    });
    return leafCache[name]=list;
  }
  // 汇总某节点三项指标
  function nodeMetrics(node){
    if(!node.children)return(()=>{const orders=leafOrders(node.name);return{
      dispatch:orders.length,
      done:orders.filter(o=>o.children.every(c=>c.confirmed)).length,
      people:orders.reduce((s,o)=>s+o.persons+o.children.reduce((a,c)=>a+c.persons,0),0)
    }})();
    const m={dispatch:0,done:0,people:0};
    const walk=n=>{if(!n.children){const mm=nodeMetrics(n);m.dispatch+=mm.dispatch;m.done+=mm.done;m.people+=mm.people;return}n.children.forEach(walk)};
    walk(node);return m;
  }
  const LEVEL_BY_ROLE={'局级':'段','段级':'车间','车间级':'工区','工区级':'车站'};
  function findNode(root,path){let cur=root;for(const nm of path){cur=(cur.children||[]).find(c=>c.name===nm);if(!cur)return null}return cur}
  // 维修作业状态：当前登录层级 + 当前下钻路径（存 sessionStorage，路由切换后保留）
  const workState={
    get role(){return sessionStorage.getItem('psWorkRole')||'局级'},
    set role(v){sessionStorage.setItem('psWorkRole',v)},
    get path(){try{return JSON.parse(sessionStorage.getItem('psWorkPath')||'[]')}catch(e){return[]}},
    set path(v){sessionStorage.setItem('psWorkPath',JSON.stringify(v))}
  };
  const SERIES=[{key:'dispatch',label:'当日派工单',color:'#119dff'},{key:'done',label:'当日销号单',color:'#27e0b0'},{key:'people',label:'作业人数',color:'#ffb036'}];
  function workPanelHTML(){
    const root=findNode(ORG_TREE,workState.path)||ORG_TREE;
    const cur=workState.path.length?workState.path[workState.path.length-1]:ORG_TREE.name;
    const units=(root.children||[]).map(c=>({name:c.name,hasChildren:!!(c.children&&c.children.length),m:nodeMetrics(c)}));
    const maxV=Math.max(10,...units.flatMap(u=>SERIES.map(s=>u.m[s.key])));
    const yTicks=Array.from({length:5},(_,i)=>Math.round(maxV*(4-i)/4));
    const roleOptions=['局级','段级','车间级','工区级'].map(r=>`<option${r===workState.role?' selected':''}>${r}</option>`).join('');
    const crumb=[`<button class="ps-wc-root" data-crumb="">${ORG_TREE.name}</button>`,...workState.path.map((p,i)=>`<i>›</i><button data-crumb="${workState.path.slice(0,i+1).join('|')}">${p}</button>`)].join('');
    const baseLevel=LEVEL_BY_ROLE[workState.role];
    const unitLevel=workState.path.length===0?baseLevel:(findNode(ORG_TREE,workState.path)||{}).children?.[0]?.level||'车站';
    return `<section class="ps-panel ps-work-panel" id="psWorkPanel">
      <h3>维修作业<span class="ps-work-role"><label>登录层级</label><select id="psWorkRole" title="切换用户层级">${roleOptions}</select></span></h3>
      <div class="ps-work-crumb">${crumb}${workState.path.length?`<button class="ps-wc-up" data-crumb="${workState.path.slice(0,-1).join('|')}" title="返回上一级">↑上级</button>`:''}</div>
      <div class="ps-work-legend">${SERIES.map(s=>`<span><i style="background:${s.color}"></i>${s.label}</span>`).join('')}</div>
      <div class="ps-work-chart" style="--max:${maxV}">
        <div class="ps-work-y">${yTicks.map(t=>`<span>${t}</span>`).join('')}</div>
        ${units.length?units.map((u,ui)=>`<div class="ps-wgroup${u.hasChildren?' drillable':''}" data-unit="${u.name}" tabindex="0" role="button" aria-label="${u.name}${u.hasChildren?'，点击下钻':''}">
          <div class="ps-wbars">${SERIES.map((s,si)=>`<i class="ps-wbar" style="height:${Math.max(4,u.m[s.key]/maxV*100)}%;background:linear-gradient(180deg,${s.color},${s.color}99);animation-delay:${ui*60+si*40}ms" data-tip="${u.name} · ${s.label}：${u.m[s.key]}${s.key==='people'?'人':s.key==='dispatch'?'单':'单'}"></i>`).join('')}</div>
          <span class="ps-wname" title="${u.name}">${u.name.replace(/电务段|信号车间|车载车间|工区/,'')}<em>${unitLevel}</em></span>
        </div>`).join(''):'<p class="ps-work-empty">暂无下级数据</p>'}
        <output class="ps-chart-tip ps-work-tip"></output>
      </div>
      <p class="ps-work-note">当前展示单位：<b>${cur}</b> 的下级「${unitLevel}」${workState.path.length===0?`（${workState.role}登录）`:''} · 点击柱组可下钻</p>
    </section>`;
  }
  function renderWorkPanel(){const el=document.getElementById('psWorkPanel');if(!el)return;const tip=el.querySelector('.ps-work-tip');const open=tip&&tip.classList.contains('show');el.outerHTML=workPanelHTML();document.dispatchEvent(new Event('ps-work-rendered'))}

  function panoramaScreen(){return `<div class="panorama-screen">
    <header class="ps-heading"><div class="ps-title"><strong>应急管理</strong><i></i></div><div class="ps-filters"><label><select id="psOrg"><option>某某组织机构</option><option>成都电务段</option><option>重庆电务段</option></select></label><label><select id="psPeriod"><option>近1个月</option><option>近3个月</option><option>近1年</option></select></label><button class="ps-query">查询</button><i class="ps-filter-divider" aria-hidden="true"></i><button class="ps-emergency-query"><span aria-hidden="true"></span>应急查询</button></div></header>
    <div class="ps-emergency-modal" hidden><section role="dialog" aria-modal="true" aria-labelledby="psEmergencyTitle"><header><b id="psEmergencyTitle">应急查询</b><button class="ps-emergency-modal-close" aria-label="关闭">×</button></header><div><label>应急列表<select id="psEmergencyType"><option value="">请选择</option><option>成都站信号机故障20261006121212</option><option>成都站道岔故障20261006101010</option><option>成都站轨道电路故障20261006090909</option></select></label></div><footer><button class="ps-emergency-cancel">取消</button><button class="ps-emergency-confirm" disabled>进入详情</button></footer></section></div>
    <div class="ps-stage"><div class="ps-map" aria-label="成渝中线运维态势地图"></div>
      <div class="ps-column ps-left"><section class="ps-panel ps-table-panel"><h3>告警列表</h3>${table('alarm')}</section>${donut('设备数量')}${bars('设备状态-道岔标准')}</div>
      <div class="ps-column ps-right">${workPanelHTML()}${donut('问题状态')}${bars('设备状态-其他设备',[142,171,198])}</div>
      <div class="ps-stations" aria-label="地图车站">${[['成都站',30,28],['简州',39,34],['乐至',48,42],['安岳',56,50],['大足石刻',67,58],['铜梁',75,67],['重庆科学城',83,75],['重庆北',88,84]].map(([name,x,y])=>`<button class="ps-station-hit" data-station="${name}" style="--x:${x}%;--y:${y}%" aria-label="查看${name}详情"></button>`).join('')}</div>
      <section class="ps-station-card" aria-live="polite" hidden><header><b>车站详情</b><button class="ps-station-close" aria-label="关闭">×</button></header><div class="ps-station-info"></div><button class="ps-emergency-start">启动应急</button></section>
    </div></div>`}
  window.PageViews.panoramaScreen=panoramaScreen;
  document.addEventListener('click',e=>{
    // 维修作业：下钻 / 面包屑返回
    const crumb=e.target.closest('.ps-work-crumb [data-crumb]');
    if(crumb){workState.path=crumb.dataset.crumb?crumb.dataset.crumb.split('|'):[];renderWorkPanel();return}
    const grp=e.target.closest('.ps-wgroup.drillable');
    if(grp){workState.path=[...workState.path,grp.dataset.unit];renderWorkPanel();return}
    if(e.target.closest('.ps-query')){const org=document.querySelector('#psOrg')?.value,period=document.querySelector('#psPeriod')?.value;document.querySelector('#toast').textContent=`已查询 ${org} · ${period}`;document.querySelector('#toast').classList.add('show');setTimeout(()=>document.querySelector('#toast').classList.remove('show'),1700)}
    if(e.target.closest('.ps-emergency-query')){const modal=document.querySelector('.ps-emergency-modal');if(modal){modal.hidden=false;setTimeout(()=>modal.querySelector('select')?.focus(),0)}return}
    if(e.target.closest('.ps-emergency-modal-close,.ps-emergency-cancel')||e.target.classList.contains('ps-emergency-modal')){const modal=document.querySelector('.ps-emergency-modal');if(modal)modal.hidden=true;return}
    if(e.target.closest('.ps-emergency-confirm')){const fault=document.querySelector('#psEmergencyType')?.value;if(!fault)return;sessionStorage.setItem('emergency-fault',fault);sessionStorage.setItem('emergency-station','成都站');location.hash='#/panorama/emergency/process';return}
    const station=e.target.closest('.ps-station-hit');if(station){const card=document.querySelector('.ps-station-card'),name=station.dataset.station;card.querySelector('.ps-station-info').innerHTML=`<p>站名：<strong>${name}</strong></p><p>所属线路：<strong>成渝中线</strong></p><p>所属车间：<strong>${name.includes('成都')?'成都':'重庆'}信号车间</strong></p><p>所属工区：<strong>${name.replace('站','')}工区</strong></p><p>工区负责人：<strong>张明</strong></p><p>联系电话：<strong>138****2365</strong></p>`;card.hidden=false;card.style.left=`clamp(270px, ${Math.min(72,Math.max(20,Number(station.style.getPropertyValue('--x').replace('%',''))-8))}%, calc(100% - 330px))`;card.style.top=`clamp(60px, ${Math.min(58,Math.max(8,Number(station.style.getPropertyValue('--y').replace('%',''))-12))}%, calc(100% - 370px))`}
    if(e.target.closest('.ps-station-close'))e.target.closest('.ps-station-card').hidden=true;
    if(e.target.closest('.ps-emergency-start')){const name=e.target.closest('.ps-station-card').querySelector('.ps-station-info strong')?.textContent||'示例三站';sessionStorage.setItem('emergency-station',name);location.hash='#/panorama/emergency/process'}
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='psEmergencyType'){const button=e.target.closest('.ps-emergency-modal').querySelector('.ps-emergency-confirm');button.disabled=!e.target.value}
    // 维修作业：切换登录层级（局级->段 / 段级->车间 / 车间级->工区 / 工区级->车站），并重置下钻路径
    if(e.target.id==='psWorkRole'){workState.role=e.target.value;workState.path=[];renderWorkPanel()}
  });
  // 维修作业：柱条悬浮提示
  document.addEventListener('pointerover',e=>{
    const wbar=e.target.closest('.ps-wbar');
    if(wbar){const tip=wbar.closest('.ps-work-chart').querySelector('.ps-work-tip');tip.textContent=wbar.dataset.tip;tip.classList.add('show');tip.style.left=`${wbar.closest('.ps-wgroup').offsetLeft+wbar.offsetLeft+wbar.offsetWidth/2}px`;return}
    const bar=e.target.closest('.ps-bar');if(!bar)return;const tip=bar.parentElement.querySelector('.ps-chart-tip');tip.textContent=`数量：${bar.dataset.value}`;tip.classList.add('show');tip.style.left=`${bar.offsetLeft+bar.offsetWidth/2}px`});
  document.addEventListener('pointerout',e=>{const wbar=e.target.closest('.ps-wbar');if(wbar&&!wbar.contains(e.relatedTarget)){wbar.closest('.ps-work-chart').querySelector('.ps-work-tip').classList.remove('show');return}
    const bar=e.target.closest('.ps-bar');if(bar&&!bar.contains(e.relatedTarget))bar.parentElement.querySelector('.ps-chart-tip')?.classList.remove('show')});
})();
