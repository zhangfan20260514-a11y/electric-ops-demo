(function () {
  const STORAGE_KEY = 'wb-actions';
  const DEFAULT_ACTIONS = ['个人主页', '人员信息', '人员统计', '设备台账', '备品台账', '问题管控', '工单台账', '职工能力'];
  const ACTIONS = [
    ['个人主页', '#/person/home', '⌂'], ['人员信息', '#/person/list', '人'],
    ['人员统计', '#/person/statistics', '统'], ['设备台账', '#/equipment/ledger', '设'],
    ['备品台账', '#/equipment/spares', '备'], ['问题管控', '#/equipment/issues', '问'],
    ['工单台账', '#/work/orders', '单'], ['职工能力', '#/health/quality/staff', '评'],
    ['智能分析', '#/analysis', '析'], ['全景应急', '#/panorama/emergency', '急']
  ];
  const GROUPS = [
    ['人员管理', '人', ['个人主页', '人员信息', '人员统计']],
    ['设备管理', '设', ['设备台账', '备品台账', '问题管控']],
    ['作业管理', '单', ['工单台账']],
    ['综合评价', '评', ['职工能力']],
    ['智能分析', '析', ['智能分析']],
    ['全景应急', '急', ['全景应急']]
  ];
  let draft = [];
  let dragging = '';

  function savedActions() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(value) && value.length ? value.filter(name => ACTIONS.some(item => item[0] === name)) : [...DEFAULT_ACTIONS];
    } catch (_) {
      return [...DEFAULT_ACTIONS];
    }
  }

  function actionMeta(name) {
    return ACTIONS.find(item => item[0] === name) || [name, '#/workbench', '•'];
  }

  function selectedMarkup() {
    if (!draft.length) return '<div class="wb-selected-empty">请从左侧勾选常用功能</div>';
    return draft.map((name, index) => {
      const meta = actionMeta(name);
      return `<div class="wb-selected-action" draggable="true" data-action-name="${name}">
        <span class="wb-drag-handle" title="拖动排序">⋮⋮</span><i>${meta[2]}</i>
        <span><b>${name}</b><small>拖动调整显示顺序</small></span>
        <em>${index + 1}</em><button type="button" data-remove-action="${name}" aria-label="移除${name}">×</button>
      </div>`;
    }).join('');
  }

  function sync(modal) {
    if (!modal) return;
    modal.querySelectorAll('[data-action-check]').forEach(input => { input.checked = draft.includes(input.value); });
    const list = modal.querySelector('.wb-selected-actions');
    if (list) list.innerHTML = selectedMarkup();
    const count = modal.querySelector('.wb-selected-count');
    if (count) count.textContent = `已选 ${draft.length} 项`;
  }

  function buildModal(modal) {
    modal.innerHTML = `<section class="wb-modal wb-action-modal" role="dialog" aria-modal="true" aria-labelledby="wbActionTitle">
      <header><h3 id="wbActionTitle">添加常用功能</h3><button class="wb-modal-close" type="button" aria-label="关闭">×</button></header>
      <div class="wb-action-layout">
        <section class="wb-action-tree-panel">
          <div class="wb-action-pane-head"><div><b>系统导航</b><small>勾选需要添加的功能</small></div></div>
          <label class="wb-action-search"><span>⌕</span><input type="search" placeholder="搜索系统功能" data-action-search></label>
          <div class="wb-action-tree">${GROUPS.map(group => `<article class="wb-action-tree-group">
            <header><i>${group[1]}</i><b>${group[0]}</b><span>⌄</span></header>
            <div class="wb-action-tree-children">${group[2].map(name => `<label class="wb-action-tree-leaf" data-action-leaf="${name}">
              <input type="checkbox" value="${name}" data-action-check><span>${name}</span><small>${actionMeta(name)[2]}</small>
            </label>`).join('')}</div>
          </article>`).join('')}</div>
        </section>
        <section class="wb-action-selected-panel">
          <div class="wb-action-pane-head"><div><b>已选常用功能</b><small>上下拖动调整工作台展示顺序</small></div><span class="wb-selected-count"></span></div>
          <div class="wb-selected-actions"></div>
        </section>
      </div>
      <footer><button class="wb-modal-close" type="button">取消</button><button class="wb-modal-save" type="button" data-action-save>保存</button></footer>
    </section>`;
    sync(modal);
  }

  document.addEventListener('click', event => {
    const page = event.target.closest('.wb-page');
    if (!page) return;
    if (event.target.closest('#wbEditActions')) {
      draft = savedActions();
      buildModal(page.querySelector('[data-modal="action"]'));
      return;
    }
    const remove = event.target.closest('[data-remove-action]');
    if (remove) {
      event.preventDefault();
      event.stopPropagation();
      draft = draft.filter(name => name !== remove.dataset.removeAction);
      sync(remove.closest('[data-modal="action"]'));
      return;
    }
    const save = event.target.closest('[data-action-save]');
    if (save) {
      event.preventDefault();
      event.stopImmediatePropagation();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      const host = document.querySelector('#dynamicPage');
      if (host && window.PageViews && typeof window.PageViews.workbench === 'function') host.innerHTML = window.PageViews.workbench();
    }
  }, true);

  document.addEventListener('change', event => {
    const input = event.target.closest('[data-action-check]');
    if (!input) return;
    if (input.checked && !draft.includes(input.value)) draft.push(input.value);
    if (!input.checked) draft = draft.filter(name => name !== input.value);
    sync(input.closest('[data-modal="action"]'));
  });

  document.addEventListener('input', event => {
    if (!event.target.matches('[data-action-search]')) return;
    const keyword = event.target.value.trim().toLowerCase();
    event.target.closest('.wb-action-tree-panel').querySelectorAll('[data-action-leaf]').forEach(item => {
      item.hidden = keyword && !item.dataset.actionLeaf.toLowerCase().includes(keyword);
    });
  });

  document.addEventListener('dragstart', event => {
    const item = event.target.closest('.wb-selected-action');
    if (!item) return;
    dragging = item.dataset.actionName;
    item.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', dragging);
  });
  document.addEventListener('dragend', event => {
    event.target.closest('.wb-selected-action')?.classList.remove('dragging');
    document.querySelectorAll('.wb-selected-action.drag-over').forEach(item => item.classList.remove('drag-over'));
    dragging = '';
  });
  document.addEventListener('dragover', event => {
    const item = event.target.closest('.wb-selected-action');
    if (!item || item.dataset.actionName === dragging) return;
    event.preventDefault();
    document.querySelectorAll('.wb-selected-action.drag-over').forEach(node => node.classList.remove('drag-over'));
    item.classList.add('drag-over');
  });
  document.addEventListener('drop', event => {
    const item = event.target.closest('.wb-selected-action');
    if (!item || !dragging || item.dataset.actionName === dragging) return;
    event.preventDefault();
    const from = draft.indexOf(dragging);
    let to = draft.indexOf(item.dataset.actionName);
    if (from < 0 || to < 0) return;
    const rect = item.getBoundingClientRect();
    if (event.clientY > rect.top + rect.height / 2) to += 1;
    draft.splice(from, 1);
    if (from < to) to -= 1;
    draft.splice(to, 0, dragging);
    sync(item.closest('[data-modal="action"]'));
  });
})();
