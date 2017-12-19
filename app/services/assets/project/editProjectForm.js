import React from "react";
import { Select, Input, Button, Form, Icon, Row, Col } from "antd";

import Base from "components/main/Base";
import SearchSelect from "components/Form/SearchSelect";

import FormUtils from "lib/formUtils";
import utils from "utils/";

import User from "model/User/";

import EditIndustryModal from "./editIndustryModal";

import constCitys from "const/citys";

import style from "./editProjectModal.scss";

const FormItem = Form.Item;
const Option = Select.Option;

class EditProjectForm extends Base {
  constructor() {
    super();
    this.state = {
      loading: false
    };

    this.formUtils = new FormUtils("EditProjectForm");
  }
  componentWillMount() {
    this.user = new User();
    this.userInfo = utils.getStorage("userInfo") || {};

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }

    this.setState({ provinceData: constCitys, cityData: [] });
  }
  handleProvinceChange = value => {
    const { provinceData, cityData } = this.state;

    if (value) {
      const cityData = provinceData
        ? provinceData.filter(item => item.value == value)[0].children
        : [];
      this.setState({ cityData: cityData });
      this.formUtils.setFieldsValue({
        cityCode: cityData && cityData.length ? cityData[0].value : null
      });
    } else {
      this.setState({ cityData: [] });
      this.formUtils.resetFields(["cityCode"]);
    }
  };

  handleCallback = () => {};

  render() {
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 17
      }
    };

    const { industry, source } = this.props;
    const { provinceData, cityData } = this.state;

    return (
      <div id="project_form">
        <Form className="float-slide-form vant-spin follow-form">
          <FormItem label="项目名称" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("name", {
              initialValue: null,
              validateTrigger: ["onChange", "onBlur"],
              rules: [
                {
                  required: true,
                  type: "string",
                  whitespace: true,
                  message: "请输入1-50长度的项目名称",
                  min: 1,
                  max: 50
                }
              ]
            })(<Input placeholder="请输入项目名称" />)}
          </FormItem>

          <FormItem label="行业领域" {...formItemLayout}>
            <Col span={20}>
              {this.formUtils.getFieldDecorator("industryId", {
                initialValue: null,
                rules: [
                  {
                    required: true,
                    message: "请选择行业领域"
                  }
                ]
              })(
                <Select
                  getPopupContainer={() =>
                    document.getElementById("project_form")
                  }
                  size="large"
                  allowClear={true}
                  placeholder="请选择"
                >
                  {industry &&
                    industry.map(item => {
                      return (
                        <Option key={item.value} value={item.value}>
                          {item.label}
                        </Option>
                      );
                    })}
                </Select>
              )}
            </Col>
            <Col>
              <Button
                className="ant-btn-plus"
                onClick={() => this.editIndustryModal.show()}
              >
                <Icon type="plus" />
              </Button>
            </Col>
          </FormItem>
          <div id="leaderId_FormItem">
            <FormItem label="负责人" {...formItemLayout}>
              {this.props.visible ? (
                <SearchSelect
                  placeholder="请输入并选择负责人"
                  request={this.user.get_users_by_realName}
                  format={r => {
                    return { value: r.id, label: `${r.realName}(${r.mobile})` };
                  }}
                  initData={{
                    label: `${this.userInfo.realName}(${this.userInfo.mobile})`,
                    value: this.userInfo.id
                  }}
                  formUtils={this.props.formUtils}
                  name="leaderId"
                />
              ) : null}
              {this.props.formUtils.getFieldDecorator("leaderId", {
                initialValue: this.userInfo.id,
                rules: [
                  {
                    required: true,
                    message: "请输入并选择负责人"
                  }
                ]
              })(<Input type="hidden" />)}
            </FormItem>
          </div>
          <FormItem label="项目来源" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("source", {
              initialValue: null
            })(
              <Select
                getPopupContainer={() =>
                  document.getElementById("project_form")
                }
                size="large"
                allowClear={true}
                placeholder="请选择"
              >
                {source &&
                  source.map(item => {
                    return (
                      <Option key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    );
                  })}
              </Select>
            )}
          </FormItem>
          <FormItem label="地域" {...formItemLayout}>
            <Row>
              <Col span="12">
                <FormItem>
                  {this.formUtils.getFieldDecorator("provinceCode")(
                    <Select
                      getPopupContainer={() =>
                        document.getElementById("project_form")
                      }
                      allowClear={true}
                      onChange={this.handleProvinceChange}
                      placeholder="请选择"
                    >
                      {provinceData.map(item => {
                        return (
                          <Option key={item.value} value={item.value}>
                            {item.label}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span="12">
                <FormItem>
                  {this.formUtils.getFieldDecorator("cityCode")(
                    <Select
                      getPopupContainer={() =>
                        document.getElementById("project_form")
                      }
                      allowClear={true}
                      placeholder="请选择"
                    >
                      {cityData.map(item => {
                        return (
                          <Option key={item.value} value={item.value}>
                            {item.label}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </FormItem>
        </Form>
        <EditIndustryModal
          industry={industry}
          ref={ref => (this.editIndustryModal = ref)}
          formUtils={this.formUtils}
          callback={this.props.callback}
        />
      </div>
    );
  }
}

const WrapperedEditProjectForm = Form.create()(EditProjectForm);

export default WrapperedEditProjectForm;
