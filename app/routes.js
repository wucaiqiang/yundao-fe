import {
  Index,
  Login,
  Forgot,
  OncePassword,
  ProductConfigElement,
  ProductConfigCategory,
  ProductConfigCategoryEdit,
  ProductCenter,
  ProductControlIndex,
  ProductControlAudit,
  ProductControlNew,
  ProductDetailIndex,
  ProductNoticeIndex,
  ProductNoticeAudit,
  SystemConfigOrganization,
  SystemConfigRole,
  SystemPermissionLog,
  SystemLogging,
  SystemConfigSale,
  CustomerAudit,
  CustomerIndex,
  CustomerMy,
  CustomerDetailIndex,
  CustomerPool,
  CustomerDiscard,
  CustomerArbitration,
  CustomerHighSeas,
  CustomerChannel,
  SaleAppointmentAudit,
  SaleAppointmentIndex,
  SaleDeclarationAudit,
  SaleDeclarationIndex,
  DeclarationDetailIndex,
  SaleRefundsIndex,
  SaleRefundsAudit,
  SaleChance,
  SaleRedemption,
  OperationAllot,
  OperationClue,
  ReceiptPlanIndex,
  ReceiptPlanDetail,
  KnotCommissionIndex,
  KnotCommissionAudit,
  CMSProductRecommendIndex,
  CMSNewsColumnList,
  CMSNewsList,
  CMSNewsDetail,
  CMSNewsAdd,
  CMSRoadshowAdd,
  CMSRoadshowColumnList,
  CMSRoadshowDetail,
  CMSRoadshowList,
  CMSVideoList,
  AssetsIndex,
  AssetsProject,
  AssetsInvestment,
  AssetsWithdraw,
  AssetsFund,
  AssetsAddFund,
  AssetsFundDetail,
  AssetsAuditHistory
} from "./Bundles";

//路由第一个是默认首页

export default [
  // {
  //   path: "/",
  //   title: "工作台-云道金融云",
  //   keywords: "",
  //   description: "",
  //   exact: true,
  //   component: ProductCenter
  // },
  {
    path: "/investment",
    title: "投资管理-云道金融云",
    keywords: "",
    description: "",
    exact: true
  },
  {
    path: "/wealth",
    title: "财富管理-云道金融云",
    keywords: "",
    description: "",
    exact: true
  },
  {
    path: "/backstage",
    title: "后台管理-云道金融云",
    keywords: "",
    description: "",
    needPassword: true,
    exact: true
  },
  {
    path: "/product/center",
    title: "产品中心-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: ProductCenter
  },
  {
    path: "/product/config/elements",
    title: "要素配置-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: ProductConfigElement
  },
  {
    path: "/product/config/category",
    title: "类别配置-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: ProductConfigCategory
  },
  {
    path: "/product/config/category/:action",
    title: "产品类型管理-云道金融云",
    keywords: "",
    parent: "/product/config/category",
    description: "",
    exact: true,
    component: ProductConfigCategoryEdit
  },
  {
    path: "/product/control/index",
    title: "产品管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: ProductControlIndex
  },
  {
    path: "/product/control/audit",
    title: "产品审批-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: ProductControlAudit
  },
  {
    path: "/product/control/new",
    title: "新增产品-云道金融云",
    parent: "/product/control/",
    keywords: "",
    description: "",
    exact: true,
    component: ProductControlNew
  },
  {
    path: "/product/detail/:id",
    title: "产品详情-云道金融云",
    parent: "/product/control/",
    keywords: "",
    description: "",
    exact: true,
    component: ProductDetailIndex
  },
  {
    path: "/product/notice/index",
    title: "公告管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: ProductNoticeIndex
  },
  {
    path: "/product/notice/audit",
    title: "公告审批-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: ProductNoticeAudit
  },
  {
    path: "/system/config/organization",
    title: "组织结构管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: SystemConfigOrganization
  },
  {
    path: "/system/config/role",
    title: "角色管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: SystemConfigRole
  },
  {
    path: "/system/config/sale",
    title: "销售管理配置-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: SystemConfigSale
  },
  {
    path: "/system/logging",
    title: "登录记录-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: SystemLogging
  },
  {
    path: "/login",
    title: "登录-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    needLogin: false,
    component: Login
  },
  {
    path: "/forgot",
    title: "找回密码-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    needLogin: false,
    component: Forgot
  },
  {
    path: "/once_password",
    title: "重置初始密码-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    needLogin: false,
    component: OncePassword
  },
  {
    path: "/customer/index",
    title: "客户-客户管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: CustomerIndex
  },
  {
    path: "/customer/my",
    title: "我的客户-客户管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: CustomerMy
  },
  {
    path: "/customer/detail/:id",
    title: "客户详情-销售管理-云道金融云",
    parent: "/customer/index",
    keywords: "",
    description: "",
    exact: true,
    component: CustomerDetailIndex
  },
  {
    path: "/customer/pool",
    title: "全部客户-客户管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: CustomerPool
  },
  {
    path: "/customer/audit",
    title: "回退客户审批-客户管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: CustomerAudit
  },
  {
    path: "/customer/highseas",
    title: "客户公海-客户管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: CustomerHighSeas
  },
  {
    path: "/customer/channel",
    title: "渠道-客户管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: CustomerChannel
  },
  {
    path: "/sale/appointment",
    title: "我的预约-销售管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: SaleAppointmentIndex
  },
  {
    path: "/sale/appointment/audit",
    title: "预约额度确认-销售管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: SaleAppointmentAudit
  },
  {
    path: "/sale/declaration",
    title: "报单-销售管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: SaleDeclarationIndex
  },
  {
    path: "/sale/declaration/audit",
    title: "报单审批-销售管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: SaleDeclarationAudit
  },
  {
    path: "/declaration/detail/:id",
    parent: "/sale/declaration",
    title: "报单审批-销售管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: DeclarationDetailIndex
  },

  {
    path: "/sale/refunds",
    title: "我的退款-销售管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: SaleRefundsIndex
  },
  {
    path: "/sale/refunds/audit",
    title: "退款审批-销售管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: SaleRefundsAudit
  },
  {
    path: "/sale/chance",
    title: "销售机会-销售管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: SaleChance
  },
  {
    path: "/sale/redemption",
    title: "我的赎回-销售管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: SaleRedemption
  },
  {
    path: "/operation/allot",
    title: "回访管理-运营管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: OperationAllot
  },
  {
    path: "/operation/clue",
    title: "销售线索管理-运营管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: OperationClue
  },
  {
    path: "/finance/receiptplan",
    title: "回款计划管理-财务管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: ReceiptPlanIndex
  },
  {
    path: "/finance/receiptplan/detail/:id",
    parent: "/finance/receiptplan",
    title: "回款计划详情-财务管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: ReceiptPlanDetail
  },
  {
    path: "/finance/knotcommission",
    title: "结佣管理-财务管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: KnotCommissionIndex
  },
  {
    path: "/finance/knotcommission/audit",
    title: "结佣审批-财务管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: KnotCommissionAudit
  },
  {
    path: "/cms/product/recommend",
    title: "产品推荐配置-内容配置-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: CMSProductRecommendIndex
  },
  {
    path: "/cms/news/column",
    title: "文章栏目配置-内容配置-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: CMSNewsColumnList
  },
  {
    path: "/cms/news/list",
    title: "文章内容配置-内容配置-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: CMSNewsList
  },
  {
    path: "/cms/news/detail/:id",
    parent: "/cms/news/list",
    title: "文章详情-内容配置-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: CMSNewsDetail
  },
  {
    path: "/cms/news/new",
    parent: "/cms/news/list",
    title: "新增文章-内容配置-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: CMSNewsAdd
  },
  {
    path: "/cms/roadshow/new",
    parent: "/cms/roadshow/list",
    title: "新增路演-内容配置-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: CMSRoadshowAdd
  },
  {
    path: "/cms/roadshow/detail/:id",
    parent: "/cms/roadshow/list",
    title: "路演详情-内容配置-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: CMSRoadshowDetail
  },
  {
    path: "/cms/roadshow/column",
    title: "路演栏目配置-内容配置-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: CMSRoadshowColumnList
  },
  {
    path: "/cms/roadshow/list",
    title: "路演内容配置-资内容配置-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: CMSRoadshowList
  },
  {
    path: "/cms/video/list",
    title: "路演视频管理-投资管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: CMSVideoList
  },

  {
    path: "/assets/index",
    title: "首页-投资管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: AssetsIndex
  },
  {
    path: "/assets/project",
    title: "项目-投资管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: AssetsProject
  },
  {
    path: "/assets/investment",
    title: "投资管理-投资管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: AssetsInvestment
  },
  {
    path: "/assets/withdrawal",
    title: "退出管理-投资管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: AssetsWithdraw
  },
  {
    path: "/assets/fund",
    title: "基金-投资管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: AssetsFund
  },
  {
    path: "/assets/fund/new",
    parent: "/assets/fund",
    title: "新增基金-投资管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: AssetsAddFund
  },
  {
    path: "/fund/detail/:id",
    parent: "/assets/fund",
    title: "基金详情-投资管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    component: AssetsFundDetail
  },
  {
    path: "/assets/project/audit_history",
    title: "审批历史-投资管理-云道金融云",
    keywords: "",
    description: "",
    exact: true,
    parent: "/assets/index",
    component: AssetsAuditHistory
  }
];
