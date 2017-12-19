import EnumHelper from "../utils/enumHelper";

const EnumRefundStatus = EnumHelper({
  PENDING: {
    text: "待审批",
    value: 1
  },
  PASS: {
    text: "审批通过",
    value: 2
  },
  REJECT: {
    text: "已驳回",
    value: 3
  },
  UNDO: {
    text: "已取消",
    value: 4
  }
});

export default {
  EnumRefundStatus
};
