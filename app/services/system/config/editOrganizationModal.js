import React, {Component} from 'react'
import {
    Select,
    Cascader,
    Input,
    DatePicker,
    Tag,
    Checkbox,
    Button,
    Table,
    Modal,
    Form,
    Pagination,
    Spin,
    Menu,
    message
} from 'antd'
import FormUtils from '../../../lib/formUtils'
import EditOrganizationForm from './editOrganizationForm'

const SubMenu = Menu.SubMenu;

import style from './editOrganizationModal.scss'

import Department from '../../../model/Department/'

import Base from '../../../components/main/Base'

class editOrganizationModal extends Base {
    constructor() {
        super();
        this.state = {
            loading: false,
            visible: false,
            currentTab: '0'
        }
        this.formUtils = new FormUtils("editOrganizationModal");
    }
    handleCancel = () => {
        this.setState({visible: false})
    }
    show(data) {
        this.setState({visible: true})
        this.setState({formData: data})
        data.parentId = data.parentId.toString()
        this.formUtils.resetFields()
        this.formUtils.setFieldsValue(data)
    }

    handleSetForm(form) {
        this.form = form
    }

    handleSubmit(e) {
        e && e.preventDefault();
        const department = new Department()
        this
            .formUtils
            .validateFields((errors) => {
                if (!errors) {
                    const values = this
                        .formUtils
                        .getFieldsValue()
                    console.log('modal values:',values)
                    let request = null
                    if (this.state.formData.id) {
                        values.id = this.state.formData.id
                        request = department.edit
                        //编辑
                    } else {
                        //新增
                        request = department.add
                    }
                    values.parentId =Number(values.parentId)
                    request(values).then(res => {
                        if (res.success) {
                            this.setState({
                                visible:false
                            })
                            this
                                .props
                                .submit(values)
                        }
                    })
                }
            });
    }

    render() {
        let formUtils;

        const formItemLayout = {
            labelCol: {
                span: 7
            },
            wrapperCol: {
                span: 17
            }
        };
        formUtils = this.props.formUtils || this.formUtils;
        this.formUtils = formUtils;

        return (
            <Modal
                visible={this.state.visible}
                title={(this.state.formData && this.state.formData.id
                ? '编辑'
                : '新增') + '部门'}
                maskClosable={false}
                width={552}
                className={`vant-modal editOrganizationModal yundao-modal ${style.modal}`}
                wrapClassName="vertical-center-modal"
                onCancel={this.handleCancel}
                footer={[< Button onClick = {
                    this.handleCancel
                } > 关闭 </Button>, <Button type="primary" onClick={() => this.handleSubmit()}>保存</Button >]}>
                <div className={style.body}>
                    <div className={style.tabContent}>
                        <EditOrganizationForm
                            formUtils={this.formUtils}
                            data={this.state.formData}
                            formType={this.state.currentTab}
                            setForm={(form) => this.handleSetForm(form)}
                            isEdit={this.props.isEdit}
                            ref="editOrganizationForm"/>
                    </div>
                </div>
            </Modal>
        )
    }
}

export default editOrganizationModal;
