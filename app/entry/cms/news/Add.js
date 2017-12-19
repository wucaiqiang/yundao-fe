import React, { Component } from "react";
import {
  Input,
  DatePicker,
  Form,
  InputNumber,
  Select,
  Radio,
  Checkbox,
  Row,
  Col,
  Icon,
  Button,
  Breadcrumb,
  Spin,
  Modal,
  message
} from "antd";
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

const CheckboxGroup = Checkbox.Group;
const TextArea = Input.TextArea

import Base from "components/main/Base";
import Page from "components/main/Page";
import FormUtils from "lib/formUtils";
import UploadCard from "components/upload/";

import News from "model/CMS/News/index";
import Platform from "model/CMS/platform";
import NewsColumn from "model/CMS/News/column";
import Dictionary from "model/dictionary";

import Editor from "components/Editor";

import moment from "moment";

import style from "./Index.scss";

class Detail extends Base {
  constructor(props) {
    super(props);

    const { location, match } = this.props;

    const { id } = match.params;

    this.state = {
      id: id,
      isEdit: true,
      filters: {},
      visible: true
    };

    this.formUtils = new FormUtils("Detail");
  }
  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
    this.news = new News();
    this.platform = new Platform();
    this.newsColumn = new NewsColumn();
    this.loadData();
    this.dictionary = new Dictionary();
    this.getDictionary();
  }
  loadData = () => {
    const { id } = this.state;
    // this   .news   .get(id)   .then(res => {     this.setState({loading: false})
    //    if (res.success) {       let data = res.result;       data.id = id;
    // this.setState({data, id});     } else {       this.setState({loading: false,
    // error: true, message: res.message})     }   });
    this.get_platform();
  };

  // updateContent = (newContent) => {
  //   this.setState({content: newContent})
  // }

  // onChange = (evt) => {
  //   console.log("onChange fired with event info: ", evt);
  //   var newContent = evt
  //     .editor
  //     .getData();
  //   console.log("newContent",newContent)
  //   this.setState({content: newContent})
  //   this.formUtils.setFieldsValue({content:newContent})
  // }

  // onBlur = (evt) => {
  //   console.log("onBlur event called with event info: ", evt);
  // }

  // afterPaste = (evt) => {
  //   console.log("afterPaste event called with event info: ", evt);
  // }

  get_platform = () => {
    return this
      .platform
      .get_platform_web()
      .then(res => {
        this.setState({platforms: res.result})
        const platformId = res.result[0].id
        this
          .formUtils
          .setFieldsValue({platformId})
        this.get_column(platformId)
      })
  }


  getDictionary() {
    this.dictionary.gets("dic_article_status").then(res => {
      if (res.success && res.result) {
        let filters = {};
        res.result.map(item => {
          filters[item.value] = item.selections;
        });

        this.setState({ filters });
      }
    });
  }

  get_column = platformId => {
    return this.newsColumn.get_platform_column(platformId).then(res => {
      this.setState({ columns: res.result });
    });
  };

  cancel = () => {
    Modal.confirm({
      title: "确定取消新增文章？",
      okText: "确定",
      cancelText: "取消",
      onOk: () => {
        this.props.history.push("/cms/news/list");
      }
    });
  };
  save = e => {
    e && e.preventDefault();
    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();
        if (formData.coverUrl && formData.coverUrl.length) {
          formData.coverUrl = formData.coverUrl[0].url;
        }
        formData = this.formatData(formData);

        const request = this.news.add;

        request(formData).then(res => {
          if (res.success) {
            Modal.confirm({
              title: "新增文章成功.是否继续新增文章",
              okText: "继续新增",
              cancelText: "返回列表",
              onOk: () => {
                this.formUtils.resetFields();
                this.editor.clean()
                this.get_platform()
              },
              onCancel: () => {
                this.props.history.push("/cms/news/list");
              }
            });
            // message.success(`新增文章成功.`);
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
          v = moment(v).format("YYYY-MM-DD HH:mm");
        } else if (v instanceof moment) {
          v = moment(v).format("YYYY-MM-DD HH:mm");
        }
        if (v instanceof Array) {
          v = v.join(",");
        }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD HH:mm");
        }
        values[key] = v;
      }
    }
    return values;
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
    const { data = {}, mod } = this.props;
    const { activeKey, filters, platforms } = this.state;

    let fileList = this.formUtils.getFieldValue("coverUrl");

      const platformId = this.formUtils.getFieldValue("platformId");
      let platformUrl = 'www.xxx.com'
      if(platforms && platformId){
          platformUrl = platforms.filter(item=>item.id == platformId)[0] && platforms.filter(item=>item.id == platformId)[0].url  || 'www.xxx.com'
      }
    return (
      <Page {...this.props}>
        <div
          className={style.page}
          ref={ref => {
            if (ref) {
              const container = ref.parentNode.parentNode;
              this.affixContainer = container;
            }
          }}
        >
          <Breadcrumb className="page-breadcrumb">
            <Breadcrumb.Item>内容配置</Breadcrumb.Item>
            <Breadcrumb.Item>文章内容配置</Breadcrumb.Item>
            <Breadcrumb.Item>新增文章</Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-content">
            <Form>
              <FormItem label="文章标题" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("title", {
                  initialValue: data.title ? data.title : null,
                  validateTrigger: ["onChange", "onBlur"],
                  rules: [
                    {
                      required: true,
                      min:1,
                      max:100,
                      message: "请输入文章标题，长度1-100"
                    }
                  ]
                })(<Input />)}
              </FormItem>
              <FormItem label="所属平台" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("platformId", {
                  initialValue: null,
                  validateTrigger: ["onChange", "onBlur"],
                  rules: [
                    {
                      required: true,
                      message: "请选择预计打款日期"
                    }
                  ]
                })(
                  <Select
                    onChange={value => {
                      this.get_column(value);
                    }}
                    disabled={this.props.isEdit && data.id ? true : false}
                    placeholder={"请选择平台"}
                  >
                    {this.state.platforms &&
                      this.state.platforms.map(item => {
                        return (
                          <Option value={item.id} key={item.id}>
                            {item.name}
                          </Option>
                        );
                      })}
                  </Select>
                )}
              </FormItem>
              <div id="columnContainer">
              <FormItem label="所属栏目" {...formItemLayout}>
                {this.formUtils.getFieldDecorator("columnIds", {
                  initialValue: data.columnIds,
                  validateTrigger: ["onChange", "onBlur"]
                })(
                  <Select mode={"multiple"} getPopupContainer={()=>document.getElementById('columnContainer')} placeholder={"请选择所属栏目"}>
                    {this.state.columns &&
                      this.state.columns.map(item => {
                        return (
                          <Option value={item.id.toString()} key={item.id}>
                            {item.name}
                          </Option>
                        );
                      })}
                  </Select>
                )}
              </FormItem>
              </div>
              <FormItem label="图片" {...formItemLayout}>
                {!this.state.isEdit ? (
                  <img src={data.coverUrl} />
                ) : (
                  this.formUtils.getFieldDecorator("coverUrl", {
                    initialValue: []
                  })(
                    <UploadCard
                      listType="picture"
                      accept="jpg,jpeg,png"
                      fileCount={1}
                      fileSize="30MB"
                      fileList={fileList}
                      onRemove={this.handUploadRemove}
                      onChange={this.handleUploadChange}
                    >
                      <Button>
                        <Icon type="cloud-upload-o" />上传
                      </Button>
                    </UploadCard>
                  )
                )}
              </FormItem>
              {/* <FormItem label="URL" {...formItemLayout}>
                {!this.state.isEdit
                  ? data.platformUrl + "/news/" + data.code + ".html"
                  : this.formUtils.getFieldDecorator("code", {
                      initialValue: data.code,
                      validateTrigger: ["onChange", "onBlur"],
                      rules: [
                        {
                          pattern: /^[a-zA-Z0-9]{1,20}$/gi,
                          min:1,
                          max:20,
                          required: true,
                          message: "请输入文章访问的URL(只允许字母和数字,长度1-20)"
                        }
                      ]
                    })(
                      <Input
                        addonBefore={`${platformUrl}/news/`}
                        addonAfter=".html"
                      />
                    )}
              </FormItem> */}
              <FormItem label="SEO Title" {...formItemLayout}>
                {!this.state.isEdit
                  ? data.seoTitle
                  : this.formUtils.getFieldDecorator("seoTitle", {
                      initialValue: data.seoTitle,
                      validateTrigger: ["onChange", "onBlur"],
                      rules: [
                        {
                          min:1,
                          max:50,
                          message:"请输入栏目Title,长度不超过50"
                        }]
                    })(<Input placeholder="请输入栏目Title" />)}
              </FormItem>
              <FormItem label="SEO Keywords" {...formItemLayout}>
                {!this.state.isEdit
                  ? data.seoKeywords
                  : this.formUtils.getFieldDecorator("seoKeywords", {
                      initialValue: data.seoKeywords,
                      validateTrigger: ["onChange", "onBlur"],
                      rules: [
                        {
                          min:1,
                          max:100,
                          message:"请输入栏目Title,长度不超过100"
                        }]
                    })(<Input placeholder="请输入栏目Keywords" />)}
              </FormItem>
              <FormItem label="SEO Description" {...formItemLayout}>
                {!this.state.isEdit
                  ? data.seoDescription
                  : this.formUtils.getFieldDecorator("seoDescription", {
                      initialValue: data.seoDescription,
                      validateTrigger: ["onChange", "onBlur"],
                      rules: [
                        {
                          min:1,
                          max:200,
                          message:"请输入栏目Title,长度不超过200"
                        }]
                    })(<Input placeholder="请输入栏目Description" />)}
              </FormItem>
              <FormItem label="阅读数显示值" {...formItemLayout}>
                {!this.state.isEdit
                  ? data.pageview
                  : this.formUtils.getFieldDecorator("pageview", {
                      initialValue: data.pageview,
                      validateTrigger: ["onChange", "onBlur"]
                    })(<InputNumber min={0} precision={0} placeholder="阅读数"/>)}
              </FormItem>
              <FormItem label="排序" {...formItemLayout}>
                {!this.state.isEdit
                  ? data.sequence
                  : this.formUtils.getFieldDecorator("sequence", {
                      initialValue: data.sequence || 0,
                      validateTrigger: [
                        "onBlur"
                      ],
                      rules: [
                        {
                          required: true,
                          message: "请输入排序"
                          
                        }
                      ]
                    })(<InputNumber precision={0} min={0} max={999999999} placeholder="排序"/>)}(数值越小越靠前)
              </FormItem>
              <FormItem label="发布时间" {...formItemLayout}>
                {!this.state.isEdit
                  ? data.publishDate
                  : this.formUtils.getFieldDecorator("publishDate", {
                      initialValue: moment(),
                      validateTrigger: ["onChange", "onBlur"],rules:[{
                        required:true,
                        message:'请输入发布时间'
                      }]
                    })(<DatePicker  showTime
                      format="YYYY-MM-DD HH:mm" placeholder="请输入发布时间"/>)}(默认立即发布，您可以修改发布时间用于定时发布)
              </FormItem>
              <FormItem label="文章导读" {...formItemLayout}>
                {!this.state.isEdit
                  ? data.articleDetail && data.articleDetail.feature
                  : this.formUtils.getFieldDecorator("feature", {
                      initialValue:
                        data.articleDetail && data.articleDetail.feature,
                      validateTrigger: ["onChange", "onBlur"],
                      rules: [
                        {
                          required: true,
                          min:1,
                          max:500,
                          message: "请输入文章导读,长度1-500"
                        }
                      ]
                    })(<TextArea className={style.feature} autosize={{ minRows: 2, maxRows: 6 }} placeholder="请输入文章导读" />)}
              </FormItem>
              <FormItem label="文章正文" {...formItemLayout}>
                {!this.state.isEdit
                  ? data.articleDetail && data.articleDetail.content
                  : this.formUtils.getFieldDecorator("content", {
                      initialValue:
                        data.articleDetail && data.articleDetail.content,
                      validateTrigger: ["onChange", "onBlur"],
                      rules: [
                        {
                          required: true,
                          message: "请填写文章正文"
                        }
                      ]
                    })(<Input type="hidden" placeholder="请输入文章正文" />)}
                <Editor
                ref={ref=>{
                  if(ref){
                    this.editor = ref
                  }
                }}
                  content={this.formUtils.getFieldValue("content")}
                  callback={value => {
                    this.formUtils.setFieldsValue({ content: value });
                  }}
                />
                {/* <CKEditor
                  activeClass="p10"
                  content={this.state.content}
                  config={{
                    language: 'zh-cn',
                    filebrowserUploadUrl:'/api/file/upload'
                  }}
                  events={{
                  "blur": this.onBlur,
                  "afterPaste": this.afterPaste,
                  "change": this.onChange
                }}/> */}
              </FormItem>
              <FormItem label="状态" {...formItemLayout}>
                {!this.state.isEdit
                  ? data.statusText
                  : this.formUtils.getFieldDecorator("status", {
                      initialValue:
                        data.status != undefined || data.status != null
                          ? data.status.toString()
                          : "1",
                      validateTrigger: ["onChange", "onBlur"],
                      rules: [
                        {
                          required: true,
                          message: "请选择是否启用"
                        }
                      ]
                    })(
                      <RadioGroup placeholder={"排序"}>
                        {filters.dic_article_status &&
                          filters.dic_article_status.map(item => {
                            return (
                              <Radio
                                key={item.value}
                                value={item.value.toString()}
                              >
                                {item.label}
                              </Radio>
                            );
                          })}
                      </RadioGroup>
                    )}
              </FormItem>
              <FormItem label="文章来源" {...formItemLayout}>
                {!this.state.isEdit
                  ? data.articleDetail && data.articleDetail.source
                  : this.formUtils.getFieldDecorator("source", {
                      initialValue:
                        data.articleDetail && data.articleDetail.source,
                      validateTrigger: ["onChange", "onBlur"],
                      rules:[{
                        max:20,
                        message: "请输入文章来源,长度不超过20"
                      }]
                    })(<Input  placeholder="请输入文章来源"/>)}
              </FormItem>
              <FormItem label="作者" {...formItemLayout}>
                {!this.state.isEdit
                  ? data.articleDetail && data.articleDetail.author
                  : this.formUtils.getFieldDecorator("author", {
                      initialValue:
                        data.articleDetail && data.articleDetail.author,
                      validateTrigger: ["onChange", "onBlur"],
                      rules: [
                        {
                          max:20,
                          message: "请输入作者，长度不超过20"
                        }
                      ]
                    })(<Input placeholder="请输入作者"/>)}
              </FormItem>
              <div className={style.operation}>
                <Button onClick={this.cancel} className={style.clear}>
                  取消
                </Button>
                <Button onClick={this.save} className={style.submit}>
                  保存
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Page>
    );
  }
}

Detail = Form.create()(Detail);

export default Detail;
