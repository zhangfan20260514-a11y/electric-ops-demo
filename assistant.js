(function(){
  const quick=[
    '当前有哪些待关注告警？',
    '帮我分析道岔设备健康状态',
    '本月问题闭环率是多少？',
    '生成一份设备健康度评估报告',
    '近期作业天窗兑现情况如何？',
    '应急资源储备是否充足？'
  ];
  const knowledge={
    '告警':{t:'实时告警概览',c:'目前全段共有 <b>128</b> 条告警，其中今日新增 <b>8</b> 条：I级 6、II级 18、III级 43、预警 61。重点关注成都站 12# 道岔「定位无表示」与简州 JZ-3G 轨道电路电压波动，建议优先派工核查。'},
    '道岔':{t:'道岔设备健康分析',c:'道岔类设备共 12 台，平均综合得分 <b>91.4</b>：优良 9 台、合格 2 台、不合格 1 台。龙兴 26# 道岔动作电流曲线异常，建议结合集中监测曲线复核并安排整治。'},
    '闭环率':{t:'问题闭环率',c:'本月问题闭环率为 <b>96.4%</b>，较上月提升 1.2 个百分点。未销号问题 12 件（A 类 2、B 类 9、C 类 1），其中今日到期 2 项，请责任车间及时反馈处置结果。'},
    '评估':{t:'设备健康度评估报告',c:'已为您生成《设备健康度综合评估（2026-10）》：设备总数 6,832，优良率 76.8%、合格率 22.5%、不合格率 0.7%。建议对不合格设备纳入专项整治计划，详见「智能分析」模块。'},
    '天窗':{t:'作业天窗兑现分析',c:'本月计划天窗 312 项，实际兑现 296 项，周计划平均兑现率 96%，月计划完成率 94%。夜间天窗 1 项已纳入重点盯控。'},
    '应急':{t:'应急资源评估',c:'当前应急预案 10 份，应急物资储备充足；司机信息、登销记模版、出行交通信息均已维护。建议按季度开展应急演练并复核物资有效期。'}
  };
  let messages=[{role:'ai',text:'您好，我是成渝中线电务智能运维助手。我可以帮您查询设备状态、分析告警趋势、生成评估报告。请问需要什么帮助？'}];
  function reply(text){
    const hit=Object.keys(knowledge).find(k=>text.indexOf(k)>=0);
    if(hit)return `<b>${knowledge[hit].t}</b><br>${knowledge[hit].c}`;
    return '已收到您的指令。我可协助您完成设备状态查询、告警分析、问题闭环跟踪、报表生成与应急指挥等任务。您可以点击左侧快捷指令，或直接描述需求。';
  }
  function renderConversation(){const box=document.querySelector('#assMessages');if(!box)return;box.innerHTML=messages.map(m=>`<div class="ass-bubble ${m.role}"><span class="ass-avatar">${m.role==='ai'?'AI':'我'}</span><div class="ass-text">${m.text}</div></div>`).join('');box.scrollTop=box.scrollHeight;}
  function send(text){text=text.trim();if(!text)return;messages.push({role:'user',text});renderConversation();setTimeout(()=>{messages.push({role:'ai',text:reply(text)});renderConversation()},420);}
  function page(){return `<div class="ass-page"><header class="ass-heading"><div><h1>智能助手</h1><p>基于运维知识库的智能问答与辅助决策</p></div><span class="ass-online">● 在线</span></header><div class="ass-body"><aside class="ass-side"><div class="ass-side-banner"><img src="assets/profile.jpeg" alt=""><div><b>运维智能助手</b><small>I-PHM 智能体 · v2.6</small></div></div><h3>快捷指令</h3><ul class="ass-quick">${quick.map(q=>`<li data-ass-quick="${q.replace(/"/g,'&quot;')}">${q}</li>`).join('')}</ul><div class="ass-tip">提示：输入设备类型、告警、工单、报表等关键词可获得更精准的回答。</div></aside><section class="ass-chat"><div class="ass-messages" id="assMessages">${messages.map(m=>`<div class="ass-bubble ${m.role}"><span class="ass-avatar">${m.role==='ai'?'AI':'我'}</span><div class="ass-text">${m.text}</div></div>`).join('')}</div><div class="ass-input"><input id="assInput" placeholder="请输入您的问题，例如：当前告警情况..." /><button id="assSend">发送</button></div></section></div></div>`}
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-ass-quick]')){const q=e.target.closest('[data-ass-quick]').dataset.assQuick;const input=document.querySelector('#assInput');if(input)input.value=q;send(q);return}
    if(e.target.id==='assSend'){const input=document.querySelector('#assInput');if(input){send(input.value);input.value='';return}}
  });
  document.addEventListener('keydown',e=>{if(e.target.id==='assInput'&&e.key==='Enter'){const input=e.target;send(input.value);input.value=''}});
  window.PageViews.assistant=page;
})();
