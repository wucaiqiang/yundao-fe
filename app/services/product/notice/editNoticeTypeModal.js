import React from "react";
import { Input, Icon, Modal, Form, Button, Menu, message } from "antd";
import Base from "components/main/Base";
import NoticeType from "model/Product/noticeType";

import FormUtils from "lib/formUtils";

import style from "./editNoticeTypeModal.scss";

const FormItem = Form.Item;

class EditMenuItem extends React.Component {
  state = {
    editing: false
  };

  handleEdit = data => {
    this.editData = {
      id: data.value,
      name: data.label
    };
    this.setState({ editing: true }, () => {
      try {
        const dom = ReactDOM.findDOMNode(this.refs["input"]);
        dom.click();
        //尝试移动光标到最后
        var sPos = dom.value.length;
        this.setPosition(dom, sPos);
      } catch (error) {}
    });
  };
  handleSave = e => {
    let newName = e.target.value;

    if (!newName) {
      message.warning("请输入类型名称");
      return;
    } else if (this.editData.name === newName) {
      this.setState({ editing: false });
      return;
    }

    let { id } = this.editData;

    this.props.onSave({ id, name: newName }, () => {
      this.setState({ editing: false });
    });
  };

  handleCancel = () => {
    this.setState({ editing: false });
  };

  setPosition(tObj, sPos) {
    if (tObj.setSelectionRange) {
      setTimeout(function() {
        tObj.setSelectionRange(sPos, sPos);
        tObj.focus();
      }, 0);
    } else if (tObj.createTextRange) {
      var rng = tObj.createTextRange();
      rng.move("character", sPos);
      rng.select();
    }
  }
  render() {
    const { data, onDelete, onSave, ...other } = this.props;

    return this.state.editing ? (
      <Menu.Item {...other}>
        <Input
          ref="input"
          className="editInput"
          defaultValue={data.label}
          onBlur={this.handleSave}
          onPressEnter={this.handleSave}
        />
      </Menu.Item>
    ) : (
      <Menu.Item {...other}>
        <span className="node-name">{data.label}</span>
        {/*  <Icon type="edit" onClick={() => this.handleEdit(data)} /> */}
        {data.isPermitDelete === 1 ? (
          <Icon type="close" onClick={onDelete} />
        ) : null}
      </Menu.Item>
    );
  }
}

class EditNoticeTypeForm extends Base {
  constructor() {
    super();
    this.formUtils = new FormUtils("EditNoticeTypeForm");
  }
  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }
  render() {
    const formItemLayout = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 17
      }
    };

    return (
      <Form className={`float-slide-form vant-spin follow-form`}>
        <FormItem style={{ display: "none" }}>
          {this.props.formUtils.getFieldDecorator("id", {
            initialValue: ""
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem label="新增类型名称" {...formItemLayout}>
          {this.props.formUtils.getFieldDecorator("name", {
            initialValue: "",
            rules: [
              {
                required: true,
                message: "请输入类型名称"
              },
              {
                max: 20,
                message: "输入长度限制20个字"
              }
            ]
          })(<Input size="large" />)}
          <Button type="primary" onClick={this.props.onSave}>
            保存
          </Button>
        </FormItem>
      </Form>
    );
  }
}

const WrappedEditNoticeTypeForm = Form.create()(EditNoticeTypeForm);

export default class EditNoticeTypeModal extends Base {
  constructor() {
    super();
    this.state = {
      visible: false,
      noticeType: []
    };

    this.formUtils = new FormUtils("editNoticeTypeModal");
  }
  componentWillMount() {
    this.noticeType = new NoticeType();

    this.setState({ noticeType: this.props.noticeType });
  }
  handleCancel = () => {
    this.setState({ visible: false });
  };
  show() {
    this.setState({
      visible: true
    });
  }

  handleOk = () => {
    const { noticeType } = this.state,
      _this = this;

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        this.noticeType.add(formData).then(res => {
          if (res.success) {
            message.success("新增成功");

            noticeType.push({
              label: formData.name,
              value: res.result
            });

            //更新数据
            _this.setState({ visible: false, noticeType }, () => {
              this.formUtils.resetFields();
            });

            this.props.callback &&
              this.props.callback(noticeType, res.result.toString());
          }
        });
      }
    });
  };
  handleEdit = (formData, callback) => {
    const { noticeType } = this.state;

    this.noticeType.edit(formData).then(res => {
      if (res.success) {
        message.success("编辑成功");

        noticeType.map(item => {
          if (item.value == formData.id) {
            item.label = formData.name;
            return;
          }
        });

        //更新数据
        this.setState({ noticeType });

        callback && callback();
        this.props.callback && this.props.callback(noticeType);
      }
    });
  };
  handleDel = id => {
    const _this = this;

    Modal.confirm({
      width: 350,
      className: `showfloat`,
      wrapClassName: "showfloat",
      title: "删除后不可撤回，确定吗?",
      onOk() {
        return _this.noticeType.delete({ id }).then(res => {
          if (res.success) {
            message.success("删除成功");

            let noticeType = _this.state.noticeType,
              findIndex;

            noticeType.filter((item, index) => {
              if (item.value === id) {
                findIndex = index;

                return;
              }
            });

            noticeType.splice(findIndex, 1);

            _this.setState({
              noticeType
            });

            _this.props.callback(noticeType);
          }
        });
      }
    });
  };

  render() {
    let { visible, noticeType } = this.state;
    return (
      <Modal
        visible={visible}
        title={"编辑公告类型"}
        width={500}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleCancel}
        footer={[
          <Button key="close" onClick={this.handleCancel}>
            关闭
          </Button>
        ]}
      >
        <Menu>
          {noticeType &&
            noticeType.map(item => {
              return (
                <EditMenuItem
                  key={item.value}
                  data={item}
                  onSave={this.handleEdit}
                  onDelete={() => this.handleDel(item.value)}
                />
              );
            })}
        </Menu>
        <WrappedEditNoticeTypeForm
          formUtils={this.formUtils}
          setForm={form => (this.form = form)}
          onSave={this.handleOk}
        />
      </Modal>
    );
  }
}
