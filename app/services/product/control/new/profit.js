import React, {Component} from "react";

import {
    Layout,
    Form,
    Tabs,
    DatePicker,
    Input,
    InputNumber,
    Select
} from 'antd'

const {Header, Content, Footer, Sider} = Layout;

const InputGroup = Input.Group

const FormItem = Form.Item

const {TabPane} = Tabs

const RangePicker = DatePicker.RangePicker;
// const {Option} = Select
const Option = Select.Option;

import Base from '../../../../components/main/Base'
import FormUtils from '../../../../lib/formUtils'

import NumberRange from '../../../../components/Form/NumberRange'


import GM from '../../../../lib/gridManager.js'
const GridManager = GM.GridManager;
const GridInputFilter = GM.GridInputFilter;
const GridSortFilter = GM.GridSortFilter;
const FilterBar = GM.FilterBar;

import ProfitTable from './profitTable'
import style from './profit.scss'
class ProfitForm extends Base {

    constructor(props) {
        super(props);
    }
    componentWillMount() {
        this.formUtils = this.props.formUtils || this.formUtils;
        this
            .formUtils
            .setForm(this.props.form);
    }

    render() {

        return (
            <div className={style.profit}>
            <Form layout={'vertical'}>
                <ProfitTable data={this.props.data} formUtils={this.formUtils}/>
            </Form>
            </div>
        )
    }
}

ProfitForm = Form.create()(ProfitForm)

class Profit extends Base {

    state = {
        loading: true,
        visible: false
    }
    submit(callback) {
        let values = false
        this
            .formUtils
            .validateFields((errors, value) => {
                if (!errors) {
                    values = this
                        .formUtils
                        .getFieldsValue()
                    const incomeDtos= [];
                    for (var key in values) {
                        if (values.hasOwnProperty(key)) {
                            var value = values[key];
                            if(key.indexOf('Profit')>-1){
                                //处理收益模式
                                const index = key.split('-')[2]
                                const childIndex = key.split('-')[3]
                                const name = key.split('-')[1]
                                if(!incomeDtos[index]){
                                    incomeDtos[index] = {}
                                }
                                if(name == 'ruleName' || name == 'remark'){
                                    incomeDtos[index][name] = value
                                    
                                }
                                if(  name =='buy'|| name == 'buyTimeLimit' || name == 'incomeType' ||name == 'fixIncomeRate' || name == 'floatIncomeRate' ){
                                    //处理单条报价
                                    if(!incomeDtos[index]['productIncomeDtos']){
                                        incomeDtos[index]['productIncomeDtos'] =[]
                                    }
                                    if(childIndex){
                                        const innerIndex = childIndex.split('_')[1]
                                        if(!incomeDtos[index]['productIncomeDtos'][innerIndex]){
                                            incomeDtos[index]['productIncomeDtos'][innerIndex] = {}
                                        }
                                        if(name == 'buy' && value){
                                            // if(key == `Trade-buy-${index}-${innerIndex}-number-1`){
                                                incomeDtos[index]['productIncomeDtos'][innerIndex]['buyMin']=value.split(',')[0]
                                            // }
                                            // if(key == `Trade-buy-${index}-${innerIndex}-number-2`){
                                                incomeDtos[index]['productIncomeDtos'][innerIndex]['buyMax']=value.split(',')[1]
                                            // }
                                        }else{
                                            incomeDtos[index]['productIncomeDtos'][innerIndex][name]=value
                                        }
                                    }
                                }
                                delete  values[key]
                            }
                            
                        }
                    }
                    if(incomeDtos.length){
                        values['incomeDtos'] = JSON.stringify(incomeDtos.filter(item => item != null).map(item=>{
                            item.productIncomeDtos = item.productIncomeDtos.filter(item=>item!=null)
                            return item
                          }))
                    }
                }
                callback(values)
            })
        // return values
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
                <ProfitForm  data = {this.props.data} formUtils={this.formUtils}/>
            </div>
        )
    }
}

export default Profit