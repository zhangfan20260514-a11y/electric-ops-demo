window.AppConfig = {
  routes: {
    '#/workbench': { title: '工作台', module: 'workbench', view: 'placeholder' },
    '#/person/home': { title: '个人主页', module: 'person', view: 'home' },
    '#/person/list': { title: '人员信息', module: 'person', view: 'personList' },
    '#/person/statistics': { title: '人员统计', module: 'person', view: 'personStats' },
    '#/person/responsibility': { title: '包保管理', module: 'person', view: 'responsibility' },
    '#/equipment/issues': { title: '问题管控', module: 'equipment', view: 'issues' },
    '#/work/orders': { title: '工单台账', module: 'work', view: 'orders' },
    '#/work/orders/detail': { title: '工单台账详情', module: 'work', view: 'orderDetail' },
    '#/health': { title: '健康评估', module: 'health', view: 'placeholder' },
    '#/analysis': { title: '智能分析', module: 'analysis', view: 'placeholder' },
    '#/assistant': { title: '智能助手', module: 'assistant', view: 'placeholder' },
    '#/panorama': { title: '全景运维', module: 'panorama', view: 'placeholder' },
    '#/more': { title: '更多菜单', module: 'more', view: 'placeholder' }
  },
  moduleDefaults: { workbench:'#/workbench', person:'#/person/home', equipment:'#/equipment/issues', work:'#/work/orders', health:'#/health', analysis:'#/analysis', assistant:'#/assistant', panorama:'#/panorama', more:'#/more' },
  menus: {
    person: [
      {title:'个人主页',route:'#/person/home',icon:'assets/nav-home.png'},
      {title:'人员信息',route:'#/person/list',icon:'assets/nav-person.png'},
      {title:'人员统计',route:'#/person/statistics',icon:'assets/nav-stats.png'},
      {title:'包保管理',route:'#/person/responsibility',icon:'assets/nav-package.png'}
    ],
    equipment: [{title:'问题管控',route:'#/equipment/issues',icon:'assets/nav-package.png'}],
    work: [{title:'工单台账',route:'#/work/orders',icon:'assets/nav-package.png'}]
  }
};
