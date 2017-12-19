import EnumHelper from "../utils/enumHelper";

const EnumNoticeSend = EnumHelper({
  PUBLISHED: {
    text: "已发布",
    value: 1
  },
  UNPUBLISHED: {
    text: "未发布",
    value: 0
  }
});

const EnumNoticeStatus = EnumHelper({
  PENDING: {
    text: "未提交",
    value: 1
  },
  REVIEW: {
    text: "审批中",
    value: 2
  },
  PASS: {
    text: "已通过",
    value: 3
  },
  REJECT: {
    text: "已驳回",
    value: 4
  },
  UNDO: {
    text: "已取消",
    value: 5
  }
});

export default {
  EnumNoticeStatus,
  EnumNoticeSend
};
