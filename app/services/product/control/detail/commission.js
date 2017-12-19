import React, {Component} from "react";

import {TweenOneGroup} from 'rc-tween-one';

import PropTypes from "prop-types";

import {
    Layout,
    Form,
    Tabs,
    DatePicker,
    Input,
    InputNumber,
    Select,
    Row,
    Col,
    Icon,
    Affix,
    message
} from 'antd'

const {Header, Content, Footer, Sider} = Layout;

const InputGroup = Input.Group

const FormItem = Form.Item

// const {Option} = Select
const Option = Select.Option;

import GM from 'lib/gridManager.js'

import GridBase from 'base/gridMod'
const GridManager = GM.GridManager;

import style from './productDetailInfo.scss'

import Base from 'components/main/Base'

import CommissionForm from './commissionForm'

import FormUtils from 'lib/formUtils'

import Product from 'model/Product/'


let uuid = 0;

class CommissionInfoForm extends Base {
    constructor(props) {
        super(props)
    }
    componentWillMount() {
        this.formUtils = this.props.formUtils
        this
            .formUtils
            .setForm(this.props.form);
    }
    render() {
        const {data, formUtils} = this.props
        return (
            <Form>
                <CommissionForm data={data} formUtils={formUtils}/>
            </Form>
        )
    }
}

CommissionInfoForm = Form.create()(CommissionInfoForm)

class CommissionInfo extends GridBase {

    constructor(props) {
        super(props)
    }
    getColumns(type, key) {
        const {data} = this.props
        const centerTitle = <div>
            <Row>
                <Col span="6">销售金额(万)</Col>
                <Col span="6">佣金类型</Col>
                <Col span="6">前端佣金(%)</Col>
                <Col span="6">后端佣金(%)</Col>
            </Row>
        </div>
        const centerReader = (text, record, index) => {
            const childs = record.productCommissionDtos
            return childs && childs.map((child, index) => {
                return <Row
                    style={{
                    height: '40px',
                    lineHeight: '40px'
                }}
                    key={index}>
                    < Col span="6">
                        {child.saleMin}-{child.saleMax}</Col>
                    <Col span="6">
                        {child.commissionType == 'dic_commission_type_front_back'
                            ? '前端+后端佣金'
                            : '前端佣金'}
                    </Col>
                    < Col span="6">
                        {child.frontCommission}
                    </Col>
                    < Col span="6">
                        {child.backCommission}
                    </Col>
                </Row>
            })
        }
        const columns = [
            {
                title: "佣金规则",
                dataIndex: "ruleName",
                className:'name',
                width: 120,
                render: (text, record, index) => {
                    return record.ruleName || '--'
                }
            }, {
                title: centerTitle,
                dataIndex: "childs",
                width: 800,
                render: centerReader
            }, {
                title: "报价备注",
                dataIndex: "remark",
                className:'remark',
                render: (text, record, index) => {
                    return record.remark
                }
            }
        ];

        return columns;
    }
    render() {
        return (
            <div>
                <GridManager
                    noRowSelection={true}
                    autoWidth={false}
                    disabledAutoLoad={true}
                    columns={this.getColumns()}
                    dataSource={this.props.data}
                    gridWrapClassName={`grid-panel auto-width-grid`}
                    className={`multipleForm-table`}
                    mod={this}
                    rowKey={'key'}
                    onSelect={(selectData) => {
                    this.handleSelect(selectData)
                }}
                    pagination={false}
                    ref={gridManager => {
                    gridManager && (this.gridManager = gridManager);
                }}></GridManager>
            </div>
        )
    }
}

class Commission extends Base {
    state = {
        isEdit: false
    }
    constructor(props) {
        super(props)
    }
    componentWillMount() {
        this.formUtils = new FormUtils("ProductCommissionForm");
        this.product = new Product()
    }
    submit = () => {
        const {data, mod} = this.props
        let values = {}
        this
            .formUtils
            .validateFields((errors, value) => {
                console.log('errors', errors)
                if (!errors) {
                    values = this
                        .formUtils
                        .getFieldsValue()
                    //处理报价
                    console.log('values', values)
                    const commissionDtos = [];
                    for (var key in values) {
                        if (values.hasOwnProperty(key)) {
                            var value = values[key];

                            if (key.indexOf('Commission-') == 0) {
                                console.log(key)
                                console.log(value)
                                //处理销售佣金
                                const index = key.split('-')[2]
                                const childIndex = key.split('-')[3]
                                const name = key.split('-')[1]
                                if (!commissionDtos[index]) {
                                    commissionDtos[index] = {}
                                }
                                if (name == 'ruleName' || name == 'remark' || name == 'commissionId') {
                                    commissionDtos[index][name] = value

                                }
                                if (name == 'frontCommission' || name == 'commissionType' || name == 'id' || name == 'backCommission' || name == 'sale') {
                                    //处理单条报价
                                    if (!commissionDtos[index]['productCommissionDtos']) {
                                        commissionDtos[index]['productCommissionDtos'] = []
                                    }
                                    if (childIndex) {
                                        const innerIndex = childIndex.split('_')[1]
                                        if (!commissionDtos[index]['productCommissionDtos'][innerIndex]) {
                                            commissionDtos[index]['productCommissionDtos'][innerIndex] = {}
                                        }
                                        if (name == 'sale' && value) {
                                            // if (key == `Commission-sale-${index}-${innerIndex}-number-1`) {
                                            commissionDtos[index]['productCommissionDtos'][innerIndex]['saleMin'] = value.split(',')[0]
                                            // } if (key == `Commission-sale-${index}-${innerIndex}-number-2`) {
                                            commissionDtos[index]['productCommissionDtos'][innerIndex]['saleMax'] = value.split(',')[1]
                                            // }
                                        } else {
                                            commissionDtos[index]['productCommissionDtos'][innerIndex][name] = value
                                        }

                                    }
                                }
                                delete values[key]
                            }
                        }
                    }

                    if (commissionDtos.length) {
                        values['commissionDtos'] = JSON.stringify(commissionDtos.filter(item => item != null).map(item => {
                            item.productCommissionDtos = item.productCommissionDtos.filter(item => item != null)
                            item.id = item.commissionId
                            delete item.commissionId
                            return item
                        }))
                    }
                    values.productId = data.id
                    this
                        .product
                        .update_commission(values)
                        .then(res => {
                            if (res.success) {
                                message.success('更新产品佣金报价成功')
                                // mod.reloading()
                                mod.loadData()
                                this.setState({
                                    isEdit:false
                                })
                            }
                        })
                }
            })
    }
    genneratorFix= (children)=>{
        const {mod} = this.props
        return mod.state.visible ?<Affix target={() => mod.affixContainer}>
        {children}
        </Affix>:children
    }
    render() {
        const {data, mod} = this.props
        const canEdit = data.commissionDto.permission.editPermission && data.examineStatus != 1
        const canRead = data.commissionDto.permission.readPermission
        const icons = []
        if (this.state.isEdit) {
            icons.push(
                <img className='anticon' index={0}  src='/assets/images/icon/取消@1x.png' srcSet='/assets/images/icon/取消@2x.png'  onClick={e => {
                    this.setState({isEdit: false})
                }}/>
           )
            icons.push(
                <img className='anticon' index={1}  src='/assets/images/icon/确认@1x.png'  srcSet='/assets/images/icon/确认@2x.png'  onClick={this.submit}/>
            )
        } else {
            if (canRead && canEdit) {
                icons.push(
                    <img className='anticon anticon-edit' index={2}  src='/assets/images/icon/编辑@1x.png'  srcSet='/assets/images/icon/编辑@2x.png'  onClick={e => {
                        this.setState({isEdit: true})
                    }}/>
                )
            }
        }


        return (
            <div className={style.card}>
               {this.genneratorFix(
                <div className={style.header}>
                    <div className={style.title}>佣金报价</div>
                    <div className={style.icons}>{icons}</div>
                </div>)}
                <div className={style.content}>
                <div className={style.commission}>
                    {!canRead?'无权限查看':this.state.isEdit
                        ? <CommissionInfoForm formUtils={this.formUtils} data={JSON.parse(JSON.stringify(data))}/>
                        : <CommissionInfo data ={JSON.parse(JSON.stringify(data.commissionDto.data))}/>}
                        </div>
                </div>
            </div>
        )
    }
}

export default Commission
