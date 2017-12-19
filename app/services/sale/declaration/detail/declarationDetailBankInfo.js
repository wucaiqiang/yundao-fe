import React, { Component } from "react";
import {
  Button,
  Icon,
  DatePicker,
  Form,
  Radio,
  Select,
  Input,
  Row,
  Col,
  Affix,
  Tooltip,
  message
} from "antd";

const FormItem = Form.Item;

const Option = Select.Option;
const RadioGroup = Radio.Group;

import extend from "extend";

import style from "./declarationDetail.scss";

import Declaration from "model/Declaration/";
import Dictionary from "model/dictionary";

import FormUtils from "lib/formUtils";

import Base from "components/main/Base";

const NAME = "DeclarationBankInfoForm";

import Upload from "components/upload/";

class DeclarationDetailBankInfoForm extends Base {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      dic: {},
      category: []
    };
  }

  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.state.data) {
      const data = this.formatData(nextProps.data);
      this.setState(
        {
          data
        },
        () => {
          if (this.formUtils) {
            this.formUtils.resetFields();
            this.formUtils.setFieldsValue(data);
          }
        }
      );
    }
  }
  formatData = values => {
    return values;
  };
  render() {
    const { data } = this.props;
    const formItemLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };

    const bank = data && data.customerBank;

    const cantEdit = data.status ==2 ||  data.status ==1?true:false

    return (
      <div id={NAME}>
        <Form>
          <FormItem label="银行卡帐号" required={true}  {...formItemLayout}>
          {cantEdit ? (
              <Tooltip title="待审批和已通过的不可修改">
                <div style={{display:"inline-block"}}>
                {this.formUtils.getFieldDecorator("account", {
              initialValue: bank && bank.account,
              rules: [
                {
                  min: 1,
                  max: 30,
                  message: "银行卡账号长度必须在1到30位之间"
                }
              ]
            })(<Input size="large" disabled={true} />)}
                </div>
              </Tooltip>
            ) : 
            (this.formUtils.getFieldDecorator("account", {
              initialValue: bank && bank.account,
              rules: [
                {
                  min: 1,
                  max: 30,
                  message: "银行卡账号长度必须在1到30位之间"
                }
              ]
            })(<Input  size="large"/>))}
          </FormItem>
          <FormItem label="开户行" required={true}  {...formItemLayout}>
          {cantEdit ? (
              <Tooltip title="待审批和已通过的不可修改">
                <div style={{display:"inline-block"}}>
                {this.formUtils.getFieldDecorator("bankName", {
              initialValue: bank && bank.bankName
            })(<Input size="large" disabled={true} />)}
                </div>
              </Tooltip>
            ) : (this.formUtils.getFieldDecorator("bankName", {
              initialValue: bank && bank.bankName
            })(<Input size="large"/>))}
          </FormItem>
          <FormItem label="银行卡正反面" required={true}  {...formItemLayout}>
            <ul className={style.images}>
              <li className={style.image}>
                {this.formUtils.getFieldDecorator("front", {
                  initialValue: bank && bank.front
                })(<Input  type="hidden" />)}
               {cantEdit ? (
                 <Tooltip title="待审批和已通过的不可修改"> {bank && bank.front?<img src={bank.front} alt="银行卡正面" />:<div className={style.uploaded}>
                 <div className={style.upload_btn}>
                       <Icon type="plus" />
                       <p>上传正面</p>
                     </div>
                 </div>}</Tooltip>
                ) :  <Upload
                  showUploadList={false}
                  max={1}
                  onSave={file => {
                    this.formUtils.setFieldsValue({ front: file.url });
                  }}
                >
                  {this.formUtils.getFieldValue("front") ? (
                    <div className={style.uploaded}>
                      <img
                        src={this.formUtils.getFieldValue("front")}
                        alt="银行卡正面"
                      />
                      <div className={style.btns}>
                        <Icon
                          type="close"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.formUtils.setFieldsValue({ front: "" });
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={style.upload_btn}>
                      <Icon type="plus" />
                      <p>上传正面</p>
                    </div>
                  )}
                </Upload>}
              </li>
              <li className={style.image}>
                {this.formUtils.getFieldDecorator("back", {
                  initialValue: bank && bank.back
                })(<Input type="hidden" />)}
               {cantEdit ? (
                 <Tooltip title="待审批和已通过的不可修改">
                  {bank && bank.back?<img src={bank.back} alt="银行卡反面" />:<div className={style.uploaded}>
                <div className={style.upload_btn}>
                      <Icon type="plus" />
                      <p>上传反面</p>
                    </div>
              </div>}
                  </Tooltip>
                ) :  <Upload
                  showUploadList={false}
                  max={1}
                  onSave={file => {
                    this.formUtils.setFieldsValue({ back: file.url });
                  }}
                >
                  {this.formUtils.getFieldValue("back") ? (
                    <div className={style.uploaded}>
                      <img
                        src={this.formUtils.getFieldValue("back")}
                        alt="银行卡反面"
                      />
                      <div className={style.btns}>
                        <Icon
                          type="close"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.formUtils.setFieldsValue({ back: "" });
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={style.upload_btn}>
                      <Icon type="plus" />
                      <p>上传反面</p>
                    </div>
                  )}
                </Upload>}
              </li>
            </ul>
          </FormItem>
        </Form>
      </div>
    );
  }
}

DeclarationDetailBankInfoForm = Form.create()(DeclarationDetailBankInfoForm);

export default class DeclarationDetailBankInfo extends Component {
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    this.declaration = new Declaration();
    this.formUtils = new FormUtils(NAME);
  }
  state = {
    isEdit: false
  };

  submit = () => {
    const { data, mod, parent } = this.props;
    let values = false;
    this.formUtils.validateFields(errors => {
      console.log(errors);
      if (!errors) {
        values = this.formUtils.getFieldsValue();

        values = this.formatData(values);
        values.id = data.id;

        this.declaration.update_bank(values).then(res => {
          if (res && res.success) {
            message.success("更新银行卡成功");
            // mod.reloading()
            mod.loadData();
            parent.getValidate();

            this.setState({ isEdit: false });
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
        values[key] = v;
      }
    }

    return values;
  }
  genneratorFix = children => {
    const { mod } = this.props;
    return mod.state.visible ? (
      <Affix target={() => mod.affixContainer}>{children}</Affix>
    ) : (
      children
    );
  };
  render() {
    const { data } = this.props;
    if (!data) {
      return null;
    }

    // //无编辑权限 同时状态是已取消和已通过
    // const canEdit =
    //   data.permission.editPermission &&
    //   data.data.status != 4 &&
    //   data.data.status != 2;

       //无编辑权限 同时状态是已取消,已作废,已退款,已通过
    const canEdit = data.permission.editPermission && [4,5,6,2].indexOf(data.data.status) == -1
    
    const canRead = data.permission.readPermission;
    let info = JSON.parse(JSON.stringify(data.data));
    const formItemLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };

    const icons = [];

    if (this.state.isEdit) {
      icons.push(
        <img
          className="anticon"
          key="cancel"
          src="/assets/images/icon/取消@1x.png"
          srcSet="/assets/images/icon/取消@2x.png"
          onClick={e => {
            this.setState({ isEdit: false });
          }}
        />
      );
      icons.push(
        <img
          className="anticon"
          key="sure"
          src="/assets/images/icon/确认@1x.png"
          srcSet="/assets/images/icon/确认@2x.png"
          onClick={this.submit}
        />
      );
    } else {
      if (canRead && canEdit) {
        icons.push(
          <img
            className="anticon anticon-edit"
            key="edit"
            src="/assets/images/icon/编辑@1x.png"
            srcSet="/assets/images/icon/编辑@2x.png"
            onClick={e => {
              this.setState({ isEdit: true });
            }}
          />
        );
      }
    }

    const bank = info && info.customerBank;

    return (
      <div className={style.card}>
        {this.genneratorFix(
          <div className={style.header}>
            <div className={style.title}>银行卡</div>
            <div className={style.icons}>{icons}</div>
          </div>
        )}
        <div className={style.content}>
          {!canRead ? (
            "暂无权限查看"
          ) : this.state.isEdit ? (
            <DeclarationDetailBankInfoForm
              formUtils={this.formUtils}
              data={info}
            />
          ) : (
            <Form>
              <FormItem label="银行卡帐号" required={true}  {...formItemLayout}>
                {bank && bank.account}
              </FormItem>
              <FormItem label="开户行" required={true}  {...formItemLayout}>
                {bank && bank.bankName}
              </FormItem>
              <FormItem label="银行卡正反面" required={true}  {...formItemLayout}>
                <ul className={style.images}>
                  {bank && bank.front ? (
                    <li className={style.image}>
                      <a href={bank && bank.front} target="_blank">
                        <img src={bank && bank.front} alt="银行卡正面" />
                      </a>
                    </li>
                  ) : null}

                  {bank && bank.back ? (
                    <li className={style.image}>
                      <a href={bank && bank.back} target="_blank">
                        <img src={bank && bank.back} alt="银行卡反面" />
                      </a>
                    </li>
                  ) : null}
                </ul>
              </FormItem>
            </Form>
          )}
        </div>
      </div>
    );
  }
}
