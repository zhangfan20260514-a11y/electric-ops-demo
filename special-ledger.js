(function(){
  /* ===== 公共基础数据 ===== */
  const lines=['重庆东环线','成渝中线','渝黔线'];
  const depts=['重庆电务段','成都电务段'];
  const stations=['龙兴站','重庆北站','简州站','成都东站','天府站','资阳西站','迎龙站','樵坪山所'];
  const stOn='<span class="el-status el-on">启用</span>',stOff='<span class="el-status el-off">停用</span>';

  /* ===== 道岔台账（Excel 32字段） ===== */
  const SWITCH_FIELDS=['线别名称','车站名称','设备名称','里程(KM)','转辙设备类型','转辙机型号','道岔类型','直股开通方向','正侧线','行别','工务道岔图号','转辙设备安装图号','辙岔类型','钢轨类型(kg)','道床类型','所属交分道岔','控制类型','动别','锁闭方式','辙叉号','牵引点数量','转辙机安装方式','密检器数量','道岔融雪装置','是否分路道岔','检修周期','检修周期E','联锁道岔','转辙机安装位置(尖)','转辙机安装位置(芯)'];
  const pick=(arr,i)=>arr[i%arr.length];
  const switchDevices=Array.from({length:24},(_,i)=>({
    id:`DC${String(2001+i)}`,dept:pick(depts,i),line:pick(lines,i),station:pick(stations,i*3),
    name:`${i+1}#`,mile:`0${(i*137%999+100)}.${String(i*331%999).padStart(3,'0')}`,
    drive:pick(['电动','电液'],i),model:pick(['ZDJ9','S700K','ZD6','ZYJ7'],i),kind:pick(['单开','对开','交分'],i),
    direct:pick(['上行正线','下行正线'],i),side:pick(['正线','侧线'],i*2),dir:pick(['上行','下行'],i+1),
    gw:pick(['CZ2210','SC330','CZ2600'],i),installMap:pick(['专线4249','电号8541'],i),
    frog:pick(['固定心','可动心'],i),rail:pick(['50','60'],i),bed:pick(['有砟','无砟'],i*2),
    cross:pick(['普通','AT'],i),ctrl:pick(['电气集中','计算机联锁'],i*3),move:pick(['单动','双动','三动'],i),
    lock:pick(['内锁','外锁'],i+2),frogNo:pick(['9','12','18'],i),points:String(i%5+1),
    mount:pick(['角钢','托板'],i),checker:i%3?'':'1',snow:i%4?'无':'有',shunt:i%2?'否':'是',
    cycle:pick(['月检','季检'],i),cycleE:i%2?'':'6个月',interlock:`1/${i%3+3}`,
    posTip:pick(['左侧','右侧'],i),posCore:pick(['右侧','左侧'],i+1),
    status:i%8===0?'停用':'启用'
  }));

  /* ===== 其他10类通用台账 ===== */
  const OTHER_NAMES={
    circuit:['ZPW-2000A区间闭塞','站内电码化区段','轨道继电器组合'],
    signal:['进站信号机','出站信号机','调车信号机','通过信号机'],
    indoor:['联锁机','列控主机','监测分机','接口柜','组合柜'],
    hump:['驼峰测速雷达','减速器控制设备','峰顶信号设备'],
    ctcs:['应答器','LEU设备','CTCS车载设备地面单元'],
    cable:['干线光缆','地区电缆','信号数字电缆'],
    center:['CTC中心设备','监测中心服务器','调度终端'],
    crossing:['道口信号设备','道口报警装置'],
    lightning:['电源防雷模块','通道防雷单元','等电位连接端子'],
    trough:['电缆槽盖板','桥架电缆槽']
  };
  const SPECIAL=[
    {key:'circuit',label:'轨道电路',cols:[['freq','载频'],['mode','闭塞方式'],['len','区段长度(m)'],['ins','绝缘方式'],['occ','占用表示']],
     vals:{freq:['1700-1','1700-2','2000-1','2000-2','2300-1','2600-1'],mode:['自动闭塞','站内电码化'],len:['1250','860','1640','720','980'],ins:['电气绝缘','机械绝缘'],occ:['正常','调整状态']}},
    {key:'signal',label:'信号机',cols:[['stype','信号机类型'],['light','灯光制式'],['lamp','灯泡类型'],['dark','点灯方式'],['cnt','机构数']],
     vals:{stype:['进站','出站','调车','通过','复示'],light:['三显示','四显示','二显示'],lamp:['LED','透镜式'],dark:['点亮','灭灯'],cnt:['1','2','3']}},
    {key:'indoor',label:'室内设备',cols:[['itype','设备类型'],['model2','型号'],['power','电源方式'],['duplex','双机状态'],['room','所在机房']],
     vals:{itype:['联锁机','列控主机','监测分机','接口柜','组合柜'],model2:['DS6-K5B','EI32-JD','JD-1A','通用'],power:['双路交流','UPS供电'],duplex:['A机主用','B机主用'],room:['信号机械室','联锁机房']}},
    {key:'hump',label:'驼峰设备',cols:[['htype','设备类型'],['radar','雷达型号'],['retarder','减速器(台)'],['ctrl2','控制方式'],['yard','驼峰场']],
     vals:{htype:['测速雷达','减速器','峰顶信号设备'],radar:['TZWY-1','CW-2'],retarder:['6','8','12'],ctrl2:['自动化','半自动'],yard:['第1驼峰场','第2驼峰场']}},
    {key:'ctcs',label:'列控室外设备',cols:[['ctype','设备类型'],['code','设备编号'],['msg','报文类型'],['pos2','安装位置'],['leu','关联LEU']],
     vals:{ctype:['应答器','LEU','车载设备地面单元'],code:['BG-1024','LEU-08','VC-15'],msg:['默认报文','临时限速报文'],pos2:['进站信号机处','区间K35+200'],leu:['LEU-08','无']}},
    {key:'cable',label:'电缆线路',cols:[['ktype','电缆类型'],['cores','芯数'],['length','长度(m)'],['lay','敷设方式'],['route','径路']],
     vals:{ktype:['信号数字电缆','干线光缆','地区电缆'],cores:['12','16','24','48'],length:['1350','820','2400'],lay:['直埋','槽道','架空'],route:['龙兴—简州','迎龙—樵坪山','简州—天府']}},
    {key:'center',label:'中心设备',cols:[['centype','设备类型'],['model2','型号'],['ip','IP地址'],['host','主机名'],['site','所在机房']],
     vals:{centype:['CTC中心设备','监测中心服务器','调度终端'],model2:['DS6-K5B','EI32-JD','华为2288'],ip:['10.28.1.11','10.28.1.12','192.168.5.30'],host:['CTC-APP-01','MON-DB-02','DISP-T-03'],site:['调度中心机房','监测中心机房']}},
    {key:'crossing',label:'道口设备',cols:[['gtype','道口类型'],['alarm','报警设备'],['barrier','遮断信号机'],['guard','看守方式'],['road','道路名称']],
     vals:{gtype:['有人看守','无人看守'],alarm:['道口报警器','声光报警装置'],barrier:['2','4','无'],guard:['常设看守','监护'],road:['G319国道','县道X102','乡道Y008']}},
    {key:'lightning',label:'防雷设备',cols:[['ltype','防雷类型'],['grade','防雷等级'],['pos2','安装位置'],['cnt2','数量'],['brand','厂家型号']],
     vals:{ltype:['电源防雷','通道防雷','等电位连接'],grade:['B级','C级'],pos2:['电源屏','组合柜','分线盘'],cnt2:['2','4','6'],brand:['中光ZG-40','雷迅AS-15']}},
    {key:'trough',label:'电缆槽',cols:[['ttype','类型'],['mat','材质'],['tlen','长度(m)'],['cover','盖板状态'],['sec','区段']],
     vals:{ttype:['桥架','槽盒'],mat:['钢制','玻璃钢'],tlen:['320','560','880'],cover:['完好','部分缺损'],sec:['龙兴站内','DK35-DK42','迎龙站内']}}
  ];
  const otherDevices={};
  SPECIAL.forEach((sp,k)=>{
    const names=OTHER_NAMES[sp.key];
    otherDevices[sp.key]=Array.from({length:names.length*3},(_,i)=>Object.assign({
      id:`${sp.label.slice(0,2)}${String(3001+i+k*100)}`,dept:pick(depts,i+k),line:pick(lines,i+k),station:pick(stations,i*2+k),
      type:sp.label,name:names[i%names.length]+`-${String(i+1).padStart(2,'0')}`,model:pick(['GZY-1','DS6-K5B','EI32-JD','通用'],i),
      mile:`DK${(i*89%900+50)}.${String(i*127%999).padStart(3,'0')}`,install:`202${i%4}-${String(i%12+1).padStart(2,'0')}-15`,
      status:i%9===0?'停用':'启用'
    },Object.fromEntries(sp.cols.map(([key],j)=>[key,pick(sp.vals[key],i+j*2)]))));
  });

  /* ===== 设备核对对比数据（生产系统 vs 集中监测） ===== */
  const compareData={
    prod:[
      {line:'重庆东环线',station:'龙兴站',type:'道岔',name:'1#'},
      {line:'重庆东环线',station:'龙兴站',type:'轨道电路',name:'X1LQ(L)BG'},
      {line:'成渝中线',station:'简州站',type:'信号机',name:'X2JG'},
      {line:'重庆东环线',station:'迎龙站',type:'道岔',name:'5#'},
      {line:'成渝中线',station:'天府站',type:'轨道电路',name:'4DG'}
    ],
    cma:[
      {line:'重庆东环线',station:'龙兴站',type:'道岔',name:'1#'},
      {line:'重庆东环线',station:'龙兴站',type:'轨道电路',name:'X1LQ(L)BG'},
      {line:'成渝中线',station:'简州站',type:'信号机',name:'X2JG'},
      {line:'重庆东环线',station:'樵坪山所',type:'轨道电路',name:'J2G'},
      {line:'成渝中线',station:'资阳西站',type:'信号机',name:'S3XL'}
    ]
  };

  /* ===== 通用页面工厂 ===== */
  const opt=(items,label)=>`<option value="">全部${label}</option>${items.map(x=>`<option>${x}</option>`).join('')}`;

  function makeView(cfg){
    const state={dept:'',line:'',station:'',type:'',name:'',status:'',page:1};
    const all=()=>cfg.devices;
    const filtered=()=>all().filter(d=>(!state.dept||d.dept===state.dept)&&(!state.line||d.line===state.line)&&(!state.station||d.station===state.station)&&(!state.type||d.type===state.type)&&(!state.name||d.name.includes(state.name))&&(!state.status||d.status===state.status));
    const rows=()=>{
      const start=(state.page-1)*8,list=filtered().slice(start,start+8);
      return list.map(d=>cfg.row(d)).join('')||`<tr><td colspan="${cfg.cols.length+2}" class="el-empty">暂无符合条件的设备</td></tr>`;
    };
    const pager=()=>{const total=filtered().length,pages=Math.max(1,Math.ceil(total/8));state.page=Math.min(state.page,pages);return `<button data-sl-page="${cfg.key}-${state.page-1}" ${state.page===1?'disabled':''}>‹</button>${Array.from({length:pages},(_,i)=>`<button data-sl-page="${cfg.key}-${i+1}" class="${state.page===i+1?'active':''}">${i+1}</button>`).join('')}<button data-sl-page="${cfg.key}-${state.page+1}" ${state.page===pages?'disabled':''}>›</button><span>共 ${total} 条</span>`};
    const render=()=>{const root=document.querySelector(`[data-sl-view="${cfg.key}"]`);if(!root)return;root.querySelector('[data-sl-rows]').innerHTML=rows();root.querySelector('[data-sl-pager]').innerHTML=pager()};
    const readFilters=root=>{state.dept=root.querySelector('.sl-dept').value;state.line=root.querySelector('.sl-line').value;state.station=root.querySelector('.sl-station').value;state.type=root.querySelector('.sl-type').value;state.name=root.querySelector('.sl-name').value.trim();state.status=root.querySelector('.sl-status').value;state.page=1};
    const detail=d=>cfg.detail?cfg.detail(d):`<div class="el-drawer"><div class="el-drawer-banner"><span class="el-id">${d.id}</span><b>${d.name}</b><span class="el-status el-${d.status==='启用'?'on':'off'}">${d.status}</span></div><div class="detail-list sl-detail-list"><span>部门</span><b>${d.dept}</b><span>线别</span><b>${d.line}</b><span>车站</span><b>${d.station}</b><span>设备类型</span><b>${d.type}</b><span>设备名称</span><b>${d.name}</b><span>规格型号</span><b>${d.model}</b><span>里程</span><b>${d.mile}</b><span>安装日期</span><b>${d.install||'—'}</b>${(cfg.fields||[]).map(([k,l])=>`<span>${l}</span><b>${d[k]||'—'}</b>`).join('')}</div></div>`;
    return {state,filtered,rows,pager,render,readFilters,detail,cols:cfg.cols,key:cfg.key};
  }

  /* ===== 道岔视图配置 ===== */
  const switchRow=d=>`<tr><td>${d.line}</td><td>${d.station}</td><td><b>${d.name}</b></td><td>${d.mile}</td><td>${d.drive}</td><td>${d.move}</td><td>${d.frogNo}</td><td>${d.points}</td><td>${d.ctrl}</td><td>${d.lock}</td><td>${d.status==='启用'?stOn:stOff}</td><td class="el-action"><button data-sl-detail="switch-${d.id}">详情</button></td></tr>`;
  const switchDetail=d=>`<div class="el-drawer sl-drawer"><div class="el-drawer-banner"><span class="el-id">${d.id}</span><b>道岔 ${d.name}（${d.station}）</b><span class="el-status el-${d.status==='启用'?'on':'off'}">${d.status}</span></div><div class="detail-list sl-detail-list">${SWITCH_FIELDS.map(f=>`<span>${f}</span><b>${d[{'线别名称':'line','车站名称':'station','设备名称':'name','里程(KM)':'mile','转辙设备类型':'drive','转辙机型号':'model','道岔类型':'kind','直股开通方向':'direct','正侧线':'side','行别':'dir','工务道岔图号':'gw','转辙设备安装图号':'installMap','辙岔类型':'frog','钢轨类型(kg)':'rail','道床类型':'bed','所属交分道岔':'cross','控制类型':'ctrl','动别':'move','锁闭方式':'lock','辙叉号':'frogNo','牵引点数量':'points','转辙机安装方式':'mount','密检器数量':'checker','道岔融雪装置':'snow','是否分路道岔':'shunt','检修周期':'cycle','检修周期E':'cycleE','联锁道岔':'interlock','转辙机安装位置(尖)':'posTip','转辙机安装位置(芯)':'posCore'}[f]]||'—'}</b>`).join('')}</div></div>`;

  const views={};
  views.switch=makeView({key:'switch',devices:switchDevices,cols:['线别','车站','设备名称','里程(KM)','转辙设备类型','动别','辙叉号','牵引点数量','控制类型','锁闭方式','设备状态','操作'],row:switchRow,detail:switchDetail});
  SPECIAL.forEach(sp=>{
    views[sp.key]=makeView({key:sp.key,devices:otherDevices[sp.key],fields:sp.cols,
      cols:['线别','车站','设备名称',...sp.cols.map(x=>x[1]),'设备状态','操作'],
      row:d=>`<tr><td>${d.line}</td><td>${d.station}</td><td><b>${d.name}</b></td>${sp.cols.map(([k])=>`<td>${d[k]}</td>`).join('')}<td>${d.status==='启用'?stOn:stOff}</td><td class="el-action"><button data-sl-detail="${sp.key}-${d.id}">详情</button></td></tr>`});
  });

  function pageOf(key){
    const cfg=views[key],isSwitch=key==='switch';
    const label=isSwitch?'道岔设备':SPECIAL.find(x=>x.key===key)?.label||key;
    const typeOptions=isSwitch?['单开','对开','交分']:[label];
    requestAnimationFrame(()=>{const root=document.querySelector(`[data-sl-view="${key}"]`);if(root)cfg.render();const it=document.querySelector('[data-sl-items]'),ex=document.querySelector('[data-sl-expand]');if(it&&ex){const need=it.scrollHeight>44;ex.style.display=need?'':'none';it.classList.remove('expanded');ex.textContent='展开 ⌄'}});
    return `<div class="el-page standard-page" data-sl-view="${key}"><header class="el-heading"><div><h1>${label}</h1><p>${label}台账信息管理${isSwitch?' · 台账数据对照道岔台账导出表':''}</p></div><span>数据更新：2026-10-20 09:30</span></header><section class="data-panel"><div class="filter-bar el-filter sl-filterbar"><div class="sl-filter-items" data-sl-items><label>部门<select class="sl-dept">${opt(depts,'部门')}</select></label><label>线别<select class="sl-line">${opt(lines,'线别')}</select></label><label>车站<select class="sl-station">${opt(stations,'车站')}</select></label><label>设备类型<select class="sl-type">${opt(typeOptions,'类型')}</select></label><label class="el-keyword">设备名称<input class="sl-name" placeholder="请输入设备名称"></label><label>设备状态<select class="sl-status"><option value="">全部状态</option><option>启用</option><option>停用</option></select></label></div><button class="sl-expand-btn" type="button" data-sl-expand>展开 ⌄</button><div class="sl-filter-btns"><button data-sl-query="${key}">查询</button><button data-sl-reset="${key}">重置</button></div></div>${isSwitch?'<div class="sl-action-row"><button class="primary-action" id="slCompareBtn">设备核对</button></div>':''}<div class="table-wrap"><table class="design-table el-table"><thead><tr>${cfg.cols.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody data-sl-rows>${cfg.rows()}</tbody></table></div><footer class="el-pager" data-sl-pager>${cfg.pager()}</footer></section></div>`;
  }

  /* ===== 设备核对弹框（同线、同站、同设备类型维度对比） ===== */
  const cmpSame=(a,b)=>a.line===b.line&&a.station===b.station&&a.type===b.type&&a.name===b.name;
  const cmpRows=list=>list.map(d=>`<tr class="sl-cmp-diff"><td>${d.line}</td><td>${d.station}</td><td>${d.type}</td><td>${d.name}</td></tr>`).join('')||'<tr><td colspan="4" style="text-align:center;color:#98a5b3;padding:18px 0">无差异设备</td></tr>';
  function openCompare(){
    if(document.querySelector('.sl-cmp-shell'))return;
    const prodOnly=compareData.prod.filter(p=>!compareData.cma.some(c=>cmpSame(c,p)));
    const cmaOnly=compareData.cma.filter(c=>!compareData.prod.some(p=>cmpSame(p,c)));
    const shell=document.createElement('div');shell.className='sl-cmp-shell';
    shell.innerHTML=`<div class="sl-cmp-mask" data-sl-cmp-close></div><section class="sl-cmp-dialog" role="dialog" aria-modal="true"><header><b>设备核对 — 台账数据对比</b><button data-sl-cmp-close aria-label="关闭">×</button></header><div class="sl-cmp-body"><div class="sl-cmp-col"><h3>生产系统设备台账</h3><table><thead><tr><th>线路</th><th>车站</th><th>设备类型</th><th>设备名称</th></tr></thead><tbody>${cmpRows(prodOnly)}</tbody></table></div><div class="sl-cmp-col"><h3>集中监测设备台账</h3><table><thead><tr><th>线路</th><th>车站</th><th>设备类型</th><th>设备名称</th></tr></thead><tbody>${cmpRows(cmaOnly)}</tbody></table></div></div><footer><span class="sl-cmp-note">按同线路、同车站、同设备类型维度匹配，仅对比道岔、轨道电路、信号机三大类型，展示两侧不同的设备列表</span><button class="primary-action" data-sl-cmp-close>关闭</button></footer></section>`;
    document.body.appendChild(shell);requestAnimationFrame(()=>shell.classList.add('open'));
  }
  function closeCompare(){const s=document.querySelector('.sl-cmp-shell');if(!s)return;s.classList.remove('open');setTimeout(()=>s.remove(),200)}

  /* ===== 事件 ===== */
  document.addEventListener('click',e=>{
    const ex=e.target.closest('[data-sl-expand]');
    if(ex){const it=document.querySelector('[data-sl-items]');if(it){const open=it.classList.toggle('expanded');ex.textContent=open?'收起 ⌃':'展开 ⌄'}return}
    if(e.target.closest('[data-sl-dclose]')){closeDetailModal();return}
    if(e.target.closest('#slCompareBtn')){openCompare();return}
    if(e.target.closest('[data-sl-cmp-close]')){closeCompare();return}
    const q=e.target.closest('[data-sl-query]');
    if(q){const root=q.closest('[data-sl-view]');const cfg=views[root.dataset.slView];cfg.readFilters(root);cfg.render();return}
    const r=e.target.closest('[data-sl-reset]');
    if(r){const root=r.closest('[data-sl-view]');const cfg=views[root.dataset.slView];Object.assign(cfg.state,{dept:'',line:'',station:'',type:'',name:'',status:'',page:1});root.querySelectorAll('select').forEach(x=>x.selectedIndex=0);const n=root.querySelector('.sl-name');if(n)n.value='';cfg.render();return}
    const pg=e.target.closest('[data-sl-page]');
    if(pg&&!pg.disabled){const [key,num]=pg.dataset.slPage.split('-');views[key].state.page=+num;views[key].render();return}
    const dt=e.target.closest('[data-sl-detail]');
    if(dt){const [key,id]=dt.dataset.slDetail.split('-');const list=(key==='switch'?switchDevices:otherDevices[key]);const dev=list.find(x=>x.id===id);if(!dev)return;openDetailModal(key,dev)}
  });
  function openDetailModal(key,dev){
    if(document.querySelector('.sl-detail-shell'))return;
    const shell=document.createElement('div');shell.className='sl-cmp-shell sl-detail-shell';
    shell.innerHTML=`<div class="sl-cmp-mask" data-sl-dclose></div><section class="sl-cmp-dialog" role="dialog" aria-modal="true"><header><b>台账详情</b><button data-sl-dclose aria-label="关闭">×</button></header><div class="sl-detail-modal-body">${(key==='switch'?switchDetail:views[key].detail)(dev)}</div><footer><button class="primary-action" data-sl-dclose>关闭</button></footer></section>`;
    document.body.appendChild(shell);requestAnimationFrame(()=>shell.classList.add('open'));
  }
  function closeDetailModal(){const s=document.querySelector('.sl-detail-shell');if(!s)return;s.classList.remove('open');setTimeout(()=>s.remove(),200)}

  /* ===== 注册视图 ===== */
  window.PageViews.slSwitch=()=>pageOf('switch');
  SPECIAL.forEach(sp=>{window.PageViews['sl_'+sp.key]=()=>pageOf(sp.key)});
})();
