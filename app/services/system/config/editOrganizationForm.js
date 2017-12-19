import React, {Component} from 'react';
import {
    Select,
    Cascader,
    Input,
    DatePicker,
    Tag,
    Checkbox,
    Radio,
    Button,
    Table,
    Modal,
    Form,
    Menu,
    Pagination,
    Spin,
    message,
    Icon,
    Tabs,
    TreeSelect
} from 'antd'
import moment from 'moment';
import FormUtils from '../../../lib/formUtils'
import utils from '../../../utils/'

const SubMenu = Menu.SubMenu;

const FormItem = Form.Item
const RadioGroup = Radio.Group

import style from './editOrganizationForm.scss'

let uuid = 0;

const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const TreeNode = TreeSelect.TreeNode;

import Base from '../../../components/main/Base'

class editOrganizationForm extends Base {
    constructor() {
        super();
        this.state = {
            loading: false,
            products: [],
            productCount: 0,
            selectedCustomers: [],
            currentTab: '0',
            money: 0,
            isCreateByCustomer: false,
            investmentType: "1"
        }
        this.formUtils = new FormUtils("editOrganizationForm");
        this.userInfo = utils.getStorage('userInfo')
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
    }

    componentDidMount() {}

    getFormClassName() {
        let cls;

        cls = ["float-slide-form", "vant-spin", "follow-form"];
        if (this.state.loading) {
            cls.push("loading");
        }
        return cls.join(" ");
    }

    onChange = (value) => {
        this.setState({value});
    }

    transformDepartmentTree = (items, dist,disabled) => {
        //如果父节点被禁止使用 所有子节点被禁止点击 否则 判断当前节点是否等于传入进来的默认节点 假如是的话 则当前节点禁止点击 并且子节点禁止点击
        let childrenDisabled = false
        if (disabled == true) {
            childrenDisabled = true
        }
        return items.length && items.map((item, index) => {
            if (item.childs && item.childs.length) {
                let disabled = true
                if (!childrenDisabled) {
                    disabled = dist == item.id
                        ? true
                        : false
                }
                return <TreeNode
                    disabled={disabled}
                    value={item
                    .id
                    .toString()}
                    title={item.name}
                    key={item
                    .id
                    .toString()}>
                    {this.transformDepartmentTree(item.childs,dist, disabled)}
                </TreeNode>
            } else {
                let disabled = true
                if (!childrenDisabled) {
                    disabled = dist == item.id
                        ? true
                        : false
                }
                return <TreeNode
                    disabled={disabled}
                    value={item
                    .id
                    .toString()}
                    title={item.name}
                    key={item
                    .id
                    .toString()}/>
            }
        })
    }

    render() {
        let formUtils;
        formUtils = this.formUtils;

        const formItemLayout = {
            labelCol: {
                span: 5
            },
            wrapperCol: {
                span: 19
            }
        };

        const tProps = {
            value: this.state.value,
            onChange: this.onChange,
            showCheckedStrategy: SHOW_PARENT,
            treeDefaultExpandAll: true,
            searchPlaceholder: '请选择可见范围',
        };

        return (
            <div className={style.body}>
                <Form className={this.getFormClassName()}>
                    <FormItem label="部门名称" {...formItemLayout}>
                        {this
                            .props
                            .formUtils
                            .getFieldDecorator("name", {
                                initialValue: this.props.data.name,
                                validateTrigger: [
                                    'onChange', 'onBlur'
                                ],
                                rules: [
                                    {
                                        required: true,
                                        type: 'string',
                                        whitespace: true,
                                        message: "请填写长度不超过30个字符的部门名称",
                                        min: 1,
                                        max: 30
                                    }
                                ]
                            })(<Input type="text"/>)}
                    </FormItem>
                    <FormItem label="上级部门" {...formItemLayout}>
                        {this
                            .props
                            .formUtils
                            .getFieldDecorator("parentId", {
                                initialValue: this
                                    .props
                                    .data
                                    .parentId
                                    .toString(),
                                rules: [
                                    {
                                        required: true,
                                        message: "请选择上级部门"
                                    }
                                ]
                            })(
                                <TreeSelect {...tProps}>
                                    <TreeNode value='0' title={this.userInfo && this.userInfo.tenantName} key='0'>
                                        {this.transformDepartmentTree(utils.getStorage('department'),this.props.data.id)}
                                    </TreeNode>
                                </TreeSelect>
                            )}

                    </FormItem>
                </Form>
            </div>
        )
    }
}
editOrganizationForm = Form.create()(editOrganizationForm);

export default editOrganizationForm;
