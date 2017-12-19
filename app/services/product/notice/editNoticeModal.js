import React from "react";
import { Button, Icon, Modal, Spin, message } from "antd";
import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Notice from "model/Product/notice";

import EditNoticeForm from "./editNoticeForm";
import NoticeDetailForm from "./noticeDetailForm";

import style from "./index.scss";

export default class EditNoticeModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      canEdit: false,
      isEdit: false,
      formData: {},
      action: null
    };

    this.formUtils = new FormUtils("editNoticeModal");
  }
  componentWillMount() {
    this.notice = new Notice();
  }
  componentDidMount() {}
  componentWillReceiveProps(nextProps) {
    console.log(nextProps.container);

    if (nextProps.container) {
      this.container = nextProps.container;
    }
  }
  show(id, isEdit = false, canEdit = false) {
    this.setState({
      visible: true,
      isEdit,
      canEdit
    });

    if (id) {
      this.setState({ loading: true });
      this.notice.get({ id }).then(res => {
        if (res.success) {
          let formData = res.result;
          canEdit =
            (formData.data.status == 1 || formData.data.status == 4) &&
            formData.permission.editPermission;
          this.setState({ formData: formData.data, canEdit, loading: false });
        }
      });
    } else {
      let formData = {
        isTimingSend: "0",
        sendTime: null,
        productId: null,
        content: ""
      };

      this.setState({ formData }, () => {
        this.formUtils.resetFields();
        this.formUtils.setFieldsValue(formData);
      });
    }
  }
  handleCancel = () => {
    this.setState({ isEdit: false });
  };
  handleClose = () => {
    this.setState({ visible: false });
  };
  handleEdit = () => {
    let { formData } = this.state,
      showTime = formData.isTimingSend == 1;

    formData.noticeTypeId = formData.noticeTypeId.toString();
    formData.isTimingSend = formData.isTimingSend.toString();
    if (formData.sendTime) {
      formData.sendTime = moment(formData.sendTime);
    }
    formData.files = [];
    formData.baseProductNoticeAttach &&
      formData.baseProductNoticeAttach.map(attach => {
        formData.files.push({
          uid: attach.id,
          name: attach.sourceName,
          state: "done",
          url: attach.url,
          type: attach.type
        });
      });

    this.setState({ isEdit: true }, () => {
      const _this = this;
      setTimeout(function() {
        _this.formUtils.resetFields();
        _this.formUtils.setFieldsValue(formData);
      }, 100);
    });
  };
  handleSubmit = e => {
    e && e.preventDefault();

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        if (!formData.productId) {
          message.error("产品不存在或数据有误，请重新搜索选择！");
          return;
        }

        if (formData.files && formData.files.length > 0) {
          let files = formData.files.map(file => {
            return {
              fileName: file.name,
              fileUrl: file.url,
              fileType: file.type
            };
          });

          formData.files = JSON.stringify(files);
        } else {
          formData.files = null;
        }

        formData = this.formatData(formData);

        let request = this.notice.add;

        if (formData.id) {
          request = this.notice.edit;
        }

        request(formData).then(res => {
          if (res.success) {
            message.success(formData.id ? "编辑公告成功" : "新增公告成功");

            this.setState({
              visible: false
            });
            this.props.reload();
          }
        });
      }
    });
  };

  formatData(values) {
    for (var key in values) {
      if (values.hasOwnProperty(key)) {
        var v = values[key];
        if (typeof v == "string") {
          v = v.replace(/^\s*|\s*$/g, "");
        }
        if (v instanceof Date) {
          v = moment(v).format("YYYY-MM-DD HH:mm:ss");
        } else if (v instanceof moment) {
          v = moment(v).format("YYYY-MM-DD HH:mm:ss");
        }
        if (v instanceof Array) {
          v = v.join(",");
        }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD HH:mm:ss");
        }
        values[key] = v;
      }
    }
    return values;
  }
  renderFooterBtn() {
    let { formData, isEdit } = this.state,
      btns;

    if (isEdit && formData.id) {
      btns = [
        <Button key="cancel" onClick={this.handleCancel}>
          取消
        </Button>,
        <Button type="primary" key="submit" onClick={this.handleSubmit}>
          保存
        </Button>
      ];
    } else if (isEdit) {
      btns = [
        <Button key="close" onClick={this.handleClose}>
          关闭
        </Button>,
        <Button type="primary" key="submit" onClick={this.handleSubmit}>
          保存
        </Button>
      ];
    } else {
      btns = [
        <Button key="close" onClick={this.handleClose}>
          关闭
        </Button>
      ];
    }
    return btns;
  }
  render() {
    let { visible, formData, isEdit, canEdit, loading } = this.state;
    return (
      <Modal
        visible={visible}
        title={
          <div>
            {(isEdit ? (formData.id ? "编辑" : "新增") : "查看") + "公告"}
            {canEdit ? (
              <Icon
                className={"fr"}
                type="edit"
                style={{ cursor: "pointer" }}
                onClick={this.handleEdit}
              />
            ) : null}
          </div>
        }
        width={525}
        className={`vant-modal  yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal showfloat"
        closable={false}
        footer={this.renderFooterBtn()}
      >
        <Spin spinning={loading}>
          {isEdit ? (
            <EditNoticeForm
              ref={form => (this.editNoticeForm = form)}
              formUtils={this.formUtils}
              noticeType={this.props.noticeType}
              setForm={form => (this.form = form)}
              callback={this.props.callback}
            />
          ) : (
            <NoticeDetailForm data={formData} />
          )}
        </Spin>
      </Modal>
    );
  }
}
