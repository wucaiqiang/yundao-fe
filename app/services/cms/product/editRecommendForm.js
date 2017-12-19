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
    Row,
    Col
} from "antd";

import Base from "components/main/Base";

import FormUtils from "lib/formUtils";

import Customer from "model/Customer/";

import moment from "moment";

import Product from "model/Product/";

import SearchSelect from "components/Form/SearchSelect";

import Platform from 'model/CMS/platform'

import style from "./editRecommendModal.scss"

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
        this.platform = new Platform()
        const {data} = this.props
        if(!data.id){
            this.get_platform()
        }else{
            this.get_platform()
            this.get_position(data.platformId,data.positionId)
        }
        
    }

    // componentWillReceiveProps(nextProps) {
    //     const {data} = nextProps
    //      if(data.id){
    //          if(data.id !=this.props.data.id){
    //             data.platformId = data.platformId.toString()
    //             data.positionId = data.positionId.toString()
    //             this.get_position(data.platformId,data.positionId)
    //         }
    //     }else{
            
    //     }
    // }

    get_platform =()=>{
        const {isEdit,data} = this.props
        return this.platform.get_platform().then(res=>{
            this.setState({
                platforms:res.result
            })
            const platformId =res.result[0].id.toString()
            if(!data.id){
                this.get_position(platformId)
                this.formUtils.setFieldsValue({platformId:platformId})
            }
            
        })
    }

    get_position =(platformId,positionId)=>{
        return this.platform.get_position_by_platform(platformId).then(res=>{
            const positions = res.result
            this.setState({
                positions:positions
            })
            
            if(!positionId){
                this.formUtils.setFieldsValue({positionId:positions[0].id.toString()})
            }else{
                console.log('positions',positions)
                console.log('positionId',positionId)
                console.log('positions.map(item=>item.id).indexOf(positionId)  == -1',positions.map(item=>item.id).indexOf(positionId)  == -1)
                if(positions.map(item=>item.id.toString()).indexOf(positionId)  == -1){
                    const {data} =this.props
                    delete data.positionId
                    this.formUtils.resetFields()
                    this.formUtils.setFieldsValue(data)
                }
            }
        })
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
        return (
            <Form
                className={this.getFormClassName()}
                ref={ref => (this.container = ReactDom.findDOMNode(ref))}>
                {!this.props.isEdit
                    ? (
                        <FormItem label="产品名称" {...formItemLayout}>
                            {data.productName}
                        </FormItem>
                    )
                    : (
                        <FormItem label="产品名称" {...formItemLayout}>
                            <div id={"productId_FormItem"}>
                                <SearchSelect
                                    placeholder="请输入并选择产品"
                                    request={this.product.get_product}
                                    format={r => {
                                    if(!this.product_list){
                                        this.product_list = []
                                    }
                                    this.product_list.push(r)
                                    return {value: r.id, label: r.name};
                                }}
                                    formUtils={this.props.formUtils}
                                    name="productId"
                                    callback={value=>{
                                        const current_product = this.product_list.filter(item=>item.id == value.key).pop()
                                        this.setState({
                                            current_product
                                        })
                                        // console.log('product_list',this.product_list)
                                        // console.log(value)
                                    }}
                                    initData={{
                                    label: data.productName,
                                    value: data.productId
                                }}/> {this
                                    .formUtils
                                    .getFieldDecorator("productId", {
                                        initialValue: data.productId,
                                        validateTrigger: [
                                            "onChange", "onBlur"
                                        ],
                                        rules: [
                                            {
                                                required: true,
                                                message: "请输入并选择产品"
                                            }
                                        ]
                                    })(<Input type="hidden"/>)}
                            </div>
                        </FormItem>
                    )}
                <FormItem label=" " {...formItemLayout}>
                    发行状态：{this.state.current_product?this.state.current_product.issuedStatusText:data.issuedStatusText}
                </FormItem>
                {!this.props.isEdit
                    ? null
                    : this
                        .formUtils
                        .getFieldDecorator("platformId", {
                            validateTrigger: [
                                "onChange", "onBlur"
                            ],
                            rules: [
                                {
                                    required: true,
                                    message: "请选择平台"
                                }
                            ]
                        })(<Input type="hidden"/>)}
                <FormItem label="显示位置" {...formItemLayout} ref={ref=>this.formItem =ReactDom.findDOMNode(ref) }>

                    {!this.props.isEdit
                        ? null
                        : this
                            .formUtils
                            .getFieldDecorator("positionId", {
                                validateTrigger: [
                                    "onChange", "onBlur"
                                ],
                                rules: [
                                    {
                                        required: true,
                                        message: "请选择推荐位"
                                    }
                                ]
                            })(<Input type="hidden"/>)}
                    {!this.props.isEdit
                        ? `${data.platformName} ${data.positionName}`
                        : <Row>
                            <Col span={12}>
                                <Select
                                getPopupContainer={()=>this.formItem}
                                value={this.formUtils.getFieldValue('platformId')}
                                    onChange={value => {
                                    this
                                        .formUtils
                                        .setFieldsValue({'platformId': value})
                                    this.get_position(value)
                                }}
                                    placeholder={'请选择平台'}>
                                    {this.state.platforms && this.state.platforms.map(item=>{
                                        return  <Option value={item.id.toString()} key={item.id}>{item.name}</Option>
                                    })}
                                </Select>
                            </Col>
                            <Col span={12}>
                                <Select
                                getPopupContainer={()=>this.formItem}
                                value={this.formUtils.getFieldValue('positionId')}
                                    onChange={value => {
                                    this
                                        .formUtils
                                        .setFieldsValue({'positionId': value})
                                }}
                                    placeholder={'请选择推荐位'}>
                                    {this.state.positions && this.state.positions.map(item=>{
                                        return  <Option value={item.id.toString()} key={item.id}>{item.name}</Option>
                                    })}
                                </Select>
                            </Col>
                        </Row>}

                </FormItem>
                <FormItem label="排序" {...formItemLayout}>
                    {!this.props.isEdit
                        ? data.sort
                        : this
                            .formUtils
                            .getFieldDecorator("sort", {
                                initialValue: data.sort || 0,
                                rules: [
                                    {
                                        required: true,
                                        message: "请输入排序"
                                    }
                                ],
                                validateTrigger: ["onChange", "onBlur"]
                            })(<InputNumber placeholder='排序' max={999999999} min={0} precision={0}/>)
}(数值越小越靠前)

                </FormItem>
                <FormItem label="状态" {...formItemLayout}>
                    {!this.props.isEdit
                        ? data.statusText
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
                                <RadioGroup placeholder={'排序'}>
                                    <Radio value={'1'}>启用</Radio>
                                    <Radio value={'0'}>停用</Radio>
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
