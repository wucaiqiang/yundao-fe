import React from "react";
import {
  AutoComplete,
  Form,
  Input,
  Button,
  Icon,
  Modal,
  Spin,
  Table,
  message
} from "antd";
import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Clue from "model/Clue";
import User from "model/User";

import style from "./modal.scss";

const FormItem = Form.Item;
const AutoCompleteOption = AutoComplete.Option;

class AllotCsForm extends Base {
  constructor() {
    super();

    this.state = {
      autoCompleteResult: []
    };

    this.formUtils = new FormUtils("allotCsForm");
  }
  componentWillMount() {
    this.clue = new Clue();
    this.user = new User();

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }
  getOptions = autoCompleteResult => {
    return autoCompleteResult.map(item => {
      return (
        <AutoCompleteOption key={item.id} title={item.realName}>
        {`${item.realName}(${item.mobile})`}
        </AutoCompleteOption>
      );
    });
  };
  handleSearch = value => {
    //搜索变化时重新赋值
    this.formUtils.resetFields(["userId", "userName"]);

    if (!value) {
      this.setState({ autoCompleteResult: [] });
    } else {
      const _this = this;
      this.user.get_users_by_realName(value).then(res => {
        if (res.success) {
          _this.setState({ autoCompleteResult: res.result });
        }
      });
    }
  };
  handleSearchSelect(value, option) {
    this.formUtils.setFieldsValue({
      userId: value,
      userName: option.props.children
    });
  }

  render() {
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 18
      }
    };

    const { autoCompleteResult } = this.state;

    return (
      <Form className={`float-slide-form vant-spin follow-form`}>
        <FormItem style={{ display: "none" }}>
          {this.props.formUtils.getFieldDecorator("customerId", {
            initialValue: ""
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem style={{ display: "none" }}>
          {this.props.formUtils.getFieldDecorator("leadsIds", {
            initialValue: ""
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem style={{ display: "none" }}>
          {this.props.formUtils.getFieldDecorator("userId", {
            initialValue: ""
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem style={{ display: "none" }}>
          {this.props.formUtils.getFieldDecorator("userName", {
            initialValue: ""
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem label="回访负责人" {...formItemLayout}>
          {this.props.formUtils.getFieldDecorator("realName", {
            initialValue: "",
            validateTrigger: ["onChange", "onBlur"],
            rules: [
              {
                required: true,
                type: "string",
                whitespace: true,
                message: "请输入并选择回访负责人"
              }
            ]
          })(
            <AutoComplete
              placeholder="请输入并选择回访负责人"
              dataSource={this.getOptions(autoCompleteResult)}
              onSearch={this.handleSearch}
              onSelect={(value, option) =>
                this.handleSearchSelect(value, option)}
            >
              <Input />
            </AutoComplete>
          )}
        </FormItem>
        <FormItem label="回访事由" {...formItemLayout}>
          {this.props.formUtils.getFieldDecorator("matter", {
            initialValue: "客户有效性确认",
            validateTrigger: ["onChange", "onBlur"],
            rules: [
              {
                required: true,
                type: "string",
                whitespace: true,
                message: "请填写长度不超过100个字符",
                min: 1,
                max: 100
              }
            ]
          })(<Input type="textarea" rows={3} size="large" />)}
        </FormItem>
      </Form>
    );
  }
}

const WrappedAllotCsForm = Form.create()(AllotCsForm);

export default class AllotCsModal extends Base {
  constructor() {
    super();
    this.state = {
      dataLoading: false,
      loading: false,
      visible: false,
      step: 1,
      allotList: null
    };

    this.formUtils = new FormUtils("allotCsModal");
  }
  componentWillMount() {
    this.clue = new Clue();
  }
  componentDidMount() {}
  show(data) {
    this.getUnallot(data.customerId);

    this.setState(
      {
        ...data,
        step: 1,
        dataLoading: true,
        visible: true,
        allotList: null
      },
      () => {
        this.formUtils.setFieldsValue(data);
      }
    );
  }
  getColumns() {
    const columns = [
      {
        title: "时间",
        dataIndex: "createDate",
        width: 140,
        key: "createDate",
        render(text) {
          return text ? moment(text).format("YYYY-MM-DD HH:mm") : null;
        }
      },
      {
        title: "类型",
        dataIndex: "typeText",
        key: "typeText"
      },
      {
        title: "渠道",
        dataIndex: "channelText",
        key: "channelText"
      }
    ];

    return columns;
  }
  getColumns1() {
    const columns = [
      {
        title: "时间",
        dataIndex: "createDate",
        width: 140,
        key: "createDate",
        render(text) {
          return text ? moment(text).format("YYYY-MM-DD HH:mm") : null;
        }
      },
      {
        title: "类型",
        dataIndex: "typeText",
        key: "typeText"
      },
      {
        title: "渠道",
        dataIndex: "channelText",
        key: "channelText"
      },
      {
        title: "负责人",
        dataIndex: "userName",
        key: "userName"
      }
    ];

    return columns;
  }
  /**
   * 获取未分配线索
   *
   * @param {any} customerId
   * @memberof AllotCsModal
   */
  getUnallot(customerId) {
    this.clue.getUnallot(customerId).then(res => {
      let allotList, leadsIds;
      if (res.success) {
        allotList = res.result;
        leadsIds = allotList.map(item => item.id).join(",");
        this.formUtils.setFieldsValue({ leadsIds });
      }
      this.setState({ dataLoading: false, allotList });
    });
  }
  handleCancel = () => {
    this.setState({ visible: false }, () => {
      this.formUtils.resetFields();
    });
  };
  handleTrySubmit = () => {
    this.formUtils.validateFields((errors, values) => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();
        this.setState({ loading: true });
        this.clue.tryAllot(formData).then(res => {
          this.setState({ loading: false });
          //如果result null 表示直接成功，否则进下一步确认
          if (res.success && (res.result === null || res.result.length === 0)) {
            message.success("分配回访成功");
            this.setState(
              {
                visible: false,
                step: 1
              },
              () => {
                this.formUtils.resetFields();
              }
            );

            this.props.reload && this.props.reload();
          } else if (res.success) {
            this.setState({ step: 2, allotList: res.result });
          }
        });
      }
    });
  };
  handleReset = () => {
    this.setState({ step: 1 });
  };
  handleSubmit = e => {
    e && e.preventDefault();

    this.formUtils.validateFields((errors, values) => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();

        this.setState({ loading: true });
        this.clue.allot(formData).then(res => {
          this.setState({ loading: false });

          if (res.success) {
            message.success("分配回访成功");
            this.setState(
              {
                step: 1,
                visible: false
              },
              () => {
                this.formUtils.resetFields();
              }
            );

            this.props.reload && this.props.reload();
          }
        });
      }
    });
  };

  render() {
    let { visible, dataLoading, loading, step, allotList } = this.state;
    return (
      <Modal
        visible={visible}
        title="分配回访"
        width={600}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={
          step === 1 ? (
            [
              <Button key="cancel" onClick={this.handleCancel}>
                取消
              </Button>,
              <Button
                key="ok"
                type="primary"
                loading={loading}
                onClick={this.handleTrySubmit}
              >
                确定
              </Button>
            ]
          ) : (
            [
              <Button key="reset" onClick={this.handleReset}>
                重新分配
              </Button>,
              <Button
                key="ok"
                type="primary"
                loading={loading}
                onClick={this.handleSubmit}
              >
                确定
              </Button>
            ]
          )
        }
      >
        <Spin spinning={dataLoading}>
          {allotList && allotList.length > 1 ? (
            <div className={style.table}>
              <div className={style.table_title}>
                {step === 1 ? (
                  "同个客户的以下线索将一起分配："
                ) : (
                  `该客户近期的线索已经分配给其他负责人，是否仍然分配给${this.formUtils.getFieldValue(
                    "userName"
                  )}？`
                )}
              </div>
              <div className={style.table_content}>
                {step === 1 ? (
                  <Table
                    rowKey="id"
                    pagination={false}
                    dataSource={allotList}
                    columns={this.getColumns()}
                    scroll={{ x:'100%',y: "200px" }}
                  />
                ) : (
                  <Table
                    rowKey="id"
                    pagination={false}
                    dataSource={allotList}
                    columns={this.getColumns1()}
                    scroll={{ x:'100%',y: "200px" }}
                  />
                )}
              </div>
            </div>
          ) : null}

          <div style={{ display: step === 1 ? "block" : "none" }}>
            <WrappedAllotCsForm
              ref={form => (this.customerAllotForm = form)}
              formUtils={this.formUtils}
              setForm={form => (this.form = form)}
            />
          </div>
        </Spin>
      </Modal>
    );
  }
}
