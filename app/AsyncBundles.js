import asyncComponent from "./lib/asyncComponent";

//start:基础页面
export const Index = asyncComponent("Index", () => import("./entry/Index"));
export const Login = asyncComponent("Login", () => import("./entry/Login"));
export const Forgot = asyncComponent("Forgot", () => import("./entry/Forgot"));
export const OncePassword = asyncComponent("OncePassword", () =>
  import("./entry/user/OncePassword")
);
//end:基础页面

//start:产品配置
export const ProductConfigElement = asyncComponent("ProductConfigElement", () =>
  import("./entry/product/config/Elements")
);
export const ProductConfigCategory = asyncComponent(
  "ProductConfigCategory",
  () => import("./entry/product/config/Category")
);
export const ProductConfigCategoryEdit = asyncComponent(
  "ProductConfigCategoryEdit",
  () => import("./entry/product/config/EditCategory")
);
//end:产品配置

//start:产品管理
export const ProductCenter = asyncComponent("ProductCenter", () =>
  import("./entry/product/Center")
);
export const ProductControlIndex = asyncComponent("ProductControlIndex", () =>
  import("./entry/product/control/Index")
);
export const ProductControlAudit = asyncComponent("ProductControlAudit", () =>
  import("./entry/product/control/Audit")
);
export const ProductControlNew = asyncComponent("ProductControlNew", () =>
  import("./entry/product/control/New")
);
export const ProductNoticeIndex = asyncComponent("ProductNoticeIndex", () =>
  import("./entry/product/notice/Index")
);
export const ProductNoticeAudit = asyncComponent("ProductNoticeAudit", () =>
  import("./entry/product/notice/Audit")
);
//end:产品管理

//start:产品详情
export const ProductDetailIndex = asyncComponent("ProductDetailIndex", () =>
  import("./entry/product/detail/Index")
);
//end:产品详情

//start:系统管理
export const SystemConfigOrganization = asyncComponent(
  "SystemConfigOrganization",
  () => import("./entry/system/config/Organization")
);
export const SystemConfigRole = asyncComponent("SystemConfigRole", () =>
  import("./entry/system/config/Role")
);
export const SystemPermissionLog = asyncComponent("SystemPermissionLog", () =>
  import("./entry/system/PermissionLog")
);
export const SystemLogging = asyncComponent("SystemLogging", () =>
  import("./entry/system/Logging")
);
export const SystemConfigSale = asyncComponent("SystemConfigSale", () =>
  import("./entry/system/config/Sale")
);
//end:系统管理

//start:客户管理
export const CustomerIndex = asyncComponent("CustomerIndex", () =>
  import("./entry/customer/Index")
);
export const CustomerMy = asyncComponent("CustomerMy", () =>
  import("./entry/customer/My")
);
export const CustomerDetailIndex = asyncComponent("CustomerDetailIndex", () =>
  import("./entry/customer/Detail")
);
export const CustomerPool = asyncComponent("CustomerPool", () =>
  import("./entry/customer/Pool")
);
export const CustomerAudit = asyncComponent("CustomerAudit", () =>
  import("./entry/customer/Audit")
);
export const CustomerDiscard = asyncComponent("CustomerDiscard", () =>
  import("./entry/customer/Discard")
);
export const CustomerArbitration = asyncComponent("CustomerArbitration", () =>
  import("./entry/customer/Arbitration")
);
export const CustomerHighSeas = asyncComponent("CustomerHighSeas", () =>
  import("./entry/customer/HighSeas")
);
export const CustomerChannel = asyncComponent("CustomerChannel", () =>
  import("./entry/customer/Channel")
);
//end:客户管理

//start:销售管理
export const SaleAppointmentIndex = asyncComponent("SaleAppointmentIndex", () =>
  import("./entry/sale/appointment/Index")
);
export const SaleAppointmentAudit = asyncComponent("SaleAppointmentAudit", () =>
  import("./entry/sale/appointment/Audit")
);
export const SaleDeclarationIndex = asyncComponent("SaleDeclarationIndex", () =>
  import("./entry/sale/declaration/Index")
);
export const SaleDeclarationAudit = asyncComponent("SaleDeclarationAudit", () =>
  import("./entry/sale/declaration/Audit")
);
export const SaleRefundsIndex = asyncComponent("SaleRefundsIndex", () =>
  import("./entry/sale/refunds/Index")
);
export const SaleRefundsAudit = asyncComponent("SaleRefundsAudit", () =>
  import("./entry/sale/refunds/Audit")
);
export const SaleChance = asyncComponent("SaleChance", () =>
  import("./entry/sale/Chance")
);
export const SaleRedemption = asyncComponent("SaleRedemption", () =>
  import("./entry/sale/Redemption")
);
export const DeclarationDetailIndex = asyncComponent(
  "DeclarationDetailIndex",
  () => import("./entry/sale/declaration/Detail")
);
//end:销售管理

//start:运营管理
export const OperationAllot = asyncComponent("OperationAllot", () =>
  import("./entry/operation/Allot")
);
export const OperationClue = asyncComponent("OperationClue", () =>
  import("./entry/operation/Clue")
);
//end:运营管理

// start:财务管理
export const ReceiptPlanIndex = asyncComponent("ReceiptPlanIndex", () =>
  import("./entry/finance/receiptplan/Index")
);
export const ReceiptPlanDetail = asyncComponent("ReceiptPlanDetail", () =>
  import("./entry/finance/receiptplan/Detail")
);
export const KnotCommissionIndex = asyncComponent("KnotCommissionIndex", () =>
  import("./entry/finance/knotcommission/Index")
);
export const KnotCommissionAudit = asyncComponent("KnotCommissionAudit", () =>
  import("./entry/finance/knotcommission/Audit")
);
//  end:财务管理

// start:内容管理
export const CMSProductRecommendIndex = asyncComponent(
  "CMSProductRecommendIndex",
  () => import("./entry/cms/product/Recommend")
);
export const CMSNewsColumnList = asyncComponent("CMSNewsColumnList", () =>
  import("./entry/cms/news/Column")
);

export const CMSNewsList = asyncComponent("CMSNewsList", () =>
  import("./entry/cms/news/List")
);

export const CMSNewsDetail = asyncComponent("CMSNewsDetail", () =>
  import("./entry/cms/news/Detail")
);

export const CMSNewsAdd = asyncComponent("CMSNewsAdd", () =>
  import("./entry/cms/news/Add")
);

export const CMSRoadshowAdd = asyncComponent("CMSRoadshowAdd", () =>
  import("./entry/cms/roadshow/Add")
);
export const CMSRoadshowDetail = asyncComponent("CMSRoadshowDetail", () =>
  import("./entry/cms/roadshow/Detail")
);

export const CMSRoadshowColumnList = asyncComponent(
  "CMSRoadshowColumnList",
  () => import("./entry/cms/roadshow/Column")
);

export const CMSRoadshowList = asyncComponent("CMSRoadshowList", () =>
  import("./entry/cms/roadshow/List")
);

export const CMSVideoList = asyncComponent("CMSVideoList", () =>
  import("./entry/cms/video/List")
);

//  end:内容管理

// start:投资管理

export const AssetsIndex = asyncComponent("AssetsIndex", () =>
  import("./entry/assets/Index")
);
export const AssetsProject = asyncComponent("AssetsProject", () =>
  import("./entry/assets/Project")
);
export const AssetsInvestment = asyncComponent("AssetsInvestment", () =>
  import("./entry/assets/Investment")
);
export const AssetsWithdraw = asyncComponent("AssetsWithdraw", () =>
  import("./entry/assets/Withdraw")
);
export const AssetsFund = asyncComponent("AssetsFund", () =>
  import("./entry/assets/Fund")
);
export const AssetsAddFund = asyncComponent("AssetsAddFund", () =>
  import("./entry/assets/AddFund")
);
export const AssetsFundDetail = asyncComponent("AssetsFundDetail", () =>
  import("./entry/assets/FundDetail")
);
export const AssetsAuditHistory = asyncComponent("AssetsAuditHistory", () =>
  import("./entry/assets/AuditHistory")
);

// end:投资管理
