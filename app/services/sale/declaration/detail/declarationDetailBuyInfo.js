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
  message,
  Tooltip
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

const NAME = "CustomerBankInfoForm";

import Upload from "components/upload/";

import moment from "moment";

class CustomerDetailBankInfoForm extends Base {
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
    console.log("data", data);
    const formItemLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };

    const cantEdit = data.status ==2 ||  data.status ==1?true:false

    return (
      <div id={NAME}>
        <Form>
          <FormItem label="认购金额(万)" {...formItemLayout}>
            {cantEdit ? (
              <Tooltip title="待审批和已通过的不可修改">
                <div>
                  {this.formUtils.getFieldDecorator("dealAmount", {
                    initialValue: data && data.dealAmount
                  })(<Input size="large" disabled={true} />)}
                </div>
              </Tooltip>
            ) : (
              this.formUtils.getFieldDecorator("dealAmount", {
                initialValue: data && data.dealAmount
              })(<Input size="large" />)
            )}
          </FormItem>
          <FormItem label="打款日期"  {...formItemLayout}>
            {cantEdit ? (
              <Tooltip title="待审批和已通过的不可修改">
                <div style={{ display: "inline-block" }}>
                  {this.formUtils.getFieldDecorator("payDate", {
                    initialValue: data && data.payDate
                  })(
                    <DatePicker
                      size="large"
                      disabled={true}
                      getCalendarContainer={() => document.getElementById(NAME)}
                    />
                  )}
                </div>
              </Tooltip>
            ) : (
              this.formUtils.getFieldDecorator("payDate", {
                initialValue: data.payDate || null
              })(
                <DatePicker
                  size="large"
                  getCalendarContainer={() => document.getElementById(NAME)}
                />
              )
            )}
          </FormItem>
          <FormItem label="产品名称" {...formItemLayout}>
            {data && data.productName}
          </FormItem>
          <FormItem label="产品类型" {...formItemLayout}>
            {data && data.productTypeName}
          </FormItem>
          <FormItem label="产品期限" {...formItemLayout}>
            {data.productTime ? data.productTime : null}
          </FormItem>
          <FormItem label="产品成立日期" {...formItemLayout}>
            {data.productCreateDate
              ? moment(data.productCreateDate).format("YYYY-MM-DD")
              : null}
          </FormItem>
          <FormItem label="产品成立公告" {...formItemLayout}>
            {data && data.productNoticeName}
          </FormItem>
          <FormItem label="打款凭证" required={true} {...formItemLayout}>
            {this.formUtils.getFieldDecorator("voucher", {
              initialValue: data.voucher || []
            })(<Input type="hidden" />)}
            <ul className={style.images}>
              {this.formUtils.getFieldValue("voucher").map(item => {
                return (
                  <li className={style.image} key={item.fileUrl}>
                    <div className={style.uploaded}>
                      <img src={item.fileUrl} alt="打款凭证" />
                      <div className={style.btns}>
                        {cantEdit ? null : (
                          <Icon
                            type="close"
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              const voucher = this.formUtils.getFieldValue(
                                "voucher"
                              );
                              this.formUtils.setFieldsValue({
                                voucher: voucher.filter(
                                  asset => asset.fileUrl != item.fileUrl
                                )
                              });
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
              {this.formUtils.getFieldValue("voucher").length < 4  ? (
                <li className={style.image}>
                 {cantEdit?(<Tooltip title="待审批和已通过的不可修改"><div className={style.uploaded}>
                <div className={style.upload_btn}>
                      <Icon type="plus" />
                      <p>上传照片</p>
                    </div>
              </div></Tooltip>): <Upload
                    showUploadList={false}
                    max={1}
                    onSave={file => {
                      let voucher = this.formUtils.getFieldValue("voucher");
                      voucher.push({ fileUrl: file.url, fileName: file.name });
                      this.formUtils.setFieldsValue({ voucher: voucher });
                    }}
                  >
                    <div className={style.upload_btn}>
                      <Icon type="plus" />
                      <p>上传照片</p>
                    </div>
                  </Upload>}
                </li>
              ) : null}
            </ul>
          </FormItem>
          <FormItem label="合同附件" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("contractFile", {
              initialValue: data.contractFile || []
            })(<Input type="hidden" />)}
            <ul className={style.images}>
              {this.formUtils.getFieldValue("contractFile").map(item => {
                return (
                  <li className={style.image} key={item.fileUrl}>
                    <div className={style.uploaded}>
                      <img src={item.fileUrl} alt="资产证明" />
                      <div className={style.btns}>
                        <Icon
                          type="close"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const contractFile = this.formUtils.getFieldValue(
                              "contractFile"
                            );
                            this.formUtils.setFieldsValue({
                              contractFile: contractFile.filter(
                                asset => asset.fileUrl != item.fileUrl
                              )
                            });
                          }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
              {this.formUtils.getFieldValue("contractFile").length < 12 ? (
                <li className={style.image}>
                  <Upload
                    showUploadList={false}
                    max={1}
                    onSave={file => {
                      let contractFile = this.formUtils.getFieldValue(
                        "contractFile"
                      );
                      contractFile.push({
                        fileUrl: file.url,
                        fileName: file.name
                      });
                      this.formUtils.setFieldsValue({
                        contractFile: contractFile
                      });
                    }}
                  >
                    <div className={style.upload_btn}>
                      <Icon type="plus" />
                      <p>上传照片</p>
                    </div>
                  </Upload>
                </li>
              ) : null}
            </ul>
          </FormItem>
          <FormItem label="报单备注" {...formItemLayout}>
            {data.status == 3 ? (
              <Tooltip title="审批中，已通过，已取消不可修改">
                <div>
                  {this.formUtils.getFieldDecorator("remark", {
                    initialValue: data.remark,
                    validateTrigger: ["onChange", "onBlur"],
                    rules: [
                      {
                        type: "string",
                        whitespace: true,
                        message: "请填写长度不超过200个字符",
                        min: 1,
                        max: 200
                      }
                    ]
                  })(
                    <Input
                      type="textarea"
                      disabled={true}
                      rows={3}
                      size="large"
                    />
                  )}
                </div>
              </Tooltip>
            ) : (
              this.formUtils.getFieldDecorator("remark", {
                initialValue: data.remark,
                validateTrigger: ["onChange", "onBlur"],
                rules: [
                  {
                    type: "string",
                    whitespace: true,
                    message: "请填写长度不超过200个字符",
                    min: 1,
                    max: 200
                  }
                ]
              })(<Input type="textarea" rows={3} size="large" />)
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

CustomerDetailBankInfoForm = Form.create()(CustomerDetailBankInfoForm);

export default class CustomerDetailBuyInfo extends Component {
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
    this.formUtils.validateFields(errors => {
      console.log(errors);
      if (!errors) {
        let values = this.formUtils.getFieldsValue();

        values = this.formatData(values);
        values.id = data.id;
        if (values.voucher && values.voucher.length) {
          values.voucher = values.voucher.length
            ? JSON.stringify(values.voucher)
            : null;
        }
        if (values.contractFile && values.contractFile.length) {
          values.contractFile = values.contractFile.length
            ? JSON.stringify(values.contractFile)
            : null;
        }
        this.declaration.update_subscribe(values).then(res => {
          if (res && res.success) {
            message.success("更新认购信息成功");
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
        if (v instanceof Date) {
          v = moment(v).format("YYYY-MM-DD");
        } else if (v instanceof moment) {
          v = moment(v).format("YYYY-MM-DD");
        }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD");
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

     //无编辑权限 同时状态是已取消,已作废,已退款
     const canEdit = data.permission.editPermission && [4,5,6].indexOf(data.data.status) == -1
     
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

    if (!info) {
      return null;
    }

    if (info.payDate) {
      info.payDate = moment(info.payDate);
    }

    return (
      <div className={style.card}>
        {this.genneratorFix(
          <div className={style.header}>
            <div className={style.title}>认购信息</div>
            <div className={style.icons}>{icons}</div>
          </div>
        )}
        <div className={style.content}>
          {!canRead ? (
            "暂无权限查看"
          ) : this.state.isEdit ? (
            <CustomerDetailBankInfoForm
              formUtils={this.formUtils}
              data={info}
            />
          ) : (
            <Form>
              <FormItem label="认购金额(万)" {...formItemLayout}>
                {info && info.dealAmount}
              </FormItem>
              <FormItem label="打款日期" {...formItemLayout}>
                {info.payDate ? info.payDate.format("YYYY-MM-DD") : null}
              </FormItem>
              <FormItem label="产品名称" {...formItemLayout}>
                {info && info.productName}
              </FormItem>
              <FormItem label="产品类型" {...formItemLayout}>
                {info && info.productTypeName}
              </FormItem>
              <FormItem label="产品期限" {...formItemLayout}>
                {info.productTime ? info.productTime : null}
              </FormItem>
              <FormItem label="产品成立日期" {...formItemLayout}>
                {info.productCreateDate
                  ? moment(info.productCreateDate).format("YYYY-MM-DD")
                  : null}
              </FormItem>
              <FormItem label="产品成立公告" {...formItemLayout}>
                {info && info.productNoticeName}
              </FormItem>
              <FormItem label="打款凭证" required={true} {...formItemLayout}>
                <ul className={style.images}>
                  {info.voucher &&
                    info.voucher.map(item => {
                      return (
                        <li className={style.image} key={item.fileUrl}>
                          <a href={item.fileUrl} target="_blank">
                            <img src={item.fileUrl} alt={item.fileName} />
                          </a>
                        </li>
                      );
                    })}
                </ul>
              </FormItem>
              <FormItem label="合同附件" {...formItemLayout}>
                <ul className={style.images}>
                  {info.contractFile &&
                    info.contractFile.map(item => {
                      return (
                        <li className={style.image} key={item.fileUrl}>
                          <a href={item.fileUrl} target="_blank">
                            <img src={item.fileUrl} alt={item.fileName} />
                          </a>
                        </li>
                      );
                    })}
                </ul>
              </FormItem>
              <FormItem label="报单备注" {...formItemLayout}>
                {info && info.remark}
              </FormItem>
            </Form>
          )}
        </div>
      </div>
    );
  }
}
