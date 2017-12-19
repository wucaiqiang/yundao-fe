import React, { Component } from "react";
import Grid from "./grid";
import extend from "extend";

function wrap(props, name) {
  props[name] = (...params) => {
    let ret;

    if (this.props[name]) {
      ret = this.props[name](...params);
    }
    if (name != "onChange") {
      ret = ret || this[name](...params);
    }
    return ret;
  };
}
class DataGrid extends Component {
  mounted = false;
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: []
    };
  }
  componentWillUnmount() {
    this.mounted = false;
  }
  componentWillMount() {
    if (this.props.disabledAutoLoad) {
      this.setState({ loading: false });
    }
  }
  componentDidMount() {
    this.mounted = true;
  }
  rebuildProps() {
    let props;

    props = extend(true, {}, this.props);
    wrap.call(this, props, "beforeLoad");
    wrap.call(this, props, "loadSuccess");
    wrap.call(this, props, "onChange");
    this.buildProps = props;
  }
  beforeLoad(params) {
    this.setState({ loading: true });
    return params;
  }
  loadSuccess(data) {
    if (this.mounted) {
      this.setState({ loading: false, data: data.data.result.datas });
    }
    return data;
  }
  toggleSortOrder(order, column) {
    this.refs.grid.toggleSortOrder(order, column);
  }
  onChange(pagination, filters, sorter) {
    this.setState({
      pagination,
      filters,
      sorter
    });
    this.refs.grid.fetch(undefined, pagination, filters, sorter);
  }
  load(...args) {
    this.setState({ loading: true });
    return this.refs.grid.fetch.apply(this.refs.grid, args);
  }
  fetch(...args) {
    this.load(...args);
  }
  reload() {
    console.log('this.refs.grid.state.pagination',this.refs.grid.state.pagination)
    let pagination = this.refs.grid.state.pagination
    // pagination.pageSize = 10,
    // pagination.current=1
    this.load(null,pagination);
  }
  showTotal() {
    try {
      return `共${this.refs.grid.state.pagination.total}条`;
    } catch (e) {}
  }
  render() {
    this.rebuildProps();
    return (
      <Grid
        dataSource={this.state.data || this.props.dataSource}
        loading={this.state.loading}
        pagination={
          this.props.pagination === false
            ? false
            : this.props.pagination
              ? this.props.pagination
              : {
                  showTotal: () => this.showTotal(),
                  showQuickJumper: true,
                  showSizeChanger: true
                }
        }
        ref="grid"
        {...this.buildProps}
      />
    );
  }
}
export default DataGrid;
