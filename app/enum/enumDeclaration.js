import EnumHelper from "../utils/enumHelper";

const EnumDeclarationStatus = EnumHelper({
  UNCOMMIT: {
    text: "未提交",
    value: 0
  },
  PENDING: {
    text: "待审批",
    value: 1
  },
  PASS: {
    text: "审批通过",
    value: 2
  },
  REJECT: {
    text: "驳回修改",
    value: 3
  },
  UNDO: {
    text: "已取消",
    value: 4
  },
  INVALID: {
    text: "已作废",
    value: 5
  }
});

export default {
  EnumDeclarationStatus
};
