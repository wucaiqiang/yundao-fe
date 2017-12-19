import React, {Component} from "react";

import moment from "moment";

import extend from 'extend'

const Moment = moment

import {
    Layout,
    Form,
    Tabs,
    Input,
    Select,
    Row,
    Col,
    Spin
} from 'antd'

const {Header, Content, Footer, Sider} = Layout;

const FormItem = Form.Item

import Base from 'components/main/Base'

import FormUtils from 'lib/formUtils'

import style from './info.scss'

//数据源
import ProductCategory from 'model/Product/category'
import Product from 'model/Product/'
import User from 'model/User/'

import DynamicFormItem from 'components/Form/DynamicFormItem'

class InfoForm extends Base {
    state = {
        category: [],
        fields: [],
        loading:false,
        formLayout: 'horizontal'
    }
    constructor(props) {
        super(props);
    }
    componentWillMount() {
        this.formUtils = this.props.formUtils || this.formUtils;
        this
            .formUtils
            .setForm(this.props.form);
        this.user = new User()
    }
    componentDidMount() {
        const category = new ProductCategory()
        category
            .get_all()
            .then(res => {
                if (res.success) {
                    this.setState({category: res.result && res.result.filter(item=>item.isEnabled === 1)})
                }
            })
    }

    updateFields = (typeId) => {
        const {mod} = this.props
        const product = new Product()
        this.setState({fields: [],loading:true})
        product
            .get_fields(typeId)
            .then(res => {
                if (res.success) {
                    const fields = res.result
                    // this.setState({fields: fields})
                    mod.updateDynamicFormFields(fields)
                    this.setState({
                        loading:false
                    })
                }
            })
    }
    formatFieldType = (field) => {
        if (field.name == 'assistantId') {
            //助理
            field.typeCode = 'search_select'
            field.request = this.user.get_users_by_realName
            field.format = r => {
                return {value: r.id, label: `${r.realName}(${r.mobile})`}
            }
        } else if (field.name == 'receiverId') {
            //负责人
            field.typeCode = 'search_select'
            field.request = this.user.get_users_by_realName
            field.format = r => {
                return {value: r.id, label: `${r.realName}(${r.mobile})`}
            }
        }
        return field
    }

    changeCategory = (value) => {
        if(value){
            this.updateFields(value)
        }
    }
    renderDynamicFormItemList() {
        const fields = this.props.fields && this.props.fields.productFieldDtos && this
            .props
            .fields
            .productFieldDtos
            .map(this.formatFieldType) || [];


        const {formLayout} = this.state;
        const formItemLayout = formLayout === 'horizontal'
            ? {
                labelCol: {
                    span: 6
                },
                wrapperCol: {
                    span: 16
                }
            }
            : null;
        const BaseSelectFormItem = (
            <FormItem label="产品类别" key={0}>
                {this
                    .formUtils
                    .getFieldDecorator("typeId", {
                        validateTrigger: [
                            'onChange', 'onBlur'
                        ],
                        rules: [
                            {
                                required: true,
                                type: 'string',
                                whitespace: true,
                                message: "请选择产品类别",
                                min: 1,
                                max: 50
                            }
                        ]
                    })(
                        <Select allowClear placeholder='请选择' onChange={this.changeCategory}>
                            {this
                                .state
                                .category
                                .map(item => {
                                    return <Select.Option
                                        key={item.id}
                                        value={item
                                        .id
                                        .toString()}>{item.name}</Select.Option>
                                })}

                        </Select>
                    )}
            </FormItem>
        );

        const renderFormItem = (field, index) => {
            return index == 0
                ? BaseSelectFormItem
                : this.state.loading?null:<DynamicFormItem
                    key={index}
                    field={field}
                    formUtils={this.formUtils}
                    {...formItemLayout}/>
        };

        fields.unshift(BaseSelectFormItem);
        let leftCol = [],
            rightCol = [],
            index = 0;
        while (index < fields.length) {
            var field = fields[index];
            var nextField = fields[index + 1];

            {
                !field
                    ? null
                    : leftCol.push(renderFormItem(field, index))
            }
            {
                !nextField
                    ? null
                    : rightCol.push(renderFormItem(nextField, index + 1))
            }
            index = index + 2
        };

        return (
            <Row >
                <Col span={12}>{leftCol}</Col>
                <Col span={12}>{rightCol}</Col>
            </Row>
        )
    }
    render() {
        return (
            <div className={style.base_info}>
            <Form>
                {this.renderDynamicFormItemList()}
            </Form>
            </div>
        )
    }
}

InfoForm = Form.create()(InfoForm)

class ProductInfo extends Base {

    state = {
        loading: true,
        visible: false
    }

    submit(callback) {
        let values = false
        this
            .formUtils
            .validateFields((errors) => {
                if (!errors) {
                    values = extend(true,{},this
                        .formUtils
                        .getFieldsValue())
                    if (values.saleDate) {
                        //处理时间
                        values.saleDate = [
                            values
                                .saleDate[0]
                                .format("YYYY-MM-DD"),
                            values
                                .saleDate[1]
                                .format("YYYY-MM-DD")
                        ].join(',')
                    }

                    values = this.formatData(values)

                }
                callback(values)
            })
    }
    handleObjectValue(temp, source) {

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                if (v instanceof Object) {
                    temp.push(key)
                    this.handleObjectValue(temp, v)
                } else {
                    source[temp.join('.')] = v
                    temp = []
                }
            }
        }
    }
    formatData(values) {
        // const tempKeysObject = {}
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
                if (v instanceof Array) {
                    if( v[0] && v[0] instanceof Object &&  v[0]._isAMomentObject){
                        v[0]= v[0].format("YYYY-MM-DD")
                    }
                    if(v[1] && v[1] instanceof Object &&  v[1]._isAMomentObject){
                        v[1]= v[1].format("YYYY-MM-DD")
                    }
                    
                    v = v.join(',')
                }
                if (v instanceof Object && v._isAMomentObject) {
                    v = v.format("YYYY-MM-DD");
                }
                // if (v instanceof Object) {     const temp  = []
                // this.handleObjectValue(temp,values) }
                if (`${key}-number-1` || `${key}-number-2`) {
                    delete values[`${key}-number-1`]
                    delete values[`${key}-number-2`]
                }


                //对image类型进行特别处理

                this.props.fields && this.props.fields.productFieldDtos && this
                .props
                .fields
                .productFieldDtos.map(field=>{
                    if(field.name == key  && field.typeCode =='image'){
                        v = values[key].map(item=>item.id).join(',')
                    }
                })

                values[key] = v
            }
        }

        return values

    }
    constructor(props) {
        super(props);
        this.formUtils = new FormUtils("ProductInfo");
    }
    componentDidMount() {
        const {data} = this.props
        this
            .formUtils
            .setFieldsValue(data)
    }
    render() {
        return (
            <div className={style.product_detail}>
                <InfoForm mod={this.props.mod} fields={this.props.fields} formUtils={this.formUtils}/>
            </div>
        )
    }
}
//

export default ProductInfo
