(function () {
  function pieMarkup(type) {
    const problem = type === 'problem';
    const items = problem
      ? [['A类', 2, 'red'], ['B类', 9, 'orange'], ['C类', 25, 'yellow']]
      : [['I级', 6, 'red'], ['II级', 18, 'orange'], ['III级', 43, 'yellow'], ['预警', 61, 'blue']];
    const total = items.reduce((sum, item) => sum + item[1], 0);
    const gradient = problem
      ? 'conic-gradient(#ef5350 0 5.56%,#f59e0b 5.56% 30.56%,#f5c84b 30.56% 100%)'
      : 'conic-gradient(#ef5350 0 4.69%,#f59e0b 4.69% 18.75%,#f5c84b 18.75% 52.34%,#168bff 52.34% 100%)';
    return `<div class="wb-type-pie-wrap">
      <div class="wb-type-pie" style="background:${gradient}" role="img" aria-label="${items.map(item => `${item[0]}${item[1]}`).join('，')}">
        <div><strong>${total}</strong><small>类型合计</small></div>
      </div>
      <div class="wb-type-legend">${items.map(item => `<span><i class="${item[2]}"></i><b>${item[0]}</b><em>${item[1]}</em></span>`).join('')}</div>
      <span class="wb-type-trend">${problem ? '未销号率 33.3%　↓2.1%' : '较上期　↓8.6%'}</span>
    </div>`;
  }

  function refineWorkbench(root) {
    if (!root || !root.classList.contains('wb-page')) return;
    const alarmTitle = root.querySelector('.wb-alarms .wb-section-head h2');
    if (alarmTitle && alarmTitle.firstChild && !alarmTitle.closest('.wb-alarmrate')) alarmTitle.firstChild.nodeValue = '报警推送 ';
    root.querySelector('.wb-summary')?.remove();
    const welcome = root.querySelector('.wb-welcome');
    if (welcome && !welcome.querySelector('.wb-weather')) {
      const weather = document.createElement('div');
      weather.className = 'wb-weather';
      weather.innerHTML = `<div class="wb-weather-copy"><strong>18<sup>°C</sup></strong><span>晴　成都</span></div>
        <svg class="wb-weather-icon" viewBox="0 0 72 72" role="img" aria-label="晴天">
          <defs><linearGradient id="wbSunGradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffd74a"/><stop offset="1" stop-color="#ffad19"/></linearGradient></defs>
          <circle cx="39" cy="29" r="17" fill="url(#wbSunGradient)"/>
          <g stroke="#ffc52d" stroke-width="3" stroke-linecap="round"><path d="M39 5v7M39 46v7M15 29h7M56 29h7M22 12l5 5M51 41l5 5M56 12l-5 5"/></g>
          <path d="M18 56h35c6 0 10-4 10-9s-4-9-10-9c-1 0-2 0-3 .4A16 16 0 0 0 20 42a9 9 0 0 0-2 18Z" fill="#fff" stroke="#dce9f5" stroke-width="2"/>
        </svg>`;
      const dateBox = welcome.querySelector('.wb-date');
      dateBox?.querySelector('span')?.remove();
      dateBox?.append(weather);
    }
    root.querySelector('.wb-business .wb-scope>span')?.remove();
    root.querySelector('.wb-business .wb-refresh')?.remove();
    const business = root.querySelector(':scope > .wb-business');
    const alarms = root.querySelector(':scope > .wb-alarms');
    if (business && alarms && !root.querySelector(':scope > .wb-business-alarm-row')) {
      const row = document.createElement('div');
      row.className = 'wb-business-alarm-row';
      business.before(row);
      row.append(business, alarms);
    }
    root.querySelectorAll('.wb-device-grid .wb-stat-card>header a').forEach(link => link.remove());
    root.querySelectorAll('.wb-device-grid .wb-stat-card').forEach(card => {
      const stats = card.querySelector('.wb-stat-main');
      if (!stats || stats.dataset.metricReady) return;
      const problemCard = card.classList.contains('wb-problem');
      stats.dataset.metricReady = 'true';
      stats.classList.add('wb-metric-cards');
      stats.innerHTML = problemCard
        ? `<div class="wb-metric-item primary"><i><img src="assets/workbench-icons/stat-problem-total.svg" alt="" /></i><span><strong>36</strong><small>问题总数</small></span></div><div class="wb-metric-item warning"><i><img src="assets/workbench-icons/stat-unresolved.svg" alt="" /></i><span><strong>12</strong><small>未销号</small></span></div>`
        : `<div class="wb-metric-item primary"><i><img src="assets/workbench-icons/stat-alarm-total.svg" alt="" /></i><span><strong>128</strong><small>告警总数</small></span></div><div class="wb-metric-item warning"><i><img src="assets/workbench-icons/stat-today-new.svg" alt="" /></i><span><strong>8</strong><small>今日新增</small></span></div>`;
    });
    const management = root.querySelector('.wb-management-grid');
    if (management && !management.dataset.denseReady) {
      management.dataset.denseReady = 'true';
      const faultSegments = management.querySelector('.wb-stat-card:first-child .wb-segments');
      if (faultSegments) faultSegments.innerHTML = `<div class="wb-fault-scope">包保工区：<b>成都东信号工区</b></div><div class="wb-fault-chart">
        <div class="wb-fault-donut" role="img" aria-label="安全信息9，故障7，事故2"><div><strong>18</strong><small>故障合计</small></div></div>
        <div class="wb-fault-legend"><span><i class="yellow"></i>安全信息 <b>9</b></span><span><i class="orange"></i>故障 <b>7</b></span><span><i class="red"></i>事故 <b>2</b></span></div>
      </div>`;
      const rateCard = management.querySelector('.wb-stat-card:nth-child(2)');
      if (rateCard) rateCard.innerHTML = `<header><span>报警率</span><em class="wb-rate-head-tag">实时</em></header>
        <div class="wb-rate-gauge-wrap">
          <div class="wb-rate-ranks wb-rate-ranks-top" role="list" aria-label="报警率排名">
            <span role="listitem" class="wb-rank-item"><i class="wb-rank-badge">2</i><span class="wb-rank-label">车间排名</span><b class="wb-rank-value">第2名<small>/共6</small></b></span>
            <span role="listitem" class="wb-rank-item"><i class="wb-rank-badge">5</i><span class="wb-rank-label">段排名</span><b class="wb-rank-value">第5名<small>/共18</small></b></span>
          </div>
          <div class="wb-rate-gauge" role="img" aria-label="当前报警率5.2%，目标值不高于6%">
            <span class="wb-gauge-label wb-gauge-label-low">正常</span>
            <span class="wb-gauge-label wb-gauge-label-watch">关注</span>
            <span class="wb-gauge-label wb-gauge-label-high">超标</span>
            <svg viewBox="0 0 240 150" aria-hidden="true">
              <defs><linearGradient id="wbRateGaugeGradient" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#63c8ff"/><stop offset="1" stop-color="#168bff"/></linearGradient></defs>
              <path class="wb-gauge-track" d="M30 124 A90 90 0 0 1 210 124" pathLength="100"/>
              <path class="wb-gauge-progress" d="M30 124 A90 90 0 0 1 210 124" pathLength="100"/>
              <path class="wb-gauge-tick" d="M44 88 L51 92 M116 35 L116 44 M190 91 L197 87"/>
              <circle class="wb-gauge-marker-ring" cx="126" cy="34" r="13"/>
              <circle class="wb-gauge-marker" cx="126" cy="34" r="8"/>
            </svg>
            <div class="wb-gauge-value"><strong>5.2<small>%</small></strong><span>当前报警率</span></div>
          </div>
        </div>`;
      const planCard = management.querySelector('.wb-stat-card:nth-child(3)');
      if (planCard) planCard.innerHTML = `<header><span>计划完成率</span></header>
        <div class="wb-plan-donuts">
          <div class="wb-plan-donut-row"><div class="wb-percent-donut weekly" role="img" aria-label="周计划平均兑现率96%"><div><strong>96%</strong></div></div><span><b>周计划平均兑现率</b><small>目标值 95%</small></span></div>
          <div class="wb-plan-donut-row"><div class="wb-percent-donut monthly" role="img" aria-label="月计划完成率94%"><div><strong>94%</strong></div></div><span><b>月计划完成率</b><small>目标值 92%</small></span></div>
        </div>`;
    }
    const problem = root.querySelector('.wb-stat-card.wb-problem .wb-segments');
    if (problem && !problem.dataset.pieReady) {
      problem.dataset.pieReady = 'true';
      problem.innerHTML = pieMarkup('problem');
    }
    const alarm = root.querySelector('.wb-stat-card.wb-alarm .wb-segments');
    if (alarm && !alarm.dataset.pieReady) {
      alarm.dataset.pieReady = 'true';
      alarm.innerHTML = pieMarkup('alarm');
    }
    const alarmTable = root.querySelector('.wb-alarm-table');
    if (alarmTable && !alarmTable.dataset.listReady) {
      const rows = [...alarmTable.querySelectorAll('tbody tr')];
      const counts = { 'I级': 0, 'II级': 0, 'III级': 0, '预警': 0 };
      const items = rows.map((row, index) => {
        const cells = [...row.querySelectorAll('td')].map(cell => cell.textContent.trim());
        const level = cells[4] || '预警';
        counts[level] = (counts[level] || 0) + 1;
        const stateClass = cells[7] === '已恢复' ? 'recovered' : cells[7] === '处理中' ? 'processing' : 'pending';
        return `<article class="wb-alarm-list-item level-${level.replace('级', '')}" data-alarm-level="${level}">
          <span class="wb-alarm-list-icon" aria-label="${level}">${level === '预警' ? '预警' : level.replace('级', ' 级')}</span>
          <div class="wb-alarm-list-content"><strong>${cells[5]}</strong><p><span>⌖ ${cells[1]} / ${cells[2]} / ${cells[3]}</span><time>● ${cells[6]}</time></p></div>
          <span class="wb-alarm-list-state ${stateClass}">${cells[7]}</span>
          <button class="wb-alarm-detail" data-alarm="${index}">查看详情</button>
        </article>`;
      }).join('');
      alarmTable.dataset.listReady = 'true';
      alarmTable.innerHTML = `<nav class="wb-alarm-filters" aria-label="报警等级筛选">
        <button class="active">全部 <b>${rows.length}</b></button>
        <button>I级 <b>${counts['I级']}</b></button><button>II级 <b>${counts['II级']}</b></button>
        <button>III级 <b>${counts['III级']}</b></button><button>预警 <b>${counts['预警']}</b></button>
      </nav><div class="wb-alarm-list">${items}</div>`;
    }
  }

  const host = document.querySelector('#dynamicPage');
  if (!host) return;
  document.addEventListener('click', event => {
    const button = event.target.closest('.wb-alarm-filters button');
    if (!button) return;
    const filters = button.closest('.wb-alarm-filters');
    filters.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
    const level = button.childNodes[0].textContent.trim();
    button.closest('.wb-alarm-table').querySelectorAll('.wb-alarm-list-item').forEach(item => {
      item.hidden = level !== '全部' && item.dataset.alarmLevel !== level;
    });
  });
  const apply = () => refineWorkbench(host.querySelector('.wb-page'));
  new MutationObserver(apply).observe(host, { childList: true, subtree: false });
  apply();
})();
