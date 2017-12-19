import EnumHelper from "../utils/enumHelper";

const EnumAuditStatus = EnumHelper({
  REVIEW: {
    text: "审批中",
    value: 1
  },
  PASS: {
    text: "已通过",
    value: 2
  },
  REJECT: {
    text: "已驳回",
    value: 3
  }
});
const EnumCustomerStatus = EnumHelper({
  REVIEW: {
    text: "未确认",
    value: "0"
  },
  PASS: {
    text: "有效客户",
    value: "1"
  },
  REJECT: {
    text: "无效客户",
    value: "2"
  }
});

/**
 * 客户类型
 */
const EnumCustomerType = EnumHelper({
  PERSON: {
    text: "个人客户",
    value: "1"
  },
  ORGANIZATION: {
    text: "机构客户",
    value: "2"
  }
});

export default {
  EnumAuditStatus,
  EnumCustomerStatus,
  EnumCustomerType
};
