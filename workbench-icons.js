(function () {
  const icons = {
    '个人主页': 'home.svg', '人员信息': 'person.svg', '人员统计': 'statistics.svg',
    '设备台账': 'device.svg', '备品台账': 'spares.svg', '问题管控': 'issues.svg',
    '工单台账': 'orders.svg', '职工能力': 'ability.svg', '智能分析': 'analysis.svg',
    '全景应急': 'emergency.svg'
  };
  function image(name) {
    return `<img src="assets/workbench-icons/${icons[name]}" alt="" aria-hidden="true">`;
  }
  function apply(root) {
    if (!root) return;
    root.querySelectorAll('.wb-shortcut-grid>button').forEach(button => {
      const name = button.querySelector('span')?.textContent.trim();
      const holder = button.querySelector('i');
      if (icons[name] && holder && !holder.querySelector('img')) holder.innerHTML = image(name);
    });
    root.querySelectorAll('.wb-action-tree-leaf').forEach(item => {
      const name = item.dataset.actionLeaf;
      const holder = item.querySelector('small');
      if (icons[name] && holder && !holder.querySelector('img')) holder.innerHTML = image(name);
    });
    root.querySelectorAll('.wb-selected-action').forEach(item => {
      const name = item.dataset.actionName;
      const holder = item.querySelector('i');
      if (icons[name] && holder && !holder.querySelector('img')) holder.innerHTML = image(name);
    });
  }
  const host = document.querySelector('#dynamicPage');
  if (!host) return;
  new MutationObserver(() => apply(host)).observe(host, { childList: true, subtree: true });
  apply(host);
})();
