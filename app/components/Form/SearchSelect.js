import React, { Component } from "react";
import { Select } from "antd";
import FormUtils from "lib/formUtils";
import utils from "utils/";
import ajax from "lib/ajax";

import Storage from "lib/storage";

let currentValue;

const Option = Select.Option;

import Base from "components/main/Base";

class SearchSelect extends Base {
  state = {
    list: [],
    notFoundContent: null
  };

  componentWillMount() {
    const { request, format, name, initData } = this.props;

    const userId = utils.getStorage("userInfo").id;
    this.cache = [];

    this.storage = new Storage("local", "local");

    if (["assistantId", "receiverId", "leaderId"].indexOf(name) > -1) {
      this.cacheName = "search_office_worker_cache";
    }

    if (this.isVideo()) {
      this.cacheName = "search_videoId_cache";
      this.onSearch("");
    }

    if (["customerId"].indexOf(name) > -1) {
      this.cacheName = "search_customer_cache";
    }
    if (this.isProduct()) {
      this.cacheName = "search_productId_cache";
      this.onSearch("");
    }
    // this.cacheName = `${userId}_${this.cacheName}`
    if (!initData || !initData.value) {
      //没有初始值 设定初始下拉选项

      if (this.isProduct() || this.isVideo()) {
        this.onSearch("");
      } else {
        const list = this.getSearchCache();
        this.setState({ list });
      }
      //负责人、助理、汇报上级输入后，下次聚焦上述输入框且为输入时，下拉匹配结果框里显示为记住的员工用户名称列表，且按记录时间倒序排列
    }

    this.timeout = null;
  }

  getSearchCache = () => {
    const name = this.cacheName;
    console.log(this.cacheName);
    if (["search_customer_cache"].indexOf(name) > -1) {
      return [];
    } else {
      let cacheList = this.storage.get(name) || [];
      return this.unique(cacheList);
    }
  };

  unique = list => {
    const keys = [];
    const newList = [];
    const temp = list.map(item => {
      if (item && keys.indexOf(item.key) == -1) {
        newList.push({ key: item.key, value: item.key, label: item.label });
        keys.push(item.key);
      }
    });
    return newList;
  };

  updateSearchCache = value => {
    const name = this.cacheName;
    const maxCache = 5;
    const list = this.getSearchCache(name);
    if (value && name) {
      list.unshift(value);
      this.storage.set(name, this.unique(list).splice(0, maxCache));
    }
  };

  onSearch = (value = "") => {
    const { request, format, name } = this.props;

    value = value.replace(/(^\s*)|(\s*)$/g, "");

    if (!value && !(this.isProduct() || this.isVideo())) {
      const list = this.getSearchCache();
      this.setState({ list, notFoundContent: null });
      return;
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    const that = this;
    currentValue = value;
    function search() {
      request(value).then(res => {
        if (currentValue === value) {
          if (res.success) {
            const data = [];

            res.result.forEach(r => {
              data.push(format(r));
            });
            that.setState({ list: data, notFoundContent: "无匹配结果" });
          }
        }
      });
    }
    this.timeout = setTimeout(search, 300);
  };

  isProduct = () => {
    const { name } = this.props;
    return ["productId"].indexOf(name) > -1 ? true : false;
  };

  isVideo = () => {
    const { name } = this.props;
    return ["videoId"].indexOf(name) > -1 ? true : false;
  };

  onChange = value => {
    let data = {};
    let list = [];
    let selectOption;

    const { name, formUtils } = this.props;

    data[name] = value ? value.key : "";

    formUtils && formUtils.setFieldsValue(data);

    this.setState({
      selected: value || null
    });

    if (value && this.state.list) {
      selectOption = this.state.list.find(item => item.value == value.key);

      selectOption.key = value.key;
    }
    this.props.callback && this.props.callback(selectOption);

    if (this.isProduct() || this.isVideo()) {
      this.onSearch();
    } else {
      if (value && value != undefined) {
        this.updateSearchCache(value);
      } else {
        list = this.getSearchCache();
      }
      this.setState({ list: list });
    }
  };

  render() {
    const { initData = {}, placeholder, disabled, ...others } = this.props;

    const { notFoundContent } = this.state;

    let props = {};

    if (initData && initData.value) {
      props.defaultValue = {
        key: initData.value.toString(),
        label: initData.label
      };
    }

    return (
      <Select
        placeholder={placeholder ? placeholder : "请输入选择"}
        getPopupContainer={() =>
          this.props.popupContainer
            ? this.props.popupContainer
            : this.props.name
              ? document.getElementById(`${this.props.name}_FormItem`)
              : document.body
        }
        labelInValue
        showSearch
        allowClear
        disabled={disabled}
        notFoundContent={notFoundContent}
        {...props}
        filterOption={false}
        onSearch={this.onSearch}
        onChange={this.onChange}
      >
        {this.state.list.map(d => (
          <Option key={d.value} disabled={d.disabled}>
            {d.label}
          </Option>
        ))}
      </Select>
    );
  }
}

export default SearchSelect;
