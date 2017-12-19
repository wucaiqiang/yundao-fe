import React, { Component } from "react";
import ajax from "../lib/ajax";
import extend from "extend";

import Base from '../components/main/Base'

class GridMod extends Base {
  getColumns() {
    let width;

    if (this.columns) {
      width = 0;
      this.columns.map(column => {
        width += column.width || 100;
      });
      this.gridWidth = width;
    }
    return this.columns || [];
  }
  beforeLoad(params) {
    return params;
  }
  loadProp(key, url, fn) {
    let data;

    data = {};
    ajax.get(url).then(r => {
      let state;

      if (!r) {
        return;
      }
      if (!r.success) {
        return;
      }
      this.state[key] = r.result || [];
      this.state.columns = this.getColumns();
      state = extend(true, {}, this.state);
      this.setState(state);
      fn && fn(key, r.result);
      this.gridManager.setFilters(key, r.result);
    });
  }
  getFilterData(key) {
    let data;
    data = this.state[key];
    data = data.map((d, i) => {
      return {
        text: d.name || d.keyValue || d.realName,
        value: d.code || d.id
      };
    });
    return data;
  }
  doReloadGrid() {
    let state, gridManager;

    gridManager = this.gridManager || this.refs.gridManager;
    state = gridManager.grid.refs.grid.state;
    if (gridManager.grid.reload) {
      gridManager.grid.reload();
    } else {
      gridManager.grid.refs.grid.reloadGrid(state.pagination, state.filters, {
        sortField: state.sortColumn,
        sortOrder: state.sortOrder
      });
    }
  }
  getFloatToolsBarCls() {
    let cls;

    cls = ["vant-float-bar"];
    if (this.state.selectRowsCount) {
      cls.push("open");
    }
    return cls.join(" ");
  }
  setFilterBar(gridManager) {
    if (gridManager) {
      this.gridManager = gridManager;
      setTimeout(() => {
        this.gridManager.setFilterBar(this.refs.filterBar);
      });
    }
  }
  resetFilterByKey(params, key, newKey) {
    const gridManager = this.gridManager || this.refs.gridManager;
    if (params[key]) {
      if (params[key] instanceof Array) {
        params[key] = params[key].join(",");
      }
      if (params[key] != "") {
        if (newKey) {
          params[newKey] = params[key];
          delete params[key];
        }
      }
    }
    return params;
  }
  formatRangeParams(params, key, startKey, endKey) {
    if (params[key] && params[key].length) {
      params[startKey] = params[key][0].values[0];
      params[endKey] = params[key][0].values[1];
      delete params[key];
    }
    return params;
  }
  handleSelect(selectData) {
    console.log(selectData)
    let state;
    state = this.state;
    state.selectIds = selectData.selectIds;
    state.selectRowsCount = selectData.selectRowsCount;
    state.selectRowsData = selectData.selectRowsData;
    state = extend(true, {}, state);
    this.setState(state);
  }
  setGridWidth(columns) {
    let width;

    width = 0;
    columns.map(c => {
      width += c.width || 0;
    });
    this.gridWidth = width + 60;
  }
  loading(loading = true) {
    if (this.refs.gridManager) {
      this.refs.gridManager.setState({ loading });
    }
  }
}

export default GridMod;
