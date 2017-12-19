import React, { Component } from "react";

import moment from "moment";

import {
  Layout,
  Form,
  Tabs,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Radio,
  Button,
  Row,
  Col,
  DatePicker
} from "antd";

const InputGroup = Input.Group;

const { Option } = Select;

const FormItem = Form.Item;

import Base from "components/main/Base";

import FormUtils from "lib/formUtils";

import style from "./DynamicFormItem.scss";

import constCitys from "const/citys";
class Address extends Input {
  state = {
    provinceData: [],
    cityData: []
  };
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    this.formUtils = this.props.formUtils;
    const { name, initValue } = this.props;
    let initData = {},
      cityData = [];
    if (initValue) {
      initData = JSON.parse(initValue);
      if (initData.city) {
        constCitys.map(item => {
          if (item.value == initData.province) {
            cityData = item.children;
          }
        });
      }
    }
    this.setState({
      provinceData: constCitys,
      province: initData.province,
      cityData: cityData,
      city: initData.city,
      address: initData.address
    });
  }

  render() {
    const { name, initValue, required } = this.props;
    const { provinceData, cityData, address } = this.state;
    const handleProvinceChange = value => {
      const cityData = provinceData.filter(item => item.value == value)[0]
        .children;

      this.setState({
        province: value,
        cityData: cityData,
        city: cityData[0].value
      });
      const { address } = this.state;
      let data = {};
      data[name] = JSON.stringify({
        province: value,
        city: cityData[0].value,
        address: address
      });
      this.formUtils.setFieldsValue(data);
    };
    const onSecondCityChange = value => {
      this.setState({ city: value });
      const { province, address } = this.state;
      let data = {};
      data[name] = JSON.stringify({
        province: province,
        city: value,
        address: address
      });
      this.formUtils.setFieldsValue(data);
    };
    const handleAddressChange = e => {
      const { value } = e.target;
      this.setState({ address: value });
      const { province, city } = this.state;
      let data = {};
      data[name] = JSON.stringify({
        province: province,
        city: city,
        address: value
      });
      this.formUtils.setFieldsValue(data);
    };
    let initData = {};
    if (initValue) {
      let initData = JSON.parse(initValue);
    }

    // if(initValue.city && this.state.provinceData.length &&
    // !this.state.cityData.length){     handleProvinceChange(initValue.province) }

    return (
      <div
        style={{
          width: "100%"
        }}
        id={`${name}_address_component`}
      >
        <InputGroup>
          <Select
            size="large"
            getPopupContainer={() =>
              document.getElementById(`${name}_address_component`)}
            defaultValue={initData.province}
            value={this.state.province}
            placeholder="请选择"
            onChange={handleProvinceChange}
            style={{
              width: "50%"
            }}
          >
            {provinceData.map(item => {
              return (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              );
            })}
          </Select>
          <Select
            size="large"
            getPopupContainer={() =>
              document.getElementById(`${name}_address_component`)}
            defaultValue={initData.city}
            value={this.state.city}
            placeholder="请选择"
            onChange={onSecondCityChange}
            style={{
              width: "50%"
            }}
          >
            {cityData.map(item => {
              return (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              );
            })}
          </Select>
        </InputGroup>
        <Input
          defaultValue={initData.address}
          onChange={handleAddressChange}
          value={this.state.address}
          style={{
            width: "100%"
          }}
        />
      </div>
    );
  }
}

export default Address;
