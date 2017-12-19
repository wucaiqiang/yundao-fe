import React from "react";
import {
  Select,
  Input,
  DatePicker,
  Upload,
  Button,
  Form,
  Row,
  Col,
  AutoComplete,
  Icon,
  Checkbox,
  Radio
} from "antd";
import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Customer from "model/Customer/";
import style from "./editCustomerTagForm.scss";

const FormItem = Form.Item;
const Option = Select.Option;
const Textarea = Input.Textarea;
const AutoCompleteOption = AutoComplete.Option;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

class EditCustomerTagForm extends Base {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      topTags: [],
      checkedTags: this.props.checkedTags || [],
      inputValue: this.props.checkedTags
        ? this.props.checkedTags.join(",")
        : null
    };

    this.formUtils = new FormUtils("EditCustomerTagForm");
  }
  componentWillMount() {
    this.customer = new Customer();

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
    this.customer.tag_get_top().then(res => {
      if (res && res.result) {
        this.setState({
          topTags: res.result.map(item => item.name)
        });
      }
    });
  }
  // componentWillReceiveProps(nextProps) {
  //   // if(nextProps.checkedTags){
  //     this.setState({
  //       checkedTags:nextProps.checkedTags || [],
  //       inputValue: nextProps.checkedTags
  //       ? nextProps.checkedTags.join(",")
  //       : null
  //     })
  //   // }
  // }
  getFormClassName() {
    let cls;

    cls = ["float-slide-form", "vant-spin", "follow-form"];
    if (this.state.loading) {
      cls.push("loading");
    }
    return cls.join(" ");
  }

  onChange = checkedTags => {
    const newValue = [
      ...new Set(checkedTags.filter(item => item.trim() != ""))
    ];
    this.setState({
      checkedTags: [...new Set(checkedTags)],
      inputValue: newValue.join(",")
    });
    this.updateTagsValue(newValue.join(","));
  };
  onInput = e => {
    const { value } = e.target;
    let newValue = [...new Set(value.replace(/，/g, ",").split(","))];
    this.setState({
      checkedTags: newValue,
      inputValue: value
    });
    this.updateTagsValue(newValue.join(","));
  };
  updateTagsValue = value => {
    this.formUtils.setFieldsValue({
      tags: value
    });
  };
  getTags = () => {
    const { topTags, checkedTags } = this.state;
    return (
      <CheckboxGroup
        className={style.tag}
        options={topTags}
        value={checkedTags}
        onChange={this.onChange}
      />
    );
  };
  render() {
    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 24
      }
    };

    return (
      <div>
        <Form className={this.getFormClassName()}>
          <p className={style.title}>从已有标签中选择</p>
          <div className={style.box} style={{ marginBottom: "36px" }}>
            <div className={style.tags}>{this.getTags()}</div>
          </div>
          <p className={style.title}>创建新标签</p>
          {this.formUtils.getFieldDecorator("tags")(<Input type="hidden" />)}
          <FormItem {...formItemLayout}>
            <Input
              onChange={this.onInput}
              value={this.state.inputValue}
              placeholder="多个标签请用逗号隔开"
            />
          </FormItem>
        </Form>
      </div>
    );
  }
}
EditCustomerTagForm = Form.create()(EditCustomerTagForm);

export default EditCustomerTagForm;
