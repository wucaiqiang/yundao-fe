import React from "react";
import ReactDOM from "react-dom";
import { Button, Form, DatePicker,Select, Input, Modal, message } from "antd";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Assets from "model/Assets/index";
import Dictionary from "model/dictionary";

import style from "./addRoundModal.scss";

const FormItem = Form.Item;
const Option = Select.Option;

import moment from 'moment'

class AddAdviceForm extends Base {
  state={
    filters:{}
  }
  constructor() {
    super();
    this.formUtils = new FormUtils("AddAdviceForm");
  }
  componentWillMount() {
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
    this.dictionary = new Dictionary();
    this.getDictionary()
  }
  getDictionary() {
    this
      .dictionary
      .gets("dic_project_round")
      .then(res => {
        if (res.success && res.result) {
          let filters = {};
          res
            .result
            .map(item => {
              filters[item.value] = item.selections;
            });

          this.setState({filters});
        }
      });
  }
  
  render() {
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 18
      }
    };
    const {dic_project_round} = this.state.filters
    const {data} = this.props
    return (
      <Form
        className={`float-slide-form vant-spin follow-form`}
        ref={ref => (this.container = ReactDOM.findDOMNode(ref))}
      >
      <FormItem label="融资轮次" {...formItemLayout}>
          {data.id?data.roundText:this.props.formUtils.getFieldDecorator("round", {
            rules: [
              {
                required: true,
                message: "请选择融资轮次",
              }
            ]
          })(
            <Select
              getPopupContainer={() => this.container}
              size="large"
              allowClear={true}
              placeholder="请选择融资轮次"
            >
            {dic_project_round && dic_project_round.map(item=>{
              return <Option key={item.value} value={item.value}>
                {item.label}
              </Option>
              })}
            </Select>
          )}
        </FormItem>
        <FormItem style={{display:'none'}}>
          {this.props.formUtils.getFieldDecorator("projectId", {
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem style={{display:'none'}}>
          {this.props.formUtils.getFieldDecorator("id", {
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem label="融资时间" {...formItemLayout}>
          {this.props.formUtils.getFieldDecorator("time", {
            validateTrigger: ["onChange", "onBlur"],
            rules: [
              {
                required: true,
                message: "请选择融资时间",
              }
            ]
          })(<DatePicker getCalendarContainer={()=>this.container} placeholder="请选择融资时间" size="large" />)}
        </FormItem>
      </Form>
    );
  }
}

const WrappedAddAdviceForm = Form.create()(AddAdviceForm);

export default class AddAdviceModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      isEdit: false,
      formData: {},
      action: null
    };

    this.formUtils = new FormUtils("addAdviceModal");
  }
  componentWillMount() {
    this.assets = new Assets();
    
  }
  

  componentDidMount() {}
  show = (data = {}) => {
    console.log('data',data)
    this.setState({ visible: true,data,isEdit:data.id?true:false }, () => {
      this.formUtils.resetFields();
      data.time = moment(data.time)
      this.formUtils.setFieldsValue(data)
    });
  };
  handleClose = () => {
    this.setState({ visible: false });
  };
  handleSubmit = e => {
    e && e.preventDefault();
    const {isEdit} = this.state
    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formatData(this.formUtils.getFieldsValue())
        const request = this.state.isEdit? this.assets.financing_update_round:this.assets.financing_add_round;
        request(formData).then(res => {
          if (res.success) {
            this.setState({
              visible: false
            });
            message.success(`${isEdit?'编辑':'新增'}融资信息成功`);
            this.props.reload && this.props.reload();
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
          v = moment(v).format("YYYY-MM-DD HH:mm:ss");
        } else if (v instanceof moment) {
          v = moment(v).format("YYYY-MM-DD HH:mm:ss");
        }
        if (v instanceof Array) {
          v = v.join(",");
        }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD HH:mm:ss");
        }
        values[key] = v;
      }
    }
    return values;
  }

  render() {
    const { industry, source, callback,isEdit } = this.props;
    const { visible } = this.state;
    return (
      <Modal
        visible={visible}
        title={`${isEdit?'编辑':'新增'}融资信息`}
        className={`vant-modal yundao-modal  ${style.modal}`}
        wrapClassName="showfloat vertical-center-modal"
        onCancel={this.handleClose}
        onOk={this.handleSubmit}
        closable={false}
      >
        <WrappedAddAdviceForm
          data = {this.state.data}
          formUtils={this.formUtils}
          setForm={form => (this.form = form)}
          callback={callback}
        />
      </Modal>
    );
  }
}
