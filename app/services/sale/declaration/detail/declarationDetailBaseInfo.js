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
  message,
  Affix,
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

const NAME = "DeclarationDetailBaseInfo";

import Upload from "components/upload/";

import moment from "moment";

class DeclarationDetailBaseInfoForm extends Base {
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
    const dictionary = new Dictionary();
    dictionary.gets("dic_customer_credentials").then(res => {
      if (res.success && res.result) {
        let dic = {};
        res.result.map(item => {
          dic[item.value] = item;
        });

        this.setState({ dic });
      }
    });
  }
  getDicSelections(ChildComponent, code) {
    return (
      this.state.dic[code] &&
      this.state.dic[code].selections &&
      this.state.dic[code].selections.map(item => {
        return (
          <ChildComponent value={item.value} key={item.value}>
            {item.label}
          </ChildComponent>
        );
      })
    );
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

    const cantEdit = data.status ==2 ||  data.status ==1?true:false

    return (
      <div id={NAME}>
        <Form>
          <FormItem label="客户名称" {...formItemLayout}>
            {data && data.customerName}
          </FormItem>

          <FormItem label="成单人" {...formItemLayout}>
            {data && data.userName}
          </FormItem>

          <FormItem label="证件类型" required={true} {...formItemLayout}>
            {cantEdit ? (
              <Tooltip title="待审批和已通过的不可修改">
                <div style={{ display: "inline-block",width:'150px' }}>
                  {this.formUtils.getFieldDecorator("type", {
                    initialValue: data.credentialType
                      ? data.credentialType.toString()
                      : null
                  })(
                    <Select
                      placeholder="请选择证件类型"
                      size="large"
                      disabled={true}
                      allowClear={true}
                      getPopupContainer={() => document.getElementById(NAME)}
                    >
                      {this.getDicSelections(
                        Option,
                        "dic_customer_credentials"
                      )}
                    </Select>
                  )}
                </div>
              </Tooltip>
            ) : (
              this.formUtils.getFieldDecorator("type", {
                initialValue: data.credentialType
                  ? data.credentialType.toString()
                  : null
              })(
                <Select
                  placeholder="请选择证件类型"
                  size="large"
                  allowClear={true}
                  getPopupContainer={() => document.getElementById(NAME)}
                >
                  {this.getDicSelections(Option, "dic_customer_credentials")}
                </Select>
              )
            )}
          </FormItem>
          <FormItem label="证件号码" required={true}  {...formItemLayout}>
            {cantEdit? (
              <Tooltip title="待审批和已通过的不可修改">
                <div style={{ display: "inline-block" }}>
                  {this.formUtils.getFieldDecorator("number", {
                    initialValue: data.certNo
                  })(
                    <Input
                      size="large"
                      disabled={true}
                    />
                  )}
                </div>
              </Tooltip>
            ) : (
              this.formUtils.getFieldDecorator("number", {
                initialValue: data.certNo
              })(<Input size="large" />)
            )}
          </FormItem>
          <FormItem label="证件正反面" required={true}  {...formItemLayout}>
            <ul className={style.images}>
              <li className={style.image}>
                {this.formUtils.getFieldDecorator("front", {
                  initialValue: data.certFront
                })(<Input type="hidden" />)}
                {cantEdit ?
                  (<Tooltip title="待审批和已通过的不可修改">{data.certFront?<img src={data.certFront} alt="证件正面" />:<div className={style.uploaded}>
                  <div className={style.upload_btn}>
                        <Icon type="plus" />
                        <p>上传正面</p>
                      </div>
                </div>}</Tooltip>)
                : (
                  <Upload
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
                          alt="证件正面"
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
                  </Upload>
                )}
              </li>
              <li className={style.image}>
                {this.formUtils.getFieldDecorator("back", {
                  initialValue: data.certBack
                })(<Input type="hidden" />)}
                {cantEdit ?
                (<Tooltip title="待审批和已通过的不可修改">{data.certBack?<img src={data.certBack} alt="证件反面" />:<div className={style.uploaded}>
                <div className={style.upload_btn}>
                      <Icon type="plus" />
                      <p>上传反面</p>
                    </div>
              </div>}</Tooltip>)
                 : (
                  <Upload
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
                          alt="证件反面"
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
                  </Upload>
                )}
              </li>
            </ul>
          </FormItem>
          <FormItem label="资产证明" required={true}  {...formItemLayout}>
            {this.formUtils.getFieldDecorator("declarationAttachs", {
              initialValue: data.declarationAttachs || []
            })(<Input type="hidden" />)}
            <ul className={style.images}>
              {this.formUtils.getFieldValue("declarationAttachs").map(item => {
                return (
                  <li className={style.image} key={item.fileUrl}>
                    <div className={style.uploaded}>
                      <img src={item.fileUrl} alt="资产证明" />
                      {cantEdit?null:<div className={style.btns}>
                        <Icon
                          type="close"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const declarationAttachs = this.formUtils.getFieldValue(
                              "declarationAttachs"
                            );
                            this.formUtils.setFieldsValue({
                              declarationAttachs: declarationAttachs.filter(
                                asset => asset.fileUrl != item.fileUrl
                              )
                            });
                          }}
                        />
                      </div>}
                    </div>
                  </li>
                );
              })}
              {this.formUtils.getFieldValue("declarationAttachs").length < 4  ? (
                <li className={style.image}>
                  {cantEdit?(<Tooltip title="待审批和已通过的不可修改"><div className={style.uploaded}>
                <div className={style.upload_btn}>
                      <Icon type="plus" />
                      <p>上传照片</p>
                    </div>
              </div></Tooltip>):<Upload
                    showUploadList={false}
                    max={1}
                    onSave={file => {
                      let declarationAttachs = this.formUtils.getFieldValue(
                        "declarationAttachs"
                      );
                      declarationAttachs.push({
                        fileUrl: file.url,
                        fileName: file.name
                      });
                      this.formUtils.setFieldsValue({
                        declarationAttachs: declarationAttachs
                      });
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
        </Form>
      </div>
    );
  }
}

DeclarationDetailBaseInfoForm = Form.create()(DeclarationDetailBaseInfoForm);

export default class DeclarationDetailBaseInfo extends Component {
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

        values.declarationAttachs =
          values.declarationAttachs && values.declarationAttachs.length
            ? JSON.stringify(values.declarationAttachs)
            : null;

        this.declaration.update_credentials(values).then(res => {
          if (res && res.success) {
            message.success("更新身份资料成功");

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
  componentWillReceiveProps(nextProps) {
    if (nextProps.data.id != this.props.data.id) {
      this.setState({
        isEdit: false
      });
    }
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

    if (info.customerCredentials) {
      info.certNo = info.customerCredentials.number;
      info.credentialType = info.customerCredentials.type;
      info.credentialTypeText = info.customerCredentials.typeText;
      info.certFront = info.customerCredentials.front;
      info.certBack = info.customerCredentials.back;
    }

    return (
      <div className={style.card}>
        {this.genneratorFix(
          <div className={style.header}>
            <div className={style.title}>身份资料</div>
            <div className={style.icons}>{icons}</div>
          </div>
        )}
        <div className={style.content}>
          {!canRead ? (
            "暂无权限查看"
          ) : this.state.isEdit ? (
            <DeclarationDetailBaseInfoForm
              formUtils={this.formUtils}
              data={info}
            />
          ) : (
            <Form>
              <FormItem label="客户名称" {...formItemLayout}>
                {info && info.customerName}
              </FormItem>

              <FormItem label="成单人" {...formItemLayout}>
                {info && info.userName}
              </FormItem>
              <FormItem label="证件类型" required={true} {...formItemLayout}>
                {info && info.credentialTypeText}
              </FormItem>
              <FormItem label="证件号码" required={true} {...formItemLayout}>
                {info.certNo}
              </FormItem>
              <FormItem label="证件正反面" required={true}  {...formItemLayout}>
                <ul className={style.images}>
                  {!info.certFront ? null : (
                    <li className={style.image}>
                      <a href={info.certFront} target="_blank">
                        <img src={info.certFront} alt="证件正面" />
                      </a>
                    </li>
                  )}
                  {!info.certBack ? null : (
                    <li className={style.image}>
                      <a href={info.certBack} target="_blank">
                        <img src={info.certBack} alt="证件反面" />
                      </a>
                    </li>
                  )}
                </ul>
              </FormItem>
              <FormItem label="资产证明" required={true}  {...formItemLayout}>
                <ul className={style.images}>
                  {info.declarationAttachs &&
                    info.declarationAttachs.map(item => {
                      return (
                        <li className={style.image} key={item.fileUrl}>
                          <a href={item.fileUrl} target="_blank">
                            <img src={item.fileUrl} alt="" />
                          </a>
                        </li>
                      );
                    })}
                </ul>
              </FormItem>
            </Form>
          )}
        </div>
      </div>
    );
  }
}
