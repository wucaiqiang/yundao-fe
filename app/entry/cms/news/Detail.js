import React, { Component } from "react";
import ReactDOM from "react-dom";
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
  message,
  Modal
} from "antd";
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;

const CheckboxGroup = Checkbox.Group;
import Base from "components/main/Base";
import Page from "components/main/Page";
import FormUtils from "lib/formUtils";
import UploadCard from "components/upload/";

import moment from "moment";

import News from "model/CMS/News/index";
import Platform from "model/CMS/platform";
import NewsColumn from "model/CMS/News/column";

import Dictionary from "model/dictionary";

import Editor from "components/Editor";

import style from "./Index.scss";

class Detail extends Base {
  state = {
    loading: true,
    visible: false,
    activeKey: "1"
  };
  constructor(props) {
    super(props);

    const { location, match } = this.props;

    const { id } = match.params;

    this.state = {
      id: id,
      data: {},
      isEdit: false,
      visible: true,
      filters: {}
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
    this.dictionary = new Dictionary();
    this.newsColumn = new NewsColumn();
    this.loadData();
    this.getDictionary();
  }
  loadData = () => {
    this.loadNews();
    this.get_platform();
  };

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

  loadNews = () => {
    const { id } = this.state;
    this.news.get(id).then(res => {
      this.setState({ loading: false });
      if (res.success) {
        let data = res.result;
        data.id = id;
        if (data.coverUrl) {
          data.coverUrl = [
            {
              name: data.coverUrl,
              uid: data.coverUrl,
              url: data.coverUrl,
              type: "image/png",
              status: "done"
            }
          ];
        }
        if (data.columnIds) {
          data.columnIds = data.columnIds.split(",");
        }
        data.status = data.status.toString();
        this.setState({
          data,
          id,
          content: data.articleDetail ? data.articleDetail.content : null
        });
        this.get_column(data.platformId);
      } else {
        this.setState({ loading: false, error: true, message: res.message });
      }
    });
  };

  get_platform = () => {
    return this.platform.get_platform_web().then(res => {
      this.setState({ platforms: res.result });
      // this.formUtils.setFieldsValue({platforms:res.result[0].id})
    });
  };

  get_column = platformId => {
    return this.newsColumn.get_platform_column(platformId).then(res => {
      this.setState({ columns: res.result });
    });
  };

  cancel = () => {
    Modal.confirm({
      title: "确定取消编辑文章？",
      okText: "确定",
      cancelText: "继续编辑",
      onOk: () => {
        this.setState({ isEdit: false });
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

        const request = this.news.update;
        formData.id = this.state.id;

        request(formData).then(res => {
          if (res.success) {
            message.success("文章编辑成功");
            this.loadData();
            this.setState({ isEdit: false });
          }
        });
      }
    });
  };

  intoEdit = () => {
    let formatData = Object.assign({}, this.state.data);
    if (formatData.publishDate) {
      formatData.publishDate = moment(formatData.publishDate);
    }
    this.setState({ isEdit: true }, () => {
      this.formUtils.setFieldsValue(formatData);
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
    const {
      activeKey,
      data,
      isEdit,
      platforms,
      positions,
      columns,
      filters
    } = this.state;

        let fileList = this
            .formUtils
            .getFieldValue("coverUrl");
        // const platformId = this.formUtils.getFieldValue("platformId");
        let platformUrl = 'www.xxx.com'
        // console.log('platforms && platformId',platforms,platformId)
        if(platforms && data.platformId){
            platformUrl = platforms.filter(item=>item.id == data.platformId)[0] && platforms.filter(item=>item.id == data.platformId)[0].url  || 'www.xxx.com'
        }
        return (
            <Page {...this.props}>
                <div
                    className={style.page}
                    ref={ref => {
                    if (ref) {
                        const container = ref.parentNode.parentNode;
                        this.affixContainer = container
                    }
                }}>
                    <Breadcrumb className="page-breadcrumb">
                        <Breadcrumb.Item>内容配置</Breadcrumb.Item>
                        <Breadcrumb.Item>文章内容配置</Breadcrumb.Item>
                        <Breadcrumb.Item>文章详情</Breadcrumb.Item>
                    </Breadcrumb>
                    <div className="page-content">
                        <Spin spinning={this.state.loading}>
                        <div className={style.operation}>
                                    {isEdit
                                        ? <div className={style.operation}>
                                                <Button onClick={this.cancel} className={style.clear}>取消</Button>
                                                <Button className={style.submit} onClick={this.save}>保存</Button>
                                            </div>
                                        : <Button className={style.submit} onClick={this.intoEdit}>编辑</Button>}
                                </div>
                            <Form>
                                <FormItem label="文章标题" {...formItemLayout}>
                                    {!isEdit
                                        ? data.title
                                        : this
                                            .formUtils
                                            .getFieldDecorator("title", {
                                                initialValue: data.title,
                                                validateTrigger: [
                                                    "onChange", "onBlur"
                                                ],
                                                rules: [
                                                    {
                                                      required: true,
                                                      min:1,
                                                      max:100,
                                                      message: "请输入文章标题，长度1-100"
                                                    }
                                                  ]
                                            })(<Input/>)
}
                                </FormItem>
                                <FormItem label="所属平台" {...formItemLayout}>
                                    {!isEdit
                                        ? platforms && platforms.filter(item=>item.id == data.platformId)[0] && platforms.filter(item=>item.id == data.platformId)[0].name
                                        : this
                                            .formUtils
                                            .getFieldDecorator("platformId", {
                                                initialValue: data.platformId,
                                                validateTrigger: [
                                                    "onChange", "onBlur"
                                                ],
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请选择所属平台"
                                                    }
                                                ]
                                            })(
                                                <Select
                                                    onChange={value => {
                                                    this.get_column(value)
                                                }}
                                                    disabled={true}
                                                    placeholder={'请选择平台'}>
                                                    {platforms && platforms
                                                        .map(item => {
                                                            return <Option value={item.id} key={item.id}>{item.name}</Option>
                                                        })}
                                                </Select>
                                            )
}
                                </FormItem>

                                <FormItem label="所属栏目" {...formItemLayout}>
                                    {!isEdit
                                        ? data.columnName
                                        : this
                                            .formUtils
                                            .getFieldDecorator("columnIds", {
                                                initialValue:  data
                                                .columnIds || [],
                                                validateTrigger: [
                                                    "onChange", "onBlur"
                                                ]
                                            })(
                                                <Select mode="multiple" placeholder={'请选择所属栏目'}>
                                                    {columns && columns
                                                        .map(item => {
                                                            return <Option value={item.id.toString()} key={item.id}>{item.name}</Option>
                                                        })}
                                                </Select>
                                            )
}
                                </FormItem>
                                <FormItem label="图片" {...formItemLayout}>
                                    {!isEdit
                                        ? <img style={{
                                            maxWidth:'100%',
                                            maxHeight:'400px'
                                        }} src={data.coverUrl && data.coverUrl[0] && data.coverUrl[0].url}/>
                                        : this
                                            .formUtils
                                            .getFieldDecorator("coverUrl", {initialValue: data.coverUrl})(
                                                <UploadCard
                                                    listType="picture"
                                                    accept="jpg,jpeg,png"
                                                    fileCount={1}
                                                    fileSize="30MB"
                                                    fileList={fileList}
                                                    >
                                                    <Button>
                                                        <Icon type="cloud-upload-o"/>上传
                                                    </Button>
                                                </UploadCard>
                                            )}
                                </FormItem>
                                <FormItem label="URL" {...formItemLayout}>
                                <a href={`//${platformUrl}/news/${data.code || 'xxx'}.html`} target="_blank">{`${platformUrl}/news/${data.code || 'xxx'}.html`}</a>
                                    {/* {!isEdit
                                        ? `${platformUrl}/news/${data.code || 'xxx'}.html`
                                        : this
                                            .formUtils
                                            .getFieldDecorator("code", {
                                                initialValue: data.code,
                                                validateTrigger: [
                                                    "onChange", "onBlur"
                                                ],
                                                rules: [
                                                    {
                                                        pattern: /^[a-zA-Z0-9]{1,20}$/gi,
                                                        required: true,
                                                        message: "请输入文章访问的URL(只允许字母和数字)"
                                                    }
                                                ]
                                            })(<Input
                                                addonBefore={`${platformUrl}/news/`}
                                                disabled={true}
                                                addonAfter=".html"/>)} */}
                                </FormItem> 
                                <FormItem label="SEO Title" {...formItemLayout}>
                                    {!isEdit
                                        ? data.seoTitle
                                        : this
                                            .formUtils
                                            .getFieldDecorator("seoTitle", {
                                                initialValue: data.seoTitle,
                                                validateTrigger: ["onChange", "onBlur"],
                                                rules: [
                                                    {
                                                      min:1,
                                                      max:50,
                                                      message:"请输入栏目Title,长度不超过50"
                                                    }]
                                            })(<Input placeholder="请输入栏目Title"/>)}
                                </FormItem>
                                <FormItem label="SEO Keywords" {...formItemLayout}>
                                    {!isEdit
                                        ? data.seoKeywords
                                        : this
                                            .formUtils
                                            .getFieldDecorator("seoKeywords", {
                                                initialValue: data.seoKeywords,
                                                validateTrigger: ["onChange", "onBlur"],
                                                rules: [
                                                    {
                                                      min:1,
                                                      max:100,
                                                      message:"请输入栏目Title,长度不超过100"
                                                    }]
                                            })(<Input placeholder="请输入栏目Keywords"/>)}
                                </FormItem>
                                <FormItem label="SEO Description" {...formItemLayout}>
                                    {!isEdit
                                        ? data.seoDescription
                                        : this
                                            .formUtils
                                            .getFieldDecorator("seoDescription", {
                                                initialValue: data.seoDescription,
                                                validateTrigger: ["onChange", "onBlur"],
                                                rules: [
                                                    {
                                                      min:1,
                                                      max:200,
                                                      message:"请输入栏目Title,长度不超过200"
                                                    }]
                                            })(<Input placeholder="请输入栏目Description"/>)}
                                </FormItem>
                                <FormItem label="阅读数显示值" {...formItemLayout}>
                                    {!isEdit
                                        ? data.pageview
                                        : this
                                            .formUtils
                                            .getFieldDecorator("pageview", {
                                                initialValue: data.pageview,
                                                validateTrigger: ["onChange", "onBlur"]
                                            })(<InputNumber min={0} precision={0} placeholder="阅读数"/>)}
                                </FormItem>
                                <FormItem label="排序" {...formItemLayout}>
                                    {!isEdit
                                        ? data.sequence
                                        : this
                                            .formUtils
                                            .getFieldDecorator("sequence", {
                                                initialValue: data.sequence,
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
                                    {!isEdit
                                        ? data.publishDate ?moment(data.publishDate).format("YYYY-MM-DD HH:mm"):null
                                        : this
                                            .formUtils
                                            .getFieldDecorator("publishDate", {
                                                initialValue: data.publishDate
                                                    ? moment(data.publishDate)
                                                    : null,
                                                validateTrigger: ["onChange", "onBlur"],
                                                rules:[{
                                                    required:true,
                                                    message:'请输入发布时间'
                                                }]
                                            })(<DatePicker showTime
                                                format="YYYY-MM-DD HH:mm" placeholder="请输入发布时间"/>)}(默认立即发布，您可以修改发布时间用于定时发布)
                                </FormItem>
                                <FormItem label="文章导读" {...formItemLayout}>
                                    {!isEdit
                                        ? data.articleDetail && data.articleDetail.feature
                                        : this
                                            .formUtils
                                            .getFieldDecorator("feature", {
                                                initialValue: data.articleDetail && data.articleDetail.feature,
                                                validateTrigger: [
                                                    "onChange", "onBlur"
                                                ],
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
                                    {!isEdit
                                        ? <iframe style={{width:'100%'}} height={400} ref={ref=>{
                                            if(ref){
                                                const frame = ReactDOM.findDOMNode(ref)
                                                frame.contentWindow.document.body.innerHTML = data.articleDetail && data.articleDetail.content
                                                console.log(frame)
                                            }
                                        }}>{data.articleDetail && data.articleDetail.content}</iframe>
                                        : this
                                            .formUtils
                                            .getFieldDecorator("content", {
                                                initialValue: data.articleDetail && data.articleDetail.content,
                                                validateTrigger: [
                                                    "onChange", "onBlur"
                                                ],
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '请填写文章正文'
                                                    }
                                                ]
                                            })(<Input type="hidden"/>)}
                                    {isEdit
                                        ? <Editor content={this.formUtils.getFieldValue('content')} callback={(value)=>{
                  this.formUtils.setFieldsValue({content:value})
                }}/>
                                        : null}
                                </FormItem>
                                <FormItem label="状态" {...formItemLayout}>
                                    {!isEdit
                                        ? filters.dic_article_status && filters.dic_article_status.filter(item=>item.value == data.status)[0] && filters.dic_article_status.filter(item=>item.value == data.status)[0].label
                                        : this
                                            .formUtils
                                            .getFieldDecorator("status", {
                                                initialValue: data.status != undefined || data.status != null
                                                    ? data
                                                        .status
                                                        .toString()
                                                    : '1',
                                                validateTrigger: [
                                                    "onChange", "onBlur"
                                                ],
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请选择是否启用"
                                                    }
                                                ]
                                            })(
                                                <RadioGroup placeholder={'排序'}>
                                                {filters.dic_article_status && filters.dic_article_status.map(item=>{
                                                    return  <Radio key={item.value} value={item.value.toString()}>{item.label}</Radio>
                                                })}
                                                   
                                                </RadioGroup>
                                            )}
                                </FormItem>
                                <FormItem label="文章来源" {...formItemLayout}>
                                    {!isEdit
                                        ? data.articleDetail && data.articleDetail.source
                                        : this
                                            .formUtils
                                            .getFieldDecorator("source", {
                                                initialValue: data.articleDetail && data.articleDetail.source,
                                                validateTrigger: ["onChange", "onBlur"],
                                                rules:[{
                                                    max:20,
                                                    message: "请输入文章来源,长度不超过20"
                                                  }]
                                            })(<Input placeholder="请输入文章导读"/>)}
                                </FormItem>
                                <FormItem label="作者" {...formItemLayout}>
                                    {!isEdit
                                        ? data.articleDetail && data.articleDetail.author
                                        : this
                                            .formUtils
                                            .getFieldDecorator("author", {
                                                initialValue: data.articleDetail && data.articleDetail.author,
                                                validateTrigger: [
                                                    "onChange", "onBlur"
                                                ],
                                                rules: [
                                                    {
                                                      max:20,
                                                      message: "请输入作者，长度不超过20"
                                                    }
                                                  ]
                                            })(<Input placeholder="请输入作者"/>)}
                                </FormItem>
                               
                            </Form>
                        </Spin>
                    </div>
                </div>
            </Page>
        );
    }
}

Detail = Form.create()(Detail);

export default Detail;
