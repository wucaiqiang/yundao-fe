import React from "react";
import { Select, Input, DatePicker, Button, Form, Checkbox } from "antd";
import moment from "moment";
import Base from "components/main/Base";

import FormUtils from "lib/formUtils";

import Dictionary from "model/dictionary";
import Category from "model/Product/category";
import Customer from "model/Customer/";

import style from "./filterCustomerForm.scss";

const FormItem = Form.Item;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const { RangePicker } = DatePicker;

class FilterCustomerForm extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      dic: {
        dic_customer_invest_type: [],
        dic_customer_risk_rating: [],
        dic_sex: []
      },
      tags: [],
      category: []
    };

    this.formUtils = new FormUtils("FilterCustomerForm");
  }
  componentWillMount() {
    this.dictionary = new Dictionary();
    this.category = new Category();
    this.customer = new Customer();

    this.getDictionary();

    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }
  componentDidMount() {}
  componentWillReceiveProps(nextProps) {
    this.grid = nextProps.grid;

    const {
      dic = {
        dic_customer_invest_type: [],
        dic_customer_risk_rating: [],
        dic_sex: []
      },
      tags = [],
      category = []
    } = this.state;

    if (nextProps.grid) {
      console.log("设置自定义筛选条件元数据：", nextProps);
      const filters = {
        tags: {
          title: "标签",
          filter: {}
        },
        investTypes: {
          title: "投资偏好",
          filter: this.getArrayToMap(category)
        },
        riskRatings: {
          title: "风险特征",
          filter: this.getArrayToMap(dic.dic_customer_risk_rating)
        },
        typies: {
          title: "投资人类型",
          filter: this.getArrayToMap(dic.dic_customer_invest_type)
        },
        birthday: {
          title: "生日",
          filter: {}
        },
        sexs: {
          title: "性别",
          filter: this.getArrayToMap(dic.dic_sex)
        },
        trade: {
          title: "行业",
          filter: {}
        },
        organization: {
          title: "机构",
          filter: {}
        },
        position: {
          title: "职务",
          filter: {}
        }
      };

      let filterMapData = nextProps.grid.filterMapData;

      nextProps.grid.filterMapData = Object.assign(
        filterMapData || {},
        filters
      );
    }
  }

  getArrayToMap(data) {
    let mapData = {};

    data.length > 0 &&
      data.map(item => {
        mapData[item.value] = item.label;
      });

    return mapData;
  }
  canParsedFilter() {
    const {
      dic = {
        dic_customer_invest_type: [],
        dic_customer_risk_rating: [],
        dic_sex: []
      },
      tags = [],
      category = []
    } = this.state;

    if (tags.length === 0) return false;
    else if (category.length === 0) return false;
    else if (dic.dic_customer_invest_type.length === 0) return false;
    else if (dic.dic_customer_risk_rating.length === 0) return false;
    else return true;
  }
  getDictionary() {
    this.dictionary
      .gets("dic_customer_invest_type,dic_customer_risk_rating,dic_sex")
      .then(res => {
        if (res.success && res.result) {
          let dic = {};
          res.result.map(item => {
            dic[item.value] = item.selections.map(item => {
              return { label: item.label, value: item.value };
            });
          });

          this.setState({ dic });
        }
      });

    this.category.get_all().then(res => {
      if (res.success && res.result) {
        this.setState({
          category: res.result.map(item => {
            return { label: item.name, value: item.id };
          })
        });
      }
    });

    this.customer.tag_get_top().then(res => {
      if (res && res.result) {
        this.setState({
          tags: res.result.map(item => item.name)
        });
      }
    });
  }
  handleReset = () => {
    this.formUtils.resetFields();
  };
  handleSubmit = () => {
    let values = this.formUtils.getFieldsValue();

    for (let value in values) {
      if (values[value] === null || values[value] === undefined) {
        delete values[value];
      } else if (values[value] instanceof Array && values[value].length === 0) {
        delete values[value];
      }
    }

    if (values.birthday) {
      values.birthday = [
        {
          filterType: "monthRange",
          values: [
            moment(values.birthday[0]).format("MM-DD"),
            moment(values.birthday[1]).format("MM-DD"),
            moment(values.birthday[0]).format("YYYY-MM-DD"),
            moment(values.birthday[1]).format("YYYY-MM-DD")
          ]
        }
      ];
    }

    this.grid && this.grid.onSearch(values);
    console.log(values);
  };
  render() {
    const formItemLayout = {
      labelCol: {
        span: 5
      },
      wrapperCol: {
        span: 20
      }
    };

    const { dic } = this.state;

    return (
      <div className={style.filterForm} id="filterForm">
        <Form>
          <FormItem label="标签" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("tags")(
              <Select
                getPopupContainer={() => document.getElementById("filterForm")}
                allowClear={true}
                size="large"
                mode="tags"
                placeholder="请选择标签"
              >
                {this.state.tags.map(item => {
                  return (
                    <Option value={item} key={item}>
                      {item}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem label="投资偏好" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("investTypes")(
              <CheckboxGroup options={this.state.category} />
            )}
          </FormItem>
          <FormItem label="风险特征" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("riskRatings")(
              <CheckboxGroup options={dic.dic_customer_risk_rating} />
            )}
          </FormItem>
          <FormItem label="投资人类型" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("typies")(
              <CheckboxGroup options={dic.dic_customer_invest_type} />
            )}
          </FormItem>
          <FormItem label="生日" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("birthday")(
              <RangePicker
                getCalendarContainer={() =>
                  document.getElementById("filterForm")
                }
                format="MM-DD"
                placeholder={["月-日", "月-日"]}
              />
            )}
          </FormItem>
          <FormItem label="性别" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("sexs")(
              <CheckboxGroup options={dic.dic_sex} />
            )}
          </FormItem>
          <FormItem label="行业" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("trade", {
              initialValue: null
            })(<Input placeholder="请输入行业" />)}
          </FormItem>
          <FormItem label="机构" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("organization", {
              initialValue: null
            })(<Input placeholder="请输入机构" />)}
          </FormItem>
          <FormItem label="职务" {...formItemLayout}>
            {this.formUtils.getFieldDecorator("position", {
              initialValue: null
            })(<Input placeholder="请输入职务" />)}
          </FormItem>
          <FormItem>
            <Button onClick={this.handleReset}>重置</Button>
            <Button onClick={this.handleSubmit}>确定</Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

const WrapperedFilterCustomerForm = Form.create()(FilterCustomerForm);

export default WrapperedFilterCustomerForm;
