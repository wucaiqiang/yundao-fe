import EnumHelper from "../utils/enumHelper";

const EnumProductStatus = EnumHelper({
  PENDING: {
    text: "未提交",
    value: 0
  },
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
  },
  UNDO: {
    text: "已取消",
    value: 4
  }
});

const EnumProductIssuedStatus = EnumHelper({
  NOONLINE: {
    text: "未上线",
    value: 0
  },
  ONLINE: {
    text: "上线准备中",
    value: 1
  },
  PRESALE: {
    text: "预售",
    value: 2
  },
  RAISING: {
    text: "募集中",
    value: 3
  },
  RAISED: {
    text: "募集结束",
    value: 4
  },
  SEAL: {
    text: "存续封闭中",
    value: 5
  },
  EXIT: {
    text: "清算退出",
    value: 6
  }
});

export default {
  EnumProductStatus,
  EnumProductIssuedStatus
};
