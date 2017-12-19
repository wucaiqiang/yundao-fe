import React, { Component } from "react";
import extend from "extend";
import ModalBase from "../../../base/modalBase";
import { Layout, Checkbox, Button, Table, Icon, Input, Spin } from "antd";

const { Sider, Content } = Layout;
const CheckboxGroup = Checkbox.Group;

import GM from "../../../lib/gridManager.js";

import style from "./addRelatedElements.scss";

import Base from "../../../components/main/Base";

const {
  GridManager,
  GridInputFilter,
  FilterBar,
  GridSortFilter,
  GridDateFilter
} = GM;

class AddRelatedElements extends Base {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      fields: [],
      selectedKeys: {},
      leftFields: [],
      leftSelected: [],
      rightSelected: [],
      rightFields: []
    };
  }
  show(fields) {
    this.setState({ fields, leftFields: fields, rightFields: [] });
    this.refs.modalBase.show();
  }

  onLeftSelected = datas => {
    this.setState({ leftSelected: datas });
  };
  onRightSelected = datas => {
    this.setState({ rightSelected: datas });
  };
  moveToLeft = () => {
    const datas = this.state.rightSelected;

    const leftFields = this.state.leftFields.concat(datas);
    const rightFields = this.state.rightFields.filter(field => {
      return datas.map(data => data.id).indexOf(field.id) == -1;
    });
    this.setState({
      rightFields,
      leftFields,
      rightSelected: []
    });
    this.refs["FilterTable_right"].clearSelectedIds();
  };
  moveToRight = () => {
    const datas = this.state.leftSelected;
    const rightFields = this.state.rightFields.concat(datas);
    const leftFields = this.state.leftFields.filter(field => {
      return datas.map(data => data.id).indexOf(field.id) == -1;
    });

    this.setState({
      rightFields,
      leftFields,
      leftSelected: []
    });
    this.refs["FilterTable_left"].clearSelectedIds();
  };

  hide = () => {
    this.refs.modalBase.hide();
  };
  submit = () => {
    const datas = this.state.rightFields;
    this.props.submit && this.props.submit(datas);
    this.refs.modalBase.hide();
  };
  // setState = (state, notMerge) => {
  //   if (!notMerge) {
  //     state = extend(true, this.state, state);
  //   } else {
  //     state = extend(this.state, state);
  //   }
  //   return super.setState(state);
  // }
  render() {
    return (
      <ModalBase
        ref="modalBase"
        title="新增基金产品要素"
        width="900"
        wrapClassName={style.modal}
        onOk={this.submit}
        onCancel={this.hide}
      >
        <Layout
          className="column-select"
          style={{
            height: "468px",
            flexDirection: "row"
          }}
        >
          <div className={style.content}>
            <FilterTable
              title="可关联要素"
              ref="FilterTable_left"
              onSelect={this.onLeftSelected}
              datas={this.state.leftFields}
            />
          </div>
          <div className={style.control}>
            <Button
              shape="circle"
              icon="right-circle-o"
              onClick={this.moveToRight}
              disabled={this.state.leftSelected.length == 0 ? true : false}
            />
            <Button
              shape="circle"
              icon="left-circle-o"
              onClick={this.moveToLeft}
              disabled={this.state.rightSelected.length == 0 ? true : false}
            />
          </div>
          <div className={style.content}>
            <FilterTable
              ref="FilterTable_right"
              title="本次已关联要素"
              onSelect={this.onRightSelected}
              datas={this.state.rightFields}
            />
          </div>
        </Layout>
      </ModalBase>
    );
  }
}

class FilterTable extends Component {
  constructor(props) {
    super(props);
    this.datas = this.props.datas;
    this.state = {
      searchText: "",
      loading: false,
      datas: this.datas
    };
  }

  handleSelect(selectData) {
    console.log("selectData", selectData);
    let state;

    state = this.state;
    state.selectIds = selectData.selectIds;
    state.selectRowsCount = selectData.selectRowsCount;
    state.selectRowsData = selectData.selectRowsData;
    this.setState(state);
    this.props.onSelect && this.props.onSelect(selectData.selectRowsData);
  }

  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded
    // render
    if (nextProps.datas !== this.state.datas) {
      super.setState(
        {
          loading: false,
          datas: nextProps.datas
        },
        () => {
          //搜索项
          if (this.state.searchText) {
            this.filterFromSearchText(this.state.searchText);
          }
        }
      );
    }
  }

  clearSelectedIds() {
    this.setState(
      {
        selectIds: []
      },
      () => {
        this.filterFromSearchText(this.state.searchText);
      }
    );
  }

  onInputChange = e => {
    this.setState({
      searchText: e.target.value
    });
  };

  // setState = (state, notMerge) => {
  //   if (!notMerge) {
  //     state = extend(true, this.state, state);
  //   } else {
  //     state = extend(this.state, state);
  //   }
  //   return super.setState(state);
  // }
  onSearch = e => {
    const searchText = e.target.value;

    this.filterFromSearchText(searchText);
  };
  filterFromSearchText(searchText) {
    const datas = JSON.parse(JSON.stringify(this.props.datas));
    const reg = new RegExp(searchText, "gi");
    this.setState({
      filtered: !!searchText,
      searchText: searchText,
      datas: datas
        .map(record => {
          const match = record.name.match(reg);
          if (!match) {
            return null;
          }
          return record;
        })
        .filter(record => !!record)
    });
  }
  getColumns() {
    const columns = [
      {
        title: "要素名称",
        dataIndex: "name",
        width: 100
      }
    ];

    let width;

    width = 0;
    columns.map(c => {
      width += c.width || 0;
    });

    this.gridWidth = width + 60;

    return columns;
  }
  render() {
    return (
      <div className={style.filter_table}>
        <div>
          <div className={` vant-filter-bar clearfix`}>
            <div className={style.title}>{this.props.title}</div>
            <div className={style.search}>
              <Input
                prefix={<Icon type="search" />}
                ref={ele => (this.searchInput = ele)}
                placeholder="请输入要素名称"
                value={this.state.searchText}
                onChange={this.onSearch}
              />
            </div>
          </div>
        </div>
        <GridManager
          rowSelection={{
            selectedRowKeys: this.state.selectIds,
            onChange: (ids, records) => {
              let selectRowsCount, i, record;

              selectRowsCount = this.state.selectRowsCount;
              if (records.length) {
                selectRowsCount = records.length;
              }
              ids = [];
              for (i = 0; i < records.length; i++) {
                record = records[i];
                ids.push(record.id);
              }
              this.handleSelect({
                selectIds: ids,
                selectRowsData: records,
                selectRowsCount
              });
            }
          }}
          disabledAutoLoad={true}
          columns={this.getColumns()}
          dataSource={this.state.datas}
          gridWrapClassName="grid-panel auto-width-grid"
          mod={this}
          pagination={false}
          scroll={{
            x: "100%",
            y: 468 - (121 + 20 + 50 + 20)
          }}
          ref={gridManager => {
            gridManager && (this.gridManager = gridManager);
          }}
        />
      </div>
    );
  }
}

export default AddRelatedElements;
