import { Table } from "antd";
import ajax from "../lib/ajax";
import extend from "extend";
import qs from "qs";

import utils from "../utils/";

import createHistory from "history/createBrowserHistory";

class Grid extends Table {
  constructor(props) {
    super(props);
    this.state = extend({}, this.state, {
      search: {},
      filters: {},
      sorter: {},
      selectedRowKeys: []
    });
  }
  reloadGrid(pagination, filters, sorter) {
    this.setState({ pagination: pagination, filters: filters, sorter: sorter });
    this.fetch(null, pagination, filters, sorter);
  }
  mergeParams(search = {}, pagination, filters, sorter) {
    let params, pager, sortField, sortOrder;

    console.log("sorter", sorter);

    pager = this.state.pagination;
    pager.current = pagination.current;
    if (sorter.field) {
      sortField = sorter.field;
      sortOrder = sorter.order;
    } else if (sorter.sortField) {
      sortField = sorter.sortField.dataIndex;
      sortOrder = sorter.sortOrder;
    }
    params = {
      pageSize: pagination.pageSize,
      currentPage: pagination.current,
      sortField,
      sortOrder,
      ...search,
      ...filters
    };

    if (this.props.beforeLoad) {
      params = this.props.beforeLoad.call(this, params) || params;
    }
    return params;
  }
  fetch(
    search = this.state.search,
    pagination = this.state.pagination,
    filters = this.state.filters,
    sorter = this.state.sorter
  ) {
    let params = this.mergeParams(search, pagination, filters, sorter);

    this.setState({ loading: true });
    // if (search) {
    //   pagination = extend({}, pagination, { current: 1 });
    //   params.currentPage = 1;
    //   this.setState({ pagination, search });
    // }

    //清理params
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        var element = params[key];
        if (!element) {
          delete params[key];
        }
      }
    }

    console.log("请求参数：", params);

    return ajax
      .get(this.props.url, {
        ...params
      })
      .then(data => {
        if (!data) return;
        let pageData, pagination;

        pagination = this.state.pagination;

        // 无翻页信息
        if (data.result instanceof Array) {
          pageData = data.result;
          data.result = {
            datas: pageData
          };
        } else if (!data.result || (data.result && !data.result.datas)) {
          // 有翻页信息但数据为空
          data.result = {
            datas: []
          };
        }
        pagination.total = data.result.totalCount;
        if (!(data.result.datas instanceof Array)) {
          data.result.datas = [];
        }
        if (this.props.loadSuccess) {
          this.props.loadSuccess({ loading: false, data: data, pagination });
        }
      });
  }
  componentDidMount() {
    if (this.props.url && !this.props.disabledAutoLoad) {
      setTimeout(() => {
        this.fetch();
      });
    }
  }
}
export default Grid;
