import React, { Component } from "react";
import { Button } from "antd";
import QueueAnim from "rc-queue-anim";

class SelectModalBase extends Component {
  constructor(props) {
    super(props);
    this.isFirstShow = true;
  }
  setSingleSelectByMutipleState(columns, linkText = "选择") {
    if (!this.state.multipleSelect) {
      columns.unshift({
        title: "操作",
        width: 80,
        render: (text, record) => {
          return (
            <a href="javascript:;" onClick={() => this.handleSelect([record])}>
              {linkText}
            </a>
          );
        }
      });
    }
  }
  getRowSelection() {
    if (this.state.multipleSelect) {
      return {
        selectedRowKeys: this.state.selectedRowKeys,
        onChange: (ids, records) => {
          this.setState({ selectedRowKeys: ids });
          this.selectRecords = records;
        }
      };
    } else {
      return null;
    }
  }
  handleSelect(record) {
    if (this.props.onSelect) {
      let r;

      r = this.props.onSelect.apply(this, [record]);
      if (r === false) {
        return;
      }
    }
    this.close();
  }
  handleSubmit() {
    let data;

    data = this.formUtils.getFieldsValue();
    this.setState({ loading: true });
    this.refs.grid.setState({ selectedRowKeys: [] });
    this.refs.grid.fetch(data);
  }
  show() {
    this.setState({ visible: true, loading: true });
    this.selectRecords = [];
    setTimeout(() => {
      this.formUtils.resetFields();
      if (!this.isFirstShow) {
        this.refs.grid.setState({ selectedRowKeys: [] });
      } else {
        this.isFirstShow = false;
      }
      this.refs.grid.setState({ search: {} });
    });
  }
  showSingle() {
    this.setState({ multipleSelect: false });
    this.show();
  }
  showMultiple() {
    this.setState({ multipleSelect: true });
    this.show();
  }
  close() {
    this.setState({ visible: false });
  }
  handleLoadSuccess(data) {
    this.setState(data);
  }
  handleSubmitSelect() {
    this.handleSelect(this.selectRecords);
  }
  getFooter() {
    let footer;

    if (this.state.multipleSelect) {
      footer = [
        <Button onClick={() => this.close()}>关闭</Button>,
        <Button type="primary" onClick={() => this.handleSubmitSelect()}>
          确定
        </Button>
      ];
    } else {
      footer = <Button onClick={() => this.close()}>关闭</Button>;
    }
    return footer;
  }
}

export default SelectModalBase;
