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

import UploadVideo from "components/upload/video";


import PreviewVideo from 'components/preview/video'

class DeclarationDetailBankInfoForm extends Base {
  constructor(props) {
    super(props);
    const { data } = this.props;

    let current =
      data.complianceRecord && data.complianceRecord.length
        ? {
            fileId: data.complianceRecord[0].refId,
            ...data.complianceRecord[0],
            status: "done",
          }
        : null;

    this.state = {
      data: data,
      current: current,
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

  handleVideoUpload = file => {
    const cacheName = "complianceVideo";
    let uploadVideoList = APP.state[cacheName];
    if (!uploadVideoList) {
      uploadVideoList = [];
    }
    message.info("视频上传中...");
    let state = {};
    file.status = "start";
    state[cacheName] = uploadVideoList.concat([
      {
        status: "start",
        size: file.size,
        name: file.name,
        uid: file.uid,
        type: file.type
      }
    ]);
    console.log("state", state);
    this.setState({
      current: {
        status: "start",
        size: file.size,
        name: file.name,
        uid: file.uid,
        type: file.type
      }
    });
    APP.setState(state, () => {
      this.uploadVideo.start(file, cacheName);
    });
  };
  getVideoUploadTips = current => {
    return (
      <div className={style.upload_btn}>
        {current.status == "error" ? (
          <div className={style.uploaded}>
            <p>{current.name}</p>
            <p>出错啦，请删除后重新上传</p>
            <div className={style.btns}>
              <Icon
                type="close"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.setState({
                    current: null
                  });
                  let values = this.formUtils.getFieldsValue();
                  values.complianceRecord = null;
                  this.formUtils.setFieldsValue(values);
                }}
              />
            </div>
          </div>
        ) : current.status == "start" ? (
          <div>
            <p>{current.name}</p>
            <p>准备上传中...</p>
          </div>
        ) : current.status == "progress" ? (
          <div>
            <p>{current.name}</p>
            <p>{(current.curr * 100).toFixed(2)}%</p>
          </div>
        ) : current.status == "done" ? (
          <div className={style.uploaded}>
            {current.id ? current.coverUrl?(
              <img src={current.coverUrl ||'/assets/images/ext/video@1x.png'} />
            ) :(
              <div>
                <p style={{
                  wordWrap:'break-word'
                }}>{current.name}</p>
              </div>
            ): (
              <div>
                <p>{current.name}</p>
                <p>已完成</p>
              </div>
            )}
            <div className={style.btns}>
              <Icon
                type="close"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.setState({
                    current: null
                  });
                  this.formUtils.setFieldsValue({ complianceRecord: null });
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
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

    const { complianceVideo } = APP.state;

    const { current } = this.state;

    data.complianceRecord = data.complianceRecord?data.complianceRecord.map(item=>{
      item.fileId = item.refId
      return item
    }):null

    console.log("complianceVideo", complianceVideo);

    return (
      <div id={NAME}>
        <Form>
          <FormItem label="合规视频" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("complianceRecord", {
              initialValue:data.complianceRecord? JSON.stringify(data.complianceRecord) : null
            })(<Input type="hidden" />)}
            <ul className={style.images}>
              <li className={style.image}>
                {current ? this.getVideoUploadTips(current) : null}
                <div style={{ display: current ? "none" : "block" }}>
                  <UploadVideo
                    multiple={false}
                    onSave={file => {
                      console.log("save", file);
                      const { current } = this.state;

                      current.status = "done";
                      this.setState({
                        current: current
                      });
                      this.formUtils.setFieldsValue({
                        complianceRecord: JSON.stringify([
                          {
                            name: file.name,
                            size: file.size,
                            fileId: file.fileId
                          }
                        ])
                      });
                    }}
                    onError={file => {
                      console.log("error", file);
                      const { current } = this.state;
                      current.status = "error";
                      this.setState({
                        current: current
                      });
                      this.formUtils.setFieldsValue({ complianceRecord: null });
                    }}
                    onProgress={file => {
                      console.log("progress", file);
                      this.setState({
                        current: {
                          ...file,
                          status: "progress"
                        }
                      });
                    }}
                    ref={ref => {
                      if (ref) {
                        this.uploadVideo = ref;
                      }
                    }}
                    showUploadList={false}
                    onAdd={this.handleVideoUpload}
                  >
                    <div className={style.upload_btn}>
                      <Icon type="plus" />
                      <p>上传视频</p>
                    </div>
                  </UploadVideo>
                </div>
              </li>
            </ul>
          </FormItem>
          <FormItem label="投资者基本信息表（自然人）" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("baseInfo", {
              initialValue: data.baseInfo || []
            })(<Input type="hidden" />)}
            <ul className={style.images}>
              {this.formUtils.getFieldValue("baseInfo") &&
                this.formUtils.getFieldValue("baseInfo").map(item => {
                  return (
                    <li className={style.image}>
                      <div className={style.uploaded}>
                        <img src={item.url} alt="投资者基本信息表（自然人）" />
                        <div className={style.btns}>
                          <Icon
                            type="close"
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              const baseInfo = this.formUtils.getFieldValue(
                                "baseInfo"
                              );
                              this.formUtils.setFieldsValue({
                                baseInfo: baseInfo.filter(
                                  asset => asset.url != item.url
                                )
                              });
                            }}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              {!this.formUtils.getFieldValue("baseInfo") ||
              this.formUtils.getFieldValue("baseInfo").length < 1 ? (
                <li className={style.image}>
                  <Upload
                    accept="png,jpg,jpeg,gif"
                    showUploadList={false}
                    max={1}
                    onSave={file => {
                      let baseInfo = this.formUtils.getFieldValue("baseInfo");
                      baseInfo.push({
                        url: file.url,
                        name: file.name,
                        formatType: 1
                      });
                      this.formUtils.setFieldsValue({ baseInfo: baseInfo });
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
          <FormItem label="投资者风险匹配告知书及投资者确认函" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("riskNotify", {
              initialValue: data.riskNotify || []
            })(<Input type="hidden" />)}
            <ul className={style.images}>
              {this.formUtils.getFieldValue("riskNotify") &&
                this.formUtils.getFieldValue("riskNotify").map(item => {
                  return (
                    <li className={style.image}>
                      <div className={style.uploaded}>
                        <img src={item.url} alt="投资者风险匹配告知书及投资者确认函" />
                        <div className={style.btns}>
                          <Icon
                            type="close"
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              const riskNotify = this.formUtils.getFieldValue(
                                "riskNotify"
                              );
                              this.formUtils.setFieldsValue({
                                riskNotify: riskNotify.filter(
                                  asset => asset.url != item.url
                                )
                              });
                            }}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              {!this.formUtils.getFieldValue("riskNotify") ||
              this.formUtils.getFieldValue("riskNotify").length < 1 ? (
                <li className={style.image}>
                  <Upload
                    accept="png,jpg,jpeg,gif"
                    showUploadList={false}
                    max={1}
                    onSave={file => {
                      let riskNotify = this.formUtils.getFieldValue(
                        "riskNotify"
                      );
                      riskNotify.push({
                        url: file.url,
                        name: file.name,
                        formatType: 1
                      });
                      this.formUtils.setFieldsValue({ riskNotify: riskNotify });
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
          <FormItem label="基金投资者风险测评问卷（自然人）" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("riskQuesstionnaire", {
              initialValue: data.riskQuesstionnaire || []
            })(<Input type="hidden" />)}
            <ul className={style.images}>
              {this.formUtils.getFieldValue("riskQuesstionnaire") &&
                this.formUtils.getFieldValue("riskQuesstionnaire").map(item => {
                  return (
                    <li className={style.image}>
                      <div className={style.uploaded}>
                        <img src={item.url} alt="基金投资者风险测评问卷（自然人）" />
                        <div className={style.btns}>
                          <Icon
                            type="close"
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              const riskQuesstionnaire = this.formUtils.getFieldValue(
                                "riskQuesstionnaire"
                              );
                              this.formUtils.setFieldsValue({
                                riskQuesstionnaire: riskQuesstionnaire.filter(
                                  asset => asset.url != item.url
                                )
                              });
                            }}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              {!this.formUtils.getFieldValue("riskQuesstionnaire") ||
              this.formUtils.getFieldValue("riskQuesstionnaire").length < 4 ? (
                <li className={style.image}>
                  <Upload
                    accept="png,jpg,jpeg,gif"
                    showUploadList={false}
                    max={1}
                    onSave={file => {
                      let riskQuesstionnaire = this.formUtils.getFieldValue(
                        "riskQuesstionnaire"
                      );
                      riskQuesstionnaire.push({
                        url: file.url,
                        name: file.name,
                        formatType: 1
                      });
                      this.formUtils.setFieldsValue({
                        riskQuesstionnaire: riskQuesstionnaire
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
          <FormItem label="基金回访确认书" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("returnConfirmation", {
              initialValue: data.returnConfirmation || []
            })(<Input type="hidden" />)}
            <ul className={style.images}>
              {this.formUtils.getFieldValue("returnConfirmation") &&
                this.formUtils.getFieldValue("returnConfirmation").map(item => {
                  return (
                    <li className={style.image}>
                      <div className={style.uploaded}>
                        <img src={item.url} alt="基金回访确认书" />
                        <div className={style.btns}>
                          <Icon
                            type="close"
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              const returnConfirmation = this.formUtils.getFieldValue(
                                "returnConfirmation"
                              );
                              this.formUtils.setFieldsValue({
                                returnConfirmation: returnConfirmation.filter(
                                  asset => asset.url != item.url
                                )
                              });
                            }}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              {!this.formUtils.getFieldValue("returnConfirmation") ||
              this.formUtils.getFieldValue("returnConfirmation").length < 1 ? (
                <li className={style.image}>
                  <Upload
                    accept="png,jpg,jpeg,gif"
                    showUploadList={false}
                    max={1}
                    onSave={file => {
                      let returnConfirmation = this.formUtils.getFieldValue(
                        "returnConfirmation"
                      );
                      returnConfirmation.push({
                        url: file.url,
                        name: file.name,
                        formatType: 1
                      });
                      this.formUtils.setFieldsValue({
                        returnConfirmation: returnConfirmation
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
          <FormItem label="其他合规文件" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("otherFile", {
              initialValue: data.otherFile || []
            })(<Input type="hidden" />)}
            <ul className={style.images}>
              {this.formUtils.getFieldValue("otherFile") &&
                this.formUtils.getFieldValue("otherFile").map(item => {
                  return (
                    <li className={style.image}>
                      <div className={style.uploaded}>
                        <img src={item.url} alt="其他合规文件" />
                        <div className={style.btns}>
                          <Icon
                            type="close"
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              const otherFile = this.formUtils.getFieldValue(
                                "otherFile"
                              );
                              this.formUtils.setFieldsValue({
                                otherFile: otherFile.filter(
                                  asset => asset.url != item.url
                                )
                              });
                            }}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              {!this.formUtils.getFieldValue("otherFile") ||
              this.formUtils.getFieldValue("otherFile").length < 8 ? (
                <li className={style.image}>
                  <Upload
                    accept="png,jpg,jpeg,gif"
                    showUploadList={false}
                    max={1}
                    onSave={file => {
                      let otherFile = this.formUtils.getFieldValue("otherFile");
                      otherFile.push({
                        url: file.url,
                        name: file.name,
                        formatType: 1
                      });
                      this.formUtils.setFieldsValue({ otherFile: otherFile });
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
        </Form>
      </div>
    );
  }
}

DeclarationDetailBankInfoForm = Form.create()(DeclarationDetailBankInfoForm);

export default class DeclarationDetailDocumentInfo extends Component {
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

        values.baseInfo = JSON.stringify(values.baseInfo);
        values.riskNotify = JSON.stringify(values.riskNotify);
        values.riskQuesstionnaire = JSON.stringify(values.riskQuesstionnaire);
        values.returnConfirmation = JSON.stringify(values.returnConfirmation);
        values.otherFile = JSON.stringify(values.otherFile);

        this.declaration.update_compliance(values).then(res => {
          if (res && res.success) {
            message.success("更新合规文件成功");

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
        values[key] = v || [];
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
    const { data,mod } = this.props;
    if (!data) {
      return null;
    }

    //无编辑权限 同时状态是已取消,已作废,已退款
    const canEdit =
      data.permission.editPermission &&
      [4, 5, 6].indexOf(data.data.status) == -1;
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

    return (
      <div className={style.card}>
        {this.genneratorFix(
          <div className={style.header}>
            <div className={style.title}>合规文件</div>
            <div className={style.icons}>{icons}</div>
          </div>
        )}
        <div className={style.content}>
        <p><a download href="https://yundaosaas.oss-cn-hangzhou.aliyuncs.com/compliance/%E5%90%88%E8%A7%84%E6%96%87%E4%BB%B6%E6%A8%A1%E6%9D%BF.zip">合规文件模板下载>></a></p>
          {!canRead ? (
            "暂无权限查看"
          ) : this.state.isEdit ? (
            <DeclarationDetailBankInfoForm
              formUtils={this.formUtils}
              data={info}
            />
          ) : (
            <Form>
              <FormItem label="合规视频" {...formItemLayout}>
                <ul className={style.images}>
                  {info.complianceRecord &&
                    info.complianceRecord.map(item => {
                      return (
                        <div style={{
                          float:'left'
                        }}>
                        <li className={style.image} style={{
                          float:'none'
                        }} >
                          {item.sourceUrl?<a onClick={e=>{
                            const video_baseVideoTranscodes = item.baseVideoTranscodes
                            const  url = video_baseVideoTranscodes && video_baseVideoTranscodes[0].url
                            url?this.previewVideo.show({
                              video:{
                                url:url,
                                coverUrl:item.coverUrl
                              }
                            }):window.open(item.sourceUrl,'_blank')

                          }} target="_Blank">
                            {item.coverUrl?<div className={style.video}><div className="vcp-playtoggle"></div><img src={item.coverUrl ||'/assets/images/ext/video@1x.png'} alt={item.name} /></div>:<p className={style.video_noCover}>{item.name}</p>}
                          </a>: item.coverUrl?<div className={style.video}><div className="vcp-playtoggle"></div><img src={item.coverUrl ||'/assets/images/ext/video@1x.png'} alt={item.name} /></div>:<p className={style.video_noCover}>{item.name}</p>}
                          
                        </li>
                        </div>
                      );
                    })}
                </ul>
              </FormItem>
              <FormItem label="投资者基本信息表（自然人）" {...formItemLayout}>
                <ul className={style.images}>
                  {info.baseInfo &&
                    info.baseInfo.map(item => {
                      return (
                        <li className={style.image}>
                          <a href={item.url} target="_Blank">
                            <img src={item.url} alt={item.name} />
                          </a>
                        </li>
                      );
                    })}
                </ul>
              </FormItem>
              <FormItem label="投资者风险匹配告知书及投资者确认函" {...formItemLayout}>
                <ul className={style.images}>
                  {info.riskNotify &&
                    info.riskNotify.map(item => {
                      return (
                        <li className={style.image}>
                          <a href={item.url} target="_Blank">
                            <img src={item.url} alt={item.name} />
                          </a>
                        </li>
                      );
                    })}
                </ul>
              </FormItem>
              <FormItem label="基金投资者风险测评问卷（自然人）" {...formItemLayout}>
                <ul className={style.images}>
                  {info.riskQuesstionnaire &&
                    info.riskQuesstionnaire.map(item => {
                      return (
                        <li className={style.image}>
                          <a href={item.url} target="_Blank">
                            <img src={item.url} alt={item.name} />
                          </a>
                        </li>
                      );
                    })}
                </ul>
              </FormItem>
              <FormItem label="基金回访确认书" {...formItemLayout}>
                <ul className={style.images}>
                  {info.returnConfirmation &&
                    info.returnConfirmation.map(item => {
                      return (
                        <li className={style.image}>
                          <a href={item.url} target="_Blank">
                            <img src={item.url} alt={item.name} />
                          </a>
                        </li>
                      );
                    })}
                </ul>
              </FormItem>
              <FormItem label="其他合规文件" {...formItemLayout}>
                <ul className={style.images}>
                  {info.otherFile &&
                    info.otherFile.map(item => {
                      return (
                        <li className={style.image}>
                          <a href={item.url} target="_Blank">
                            <img src={item.url} alt={item.name} />
                          </a>
                        </li>
                      );
                    })}
                </ul>
              </FormItem>
            </Form>
          )}
        </div>

        <PreviewVideo getContainer={() => mod.affixContainer} ref={ref=>{
              if(ref){
                this.previewVideo= ref
              }
            }}/>
      </div>
    );
  }
}
