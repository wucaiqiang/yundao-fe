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
import Utils from "utils/index";

import moment from "moment";


const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group

const CheckboxGroup = Checkbox.Group

class EditVideoForm extends Base {
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

        this.formUtils = new FormUtils("EditVideoForm");
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
                        <FormItem label="视频名称" {...formItemLayout}>
                            {data.name}
                        </FormItem>
                    )
                    : (
                        <FormItem label="视频名称" {...formItemLayout}>
                            {this
                                .formUtils
                                .getFieldDecorator("name", {
                                    initialValue: data.name,
                                    validateTrigger: [
                                        "onChange", "onBlur"
                                    ],
                                    rules: [
                                        {
                                            min:1,
                                            max:50,
                                            required: true,
                                            message: "视频名称,长度1-50"
                                        }
                                    ]
                                })(<Input/>)}
                        </FormItem>
                    )}
                <FormItem label="时长" {...formItemLayout}>
                    {data.duration ? Utils.formatTime(data.duration):null}
                </FormItem>
                <FormItem label="大小" {...formItemLayout}>
                    {data.size?Utils.bytesToSize(data.size):null}
                </FormItem>
                <FormItem label="创建人" {...formItemLayout}>
                    {data.createUserName}
                </FormItem>
                <FormItem label="创建时间" {...formItemLayout}>
                    {data.createDate?Utils.formatDate(data.createDate):null}
                </FormItem>
            </Form>
        );
    }
}
EditVideoForm = Form.create()(EditVideoForm);

export default EditVideoForm;
