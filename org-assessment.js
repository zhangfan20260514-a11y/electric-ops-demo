(function(){
  const MONTHS=['11月','12月','1月','2月','3月','4月','5月','6月','7月','8月','9月','10月'];
  const RAW=[
    ['bureau','中国铁路成都局集团',null,'局'],
    ['seg-1','成都电务段','bureau','段'],
    ['seg-1-a','重庆信号车间','seg-1','车间'],
    ['team-1','龙兴信号工区','seg-1-a','工区'],
    ['team-2','简州信号工区','seg-1-a','工区'],
    ['team-3','长寿信号工区','seg-1-a','工区'],
    ['seg-1-b','成都信号车间','seg-1','车间'],
    ['team-4','成都东信号工区','seg-1-b','工区'],
    ['team-5','天府信号工区','seg-1-b','工区'],
    ['team-6','资阳西信号工区','seg-1-b','工区'],
    ['seg-2','重庆电务段','bureau','段'],
    ['seg-2-a','内江信号车间','seg-2','车间'],
    ['team-7','内江北信号工区','seg-2-a','工区'],
    ['team-8','隆昌信号工区','seg-2-a','工区'],
    ['team-9','荣昌信号工区','seg-2-a','工区'],
    ['seg-2-b','永川信号车间','seg-2','车间'],
    ['team-10','永川信号工区','seg-2-b','工区'],
    ['team-11','江津信号工区','seg-2-b','工区'],
    ['team-12','大足信号工区','seg-2-b','工区'],
    ['seg-3','贵阳电务段','bureau','段'],
    ['seg-3-a','贵阳北信号车间','seg-3','车间'],
    ['team-13','贵阳北信号工区','seg-3-a','工区'],
    ['team-14','都拉营信号工区','seg-3-a','工区'],
    ['team-15','息烽信号工区','seg-3-a','工区'],
    ['seg-3-b','遵义信号车间','seg-3','车间'],
    ['team-16','遵义信号工区','seg-3-b','工区'],
    ['team-17','桐梓信号工区','seg-3-b','工区'],
    ['team-18','凯里信号工区','seg-3-b','工区']
  ];
  const SURNAME=['王','李','张','刘','陈','杨','赵','黄','周','徐','孙','马','朱','胡','郭'];
  const GIVEN=['建国','志强','海涛','明','洋','涛','磊','锋','勇','鹏','军','刚','伟','斌','超'];
  const LEVEL_TITLE={'局':'局长','段':'段长','车间':'车间主任','工区':'工长'};
  const WEIGHTS={safety:.3,production:.25,staff:.2,device:.25};

  const rnd=(i,k)=>{const s=Math.sin((i+1)*12.9898+(k+1)*78.233)*43758.5453;return s-Math.floor(s)};
  const orgs=RAW.map(([id,name,parent,kind],i)=>{
    const nm=SURNAME[(i*7)%SURNAME.length]+GIVEN[(i*5+3)%GIVEN.length];
    return {id,name,parent,kind,leader:kind==='局'?'王建国':nm,index:i};
  });
  const byId=Object.fromEntries(orgs.map(o=>[o.id,o]));
  const childrenOf=id=>orgs.filter(o=>o.parent===id);
  const descendantsOf=id=>{const set=new Set([id]);let more=true;while(more){more=false;orgs.forEach(o=>{if(set.has(o.parent)&&!set.has(o.id)){set.add(o.id);more=true}})}return set};
  const round1=v=>Math.round(v*10)/10;

  function baseDims(org){
    const i=org.index;
    const d={safety:round1(72+rnd(i,1)*24),production:round1(70+rnd(i,2)*26),staff:round1(74+rnd(i,3)*22),device:round1(68+rnd(i,4)*28)};
    d.total=round1(d.safety*WEIGHTS.safety+d.production*WEIGHTS.production+d.staff*WEIGHTS.staff+d.device*WEIGHTS.device);
    return d;
  }
  const dimCache={};
  function dimsOf(org){
    if(dimCache[org.id])return dimCache[org.id];
    let d;
    if(org.kind==='工区'){d=baseDims(org)}
    else{
      const kids=childrenOf(org.id);
      d=kids.reduce((acc,k)=>{const kd=dimsOf(k);acc.safety+=kd.safety;acc.production+=kd.production;acc.staff+=kd.staff;acc.device+=kd.device;acc.total+=kd.total;return acc},{safety:0,production:0,staff:0,device:0,total:0});
      const n=Math.max(1,kids.length);
      d={safety:round1(d.safety/n),production:round1(d.production/n),staff:round1(d.staff/n),device:round1(d.device/n),total:round1(d.total/n)};
    }
    dimCache[org.id]=d;
    return d;
  }
  function trendOf(org){
    const base=dimsOf(org).total,i=org.index;
    return MONTHS.map((m,k)=>round1(Math.min(98.5,Math.max(62,base-5+Math.sin((k+i)*.62)*2.6+k*.42))));
  }
  const rank=(list,org)=>list.slice().sort((a,b)=>dimsOf(b).total-dimsOf(a).total).findIndex(o=>o.id===org.id)+1;
  function rankingOf(org){
    if(org.kind==='工区'){
      const shop=byId[org.parent],seg=byId[shop.parent];
      const shopTeams=childrenOf(shop.id),segTeams=orgs.filter(o=>o.kind==='工区'&&descendantsOf(seg.id).has(o.id));
      return [{label:'车间排名',value:`${rank(shopTeams,org)}/${shopTeams.length}`},{label:'段排名',value:`${rank(segTeams,org)}/${segTeams.length}`}];
    }
    if(org.kind==='车间'){
      const seg=byId[org.parent],shops=childrenOf(seg.id);
      return [{label:'段排名',value:`${rank(shops,org)}/${shops.length}`}];
    }
    if(org.kind==='段'){
      const segs=childrenOf('bureau');
      return [{label:'局排名',value:`${rank(segs,org)}/${segs.length}`}];
    }
    return [{label:'下辖电务段',value:`${childrenOf('bureau').length} 个`}];
  }

  const state={org:'bureau',ranges:{safety:[null,null],production:[null,null],staff:[null,null],device:[null,null],total:[null,null]},page:1};
  const SCOPE={工区:'本工区评估结果',车间:'下辖工区评估结果',段:'下辖车间评估结果',局:'下辖电务段评估结果'};
  const listOf=org=>org.kind==='工区'?[org]:childrenOf(org.id);
  function filtered(){
    const org=byId[state.org];
    return listOf(org).filter(o=>{
      const d=dimsOf(o);
      return Object.entries(state.ranges).every(([k,[min,max]])=>(min===null||min===undefined||min===''||d[k]>=+min)&&(max===null||max===undefined||max===''||d[k]<=+max));
    }).sort((a,b)=>dimsOf(b).total-dimsOf(a).total);
  }

  function tree(){
    const node=o=>{const kids=childrenOf(o.id);return `<li><button class="oa-tree-node ${state.org===o.id?'selected':''}" data-oa-org="${o.id}"><i>${kids.length?'⌄':''}</i><img src="assets/tree-node.png" alt=""><span>${o.name}</span></button>${kids.length?`<ul>${kids.map(node).join('')}</ul>`:''}</li>`};
    return `<div class="oa-tree-title"><h2>组织机构</h2><span>最小单位：工区</span></div><ul class="oa-tree">${node(byId.bureau)}</ul>`;
  }

  function statCards(){
    const org=byId[state.org],d=dimsOf(org),ranks=rankingOf(org);
    const dimRows=[['安全效果','safety'],['生产组织','production'],['人员评价','staff'],['设备质量','device']].map(([label,key])=>`<li><span>${label}</span><b style="--v:${d[key]}%">${d[key].toFixed(1)}</b><i><em style="width:${d[key]}%"></em></i></li>`).join('');
    return `<article class="oa-total-card"><span>综合得分</span><strong>${d.total.toFixed(1)}</strong><div class="oa-ranks">${ranks.map(r=>`<p><em>${r.label}</em><b>${r.value}</b></p>`).join('')}</div><small>${org.kind} · ${org.name} · 责任人 ${org.leader}</small></article><article class="oa-dim-card"><header><h3>四维得分</h3><span>${org.name}</span></header><ul>${dimRows}</ul></article>`;
  }

  function trendChart(){
    const org=byId[state.org],vals=trendOf(org),w=880,h=210,x=i=>52+i*72,y=v=>170-(v-60)*3.6;
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${org.name}近一年综合得分趋势"><defs><linearGradient id="oaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#168bf0" stop-opacity=".22"/><stop offset="1" stop-color="#168bf0" stop-opacity="0"/></linearGradient></defs><g class="oa-grid">${[60,70,80,90,100].map(v=>`<line x1="46" y1="${y(v)}" x2="850" y2="${y(v)}"/><text x="12" y="${y(v)+4}">${v}</text>`).join('')}</g><polygon class="oa-area" points="${vals.map((v,i)=>`${x(i)},${y(v)}`).join(' ')} ${x(11)},170 ${x(0)},170"/><polyline class="oa-line" points="${vals.map((v,i)=>`${x(i)},${y(v)}`).join(' ')}"/>${vals.map((v,i)=>`<circle class="oa-dot" cx="${x(i)}" cy="${y(v)}" r="3.4"><title>${MONTHS[i]}：${v.toFixed(1)}分</title></circle>`).join('')}<g class="oa-xlabels">${MONTHS.map((m,i)=>`<text x="${x(i)}" y="198">${m}</text>`).join('')}</g></svg>`;
  }

  function rows(){
    const list=filtered(),start=(state.page-1)*8;
    return list.slice(start,start+8).map((o,i)=>{const d=dimsOf(o);return `<tr><td>${start+i+1}</td><td><b>${o.name}</b></td><td>${o.leader}<small>（${LEVEL_TITLE[o.kind]}）</small></td><td>${d.safety.toFixed(1)}</td><td>${d.production.toFixed(1)}</td><td>${d.staff.toFixed(1)}</td><td>${d.device.toFixed(1)}</td><td><strong class="oa-total">${d.total.toFixed(1)}</strong></td><td class="oa-action"><button data-oa-detail="${o.id}">查看详情</button></td></tr>`}).join('')||'<tr><td colspan="9" class="oa-empty">暂无符合条件的机构</td></tr>';
  }
  function pager(){
    const total=filtered().length,pages=Math.max(1,Math.ceil(total/8));
    state.page=Math.min(state.page,pages);
    return `<button data-oa-page="${state.page-1}" ${state.page===1?'disabled':''}>‹</button>${Array.from({length:pages},(_,i)=>`<button data-oa-page="${i+1}" class="${state.page===i+1?'active':''}">${i+1}</button>`).join('')}<button data-oa-page="${state.page+1}" ${state.page===pages?'disabled':''}>›</button><span>共 ${total} 条</span>`;
  }

  const range=(id,label)=>`<span class="oa-range"><em>${label}</em><input id="${id}Min" type="number" placeholder="最低分"><i>—</i><input id="${id}Max" type="number" placeholder="最高分"></span>`;
  function page(){
    requestAnimationFrame(()=>{render();updateFilterToggle(document.querySelector('.oa-page'))});
    return `<div class="oa-page"><aside class="oa-tree-panel">${tree()}</aside><section class="oa-main"><header class="oa-heading"><div><h1>机构评估</h1><p>按组织机构综合评价安全、生产、人员与设备四维表现</p></div><span>数据更新：2026-10-20 09:30</span></header><section class="oa-filter"><div class="oa-filter-controls">${range('oaSafety','安全效果')}${range('oaProduction','生产组织')}${range('oaStaff','人员评价')}${range('oaDevice','设备质量')}${range('oaTotal','总分')}</div><div class="oa-filter-actions"><button class="oa-filter-toggle" id="oaFilterToggle" hidden>展开</button><button class="primary-action" id="oaQuery">查询</button><button id="oaReset">重置</button></div></section><section class="oa-statistics" id="oaStats">${statCards()}<article class="oa-trend"><header><h2>近一年综合得分趋势</h2><span id="oaTrendScope">${byId[state.org].name} · 月度综合得分</span></header>${trendChart()}</article></section><section class="oa-table-card"><header><h2 id="oaListTitle">机构评估结果</h2><span id="oaListScope">${SCOPE[byId[state.org].kind]} · 按总分由高到低排序</span></header><div class="oa-table-wrap"><table><thead><tr><th>序号</th><th>部门名称</th><th>责任人</th><th>安全效果得分</th><th>生产组织得分</th><th>人员评价得分</th><th>设备质量得分</th><th>总分</th><th>操作</th></tr></thead><tbody id="oaRows">${rows()}</tbody></table></div><footer id="oaPager">${pager()}</footer></section></section></div>`;
  }
  function updateFilterToggle(root){if(!root)return;const box=root.querySelector('.oa-filter-controls'),btn=root.querySelector('#oaFilterToggle');if(!box||!btn)return;btn.hidden=box.classList.contains('expanded')||!(box.scrollHeight>box.clientHeight+2)}
  function render(){
    const root=document.querySelector('.oa-page');if(!root)return;
    updateFilterToggle(root);
    const org=byId[state.org];
    root.querySelector('#oaRows').innerHTML=rows();
    root.querySelector('#oaPager').innerHTML=pager();
    root.querySelector('#oaStats').innerHTML=`${statCards()}<article class="oa-trend"><header><h2>近一年综合得分趋势</h2><span id="oaTrendScope">${org.name} · 月度综合得分</span></header>${trendChart()}</article>`;
    root.querySelector('#oaListScope').textContent=`${SCOPE[org.kind]} · 按总分由高到低排序`;
  }
  function readRanges(root){
    ['Safety','Production','Staff','Device','Total'].forEach(k=>{
      const key=k.toLowerCase();
      const min=root.querySelector(`#oa${k}Min`)?.value,max=root.querySelector(`#oa${k}Max`)?.value;
      state.ranges[key]=[min===''?null:min,max===''?null:max];
    });
    state.page=1;
  }

  function detail(route){
    const id=new URLSearchParams(route.split('?')[1]||'').get('id')||'bureau';
    const org=byId[id]||byId.bureau,d=dimsOf(org),ranks=rankingOf(org),vals=trendOf(org);
    const parent=org.parent?byId[org.parent]:null;
    const kids=childrenOf(org.id);
    const w=1000,h=230,x=i=>56+i*78,y=v=>176-(v-60)*3.8;
    const dimCards=[['安全效果','safety','#168bf0'],['生产组织','production','#7b61ff'],['人员评价','staff','#13b980'],['设备质量','device','#ff9f43']].map(([label,key,color])=>`<article style="--accent:${color}"><span>${label}得分</span><strong>${d[key].toFixed(1)}</strong><small>权重 ${(WEIGHTS[key]*100).toFixed(0)}%</small></article>`).join('');
    const kidRows=kids.map((o,i)=>{const kd=dimsOf(o);return `<tr><td>${i+1}</td><td><b>${o.name}</b></td><td>${o.leader}（${LEVEL_TITLE[o.kind]}）</td><td>${kd.safety.toFixed(1)}</td><td>${kd.production.toFixed(1)}</td><td>${kd.staff.toFixed(1)}</td><td>${kd.device.toFixed(1)}</td><td><strong class="oa-total">${kd.total.toFixed(1)}</strong></td><td class="oa-action"><button data-oa-detail="${o.id}">查看</button></td></tr>`}).join('');
    return `<div class="oa-detail"><div class="oa-breadcrumb"><button class="oa-back">返回机构评估</button><i>/</i><span>机构评估详情</span></div><header class="oa-detail-head"><div><span class="oa-kind">${org.kind}</span><h1>${org.name}</h1><p>${parent?parent.name+' · ':''}责任人 ${org.leader}（${LEVEL_TITLE[org.kind]}）</p></div><aside><span>综合得分</span><b>${d.total.toFixed(1)}</b></aside></header><section class="oa-detail-cards">${dimCards}</section><section class="oa-ranks-row">${ranks.map(r=>`<article><span>${r.label}</span><b>${r.value}</b></article>`).join('')}<article><span>评价周期</span><b>2026年10月</b></article></section><section class="oa-panel"><header><h2>近一年综合得分趋势</h2><span>Y轴：综合得分　X轴：月份</span></header><svg class="oa-detail-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${org.name}近一年综合得分趋势"><g class="oa-grid">${[60,70,80,90,100].map(v=>`<line x1="50" y1="${y(v)}" x2="960" y2="${y(v)}"/><text x="14" y="${y(v)+4}">${v}</text>`).join('')}</g><polyline class="oa-line" points="${vals.map((v,i)=>`${x(i)},${y(v)}`).join(' ')}"/>${vals.map((v,i)=>`<circle class="oa-dot" cx="${x(i)}" cy="${y(v)}" r="4"><title>${MONTHS[i]}：${v.toFixed(1)}分</title></circle>`).join('')}<g class="oa-xlabels">${MONTHS.map((m,i)=>`<text x="${x(i)}" y="214">${m}</text>`).join('')}</g></svg></section>${kids.length?`<section class="oa-panel"><header><h2>下辖机构评估</h2><span>共 ${kids.length} 个${kids[0].kind}</span></header><div class="oa-table-wrap"><table><thead><tr><th>序号</th><th>部门名称</th><th>责任人</th><th>安全效果得分</th><th>生产组织得分</th><th>人员评价得分</th><th>设备质量得分</th><th>总分</th><th>操作</th></tr></thead><tbody>${kidRows}</tbody></table></div></section>`:''}</div>`;
  }

  document.addEventListener('click',e=>{
    const root=e.target.closest('.oa-page');
    if(e.target.closest('.oa-back')){location.hash='#/health/org-assessment';return}
    const detailBtn=e.target.closest('[data-oa-detail]');
    if(detailBtn){location.hash=`#/health/org-assessment/detail?id=${detailBtn.dataset.oaDetail}`;return}
    if(!root)return;
    if(e.target.id==='oaFilterToggle'){const box=root.querySelector('.oa-filter-controls'),open=box.classList.toggle('expanded');e.target.textContent=open?'收起':'展开';if(!open)updateFilterToggle(root);return}
    const node=e.target.closest('[data-oa-org]');
    if(node){state.org=node.dataset.oaOrg;state.page=1;root.querySelectorAll('[data-oa-org]').forEach(x=>x.classList.toggle('selected',x===node));render();return}
    if(e.target.id==='oaQuery'){readRanges(root);render();return}
    if(e.target.id==='oaReset'){state.ranges={safety:[null,null],production:[null,null],staff:[null,null],device:[null,null],total:[null,null]};state.page=1;root.querySelectorAll('.oa-filter input').forEach(x=>x.value='');render();return}
    const pg=e.target.closest('[data-oa-page]');
    if(pg&&!pg.disabled){state.page=+pg.dataset.oaPage;render()}
  });
  window.addEventListener('resize',()=>{const root=document.querySelector('.oa-page');if(!root)return;const box=root.querySelector('.oa-filter-controls'),btn=root.querySelector('#oaFilterToggle');if(box&&btn)btn.hidden=!(box.scrollHeight>box.clientHeight+2)});

  window.OrgAssessmentData={orgs,dimsOf,trendOf,rankingOf,levelTitle:LEVEL_TITLE};
  window.PageViews.orgAssessment=page;
  window.PageViews.orgAssessmentDetail=detail;
})();
