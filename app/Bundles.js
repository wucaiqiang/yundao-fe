import syncComponent from "./lib/syncComponent";

//start:基础页面
export const Index = syncComponent("Index", require("./entry/Index"));
export const Login = syncComponent("Login", require("./entry/Login"));
//end:基础页面

//start:产品配置
export const ProductConfigElement = syncComponent(
  "ProductConfigElement",
  require("./entry/product/config/Elements")
);
export const ProductConfigCategory = syncComponent(
  "ProductConfigCategory",
  require("./entry/product/config/Category")
);
export const ProductConfigCategoryEdit = syncComponent(
  "ProductConfigCategoryEdit",
  require("./entry/product/config/EditCategory")
);
//end:产品配置

//start:产品管理
export const ProductControlIndex = syncComponent(
  "ProductControlIndex",
  require("./entry/product/control/Index")
);
export const ProductControlAudit = syncComponent(
  "ProductControlAudit",
  require("./entry/product/control/Audit")
);
export const ProductControlNew = syncComponent(
  "ProductControlNew",
  require("./entry/product/control/New")
);

export const ProductNoticeIndex = syncComponent(
  "ProductNoticeIndex",
  require("./entry/product/notice/Index")
);
export const ProductNoticeAudit = syncComponent(
  "ProductNoticeAudit",
  require("./entry/product/notice/Audit")
);

//end:产品管理

//start:产品详情
export const ProductDetailIndex = syncComponent(
  "ProductDetailIndex",
  require("./entry/product/detail/Index")
);
//end:产品详情

//start:系统配置
export const SystemConfigOrganization = syncComponent(
  "SystemConfigOrganization",
  require("./entry/system/config/Organization")
);
export const SystemConfigRole = syncComponent(
  "SystemConfigRole",
  require("./entry/system/config/Role")
);
//end:系统配置

//start:客户管理
export const CustomerIndex = syncComponent(
  "CustomerIndex",
  require("./entry/customer/Index")
);
export const CustomerMy = syncComponent(
  "CustomerMy",
  require("./entry/customer/My")
);
export const CustomerPool = syncComponent(
  "CustomerPool",
  require("./entry/customer/Pool")
);
export const CustomerAudit = syncComponent(
  "CustomerAudit",
  require("./entry/customer/Audit")
);
//end:客户管理

//start:销售管理
export const SaleAppointmentIndex = syncComponent(
  "SaleAppointmentIndex",
  require("./entry/sale/appointment/Index")
);
export const SaleAppointmentAudit = syncComponent(
  "SaleAppointmentAudit",
  require("./entry/sale/appointment/Audit")
);
export const SaleDeclarationIndex = syncComponent(
  "SaleDeclarationIndex",
  require("./entry/sale/declaration/Index")
);
export const SaleDeclarationAudit = syncComponent(
  "SaleDeclarationAudit",
  require("./entry/sale/declaration/Audit")
);
export const DeclarationDetailIndex = syncComponent(
  "DeclarationDetailIndex",
  require("./entry/sale/declaration/detail/")
);
//end:销售管理

// start:财务管理
export const ReceiptPlanIndex = asyncComponent("ReceiptPlanIndex", () =>
  import("./entry/finance/receiptplan/Index")
);
export const KnotCommissionIndex = asyncComponent("KnotCommissionIndex", () =>
  import("./entry/finance/knotcommission/Index")
);
export const KnotCommissionAudit = asyncComponent("KnotCommissionAudit", () =>
  import("./entry/finance/knotcommission/Audit")
);
//  end:财务管理

//start:团队管理
//end:团队管理

