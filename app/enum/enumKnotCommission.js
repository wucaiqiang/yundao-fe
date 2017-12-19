import EnumHelper from "../utils/enumHelper";

const EnumKnotCommissionAction = EnumHelper({
  PASS: {
    text: "已通过",
    value: 1
  },
  UNDO: {
    text: "已否决",
    value: 5
  },
});

const EnumKnotCommissionStatus = EnumHelper({
  PENDING: {
    text: "待审批",
    value: 1
  },
  PASS: {
    text: "已通过",
    value: 2
  },
  UNDO: {
    text: "已否决",
    value: 5
  },
  
});

export default {
  EnumKnotCommissionStatus,
  EnumKnotCommissionAction
};
