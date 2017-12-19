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

const FormItem = Form.Item;

const Option = Select.Option;
const RadioGroup = Radio.Group;

import style from "./customerDetail.scss";

import Customer from "model/Customer/";
import Dictionary from "model/dictionary";

import FormUtils from "lib/formUtils";

import Base from "components/main/Base";

import moment from "moment";

import extend from "extend";

import Upload from "components/upload/";

const NAME = "CustomerBaseInfoForm";

class CustomerDetailBaseInfoForm extends Base {
    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data,
            dic: {}
        };
    }

    componentWillMount() {
        this.formUtils = this.props.formUtils || this.formUtils;
        this
            .formUtils
            .setForm(this.props.form);
        const dictionary = new Dictionary();
        dictionary
            .gets("dic_customer_credentials")
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
            });
    }
    getDicSelections(ChildComponent, code) {
        return (this.state.dic[code] && this.state.dic[code].selections && this.state.dic[code].selections.map(item => {
            return (
                <ChildComponent value={item.value} key={item.value}>
                    {item.label}
                </ChildComponent>
            );
        }));
    }
    componentWillReceiveProps(nextProps) {
        // You don't have to do this check first, but it can help prevent an unneeded
        // render
        if (nextProps.data !== this.state.data) {
            const data = this.formatData(nextProps.data);
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
            });
        }
    }
    formatData = values => {
        return values;
    };
    render() {
        const {data} = this.props;
        const formItemLayout = {
            labelCol: {
                span: 24
            },
            wrapperCol: {
                span: 8
            }
        };
        return (
            <div id="CustomerBaseInfoForm">
                <Form>

                    <FormItem label="证件类型" {...formItemLayout}>
                        {this
                            .formUtils
                            .getFieldDecorator("type", {
                                initialValue: data.certType
                                    ? data
                                        .certType
                                        .toString()
                                    : null
                            })(
                                <Select
                                    placeholder="请选择证件类型"
                                    size="large"
                                    allowClear={true}
                                    getPopupContainer={() => document.getElementById("CustomerBaseInfoForm")}>
                                    {this.getDicSelections(Option, "dic_customer_credentials")}
                                </Select>
                            )}
                    </FormItem>
                    <FormItem label="证件号码" {...formItemLayout}>
                        {this
                            .formUtils
                            .getFieldDecorator("number", {initialValue: data.certNo})(<Input/>)}
                    </FormItem>
                    <FormItem label="证件正反面" labelCol={{
                        span:24
                    }} wrapperCol={{
                        span:24
                    }}>
                        <ul className={style.images}>
                            <li className={style.image}>
                                {this
                                    .formUtils
                                    .getFieldDecorator("front", {initialValue: data.certFront})(<Input type="hidden"/>)}
                                <Upload
                                    showUploadList={false}
                                    accept="png,jpg,jpeg,gif"
                                    max={1}
                                    onSave={file => {
                                    this
                                        .formUtils
                                        .setFieldsValue({front: file.url});
                                }}>
                                    {this
                                        .formUtils
                                        .getFieldValue("front")
                                        ? (
                                            <div className={style.uploaded}>
                                                <img
                                                    src={this
                                                    .formUtils
                                                    .getFieldValue("front")}
                                                    alt="证件正面"/>
                                                <div className={style.btns}>
                                                    <Icon
                                                        type="close"
                                                        onClick={e => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        this
                                                            .formUtils
                                                            .setFieldsValue({front: ""});
                                                    }}/>
                                                </div>
                                            </div>
                                        )
                                        : (
                                            <div className={style.upload_btn}>
                                                <Icon type="plus"/>
                                                <p>上传正面</p>
                                            </div>
                                        )}
                                </Upload>
                            </li>
                            <li className={style.image}>
                                {this
                                    .formUtils
                                    .getFieldDecorator("back", {initialValue: data.certBack})(<Input type="hidden"/>)}
                                <Upload
                                    showUploadList={false}
                                    accept="png,jpg,jpeg,gif"
                                    max={1}
                                    onSave={file => {
                                    this
                                        .formUtils
                                        .setFieldsValue({back: file.url});
                                }}>
                                    {this
                                        .formUtils
                                        .getFieldValue("back")
                                        ? (
                                            <div className={style.uploaded}>
                                                <img
                                                    src={this
                                                    .formUtils
                                                    .getFieldValue("back")}
                                                    alt="证件反面"/>
                                                <div className={style.btns}>
                                                    <Icon
                                                        type="close"
                                                        onClick={e => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        this
                                                            .formUtils
                                                            .setFieldsValue({back: ""});
                                                    }}/>
                                                </div>
                                            </div>
                                        )
                                        : (
                                            <div className={style.upload_btn}>
                                                <Icon type="plus"/>
                                                <p>上传反面</p>
                                            </div>
                                        )}
                                </Upload>
                            </li>
                        </ul>
                    </FormItem>

                </Form>

            </div>
        );
    }
}

CustomerDetailBaseInfoForm = Form.create()(CustomerDetailBaseInfoForm);

export default class CustomerDetailBaseInfo extends Base {
    constructor(props) {
        super(props);
    }
    componentWillMount() {
        this.customer = new Customer();
        this.formUtils = new FormUtils(NAME);
    }
    state = {
        isEdit: false
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.data.id != this.props.data.id) {
            //加载不同的资料 设置为非编辑状态
            this.setState({isEdit: false});
        }
    }

    submit = () => {
        const {data, mod} = this.props;
        let values = false;
        this
            .formUtils
            .validateFields(errors => {
                if (!errors) {
                    values = this
                        .formUtils
                        .getFieldsValue();

                    values = this.formatData(values);
                    values.id = data.id;
                    this
                        .customer
                        .update_credentials(values)
                        .then(res => {
                            if (res && res.success) {
                                message.success("更新实名认证成功");
                                // mod.reloading();
                                mod.loadData()
                                this.setState({isEdit: false});
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
                    v = moment(v).format("YYYY-MM-DD");
                } else if (v instanceof moment) {
                    v = moment(v).format("YYYY-MM-DD");
                }
                if (v instanceof Object && v._isAMomentObject) {
                    v = v.format("YYYY-MM-DD");
                }
                values[key] = v;
            }
        }

        return values;
    }
    genneratorFix= (children)=>{
        const {mod} = this.props
        return mod.state.visible ?<Affix target={() => mod.affixContainer}>
        {children}
        </Affix>:children
    }
    render() {
        const {data} = this.props;
        if (!data) {
            return null;
        }

        const canEdit = data.info.permission.editPermission;
        const canRead = data.info.permission.readPermission;
        let info = JSON.parse(JSON.stringify(data.info.data));
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
            icons.push(<img
                className="anticon"
                index={0}
                src="/assets/images/icon/取消@1x.png"
                srcSet="/assets/images/icon/取消@2x.png"
                onClick={e => {
                this.setState({isEdit: false});
            }}/>);
            icons.push(<img
                className="anticon"
                index={1}
                src="/assets/images/icon/确认@1x.png"
                srcSet="/assets/images/icon/确认@2x.png"
                onClick={this.submit}/>);
        } else {
            if (canRead && canEdit) {
                icons.push(<img
                    className="anticon anticon-edit"
                    index={2}
                    src="/assets/images/icon/编辑@1x.png"
                    srcSet="/assets/images/icon/编辑@2x.png"
                    onClick={e => {
                    this.setState({isEdit: true});
                }}/>);
            }
        }
        info.certType = info.credential
            ? info.credential.type
            : null;
        info.certNo = info.credential
            ? info.credential.number
            : null;
      
        info.certType = info.certType
            ? info
                .certType
                .toString()
            : null;
        info.certFront = info.credential
            ? info.credential.front
            : null;
        info.certBack = info.credential
            ? info.credential.back
            : null;


        return (
            <div className={style.card}>
                <div className={style.header}>
                        <div className={style.title}>身份证件认证</div>
                        <div className={style.icons}>{icons}</div>
                    </div>
                    
                <div className={style.content}>
                    {!canRead
                        ? ("暂无权限查看")
                        : this.state.isEdit
                            ? (<CustomerDetailBaseInfoForm data={info} formUtils={this.formUtils}/>)
                            : (
                                <Form>
                                    <FormItem label="证件类型" {...formItemLayout}>
                                        {info.credential && info.credential.typeText}
                                    </FormItem>
                                    <FormItem label="证件号码" {...formItemLayout}>
                                        {info.certNo}
                                    </FormItem>
                                    <FormItem label="证件正反面" {...formItemLayout}>
                                        <ul className={style.images}>
                                            {!info.certFront
                                                ? null
                                                : (
                                                    <li className={style.image}>
                                                        <a href={info.certFront} target="_blank">
                                                            <img src={info.certFront} alt="证件正面"/>
                                                        </a>
                                                    </li>
                                                )}
                                            {!info.certBack
                                                ? null
                                                : (
                                                    <li className={style.image}>
                                                        <a href={info.certBack} target="_blank">
                                                            <img src={info.certBack} alt="证件反面"/>
                                                        </a>
                                                    </li>
                                                )}
                                        </ul>
                                    </FormItem>

                                </Form>
                            )}
                </div>
            </div>
        );
    }
}
