import EnumHelper from "../utils/enumHelper";

const EnumRefundStatus = EnumHelper({
    START: {
    text: "准备开始",
    value: 'start'
  },
  UPLOADING: {
    text: "上传中",
    value: 'uploading'
  },
  DONE: {
    text: "上传完成",
    value: 'done'
  },
  ERROR: {
    text: "上传失败",
    value: 'error'
  }
});

export default {
  EnumRefundStatus
};
