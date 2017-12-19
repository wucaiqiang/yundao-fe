import React, {Component} from "react";
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

const FormItem = Form.Item

const Option = Select.Option;
const RadioGroup = Radio.Group

import style from "./customerDetail.scss";

import Customer from 'model/Customer/'
import Dictionary from 'model/dictionary'

import FormUtils from "lib/formUtils";

import extend from 'extend'

import moment from 'moment'

import Base from "components/main/Base";

import Upload from 'components/upload/'

const NAME = 'CustomerInvestInfoForm'

class CustomerDetailInvestInfoForm extends Base {
    constructor(props) {
        super(props)
        this.state = {
            data: this.props.data,
            dic: {},
            category: []
        }

    }

    componentWillMount() {
        this.formUtils = this.props.formUtils || this.formUtils;
        this
            .formUtils
            .setForm(this.props.form);
        const dictionary = new Dictionary()
        dictionary
            .gets('dic_customer_invest_type')
            .then(res => {
                if (res.success && res.result) {
                    let dic = {};
                    res
                        .result
                        .map(item => {
                            dic[item.value] = item;
                        });

                    this.setState({dic});
                }
            })
    }
    getDicSelections(ChildComponent, code) {
        return this.state.dic[code] && this.state.dic[code].selections && this
            .state
            .dic[code]
            .selections
            .map(item => {
                return <ChildComponent value={item.value} key={item.value}>{item.label}</ChildComponent>
            })
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.state.data) {
            const data = this.formatData(nextProps.data)
            this.setState({
                data
            }, () => {
                if (this.formUtils) {
                    this
                        .formUtils
                        .resetFields();
                    this
                        .formUtils
                        .setFieldsValue(data);
                }
            })
        }
    }
    formatData = values => {
        // values.birthday = values.birthday     ? moment(values.birthday)     : null
        return values
    }
    render() {
        let {data} = this.props
        const formItemLayout = {
            labelCol: {
                span: 24
            },
            wrapperCol: {
                span: 8
            }
        }

        data.type = data.type
            ? data
                .type
                .toString()
            : null

        return (
            <div id={NAME}>
                <Form>
                    <FormItem label="资产证明"  labelCol={{
                        span:24
                    }} wrapperCol={{
                        span:24
                    }}>
                        {this
                            .formUtils
                            .getFieldDecorator("assets", {
                                initialValue: data.assets || []
                            })(<Input type="hidden"/>)}
                        <ul className={style.images}>
                            {this
                                .formUtils
                                .getFieldValue("assets")
                                .map(item => {
                                    return (
                                        <li className={style.image}>
                                            <div className={style.uploaded}>
                                                <img src={item.url} alt="资产证明"/>
                                                <div className={style.btns}>
                                                    <Icon
                                                        type="close"
                                                        onClick={e => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        const assets = this
                                                            .formUtils
                                                            .getFieldValue("assets");
                                                        this
                                                            .formUtils
                                                            .setFieldsValue({
                                                                assets: assets.filter(asset => asset.url != item.url)
                                                            });
                                                    }}/>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            {this
                                .formUtils
                                .getFieldValue("assets")
                                .length < 9
                                ? (
                                    <li className={style.image}>
                                        <Upload
                                            accept="png,jpg,jpeg,gif"
                                            showUploadList={false}
                                            max={1}
                                            onSave={file => {
                                            let assets = this
                                                .formUtils
                                                .getFieldValue("assets");
                                            assets.push({url: file.url, name: file.name});
                                            this
                                                .formUtils
                                                .setFieldsValue({assets: assets});
                                        }}>
                                            <div className={style.upload_btn}>
                                                <Icon type="plus"/>
                                                <p>上传照片</p>
                                            </div>
                                        </Upload>
                                    </li>
                                )
                                : null}
                        </ul>
                    </FormItem>
                    <FormItem label="投资人类型" {...formItemLayout}>
                        {this
                            .formUtils
                            .getFieldDecorator("type", {
                                initialValue: data.type,
                                rules: [
                                    {
                                        validator: (rule, value, callback) => {
                                            if (value == 2) {
                                                const assets = this
                                                .formUtils
                                                .getFieldValue("assets");
                                                if (!assets || !assets.length) {
                                                    callback('请为客户上传资产证明，并确认客户符合专业投资人标准后再选择该选项')
                                                }
                                            }
                                            callback()
                                        }
                                    }
                                ]
                            })(
                                <Select
                                    size="large"
                                    placeholder='请选择'
                                    allowClear={true}
                                    getPopupContainer={() => document.getElementById(NAME)}>
                                    {this.getDicSelections(Option, 'dic_customer_invest_type')}
                                </Select>
                            )}
                    </FormItem>
                </Form>
            </div>
        )
    }
}

CustomerDetailInvestInfoForm = Form.create()(CustomerDetailInvestInfoForm)

export default class CustomerDetailInvestInfo extends Component {
    componentWillMount() {
        this.customer = new Customer()
        this.formUtils = new FormUtils(NAME);
    }
    state = {
        isEdit: false
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data.id != this.props.data.id) {
            //加载不同的资料 设置为非编辑状态
            this.setState({isEdit: false})
        }
    }

    submit = () => {
        const {data, mod} = this.props
        let values = false
        this
            .formUtils
            .validateFields((errors) => {
                console.log(errors)
                if (!errors) {
                    values = this
                        .formUtils
                        .getFieldsValue()

                    values = this.formatData(values)
                    values.id = data.id
                    values.assets = JSON.stringify(values.assets)
                    this
                        .customer
                        .update_assets(values)
                        .then(res => {
                            if (res && res.success) {
                                message.success('更新资产证明成功')
                                // mod.reloading()
                                mod.loadData()
                                this.setState({isEdit: false})
                            }
                        })

                }

            })
    }
    formatData(values) {
        for (var key in values) {
            if (values.hasOwnProperty(key)) {
                var v = values[key];
                if (typeof v == "string") {
                    v = v.replace(/^\s*|\s*$/g, "");
                }
                values[key] = v
            }
        }

        return values

    }

    genneratorFix= (children)=>{
        const {mod} = this.props
        return mod.state.visible ?<Affix target={() => mod.affixContainer}>
        {children}
        </Affix>:children
    }
    render() {

        const {data} = this.props
        if (!data) {
            return null
        }

        const canEdit = data.info.permission.editPermission
        const canRead = data.info.permission.readPermission
        const info = JSON.parse(JSON.stringify(data.info.data))
        const formItemLayout = {
            labelCol: {
                span: 24
            },
            wrapperCol: {
                span: 24
            }
        }

        const icons = []

        if (this.state.isEdit) {
            icons.push(<img
                className='anticon'
                index={0}
                src='/assets/images/icon/取消@1x.png'
                srcSet='/assets/images/icon/取消@2x.png'
                onClick={e => {
                this.setState({isEdit: false})
            }}/>)
            icons.push(<img
                className='anticon'
                index={1}
                src='/assets/images/icon/确认@1x.png'
                srcSet='/assets/images/icon/确认@2x.png'
                onClick={this.submit}/>)
        } else {
            if (canRead && canEdit) {
                icons.push(<img
                    className='anticon anticon-edit'
                    index={2}
                    src='/assets/images/icon/编辑@1x.png'
                    srcSet='/assets/images/icon/编辑@2x.png'
                    onClick={e => {
                    this.setState({isEdit: true})
                }}/>)
            }
        }

        info.investTypes = info.investTypes && info.investTypes.length
            ? info
                .investTypes
                .map(item => item.productTypeId.toString())
            : []
        info.assets = info.attachDtos

        return (
            <div className={style.card}>
                <div className={style.header}>
                        <div className={style.title}>资产证明</div>
                        <div className={style.icons}>{icons}</div>
                    </div>
                   
                <div className={style.content}>
                    {!canRead
                        ? '暂无权限查看'
                        : this.state.isEdit
                            ? <CustomerDetailInvestInfoForm data={info} formUtils={this.formUtils}/>
                            : <Form>
                                <FormItem label="资产证明" {...formItemLayout}>
                                    <ul className={style.images}>
                                        {info
                                            .attachDtos
                                            .map(item => {
                                                return (
                                                    <li className={style.image}>
                                                        <a href={item.url} target="_blank">
                                                            <img src={item.url} alt=""/>
                                                        </a>
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                </FormItem>
                                <FormItem label="投资者类型" {...formItemLayout}>
                                    {info.typeText}
                                </FormItem>
                            </Form>}
                </div>
            </div>
        )
    }
}
