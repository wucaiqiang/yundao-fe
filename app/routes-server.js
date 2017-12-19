import {
    Index,
    Login,
    ProductConfigElement,
    ProductConfigCategory,
    ProductConfigCategoryEdit,
    ProductControlIndex,
    ProductControlCheck,
    ProductControlNew,
    ProductNoticeIndex,
    ProductNoticeAudit,
    SystemConfigOrganization,
    SystemConfigRole
} from "./Bundles";


export default [{
    path: '/',
    title: '首页-云道金服-私募行业企业服务平台',
    keywords: '云道，yundao，yundaojinfu，知人网络，深圳知人网络有限公司，私募，财富管理，CRM ，移动CRM，SaaS，项目管理，团队协作',
    description: '云道金服，作为私募行业领先的一站式企业服务平台，致力于推进私募金融行业的流程化、智能化， 帮助企业降低运营成本，提高工作效率，实现可持续的业务增长。',
    exact: true,
    component: Index,
}, {
    path: '/product/config/elements',
    title: '要素配置-云道金服-私募行业企业服务平台',
    keywords: '云道，yundao，yundaojinfu，知人网络，深圳知人网络有限公司，私募，财富管理，CRM ，移动CRM，SaaS，项目管理，团队协作',
    description: '云道金服，作为私募行业领先的一站式企业服务平台，致力于推进私募金融行业的流程化、智能化， 帮助企业降低运营成本，提高工作效率，实现可持续的业务增长。',
    exact: true,
    component: ProductConfigElement
}, {
    path: '/product/config/category',
    title: '类别配置-云道金服-私募行业企业服务平台',
    keywords: '云道，yundao，yundaojinfu，知人网络，深圳知人网络有限公司，私募，财富管理，CRM ，移动CRM，SaaS，项目管理，团队协作',
    description: '云道金服，作为私募行业领先的一站式企业服务平台，致力于推进私募金融行业的流程化、智能化， 帮助企业降低运营成本，提高工作效率，实现可持续的业务增长。',
    exact: true,
    component: ProductConfigCategory
}, {
    path: '/product/config/category/:action',
    title: '类别配置-云道金服-私募行业企业服务平台',
    keywords: '云道，yundao，yundaojinfu，知人网络，深圳知人网络有限公司，私募，财富管理，CRM ，移动CRM，SaaS，项目管理，团队协作',
    description: '云道金服，作为私募行业领先的一站式企业服务平台，致力于推进私募金融行业的流程化、智能化， 帮助企业降低运营成本，提高工作效率，实现可持续的业务增长。',
    exact: true,
    component: ProductConfigCategoryEdit
},{
    path: '/product/control/index',
    title: '产品管理-云道金服-私募行业企业服务平台',
    keywords: '云道，yundao，yundaojinfu，知人网络，深圳知人网络有限公司，私募，财富管理，CRM ，移动CRM，SaaS，项目管理，团队协作',
    description: '云道金服，作为私募行业领先的一站式企业服务平台，致力于推进私募金融行业的流程化、智能化， 帮助企业降低运营成本，提高工作效率，实现可持续的业务增长。',
    exact: true,
    component: ProductControlIndex
},{
    path: '/product/control/check',
    title: '产品审批-云道金服-私募行业企业服务平台',
    keywords: '云道，yundao，yundaojinfu，知人网络，深圳知人网络有限公司，私募，财富管理，CRM ，移动CRM，SaaS，项目管理，团队协作',
    description: '云道金服，作为私募行业领先的一站式企业服务平台，致力于推进私募金融行业的流程化、智能化， 帮助企业降低运营成本，提高工作效率，实现可持续的业务增长。',
    exact: true,
    component: ProductControlCheck
},{
    path: '/product/control/new',
    title: '新增产品-云道金服-私募行业企业服务平台',
    keywords: '云道，yundao，yundaojinfu，知人网络，深圳知人网络有限公司，私募，财富管理，CRM ，移动CRM，SaaS，项目管理，团队协作',
    description: '云道金服，作为私募行业领先的一站式企业服务平台，致力于推进私募金融行业的流程化、智能化， 帮助企业降低运营成本，提高工作效率，实现可持续的业务增长。',
    exact: true,
    component: ProductControlNew
},{
    path: '/product/notice/index',
    title: '公告管理-云道金服-私募行业企业服务平台',
    keywords: '云道，yundao，yundaojinfu，知人网络，深圳知人网络有限公司，私募，财富管理，CRM ，移动CRM，SaaS，项目管理，团队协作',
    description: '云道金服，作为私募行业领先的一站式企业服务平台，致力于推进私募金融行业的流程化、智能化， 帮助企业降低运营成本，提高工作效率，实现可持续的业务增长。',
    exact: true,
    component: ProductNoticeIndex
},{
    path: '/product/notice/audit',
    title: '公告审批-云道金服-私募行业企业服务平台',
    keywords: '云道，yundao，yundaojinfu，知人网络，深圳知人网络有限公司，私募，财富管理，CRM ，移动CRM，SaaS，项目管理，团队协作',
    description: '云道金服，作为私募行业领先的一站式企业服务平台，致力于推进私募金融行业的流程化、智能化， 帮助企业降低运营成本，提高工作效率，实现可持续的业务增长。',
    exact: true,
    component: ProductNoticeAudit
}, {
    path: '/system/config/organization',
    title: '组织结构管理-云道金服-私募行业企业服务平台',
    keywords: '云道，yundao，yundaojinfu，知人网络，深圳知人网络有限公司，私募，财富管理，CRM ，移动CRM，SaaS，项目管理，团队协作',
    description: '云道金服，作为私募行业领先的一站式企业服务平台，致力于推进私募金融行业的流程化、智能化， 帮助企业降低运营成本，提高工作效率，实现可持续的业务增长。',
    exact: true,
    component: SystemConfigOrganization
}, {
    path: '/system/config/role',
    title: '角色管理-云道金服-私募行业企业服务平台',
    keywords: '云道，yundao，yundaojinfu，知人网络，深圳知人网络有限公司，私募，财富管理，CRM ，移动CRM，SaaS，项目管理，团队协作',
    description: '云道金服，作为私募行业领先的一站式企业服务平台，致力于推进私募金融行业的流程化、智能化， 帮助企业降低运营成本，提高工作效率，实现可持续的业务增长。',
    exact: true,
    component: SystemConfigRole,

}, {
    path: '/login',
    title: '登录-云道金服-私募行业企业服务平台',
    keywords: '云道，yundao，yundaojinfu，知人网络，深圳知人网络有限公司，私募，财富管理，CRM ，移动CRM，SaaS，项目管理，团队协作',
    description: '云道金服，作为私募行业领先的一站式企业服务平台，致力于推进私募金融行业的流程化、智能化， 帮助企业降低运营成本，提高工作效率，实现可持续的业务增长。',
    exact: true,
    component: Login
}]
