import React, { Component } from "react";
import extend from "extend";
import {
  Icon,
  Menu,
  Dropdown,
  Row,
  Col,
  Button,
  Input,
  Tag,
  Tabs,
  Select,
  Spin,
  DatePicker,
  Form,
  Modal,
  Upload,
  Checkbox,
  Radio,
  Carousel,
  Cascader,
  message,
  Tooltip,
  Card
} from "antd";
import DataGrid from "components/dataGrid";
import utils from "utils/";
import PRODUCT_TYPE from "enum/productType";

const DropdownButton = Dropdown.Button;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const RangePicker = DatePicker.RangePicker;

class FeeTable extends Component {
  constructor(props) {
    super(props);
  }
  getColumns() {
    let columns, columnCount;

    columnCount = 0;
    columns = this.props.columns.map((column, index) => {
      if (this.props.productType == PRODUCT_TYPE.PRO_TYPE_FIX.value) {
        if (column.dataIndex == "backCommission") {
          return null;
        }
      }
      if (this.props.productType != PRODUCT_TYPE.PRO_TYPE_FIX.value) {
        if (column.dataIndex == "totalRange") {
          return null;
        }
      }
      if (column.dataIndex == "range") {
        column.render = (text, record) => {
          return (
            <div>
              {record.rangeMin != null ? `${record.rangeMin}≤` : ""}xc{record.rangeMax != null ? `<${record.rangeMax}` : ""}
            </div>
          );
        };
      } else if (column.dataIndex == "totalRange") {
        column.render = (text, record) => {
          if (record.totalRange) {
            return {
              children: (
                <div>
                  {record.totalRange.min != null
                    ? `${record.totalRange.min}≤`
                    : ""}xc{record.totalRange.max != null
                    ? `<${record.totalRange.max}`
                    : ""}
                </div>
              ),
              props: {
                rowSpan: record.totalRange.count
              }
            };
          } else {
            return {
              children: "",
              props: {
                rowSpan: 0
              }
            };
          }
        };
      }
      return column;
    });

    columns = columns.map((column, index) => {
      let render, newRender;

      if (column.children) {
        columnCount += column.children.length;
      } else {
        columnCount += 1;
      }
      function getRender(render) {
        return (text, record, index) => {
          if (record.noteTitle) {
            return {
              children: "",
              props: {
                colSpan: 0
              }
            };
          } else {
            if (render) {
              return render.call(this, text, record);
            } else {
              return text;
            }
          }
        };
      }
      switch (index) {
        case 0:
        case 1:
          if (column.children) {
            render = column.children[0].render;
          } else {
            render = column.render;
          }
          newRender = (text, record) => {
            const c = column;
            if (record.noteTitle) {
              return this.getNoteColumn(index, record);
            } else {
              if (render) {
                return render.call(this, text, record);
              } else {
                return text;
              }
            }
          };
          if (column.children) {
            column.children[0].render = newRender;
            column.children[1].render = getRender(column.children[1].render);
          } else {
            column.render = newRender;
          }
          break;
        default:
          if (column.children) {
            column.children.map(c => {
              c.render = getRender(c.render);
            });
          } else {
            column.render = getRender(column.render);
          }
      }
      this.columnCount = columnCount;
      return column;
    });
    return columns;
  }
  getNoteColumn(index, record) {
    switch (index) {
      case 0:
        return record.noteTitle;
      case 1:
        return {
          children: record.note,
          props: {
            colSpan: this.columnCount - 1
          }
        };
    }
  }
  sumListToData(list) {
    let data;

    data = {};

    if (!list) {
      return data;
    }
    list.map(item => {
      let key;

      item.totalRangeMin = item.rangeMin;
      item.rangeMin = item.commissionMin;
      item.totalRangeMax = item.rangeMax;
      item.rangeMax = item.commissionMax;

      key = `${item.totalRangeMin}-${item.totalRangeMax}`;
      if (!data[key]) {
        data[key] = {
          range: { min: item.totalRangeMin, max: item.totalRangeMax },
          items: []
        };
      }
      data[key].items.push(item);
    });
    return data;
  }
  loadData(list) {
    let data;

    if (this.props.productType == PRODUCT_TYPE.PRO_TYPE_FIX.value) {
      data = this.sumListToData(list);
      list = [];
      for (let k in data) {
        let obj = data[k];

        obj.items.map((item, i) => {
          if (i == 0) {
            item.totalRange = obj.range;
            item.totalRange.count = obj.items.length;
          }
          list.push(item);
        });
      }
    }
    list.push({
      noteTitle: "内部合伙人费用备注",
      note: this.props.quotation.partnerRemark
    });
    list.push({
      noteTitle: "外部合伙人费用备注",
      note: this.props.quotation.managerRemark
    });
    list.push({
      noteTitle: "合伙机构费用备注",
      note: this.props.quotation.mechanismRemark
    });
    this.refs.grid.loadSuccess({ data: list });
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

export default FeeTable;
