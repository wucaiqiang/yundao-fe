import React from "react";
import ReactDOM from "react-dom";
import {
  Select,
  Input,
  DatePicker,
  Upload,
  Button,
  Form,
  Row,
  Col,
  AutoComplete,
  Icon
} from "antd";
import Base from "components/main/Base";
import UploadCard from "components/upload/";
import FormUtils from "lib/formUtils";

import Notice from "model/Product/notice";

import EditNoticeTypeModal from "./editNoticeTypeModal";

const FormItem = Form.Item;
const Option = Select.Option;
const AutoCompleteOption = AutoComplete.Option;

class EditNoticeForm extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      noticeType: [],
      autoCompleteResult: []
    };

    this.formUtils = new FormUtils("editNoticeForm");
  }
  componentWillMount() {
    this.notice = new Notice();

    this.setState({ noticeType: this.props.noticeType });

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }
  getFormClassName() {
    let cls;

    cls = ["float-slide-form", "vant-spin", "follow-form"];
    if (this.state.loading) {
      cls.push("loading");
    }
    return cls.join(" ");
  }
  handleChange = value => {
    if (value == "0") {
      this.formUtils.resetFields(["sendTime"]);
    }
  };
  handleSearch = value => {
    //搜索变化时重新赋值
    this.formUtils.resetFields(["productId"]);
    let autoCompleteResult;
    if (!value) {
      autoCompleteResult = [];
      this.setState({ autoCompleteResult });
    } else {
      const _this = this;
      this.notice.get_product({ name: value }).then(res => {
        if (res.success) {
          _this.setState({ autoCompleteResult: res.result });
        }
      });
    }
  };
  handleSearchSelect(value, option) {
    this.formUtils.setFieldsValue({ productId: value });
  }
  handleRefreshNoticeType = (noticeType, noticeTypeId) => {
    this.setState({ noticeType }, () => {
      this.formUtils.setFieldsValue({
        noticeTypeId
      });
    });

    this.props.callback();
  };
  handleUploadChange = file => {};
  handleUploadRemove = file => {};
  renderNoticeTypeOptions = () => {
    return this.state.noticeType.map(item => {
      return (
        <Option key={item.value} value={item.value.toString()}>
          {item.label}
        </Option>
      );
    });
  };
  renderProductOptions = autoCompleteResult => {
    return autoCompleteResult.map(item => {
      return (
        <AutoCompleteOption key={item.id} title={item.name}>
          {item.name}
        </AutoCompleteOption>
      );
    });
  };
  render() {
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 17
      }
    };
    const { autoCompleteResult, noticeType } = this.state;

    let showTime =
        this.props.formUtils.getFieldValue("isTimingSend") == "1"
          ? true
          : false,
      fileList = this.props.formUtils.getFieldValue("files");

    return (
      <div>
        <Form
          className={this.getFormClassName()}
          ref={ref => (this.container = ReactDOM.findDOMNode(ref))}
        >
          <FormItem style={{ display: "none" }}>
            {this.props.formUtils.getFieldDecorator("id", {
              initialValue: ""
            })(<Input type="hidden" />)}
          </FormItem>
          <FormItem style={{ display: "none" }}>
            {this.props.formUtils.getFieldDecorator("productId", {
              initialValue: ""
            })(<Input type="hidden" />)}
          </FormItem>
          <FormItem label="产品名称" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("productName", {
              initialValue: "",
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请输入并选择产品"
                }
              ]
            })(
              <AutoComplete
                placeholder="请输入并选择产品"
                dataSource={this.renderProductOptions(autoCompleteResult)}
                onSearch={this.handleSearch}
                onSelect={(value, option) =>
                  this.handleSearchSelect(value, option)
                }
              >
                <Input />
              </AutoComplete>
            )}
          </FormItem>
          <FormItem label="公告类型" {...formItemLayout}>
            <Col span={20}>
              {this.props.formUtils.getFieldDecorator("noticeTypeId", {
                initialValue: "",
                validateTrigger: ["onChange", "onBlur"],
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: "请选择公告类型",
                    min: 1,
                    max: 20
                  }
                ]
              })(
                <Select size="large" getPopupContainer={() => this.container}>
                  {this.renderNoticeTypeOptions()}
                </Select>
              )}
            </Col>
            <Col>
              <Button
                className="ant-btn-plus"
                onClick={() => this.editNoticeTypeModal.show()}
              >
                <Icon type="plus" />
              </Button>
            </Col>
          </FormItem>
          <FormItem label="公告标题" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("title", {
              initialValue: "",
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请填写长度不超过50个字符",
                  min: 1,
                  max: 50
                }
              ]
            })(<Input type="text" />)}
          </FormItem>
          <FormItem label="公告概要" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("content", {
              initialValue: "",
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请填写长度不超过200个字符",
                  min: 1,
                  max: 200
                }
              ]
            })(<Input type="textarea" rows={3} size="large" />)}
          </FormItem>
          <FormItem label="发布方式" {...formItemLayout}>
            <Col span={9}>
              <FormItem>
                {this.props.formUtils.getFieldDecorator("isTimingSend", {
                  initialValue: "0",
                  rules: [
                    {
                      required: true
                    }
                  ]
                })(
                  <Select
                    getPopupContainer={() => this.container}
                    onChange={this.handleChange}
                  >
                    <Option key="0" value="0">
                      审批后立刻发布
                    </Option>
                    <Option key="1" value="1">
                      指定时间发布
                    </Option>
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={15}>
              <FormItem>
                {this.props.formUtils.getFieldDecorator("sendTime", {
                  rules: [
                    {
                      required: showTime,
                      message: "请选择发布时间"
                    }
                  ]
                })(
                  <DatePicker
                    placeholder="请选择发布时间"
                    className={showTime ? "show" : ""}
                    style={{ width: 200 }}
                    format="YYYY-MM-DD HH:mm:ss"
                    showTime={true}
                  />
                )}
              </FormItem>
            </Col>
          </FormItem>
          <FormItem label="附件上传" {...formItemLayout}>
            {this.props.formUtils.getFieldDecorator("files", {
              initialValue: []
            })(
              <UploadCard
                listType="picture"
                fileCount={5}
                fileSize="30MB"
                fileList={fileList}
                onRemove={this.handUploadRemove}
                onChange={this.handleUploadChange}
              >
                <Button>
                  <Icon type="cloud-upload-o" />上传
                </Button>
              </UploadCard>
            )}
          </FormItem>
        </Form>
        <EditNoticeTypeModal
          ref={ref => (this.editNoticeTypeModal = ref)}
          noticeType={this.props.noticeType}
          callback={this.handleRefreshNoticeType}
        />
      </div>
    );
  }
}
EditNoticeForm = Form.create()(EditNoticeForm);

export default EditNoticeForm;
