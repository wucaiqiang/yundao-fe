import React, {Component} from 'react'
import extend from 'extend'
import ModalBase from 'base/modalBase'
import {
  Layout,
  Checkbox,
  Button,
  Table,
  Icon,
  Input
} from 'antd'

const {Sider, Content} = Layout;
const CheckboxGroup = Checkbox.Group;

import GM from "lib/gridManager.js";

import style from './addRelatedElements.scss'

import FilterTable from 'components/FilterTable'

const {GridManager, GridInputFilter, FilterBar, GridSortFilter, GridDateFilter} = GM
export default class FilterTable extends Component {
  constructor(props) {
    super(props)
    this.datas = this.props.datas
    this.state = {
      searchText: '',
      datas: this.datas
    }
  }

  handleSelect(selectData) {
    let state;

    state = this.state;
    state.selectIds = selectData.selectIds;
    state.selectRowsCount = selectData.selectRowsCount;
    state.selectRowsData = selectData.selectRowsData;
    this.setState(state);
    this.props.onSelect && this
      .props
      .onSelect(selectData.selectRowsData)

  }

  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded
    // render
    if (nextProps.datas !== this.state.datas) {
      this.setState({
        datas: nextProps.datas,
        selectIds: [],
        selectRowsData: []
      }, true);
    }
  }

  onInputChange = (e) => {
    this.setState({
      searchText: e.target.value
    }, true);
  }

  // setState = (state, notMerge) => {
  //   if (!notMerge) {
  //     state = extend(true, this.state, state);
  //   } else {
  //     state = extend(this.state, state);
  //   }
  //   return super.setState(state);
  // }
  onSearch = (e) => {
    // const {searchText} = this.state;
    const datas = JSON.parse(JSON.stringify(this.props.datas))
    const searchText = e.target.value

    const reg = new RegExp(searchText, 'gi');
    this.setState({
      filtered: !!searchText,
      searchText: searchText,
      datas: datas.map((record) => {
        console.log('record', record)
        const match = record
          .name
          .match(reg);
        if (!match) {
          return null;
        }
        return {
          ...record,
          name: (
            <span>
              {record
                .name
                .split(reg)
                .map((text, i) => (i > 0 && match[0]!=''
                  ? [ <span style = {{ color: '#f50'}} > {
                      match[0]
                    } </span>, text] : text
              ))}
            </span>
          )
        };
      }).filter(record => !!record)
    }, true);
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

    // this.columns = columns;
    return columns;
  }
  render() {
    return (
      <div className={style.filter_table}>
        <GridManager
          onSelect={selectData => {
          this.handleSelect(selectData);
        }}
          disabledAutoLoad={true}
          columns={this.getColumns()}
          dataSource={this.state.datas}
          gridWrapClassName="grid-panel auto-width-grid"
          mod={this}
          pagination={false}
          scroll={{
          y: 550-(121+20+50+20)
        }}
          ref={gridManager => {
          gridManager && (this.gridManager = gridManager);
        }}>
          <div>
            <div className={` vant-filter-bar clearfix`}>
              <div className={style.title}>{this.props.title}</div>
              <div className={style.search}>
                <Input
                prefix={<Icon type="search" />}
                  ref={ele => this.searchInput = ele}
                  placeholder="请输入要素名称"
                  value={this.state.searchText}
                  onChange={this.onSearch}/>
              </div>
            </div>
          </div>
        </GridManager>
      </div>
    )
  }
}