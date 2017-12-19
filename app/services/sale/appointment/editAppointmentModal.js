import React from "react";
import { Button, Icon, Modal, Spin, message } from "antd";
import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Appoint from "model/Appoint/";

import EditAppointmentForm from "./editAppointmentForm";

import style from "./editAppointmentModal.scss";

export default class EditCustomerModal extends Base {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visible: false,
      canEdit: false,
      isEdit: false,
      hasReSubmit: false,
      formData: {},
      submiting: false
    };

    this.formUtils = new FormUtils("editAppoinementModal");
  }
  componentWillMount() {
    this.appoint = new Appoint();
  }
  componentDidMount() {}
  /**
   *
   *
   * @param {any} data
   * @param {boolean} [canEdit=true]  是否显示编辑按钮
   * @param {boolean} [hasReSubmit=false]  是否有重新提交按钮
   * @memberof EditCustomerModal
   */
  show(data, canEdit = true, hasReSubmit = false) {
    this.setState({
      visible: true,
      hidden: false,
      canEdit,
      hasReSubmit
    });

    if (data) {
      if (data.id) {
        this.setState({
          formData: data,
          loading: true,
          isEdit: false
        });
        this.appoint.get(data.id).then(res => {
          if (res.success) {
            const data = res.result.data;
            let canEdit = false;
            if (data.status == 3 && res.result.permission.editPermission) {
              // 状态为待审批、已通过、已取消和已作废的预约不可编辑
              canEdit = true;
            }
            this.setState({ formData: data, canEdit, loading: false });
            if (this.form) {
              this.formUtils.resetFields();
              this.formUtils.setFieldsValue(data);
            }
          }
        });
      } else if (data.productId) {
        this.setState({
          isEdit: true,
          formData: data
        });
        if (this.formUtils) {
          this.formUtils.resetFields();
        }
        this.formUtils.setFieldsValue({ productId: data.productId });
      }
    } else {
      this.setState({ formData: {}, isEdit: true });
      this.formUtils.resetFields();
    }
  }
  handleClose = () => {
    this.hide();
  };
  handleSubmit = e => {
    e && e.preventDefault();

    const { id } = this.state.formData;

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        formData = this.formatData(formData);
        /* source 1、个人客户   2、机构客户
        机构客户不传 customerId  */

        if (formData.source === 2) {
          formData.customerId = null;
        }

        //来自产品中心预约 使用不同的接口
        const request = id
          ? this.appoint.update
          : this.state.formData.from == "product.center"
            ? this.appoint.center_add
            : this.appoint.add;

        if (id) {
          formData.id = id;
        }

        this.setState({ submiting: true }, () => {
          request(formData).then(res => {
            this.setState({ submiting: false });
            if (res.success) {
              if (this.state.hasReSubmit) {
                this.setState({
                  isEdit: false
                });
              } else {
                this.hide();
              }
              message.success(
                `${this.state.formData.id ? "编辑" : "新增"}预约成功.`
              );
              this.props.reload();
            }
          });
        });
      }
    });
  };

  hide = () => {
    this.formUtils.resetFields();
    this.setState(
      {
        formData: {},
        visible: false
      },
      () => {
        this.setState({
          hidden: true
        });
      }
    );
  };

  formatData(values) {
    for (var key in values) {
      if (values.hasOwnProperty(key)) {
        var v = values[key];
        if (typeof v == "string") {
          v = v.replace(/^\s*|\s*$/g, "");
        }
        if (v instanceof Date) {
          v = moment(v).format("YYYY-MM-DD");
        } else if (v instanceof moment) {
          v = moment(v).format("YYYY-MM-DD");
        }
        if (v instanceof Array) {
          v = v.join(",");
        }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD");
        }
        values[key] = v;
      }
    }
    return values;
  }
  handleResubmit = () => {
    let id = this.state.formData.id;
    this.setState({ submiting: true }, () => {
      this.appoint.again_commit({ id }).then(res => {
        this.setState({ submiting: false });
        if (res.success) {
          message.success("重新提交成功");

          this.hide();

          this.props.reload();
        }
      });
    });
  };

  handleChange = showSave => {
    this.setState({ showSave });
  };
  renderFooterBtn() {
    let {
      loading,
      formData,
      isEdit,
      hasReSubmit,
      showSave = true,
      submiting
    } = this.state;

    const btns = [
      isEdit && formData.id ? (
        <Button
          key="cancel"
          onClick={() => {
            this.setState({
              isEdit: false
            });
          }}
        >
          取消
        </Button>
      ) : (
        <Button key="close" onClick={this.handleClose}>
          关闭
        </Button>
      ),
      loading ? null : !isEdit && hasReSubmit ? (
        <Button
          key="resubmit"
          type="primary"
          loading={submiting}
          onClick={this.handleResubmit}
        >
          确定提交
        </Button>
      ) : isEdit && showSave ? (
        <Button
          key="save"
          type="primary"
          loading={submiting}
          onClick={this.handleSubmit}
        >
          保存
        </Button>
      ) : null
    ];
    return btns;
  }
  render() {
    let { visible, isEdit, submiting, canEdit, formData, hidden } = this.state;

    return (
      <Modal
        visible={visible}
        title={
          <div>
            {(formData.id ? (isEdit ? "编辑" : "查看") : "新增") + "预约"}
            {canEdit && !isEdit ? (
              <Icon
                className={"fr"}
                type="edit"
                onClick={() => {
                  this.setState({
                    isEdit: true
                  });
                }}
              />
            ) : null}
          </div>
        }
        width={550}
        className={`vant-modal yundao-modal ${style.modal} `}
        wrapClassName="showfloat vertical-center-modal"
        onCancel={this.handleClose}
        closable={false}
        footer={this.renderFooterBtn()}
      >
        {!visible ? (
          <Spin />
        ) : (
          <EditAppointmentForm
            initFields={this.props.initFields}
            ref={form => (this.customerForm = form)}
            data={formData}
            formUtils={this.formUtils}
            isEdit={isEdit}
            setForm={form => (this.form = form)}
            callback={this.props.callback}
            onChange={this.handleChange}
          />
        )}
      </Modal>
    );
  }
}
