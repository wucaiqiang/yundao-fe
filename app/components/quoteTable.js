import React, { Component } from "react";
import extend from "extend";
import { Tabs, Select, DatePicker } from "antd";
import DataGrid from "components/dataGrid";
import utils from "utils/";
import PRODUCT_TYPE from "enum/productType";

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;

class QuoteTable extends Component {
  constructor(props) {
    super(props);
  }
  getColumns() {
    return this.props.columns.map(column => {
      if (this.props.productType == PRODUCT_TYPE.PRO_TYPE_FIX.value) {
        if (column.dataIndex == "backCommission") {
          return null;
        }
      }
      if (column.dataIndex == "range") {
        column.render = (text, record) => {
          return (
            <div>
              {record.rangeMin ? `${record.rangeMin}≤` : ""}xc{record.rangeMax ? `<${record.rangeMax}` : ""}
            </div>
          );
        };
      }
      return column;
    });
  }
  loadData(data) {
    this.refs.grid.loadSuccess({ data });
  }
  render() {
    let props;

    props = extend({}, this.props);
    delete props.columns;
    return (
      <DataGrid
        disabledAutoLoad={true}
        pagination={false}
        columns={this.getColumns()}
        ref="grid"
        {...props}
      />
    );
  }
}

export default QuoteTable;
