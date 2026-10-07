(function(){
  const months=['10月','11月','12月','1月','2月','3月','4月','5月','6月','7月','8月','9月'];
  const orgs=[
    {id:'bureau',name:'成都铁路局',level:'局',parent:null},
    {id:'section',name:'成都电务段',level:'段',parent:'bureau'},
    {id:'workshop-a',name:'重庆信号车间',level:'车间',parent:'section'},
    {id:'team-a',name:'龙兴信号工区',level:'工区',parent:'workshop-a'},
    {id:'team-b',name:'示例二站工区',level:'工区',parent:'workshop-a'},
    {id:'workshop-b',name:'成都信号车间',level:'车间',parent:'section'},
    {id:'team-c',name:'成都东信号工区',level:'工区',parent:'workshop-b'}
  ];
  const staffNames=['张三','李明','王芳','赵强','陈杰','刘洋','周静','徐磊','黄丽','孙磊','吴倩','郑凯'];
  const managerNames=['王勇','肖鹏','赵敏','何军','陈峰','刘强','孙伟','杨帆','周宁','高洁'];
  const units=['龙兴信号工区','示例二站工区','成都东信号工区'];
  const orgIds=['team-a','team-b','team-c'];
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const makeSeries=(base,seed)=>{
    const shape=[-15,-11,-12,-5,-6,3,8,9,16,18,20,24];
    return months.map((month,i)=>({
      label:month,
      value:clamp(base+shape[i]+((seed+i)%3-1)*1.2,42,99),
      average:clamp(base-5+shape[i]*.72,45,94)
    }));
  };
  const makeDimensionSeries=(target,max,seed)=>{
    const shape=[-.38,-.31,-.33,-.25,-.27,-.17,-.11,-.09,-.04,-.06,-.025,0];
    return months.map((month,i)=>({
      label:month,
      value:Number(clamp(target+shape[i]*max+((seed+i)%3-1)*.35,0,max).toFixed(1))
    }));
  };
  // 当月横轴必须覆盖全部自然日；用连续缓升数据避免旧版周期性锯齿。
  const makeDaily=(base,seed)=>{
    const days=30;
    return Array.from({length:days},(_,i)=>{
      const progress=i/(days-1);
      const wave=Math.sin((i+seed)*.72)*1.4;
      return {label:`${i+1}`,value:Number(clamp(base-39+progress*38+wave,20,99).toFixed(1))};
    });
  };
  function makePerson(type,name,index){
    const manager=type==='manager';
    const workload=(manager?30:31)+((index*5)%8);
    const ability=(manager?22:21)+((index*7)%8);
    const quality=(manager?21:20)+((index*3)%7);
    const bonus=(index%4)*1.5;
    const total=Number((workload+ability+quality+bonus).toFixed(1));
    const base=Math.min(96,Math.round(total));
    return {id:`${type}-${index+1}`,type,name,avatar:index%3===0?'assets/quality-detail/raw-4.png':'assets/quality-detail/raw-3.jpeg',unit:units[index%units.length],orgId:orgIds[index%orgIds.length],position:manager?['车间主任','车间副主任','技术主管'][index%3]:['信号工','高级信号工','工班长'][index%3],scores:{workload,ability,quality,bonus,total},rank:0,
      annual:makeDimensionSeries(total,100,index),daily:makeDaily(base,index),
      dimensions:{workload:makeDimensionSeries(workload,40,index+1),ability:makeDimensionSeries(ability,30,index+2),quality:makeDimensionSeries(quality,30,index+3)},
      bonuses:bonus?Array.from({length:index%3+1},(_,i)=>({name:['技术比武获奖','应急处置表扬','合理化建议'][i],reason:['段级技能竞赛获奖','故障处置表现突出','建议被车间采纳'][i],date:`2026-0${7+i}-1${2+i}`,score:Number((bonus/(index%3+1)).toFixed(1))})):[]};
  }
  function finish(list){return list.sort((a,b)=>b.scores.total-a.scores.total).map((p,i)=>({...p,rank:i+1}));}
  const data={staff:finish(staffNames.map((n,i)=>makePerson('staff',n,i))),manager:finish(managerNames.map((n,i)=>makePerson('manager',n,i)))};
  window.QualityAssessmentData={months,orgs,data};
})();
