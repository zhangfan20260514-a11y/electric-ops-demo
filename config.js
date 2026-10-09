window.AppConfig = {
  routes: {
    '#/workbench': { title: '工作台', module: 'workbench', view: 'placeholder' },
    '#/person/home': { title: '个人主页', module: 'person', view: 'home' },
    '#/person/list': { title: '人员信息', module: 'person', view: 'personList' },
    '#/person/statistics': { title: '人员统计', module: 'person', view: 'personStats' },
    '#/person/responsibility': { title: '包保管理', module: 'person', view: 'responsibility' },
    '#/equipment/issues': { title: '问题管控', module: 'equipment', view: 'issues' },
    '#/equipment/ledger': { title: '设备台账', module: 'equipment', view: 'placeholder' },
    '#/equipment/spares': { title: '备品台账', module: 'equipment', view: 'spares' },
    '#/work/orders': { title: '工单台账', module: 'work', view: 'orders' },
    '#/work/orders/detail': { title: '工单台账详情', module: 'work', view: 'orderDetail' },
    '#/health': { title: '综合评价', module: 'health', view: 'placeholder' },
    '#/health/quality/staff': { title: '职工能力', module: 'health', view: 'qualityList', qualityType: 'staff' },
    '#/health/quality/manager': { title: '干部能力', module: 'health', view: 'qualityList', qualityType: 'manager' },
    '#/health/quality/staff/detail': { title: '职工能力详情', module: 'health', view: 'qualityDetail', qualityType: 'staff' },
    '#/health/quality/manager/detail': { title: '干部能力详情', module: 'health', view: 'qualityDetail', qualityType: 'manager' },
    '#/health/equipment': { title: '设备状态', module: 'health', view: 'placeholder' },
    '#/health/organization': { title: '机构效能', module: 'health', view: 'placeholder' },
    '#/analysis': { title: '智能分析', module: 'analysis', view: 'placeholder' },
    '#/assistant': { title: '智能助手', module: 'assistant', view: 'placeholder' },
    '#/panorama': { title: '全景应急', module: 'panorama', view: 'placeholder' },
    '#/panorama/emergency': { title: '应急管理', module: 'panorama', view: 'panoramaScreen' },
    '#/panorama/emergency/process': { title: '故障一点通详情', module: 'panorama', view: 'emergencyProcess' },
    '#/panorama/library': { title: '资料库', module: 'panorama', view: 'placeholder' },
    '#/panorama/plans': { title: '应急预案管理', module: 'panorama', view: 'emergencyPlans' },
    '#/panorama/history': { title: '历史应急查询', module: 'panorama', view: 'emergencyHistory' },
    '#/panorama/drivers': { title: '司机信息维护', module: 'panorama', view: 'driverMaintenance' },
    '#/panorama/register-templates': { title: '登销记模版维护', module: 'panorama', view: 'registerTemplateMaintenance' },
    '#/panorama/travel': { title: '出行交通信息维护', module: 'panorama', view: 'travelMaintenance' },
    '#/more': { title: '更多菜单', module: 'more', view: 'placeholder' }
  },
  moduleDefaults: { workbench:'#/workbench', person:'#/person/home', equipment:'#/equipment/spares', work:'#/work/orders', health:'#/health/quality/staff', analysis:'#/analysis', assistant:'#/assistant', panorama:'#/panorama/emergency', more:'#/more' },
  menus: {
    person: [
      {title:'个人主页',route:'#/person/home',icon:'assets/nav-home.png'},
      {title:'人员信息',route:'#/person/list',icon:'assets/nav-person.png'},
      {title:'人员统计',route:'#/person/statistics',icon:'assets/nav-stats.png'},
      {title:'包保管理',route:'#/person/responsibility',icon:'assets/nav-package.png'}
    ],
    equipment: [
      {title:'设备台账',route:'#/equipment/ledger',icon:'assets/nav-package.png'},
      {title:'备品台账',route:'#/equipment/spares',icon:'assets/nav-stats.png'},
      {title:'问题管控',route:'#/equipment/issues',icon:'assets/nav-package.png'}
    ],
    work: [{title:'工单台账',route:'#/work/orders',icon:'assets/nav-package.png'}],
    health: [
      {title:'人员能力',subgroup:true,icon:'assets/nav-person.png'},
      {title:'职工能力',route:'#/health/quality/staff',icon:'assets/nav-person.png',depth:2},
      {title:'干部能力',route:'#/health/quality/manager',icon:'assets/nav-stats.png',depth:2},
      {title:'设备状态',route:'#/health/equipment',icon:'assets/nav-package.png',depth:1},
      {title:'机构效能',route:'#/health/organization',icon:'assets/nav-stats.png',depth:1}
    ],
    panorama: [
      {title:'应急管理',route:'#/panorama/emergency',icon:'assets/nav-home.png'},
      {title:'资料库',route:'#/panorama/library',icon:'assets/nav-package.png'},
      {title:'应急预案管理',route:'#/panorama/plans',icon:'assets/nav-stats.png'},
      {title:'历史应急查询',route:'#/panorama/history',icon:'assets/nav-package.png'},
      {title:'司机信息维护',route:'#/panorama/drivers',icon:'assets/nav-person.png'},
      {title:'登销记模版维护',route:'#/panorama/register-templates',icon:'assets/nav-package.png'},
      {title:'出行交通信息维护',route:'#/panorama/travel',icon:'assets/nav-stats.png'}
    ]
  }
};
