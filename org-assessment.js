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
  function dailyTrendOf(org){
    const base=trendOf(org)[11],i=org.index;
    return Array.from({length:31},(_,k)=>round1(Math.min(98.5,Math.max(62,base-2.2+Math.sin((k+i*2)*.75)*1.7+k*.05))));
  }
  const rank=(list,org)=>list.slice().sort((a,b)=>dimsOf(b).total-dimsOf(a).total).findIndex(o=>o.id===org.id)+1;
  function rankingOf(org){
    if(org.kind==='工区'){
      const shop=byId[org.parent],seg=byId[shop.parent];
      const shopTeams=childrenOf(shop.id),segTeams=orgs.filter(o=>o.kind==='工区'&&descendantsOf(seg.id).has(o.id));
      return [{label:'车间排名',value:`${rank(shopTeams,org)}/${shopTeams.length}`},{label:'段排名',value:`${rank(segTeams,org)}/${segTeams.length}`}];
    }
    if(org.kind==='车间'){
      const seg=byId[org.parent],shops=childrenOf(seg.id),allShops=orgs.filter(o=>o.kind==='车间');
      return [{label:'段排名',value:`${rank(shops,org)}/${shops.length}`},{label:'局排名',value:`${rank(allShops,org)}/${allShops.length}`}];
    }
    if(org.kind==='段'){
      const segs=childrenOf('bureau'),nationwide=1+(org.index*5)%18;
      return [{label:'局排名',value:`${rank(segs,org)}/${segs.length}`},{label:'全路排名',value:`${nationwide}/18`}];
    }
    return [{label:'本工区排名',value:'1/18'},{label:'车间排名',value:'1/2'}];
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

  function radarChart(org,d){
    const axes=[
      {label:'安全效果',key:'safety',x:160,y:31,lx:160,ly:15,anchor:'middle'},
      {label:'生产组织',key:'production',x:251,y:122,lx:308,ly:126,anchor:'end'},
      {label:'人员评价',key:'staff',x:160,y:213,lx:160,ly:252,anchor:'middle'},
      {label:'设备质量',key:'device',x:69,y:122,lx:12,ly:126,anchor:'start'}
    ];
    const center={x:160,y:122},radius=91;
    const point=(axis,scale)=>`${center.x+(axis.x-center.x)*scale},${center.y+(axis.y-center.y)*scale}`;
    const grids=[.2,.4,.6,.8,1].map(scale=>`<polygon points="${axes.map(axis=>point(axis,scale)).join(' ')}"/>`).join('');
    const axesLines=axes.map(axis=>`<line x1="${center.x}" y1="${center.y}" x2="${axis.x}" y2="${axis.y}"/>`).join('');
    const dataPoints=axes.map(axis=>point(axis,Math.max(0,Math.min(100,d[axis.key]))/100)).join(' ');
    const vertices=axes.map(axis=>{
      const [x,y]=point(axis,Math.max(0,Math.min(100,d[axis.key]))/100).split(',');
      const value=d[axis.key].toFixed(1),tip=`${axis.label}：${value}分 / 100分`;
      return `<circle class="oa-radar-point" cx="${x}" cy="${y}" r="5" tabindex="0" role="img" aria-label="${tip}" data-radar-tip="${tip}"><title>${tip}</title></circle>`;
    }).join('');
    const labels=axes.map(axis=>`<text class="oa-radar-label" x="${axis.lx}" y="${axis.ly}" text-anchor="${axis.anchor}">${axis.label}</text>`).join('');
    return `<div class="oa-radar-wrap"><svg class="oa-radar" viewBox="0 0 320 260" role="img" aria-label="${org.name}四维评价雷达图"><g class="oa-radar-grid">${grids}</g><g class="oa-radar-axes">${axesLines}</g><polygon class="oa-radar-area" points="${dataPoints}"/>${vertices}<circle class="oa-radar-center" cx="${center.x}" cy="${center.y}" r="3"/><circle class="oa-radar-score-bg" cx="${center.x}" cy="${center.y}" r="25"/><text class="oa-radar-score" x="${center.x}" y="${center.y-1}" text-anchor="middle">${d.total.toFixed(1)}</text><text class="oa-radar-unit" x="${center.x}" y="${center.y+15}" text-anchor="middle">分</text>${labels}</svg><div class="oa-radar-tooltip" role="status" hidden></div></div>`;
  }

  let radarObserver;
  function observeRadar(root){
    if(radarObserver)radarObserver.disconnect();
    if(!root||typeof ResizeObserver==='undefined')return;
    radarObserver=new ResizeObserver(entries=>entries.forEach(({target,contentRect})=>{
      target.style.setProperty('--oa-radar-height',`${Math.max(205,Math.min(252,contentRect.width*.82))}px`);
    }));
    root.querySelectorAll('.oa-total-card').forEach(card=>radarObserver.observe(card));
  }

  const SCORE_ICONS=(()=>{
    const wrap=(color,paths)=>`<svg viewBox="0 0 36 36" aria-hidden="true"><rect width="36" height="36" rx="9" fill="${color}"/><g transform="translate(6,6)" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;
    return {
      hero:wrap('#fb5a01','<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>'),
      rank1:wrap('#0070fb','<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2.5"/>'),
      rank2:wrap('#02b557','<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>')
    };
  })();
  function scoreCards(){
    const org=byId[state.org],d=dimsOf(org),ranks=rankingOf(org);
    const fmt=v=>v.replace(/^(\d+)\/(\d+)$/,'<i>$1</i><em>/$2</em>');
    const card=(label,value,icon,cls)=>`<article class="oa-score-card ${cls}"><span class="oa-score-icon">${icon}</span><div class="oa-score-info"><span>${label}</span><b>${value}</b></div></article>`;
    return card('综合得分',`${d.total.toFixed(1)}<small>分</small>`,SCORE_ICONS.hero,'hero')
      +ranks.map((r,i)=>card(r.label,fmt(r.value),i===0?SCORE_ICONS.rank1:SCORE_ICONS.rank2,'')).join('');
  }
  const DIM_META={
    safety:{label:'安全效果',color:'#168bf0',bg:'#eaf4ff',icon:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M9 12l2 2 4-4"/>'},
    production:{label:'生产组织',color:'#fb8c01',bg:'#fff3e6',icon:'<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>'},
    staff:{label:'人员评价',color:'#7b61ff',bg:'#f1edff',icon:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'},
    device:{label:'设备质量',color:'#13b980',bg:'#e6f8f0',icon:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'}
  };
  function dimBasisOf(org){
    const d=dimsOf(org);
    const alloc=(target,ws)=>{const arr=ws.map(w=>Math.round(target*w));arr[arr.length-1]+=target-arr.reduce((a,b)=>a+b,0);return arr.map(v=>Math.max(0,v))};
    const gen=(defs,target,ws)=>{const ds=alloc(target,ws);return defs.map(([name,unit],k)=>({name,unit,count:Math.max(0,Math.round(ds[k]/2)),deduct:ds[k]}))};
    return {
      safety:gen([['C类及以上事故','件'],['D类事故','件'],['故障','件'],['安全信息','件']],Math.round(100-d.safety),[.45,.25,.18,.12]),
      production:gen([['天窗利用率不足','次'],['维修任务延期','项'],['设备检修超期','台']],Math.round(100-d.production),[.4,.35,.25]),
      staff:gen([['培训未完成','次'],['技能考核不达标','人次'],['违章违纪','人次']],Math.round(100-d.staff),[.3,.4,.3]),
      device:gen([['设备故障','件'],['超期未检修','台'],['质量鉴定不良','件']],Math.round(100-d.device),[.45,.3,.25])
    };
  }
  function dimSection(){
    const org=byId[state.org],d=dimsOf(org),basis=dimBasisOf(org);
    const cards=['safety','production','staff','device'].map(key=>{
      const m=DIM_META[key],arr=basis[key],score=d[key];
      const text=`${org.name}本月${arr.map((it,k)=>`${k?'；':'发生'}${it.name} <b>${it.count}</b> ${it.unit}，扣 <b>${it.deduct}</b> 分`).join('')}。本月${m.label}得分共计 <b>${score.toFixed(1)}</b> 分。`;
      return `<li class="oa-dim-item" style="--c:${m.color};--cbg:${m.bg}"><span class="oa-dim-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${m.icon}</svg></span><div class="oa-dim-body"><div class="oa-dim-head"><span class="oa-dim-name">${m.label}</span><em class="oa-dim-weight">权重 ${(WEIGHTS[key]*100).toFixed(0)}%</em></div><p class="oa-basis-text">${text}</p><ul class="oa-basis-detail">${arr.map(it=>`<li><span>${it.name}</span><em>${it.count} ${it.unit}</em><i>扣 ${it.deduct} 分</i></li>`).join('')}<li class="oa-basis-sum"><span>合计</span><em>—</em><i>扣 ${arr.reduce((a,b)=>a+b.deduct,0)} 分</i></li></ul><button class="oa-basis-toggle" data-oa-basis="${key}">展开详情</button></div><div class="oa-dim-score"><b>${score.toFixed(1)}</b><small>分</small></div></li>`;
    }).join('');
    return `<article class="oa-total-card"><header class="oa-radar-title"><span>四维雷达图</span><strong>${d.total.toFixed(1)}分</strong></header>${radarChart(org,d)}<div class="oa-total-meta"><small>${org.kind} · ${org.name} · 责任人 ${org.leader}</small></div></article><article class="oa-dim-card"><header><h3>四维得分依据</h3><span>安全效果 30% · 生产组织 25% · 设备质量 25% · 人员评价 20%</span></header><ul class="oa-dim-list">${cards}</ul></article>`;
  }

  function trendChart(){
    const org=byId[state.org],vals=trendOf(org),w=880,h=210,x=i=>52+i*72,y=v=>170-(v-60)*3.6;
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${org.name}近一年综合得分趋势"><defs><linearGradient id="oaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#168bf0" stop-opacity=".22"/><stop offset="1" stop-color="#168bf0" stop-opacity="0"/></linearGradient></defs><g class="oa-grid">${[60,70,80,90,100].map(v=>`<line x1="46" y1="${y(v)}" x2="850" y2="${y(v)}"/><text x="12" y="${y(v)+4}">${v}</text>`).join('')}</g><polygon class="oa-area" points="${vals.map((v,i)=>`${x(i)},${y(v)}`).join(' ')} ${x(11)},170 ${x(0)},170"/><polyline class="oa-line" points="${vals.map((v,i)=>`${x(i)},${y(v)}`).join(' ')}"/>${vals.map((v,i)=>`<circle class="oa-dot" cx="${x(i)}" cy="${y(v)}" r="3.4"><title>${MONTHS[i]}：${v.toFixed(1)}分</title></circle>`).join('')}<g class="oa-xlabels">${MONTHS.map((m,i)=>`<text x="${x(i)}" y="198">${m}</text>`).join('')}</g></svg>`;
  }

  function dailyChart(){
    const org=byId[state.org],vals=dailyTrendOf(org),w=880,h=210,n=vals.length;
    const x=i=>46+i*804/(n-1),y=v=>170-(v-60)*3.6;
    const labels=vals.map((_,i)=>`10-${String(i+1).padStart(2,'0')}`),ticks=[0,4,9,14,19,24,30];
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${org.name}当月素质综合评分趋势"><defs><linearGradient id="oaFillDaily" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#13b980" stop-opacity=".2"/><stop offset="1" stop-color="#13b980" stop-opacity="0"/></linearGradient></defs><g class="oa-grid">${[60,70,80,90,100].map(v=>`<line x1="46" y1="${y(v)}" x2="850" y2="${y(v)}"/><text x="12" y="${y(v)+4}">${v}</text>`).join('')}</g><polygon class="oa-area oa-area-daily" points="${vals.map((v,i)=>`${x(i)},${y(v)}`).join(' ')} ${x(n-1)},170 ${x(0)},170"/><polyline class="oa-line oa-line-daily" points="${vals.map((v,i)=>`${x(i)},${y(v)}`).join(' ')}"/>${vals.map((v,i)=>`<circle class="oa-dot oa-dot-daily" cx="${x(i)}" cy="${y(v)}" r="2.6"><title>10月${i+1}日：${v.toFixed(1)}分</title></circle>`).join('')}<g class="oa-xlabels">${ticks.map(i=>`<text x="${x(i)}" y="198">${labels[i]}</text>`).join('')}</g></svg>`;
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
    requestAnimationFrame(()=>{render();const root=document.querySelector('.oa-page');updateFilterToggle(root);observeRadar(root)});
    return `<div class="oa-page"><aside class="oa-tree-panel">${tree()}</aside><section class="oa-main"><header class="oa-heading"><div><h1>机构评估</h1><p>按组织机构综合评价安全、生产、人员与设备四维表现</p></div><span>数据更新：2026-10-20 09:30</span></header><section class="oa-filter"><div class="oa-filter-controls">${range('oaSafety','安全效果')}${range('oaProduction','生产组织')}${range('oaStaff','人员评价')}${range('oaDevice','设备质量')}${range('oaTotal','总分')}</div><div class="oa-filter-actions"><button class="oa-filter-toggle" id="oaFilterToggle" hidden>展开</button><button class="primary-action" id="oaQuery">查询</button><button id="oaReset">重置</button></div></section><section class="oa-statistics" id="oaStats"><div class="oa-score-row">${scoreCards()}</div><div class="oa-dim-row">${dimSection()}</div><div class="oa-trend-row"><article class="oa-trend"><header><h2>近一年素质综合评分趋势</h2><span id="oaTrendScope">${byId[state.org].name} · 以月为单位</span></header>${trendChart()}</article><article class="oa-trend"><header><h2>当月素质综合评分趋势</h2><span>${byId[state.org].name} · 以天为单位（2026年10月）</span></header>${dailyChart()}</article></div></section><section class="oa-table-card"><header><h2 id="oaListTitle">机构评估结果</h2><span id="oaListScope">${SCOPE[byId[state.org].kind]} · 按总分由高到低排序</span></header><div class="oa-table-wrap"><table><thead><tr><th>序号</th><th>部门名称</th><th>责任人</th><th>安全效果得分</th><th>生产组织得分</th><th>人员评价得分</th><th>设备质量得分</th><th>总分</th><th>操作</th></tr></thead><tbody id="oaRows">${rows()}</tbody></table></div><footer id="oaPager">${pager()}</footer></section></section></div>`;
  }
  function updateFilterToggle(root){if(!root)return;const box=root.querySelector('.oa-filter-controls'),btn=root.querySelector('#oaFilterToggle');if(!box||!btn)return;btn.hidden=box.classList.contains('expanded')||!(box.scrollHeight>box.clientHeight+2)}
  function render(){
    const root=document.querySelector('.oa-page');if(!root)return;
    updateFilterToggle(root);
    const org=byId[state.org];
    root.querySelector('#oaRows').innerHTML=rows();
    root.querySelector('#oaPager').innerHTML=pager();
    root.querySelector('#oaStats').innerHTML=`<div class="oa-score-row">${scoreCards()}</div><div class="oa-dim-row">${dimSection()}</div><div class="oa-trend-row"><article class="oa-trend"><header><h2>近一年素质综合评分趋势</h2><span id="oaTrendScope">${org.name} · 以月为单位</span></header>${trendChart()}</article><article class="oa-trend"><header><h2>当月素质综合评分趋势</h2><span>${org.name} · 以天为单位（2026年10月）</span></header>${dailyChart()}</article></div>`;
    root.querySelector('#oaListScope').textContent=`${SCOPE[org.kind]} · 按总分由高到低排序`;
    observeRadar(root);
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
    const basisBtn=e.target.closest('[data-oa-basis]');
    if(basisBtn){const card=basisBtn.closest('.oa-dim-item'),open=card.classList.toggle('expanded');basisBtn.textContent=open?'收起':'展开详情';return}
    if(e.target.id==='oaQuery'){readRanges(root);render();return}
    if(e.target.id==='oaReset'){state.ranges={safety:[null,null],production:[null,null],staff:[null,null],device:[null,null],total:[null,null]};state.page=1;root.querySelectorAll('.oa-filter input').forEach(x=>x.value='');render();return}
    const pg=e.target.closest('[data-oa-page]');
    if(pg&&!pg.disabled){state.page=+pg.dataset.oaPage;render()}
  });
  function positionRadarTooltip(point,event){
    const wrap=point.closest('.oa-radar-wrap'),tip=wrap&&wrap.querySelector('.oa-radar-tooltip');
    if(!wrap||!tip)return;
    tip.textContent=point.dataset.radarTip;tip.hidden=false;
    const wr=wrap.getBoundingClientRect(),pr=point.getBoundingClientRect();
    const clientX=event&&Number.isFinite(event.clientX)?event.clientX:pr.left+pr.width/2;
    const clientY=event&&Number.isFinite(event.clientY)?event.clientY:pr.top;
    const left=Math.max(6,Math.min(clientX-wr.left+10,wr.width-tip.offsetWidth-6));
    const top=Math.max(6,Math.min(clientY-wr.top-tip.offsetHeight-10,wr.height-tip.offsetHeight-6));
    tip.style.left=`${left}px`;tip.style.top=`${top}px`;
  }
  function hideRadarTooltip(point){const tip=point.closest('.oa-radar-wrap')?.querySelector('.oa-radar-tooltip');if(tip)tip.hidden=true}
  document.addEventListener('pointerover',e=>{const point=e.target.closest?.('.oa-radar-point');if(point)positionRadarTooltip(point,e)});
  document.addEventListener('pointermove',e=>{const point=e.target.closest?.('.oa-radar-point');if(point)positionRadarTooltip(point,e)});
  document.addEventListener('pointerout',e=>{const point=e.target.closest?.('.oa-radar-point');if(point)hideRadarTooltip(point)});
  document.addEventListener('focusin',e=>{const point=e.target.closest?.('.oa-radar-point');if(point)positionRadarTooltip(point)});
  document.addEventListener('focusout',e=>{const point=e.target.closest?.('.oa-radar-point');if(point)hideRadarTooltip(point)});
  window.addEventListener('resize',()=>{const root=document.querySelector('.oa-page');if(!root)return;const box=root.querySelector('.oa-filter-controls'),btn=root.querySelector('#oaFilterToggle');if(box&&btn)btn.hidden=!(box.scrollHeight>box.clientHeight+2)});

  window.OrgAssessmentData={orgs,dimsOf,trendOf,rankingOf,levelTitle:LEVEL_TITLE};
  window.PageViews.orgAssessment=page;
  window.PageViews.orgAssessmentDetail=detail;
})();
