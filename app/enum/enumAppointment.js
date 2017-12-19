import EnumHelper from "../utils/enumHelper";

const EnumAppointmentStatus = EnumHelper({
  PENDING: {
    text: "待审批",
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
  },
  INVALID: {
    text: "已作废",
    value: 5
  }
});

export default {
  EnumAppointmentStatus
};
