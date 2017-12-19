import React from "react";
import ReactDom from "react-dom";

import {
    Input,
    DatePicker,
    Form,
    InputNumber,
    Select,
    Radio,
    Checkbox,
    Button,
    Icon,
    Row,
    Col
} from "antd";

import Base from "components/main/Base";

import UploadCard from "components/upload/";

import FormUtils from "lib/formUtils";

import moment from "moment";

import SearchSelect from "components/Form/SearchSelect";



import Customer from "model/Customer/";
import Dictionary from "model/dictionary";

import Product from "model/Product/";

import Platform from 'model/CMS/platform'

import style from "./editColumnModal.scss"



const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group

const CheckboxGroup = Checkbox.Group

class EditRecommendForm extends Base {
    constructor() {
        super();
        this.state = {
            loading: false,
            noticeType: [],
            showExtra: false,
            autoCompleteResult: [],
            dic: {},
            filters:[],
            category: []
        };

        this.formUtils = new FormUtils("EditRecommendForm");
    }
    componentWillMount() {
        this.formUtils = this.props.formUtils || this.formUtils;
        this
            .formUtils
            .setForm(this.props.form);
        if (this.props.setForm) {
            this
                .props
                .setForm
                .call(this, this);
        }
        this.product = new Product();
        this.customer = new Customer();
        this.platform = new Platform();
        this.dictionary = new Dictionary();
        this.get_platform()
        this.getDictionary()
    }

    getDictionary() {
        this.dictionary
          .gets(
            "dic_article_column_status"
          )
          .then(res => {
            if (res.success && res.result) {
              let filters = {};
              res.result.map(item => {
                filters[item.value] = item.selections;
              });
    
              this.setState({ filters });
            }
          });
      }

    getFormClassName() {
        let cls;

        cls = ["float-slide-form", "vant-spin", "follow-form"];
        if (this.state.loading) {
            cls.push("loading");
        }
        return cls.join(" ");
    }

    get_platform =()=>{
        return this.platform.get_platform_web().then(res=>{
            this.setState({
                platforms:res.result
            })
            this.formUtils.setFieldsValue({platformId:res.result[0].id.toString()})
        })
    }
    handleChange = value => {
        if (value == "0") {
            this
                .formUtils
                .resetFields(["sendTime"]);
        }
    };

    render() {
        const {data} = this.props;
        const formItemLayout = {
            labelCol: {
                span: 7
            },
            wrapperCol: {
                span: 17
            }
        };

        let {initFields} = this.props;
        let {platforms,filters} = this.state;

        let fileList = this.props.formUtils.getFieldValue("coverUrl");
        const platformId = this.props.formUtils.getFieldValue("platformId");
        let platformUrl = 'www.xxx.com'
        if(platforms && platformId){
            platformUrl = platforms.filter(item=>item.id == platformId)[0] &&  platforms.filter(item=>item.id == platformId)[0].url  || 'www.xxx.com'
        }
        return (
            <Form
                className={this.getFormClassName()}
                ref={ref => (this.container = ReactDom.findDOMNode(ref))}>
                <FormItem label="栏目名称" {...formItemLayout}>
                {!this.props.isEdit
                    ? data.name
                    : this
                        .formUtils
                        .getFieldDecorator("name", {
                            initialValue: data.name,
                            validateTrigger: [
                                "onChange", "onBlur"
                            ],
                            rules: [
                                {
                                    required: true,
                                    message: "请输入栏目名称"
                                }
                            ]
                        })(<Input placeholder="请输入栏目名称"/>)}
                </FormItem>
                
                <FormItem label="所属平台" {...formItemLayout} ref={ref=>this.formItem =ReactDom.findDOMNode(ref) }>
                {!this.props.isEdit
                    ? data.platformName
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
                                    message: "请选择平台"
                                }
                            ]
                        })(
                            <Select
                            getPopupContainer={()=>{
                                console.log(this)
                                return this.formItem
                            }}
                            disabled={this.props.isEdit && data.id
                            ? true
                            : false}
                            placeholder={'请选择平台'}>
                            {this.state.platforms && this.state.platforms.map(item=>{
                                        return  <Option value={item.id.toString()} key={item.id}>{item.name}</Option>
                                    })}
                        </Select>
                        )}
                </FormItem>
              
                <FormItem label="图片" {...formItemLayout}>
                {!this.props.isEdit
                    ? <img className={style.image} src={data.coverUrl && data.coverUrl[0] && data.coverUrl[0].url} />
                    : this.props.formUtils.getFieldDecorator("coverUrl",{
                        initialValue:data.coverUrl
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
                      )}
                </FormItem>
                <FormItem label="URL" {...formItemLayout}>
                {!this.props.isEdit
                    ?data.platformUrl+'/'+data.code+'_news'
                    : this
                        .formUtils
                        .getFieldDecorator("code", {
                            initialValue: data.code,
                            validateTrigger: [
                                "onChange", "onBlur"
                            ],
                            rules: [
                                {
                                    pattern:/^[a-zA-Z0-9]*$/ig,
                                    required: true,
                                    message: "请输入栏目访问的URL(只允许字母和数字)"
                                }
                            ]
                        })(
                            <Input addonBefore={`${platformUrl}/`} disabled={data.code?true:false} addonAfter="_news"  />
                        )}
                </FormItem>
                <FormItem label="SEO Title" {...formItemLayout}>
                {!this.props.isEdit
                    ? data.seoTitle
                    : this
                        .formUtils
                        .getFieldDecorator("seoTitle", {
                            initialValue: data.seoTitle,
                            validateTrigger: [
                                "onChange", "onBlur"
                            ]
                        })(<Input placeholder="请输入栏目Title"/>)}
                </FormItem>
                <FormItem label="SEO Keywords" {...formItemLayout}>
                {!this.props.isEdit
                    ? data.seoKeywords
                    : this
                        .formUtils
                        .getFieldDecorator("seoKeywords", {
                            initialValue: data.seoKeywords,
                            validateTrigger: [
                                "onChange", "onBlur"
                            ]
                        })(<Input placeholder="请输入栏目Keywords"/>)}
                </FormItem>
                <FormItem label="SEO Description" {...formItemLayout}>
                {!this.props.isEdit
                    ? data.seoDescription
                    : this
                        .formUtils
                        .getFieldDecorator("seoDescription", {
                            initialValue: data.seoDescription,
                            validateTrigger: [
                                "onChange", "onBlur"
                            ]
                        })(<Input placeholder="请输入栏目Description"/>)}
                </FormItem>
              
                <FormItem label="排序" {...formItemLayout}>
                    {!this.props.isEdit
                        ? data.sequence
                        : this
                            .formUtils
                            .getFieldDecorator("sequence", {
                                initialValue: data.sequence ||0,
                                validateTrigger: ["onChange", "onBlur"],
                                rules: [
                                    {
                                        required: true,
                                        message: "请输入排序"
                                    }
                                ]
                            })(<InputNumber min={0} max={999999999} placeholder='排序' precision={0}/>)
}(数值越小越靠前)

                </FormItem>
                <FormItem label="状态" {...formItemLayout}>
                    {!this.props.isEdit
                        ? filters['dic_article_column_status'] && filters['dic_article_column_status'].filter(item=>item.value==data.status)[0].label
                        : this
                            .formUtils
                            .getFieldDecorator("status", {
                                initialValue: data.status !=undefined ||data.status !=null?data.status.toString():'1',
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
                                <RadioGroup >
                                {filters['dic_article_column_status'] && filters['dic_article_column_status'].map(item=>{
                                    return <Radio value={item.value.toString()}>{item.label}</Radio>
                                })}
                                </RadioGroup>
                            )
}
                </FormItem>
            </Form>
        );
    }
}
EditRecommendForm = Form.create()(EditRecommendForm);

export default EditRecommendForm;
