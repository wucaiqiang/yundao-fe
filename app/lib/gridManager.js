import React, { Component } from "react";
import ReactDOM, { findDOMNode } from "react-dom";
import { Tag, Icon, Input, DatePicker, Form, Checkbox } from "antd";
import ClassNames from "classnames";
import DataGrid from "../components/dataGrid";
import Citys from "../components/citys";
import FormUtils from "./formUtils";

import style from "./gridManager.scss";

const RangePicker = DatePicker.RangePicker;
const CheckboxGroup = Checkbox.Group;

const sortAsc = "/assets/images/icon/升序";
const sortDesc = "/assets/images/icon/降序";

const FILTER_TYPE = {
  DATE_RANGE: "dateRange",
  Month_RANGE: "monthRange",
  NUMBER_RANGE: "numberRange",
  CITYS: "citys"
};

class GridFilterBase extends Component {
  handleConfirm(value) {
    console.log("value", value);
    // 缺少对value的验证
    if (value) {
      if (!(value instanceof Array) && !(value instanceof Object)) {
        value = [value];
      }
      this.setDropDownInvisible();
      this.getGrid().handleFilter(
        {
          dataIndex: this.props.filterKey
        },
        value
      );
    } else {
      this.handleRest();
    }
  }
  handleRest() {
    this.setDropDownInvisible();
    this.getGrid().handleFilter(
      {
        dataIndex: this.props.filterKey
      },
      []
    );
  }
  setDropDownInvisible() {
    let girdManager =
      this.props.mod.gridManager || this.props.mod.refs.gridManager;
    let { filterDropdownVisible } = girdManager.state;

    filterDropdownVisible[this.props.filterKey] = false;
    girdManager.setState(
      { filterDropdownVisible: filterDropdownVisible },
      () => {
        console.log("girdManager", girdManager);
      }
    );
  }
  getGrid() {
    if (this.props.grid) {
      return this.props.grid;
    }
    return (
      this.props.mod.grid ||
      (this.props.mod.gridManager || this.props.mod.refs.gridManager).grid.refs
        .grid
    );
  }
}

class GridFilterHTML extends Component {
  render() {
    return (
      <div className="ant-table-filter-dropdown">
        <ul
          className="ant-dropdown-menu ant-dropdown-menu-vertical ant-dropdown-menu-root"
          role="menu"
          aria-activedescendant=""
          tabIndex="0"
        >
          <li className="ant-dropdown-menu-item">{this.props.children}</li>
        </ul>
        <div className="ant-table-filter-dropdown-btns">
          <a
            className="ant-table-filter-dropdown-link clear"
            onClick={() => this.props.onReset()}
          >
            重置
          </a>
          <a
            className="ant-table-filter-dropdown-link confirm"
            onClick={() => this.props.onConfirm(this.value)}
          >
            确定
          </a>
        </div>
      </div>
    );
  }
}

// input filter
class GridInputFilterForm extends Component {
  componentWillMount() {
    this.props.formUtils.setForm(this.props.form);
  }
  handleChange(e) {
    this.props.onChange.apply(this, [e]);
  }
  render() {
    return (
      <Form onSubmit={::this.props.onSubmit}>
        {this.props.formUtils.getFieldDecorator("input", {
          onChange: e => this.handleChange(e)
        })(
          <Input
            placeholder={this.props.placeholder || "请输入关键字"}
            style={{
              width: 184
            }}
          />
        )}
      </Form>
    );
  }
}
GridInputFilterForm = Form.create({})(GridInputFilterForm);

class GridInputFilter extends GridFilterBase {
  constructor() {
    super();
    this.formUtils = new FormUtils("gridInputFilter");
  }
  handleRest() {
    super.handleRest();
    this.formUtils.resetFields();
    this.value = null;
  }
  handleChange(e) {
    this.value = e.target.value;
  }
  render() {
    return (
      <GridFilterHTML
        onConfirm={() => this.handleConfirm(this.value)}
        onReset={() => this.handleRest()}
      >
        <GridInputFilterForm
          placeholder={this.props.placeholder}
          onSubmit={e => {
            e.preventDefault();
            this.handleConfirm(this.value);
          }}
          formUtils={this.formUtils}
          onChange={e => this.handleChange(e)}
        />
      </GridFilterHTML>
    );
  }
}

//checkbox filter

class GridCheckboxFilterForm extends Component {
  componentWillMount() {
    this.props.formUtils.setForm(this.props.form);
  }
  handleChange(values) {
    this.props.onChange.apply(this, [values]);
  }
  render() {
    const checkboxList = this.props.filters.map(filter => {
      return { label: filter.label || filter.text, value: filter.value };
    });
    return (
      <Form onSubmit={::this.props.onSubmit}>
        {this.props.formUtils.getFieldDecorator("checkbox", {
          onChange: e => this.handleChange(e)
        })(<CheckboxGroup options={checkboxList} />)}
      </Form>
    );
  }
}
GridCheckboxFilterForm = Form.create({})(GridCheckboxFilterForm);

class GridCheckboxFilter extends GridFilterBase {
  constructor() {
    super();
    this.formUtils = new FormUtils("gridCheckboxFilter");
  }
  handleRest() {
    super.handleRest();
    this.formUtils.resetFields();
  }
  handleChange(values) {
    this.value = values;
  }
  getColumn(filterKey) {
    let result = null;
    const { gridManager } = this.props.mod;
    if (gridManager) {
      result = gridManager.props.columns.filter(
        column => column.dataIndex == filterKey
      );
    }
    if (result.length) {
      return result[0];
    }
    return result;
  }

  render() {
    const { mod, filterKey } = this.props;
    const column = this.getColumn(filterKey);
    return (
      <GridFilterHTML
        onConfirm={() => this.handleConfirm(this.value)}
        onReset={() => this.handleRest()}
      >
        <GridCheckboxFilterForm
          onSubmit={e => {
            e.preventDefault();
            this.handleConfirm(this.value);
          }}
          filters={column.filters}
          formUtils={this.formUtils}
          onChange={values => this.handleChange(values)}
        />
      </GridFilterHTML>
    );
  }
}

//radio filter

class GridSortFilter extends GridFilterBase {
  getColumn(filterKey) {
    let result = null;
    const { gridManager } = this.props.mod;
    if (gridManager) {
      result = gridManager.props.columns.filter(
        column => column.dataIndex == filterKey
      );
    }
    if (result.length) {
      return result[0];
    }
    return result;
  }
  render() {
    const { mod, filterKey } = this.props;
    const { gridManager } = mod;
    const column = this.getColumn(filterKey);
    return (
      <div className={style.grid_sort_filter}>
        <a
          onClick={() => {
            if (gridManager) {
              gridManager.toggleSortOrder("ascend", column);
            }
          }}
        >
          <img src={sortAsc + ".png"} srcSet={sortAsc + "@2x.png"} />升序A-Z
        </a>
        <a
          onClick={() => {
            if (gridManager) {
              gridManager.toggleSortOrder("descend", column);
            }
          }}
        >
          <img src={sortDesc + ".png"} srcSet={sortDesc + "@2x.png"} />降序Z-A
        </a>
      </div>
    );
  }
}

class GridDateFilterForm extends Component {
  componentWillMount() {
    this.props.formUtils.setForm(this.props.form);
  }
  componentDidMount() {
    this.el = findDOMNode(this);
  }
  handleChange(d, dstr) {
    this.props.onChange.apply(this, [d, dstr]);
  }
  getContainer() {
    return this.el;
  }
  render() {
    return (
      <Form>
        {this.props.formUtils.getFieldDecorator("dateRange", {
          onChange: (d, dstr) => this.handleChange(d, dstr)
        })(
          <RangePicker
            getCalendarContainer={::this.getContainer}
            style={{
              width: 240
            }}
          />
        )}
      </Form>
    );
  }
}
GridDateFilterForm = Form.create({})(GridDateFilterForm);

class GridDateFilter extends GridFilterBase {
  constructor() {
    super();
    this.formUtils = new FormUtils("gridDateFilter");
  }
  handleChange(d, dstr) {
    let data;

    data = {
      filterType: FILTER_TYPE.DATE_RANGE,
      values: dstr
    };
    this.handleConfirm([data]);
  }
  handleRest() {
    super.handleRest();
    this.formUtils.resetFields();
  }
  render() {
    return (
      <div className="ant-table-filter-dropdown ant-table-date-filter">
        <ul
          className="ant-dropdown-menu ant-dropdown-menu-vertical ant-dropdown-menu-root"
          role="menu"
          aria-activedescendant=""
        >
          <li className="ant-dropdown-menu-item">
            <GridDateFilterForm
              formUtils={this.formUtils}
              onChange={(d, dstr) => this.handleChange(d, dstr)}
            />
          </li>
        </ul>
        <div className="ant-table-filter-dropdown-btns">
          <a
            className="ant-table-filter-dropdown-link clear"
            onClick={() => this.handleRest()}
          >
            重置
          </a>
        </div>
      </div>
    );
  }
}

class GridRangeFilterForm extends Component {
  componentWillMount() {
    this.props.formUtils.setForm(this.props.form);
  }
  render() {
    return (
      <Form>
        <span
          className="ant-calendar-picker"
          style={{
            width: 240
          }}
        >
          <span className="ant-calendar-range-picker ant-input">
            {this.props.formUtils.getFieldDecorator("start")(
              <Input
                type="number"
                className="ant-calendar-range-picker-input"
                style={{ marginRight: "5%" }}
              />
            )}
            <span className="ant-calendar-range-picker-separator">~</span>
            {this.props.formUtils.getFieldDecorator("end")(
              <Input
                type="number"
                className="ant-calendar-range-picker-input"
                style={{ marginLeft: "8%" }}
              />
            )}
          </span>
        </span>
      </Form>
    );
  }
}
GridRangeFilterForm = Form.create({})(GridRangeFilterForm);

class GridRangeFilter extends GridFilterBase {
  constructor() {
    super();
    this.formUtils = new FormUtils("gridRangeFilter");
  }
  handleConfirm() {
    let data;

    data = this.formUtils.getFieldsValue();
    if (data.start == null && data.end == null) {
      return;
    }
    super.handleConfirm([
      {
        filterType: FILTER_TYPE.NUMBER_RANGE,
        values: [data.start, data.end]
      }
    ]);
  }
  handleRest() {
    super.handleRest();
    this.formUtils.resetFields();
  }
  render() {
    return (
      <GridFilterHTML
        onConfirm={() => this.handleConfirm(this.value)}
        onReset={() => this.handleRest()}
      >
        <GridRangeFilterForm formUtils={this.formUtils} />
      </GridFilterHTML>
    );
  }
}

class GridCitysFilterForm extends Component {
  componentWillMount() {
    this.props.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }
  }
  setCitys(citys) {
    this.citys = citys;
  }
  render() {
    return (
      <Form>
        {this.props.formUtils.getFieldDecorator("citys")(
          <Citys setCitys={citys => this.setCitys(citys)} />
        )}
      </Form>
    );
  }
}
GridCitysFilterForm = Form.create({})(GridCitysFilterForm);

class GridCitysFilter extends GridFilterBase {
  constructor() {
    super();
    this.formUtils = new FormUtils("gridCitysFilter");
  }
  handleConfirm() {
    let data;

    data = this.formUtils.getFieldsValue();
    this.form.citys.clear();
    super.handleConfirm([
      {
        filterType: FILTER_TYPE.CITYS,
        values: data.citys
      }
    ]);
  }
  handleRest() {
    super.handleRest();
    this.formUtils.resetFields();
  }
  setForm(form) {
    this.form = form;
  }
  render() {
    return (
      <div className="citys-filter">
        <GridFilterHTML
          onConfirm={() => this.handleConfirm(this.value)}
          onReset={() => this.handleRest()}
        >
          <GridCitysFilterForm
            formUtils={this.formUtils}
            setForm={form => this.setForm(form)}
          />
        </GridFilterHTML>
      </div>
    );
  }
}

class GridManager extends Component {
  filterDropdownVisible = {};
  constructor() {
    super();
    this.state = {
      loading: true,
      data: [],
      filterList: [],
      gridHeight: 400,
      fields: [],
      isMounted: false,
      filterDropdownVisible: {}
    };
    // this.initRowSelection();
    this.gridId = `grid_${+new Date()}`;
  }
  componentWillMount() {
    this.setState({ fields: this.props.fields });
    this.columnsBaseWidth = [];
    this.props.columns.map(item => {
      this.columnsBaseWidth.push({
        dataIndex: item.dataIndex,
        width: item.width
      });
    });
  }
  componentWillUnmount() {
    this.Interval && window.clearInterval(this.Interval);
    window.removeEventListener("resize", this.resizeEvent, false);
  }

  componentDidMount() {
    this.gridBox = document.querySelector(`#${this.gridId}`);

    function resetGridSize(gridManager) {
      let getBoundingClientRect = gridManager.gridBox.getBoundingClientRect();

      gridManager.width = getBoundingClientRect.width;
      gridManager.height = getBoundingClientRect.height;

      gridManager.setState({ gridHeight: gridManager.height });
    }

    this.resizeEvent = this.resizeTableAndColumnWidth(this);

    window.addEventListener("resize", this.resizeEvent, false);

    this.resizeEvent();

    if (!this.props.disableAutoHeight) {
      this.Interval = setInterval(() => {
        let getBoundingClientRect = this.gridBox.getBoundingClientRect();

        if (
          this.width == getBoundingClientRect.width &&
          this.height == getBoundingClientRect.height
        ) {
          return;
        }
        this.resizeEvent();
        resetGridSize(this);
      }, 500);

      resetGridSize(this);
    } else {
      this.Interval = setInterval(() => {
        this.resizeEvent();
      }, 500);
    }
  }

  /**
   * 重设table列宽
   */
  resizeTableAndColumnWidth = gridManager => () => {
    const minWidth = 140;
    const width = gridManager.gridBox.getBoundingClientRect().width;

    let gridWidth = gridManager.props.gridWidth || 0;
    let columns = gridManager.props.columns;
    if (gridWidth === 0) {
      this.columnsBaseWidth.map((column, index) => {
        gridWidth = gridWidth + (column.width || minWidth);
      });
    }

    let extendWidth = 0;
    if (width > gridWidth) {
      extendWidth = (width - gridWidth) / columns.length;
    }

    columns = columns.map((column, index) => {
      if (column.width) {
        column.width = this.columnsBaseWidth[index].width + extendWidth;
      }
      return column;
    });
    gridManager.setState({
      columns: columns,
      gridWidth: gridWidth / width * 100 + "%"
    });
  };

  initRowSelection() {
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (ids, records) => {
        console.log(ids, records);

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
        this.setState({
          selectedRowKeys: ids
        });
        if (this.props.onSelect) {
          this.props.onSelect.call(this, {
            selectIds: ids,
            selectRowsData: records,
            selectRowsCount
          });
        }
      }
    };

    return rowSelection;
  }

  /**
   * 清除行选中状态
   */
  clearRowSelect = () => {
    this.setState({
      selectedRowKeys: []
    });
    this.grid.setState({
      selectIds: "",
      selectRowsData: [],
      selectedRowKeys: [],
      selectRowsCount: 0
    });
    if (this.props.onSelect) {
      this.props.onSelect.call(this, {
        selectIds: "",
        selectRowsData: [],
        selectRowsCount: 0
      });
    }
  };
  makeFilterMapData() {
    let filterMapData, i, j, columns, column, filter;

    filterMapData = {};
    columns = this.getColumns();
    for (i = 0; i < columns.length; i++) {
      column = columns[i];
      if (!column.dataIndex) {
        continue;
      }
      filterMapData[column.dataIndex] = {
        title: column.text || column.title,
        filter: {}
      };
      if (!column.filters) {
        continue;
      }
      filterMapData[column.dataIndex].filterCount = column.filters.length;
      for (j = 0; j < column.filters.length; j++) {
        filter = column.filters[j];
        filterMapData[column.dataIndex].filter[filter.value] =
          filter.label || filter.text;
      }
    }
    this.filterMapData = Object.assign(this.filterMapData || {}, filterMapData);
  }
  beforeLoad(params) {
    let gridState;

    if (this.props.beforeLoad) {
      params = this.props.beforeLoad.apply(this, [params]);
    }

    this.setState({ loading: true, selectedRowIndex: -1 });

    this.clearRowSelect();
    this.resizeEvent();

    if (params.orderColumn) {
      this.grid.state.sortField = params.orderColumn;
      this.grid.state.sortOrder = params.sort;
    } else {
      delete this.grid.state.sortField;
      delete this.grid.state.sortOrder;
    }
    return params;
  }
  /**
   * 设置表头筛选条件显示元素
   * @param {Element} filterBar
   */
  setFilterBar(filterBar) {
    this.filterBar = filterBar;
  }
  handleChange(pagination, filters, sorter) {
    let filterList = [],
      k,
      v;
    let table = this.grid.refs.grid;

    if (this.props.onChange) {
      this.props.onChange.apply(this, [pagination, filters, sorter]);
    }

    if (table && table.state.search) {
      let search = table.state.search;

      Object.keys(search).map(name => {
        filterList.push({ name, value: search[name] });
      });
    }

    for (k in filters) {
      v = filters[k];
      filterList.push({ name: k, value: v });
    }

    this.filterBar && this.filterBar.setState({ filterList });

    this.grid.load(undefined, pagination, filters, sorter);
  }
  setFilters(key, data) {
    if (!data || data.length === 0) return;

    let i,
      filters = [];
    for (i = 0; i < data.length; i++) {
      filters.push({ text: data[i].name, value: data[i].code });
    }
    this.state[key + "Filters"] = filters;
    this.setState(this.state);
    this.makeFilterMapData();
  }
  showGridColumnsSetting() {
    this.refs.gridColumnsSetting.show(this.state.fields);
  }
  getColumns() {
    let showColumns,
      allColumns,
      width = 0;

    // console.log(this.state.fields);
    // if (!this.state.fields || !this.state.fields.length) {
    const { columns } = this.props;
    columns &&
      columns.map(item => {
        if (item.hasOwnProperty("filterDropdown")) {
          item.filterDropdownVisible = this.state.filterDropdownVisible[
            item.dataIndex
          ];
          item.onFilterDropdownVisibleChange = visible => {
            const { filterDropdownVisible, columns } = this.state;
            filterDropdownVisible[item.dataIndex] = visible;
            columns.map(column => {
              if (column.dataIndex == item.dataIndex) {
                column.filterDropdownVisible = visible;
              } else {
                column.filterDropdownVisible = undefined;
              }
              return column;
            });
            this.setState({
              columns: columns,
              filterDropdownVisible: filterDropdownVisible
            });
          };
        }
      });

    this.setState({
      columns: columns
    });

    return columns;
    // }
    // showColumns = [];

    // this.state.fields.map(field => {
    //   if (field.mustShow == 1 || field.showOrNot == 1) {
    //     showColumns.push(field);
    //   }
    // });

    // showColumns = showColumns.sort((a, b) => {
    //   a.fieldIndex = +a.fieldIndex;
    //   b.fieldIndex = +b.fieldIndex;
    //   if (a.fieldIndex > b.fieldIndex) {
    //     return 1;
    //   } else if (a.fieldIndex < b.fieldIndex) {
    //     return -1;
    //   } else {
    //     return 0;
    //   }
    // });

    // showColumns = showColumns.map(column => {
    //   let c, mapp, fixed;

    //   mapp = {
    //     1: "left",
    //     2: "right"
    //   };
    //   if (column.fieldName) {
    //     c = allColumns[column.fieldName];
    //     if (c) {
    //       if (!c.dataIndex) {
    //         c.dataIndex = column.fieldName;
    //       }
    //       c.title = column.fieldNameZH || c.title;
    //       if (typeof c.filters == "function") {
    //         c.filters = c.filters.call(this.props.mod);
    //       }
    //     } else {
    //       c = {
    //         dataIndex: column.fieldName,
    //         title: column.fieldNameZH
    //       };
    //     }
    //   } else {
    //     c = column;
    //   }

    //   if (!c.width) {
    //     c.width = 100;
    //   }

    //   width += c.width;
    //   return c;
    // });
    // showColumns.push({
    //   title: <a />,
    //   width: 50
    // });
    // width += 50;
    // this.gridWidth = width;
    // return showColumns;
  }
  // handleResetFields(fields) {
  //   this.setState({ fields });
  //   this.grid.load();
  // }
  /**
   * 排序筛选事件
   * @param {*} order
   * @param {*} column
   */
  toggleSortOrder(order, column) {
    this.grid.toggleSortOrder(order, column);
  }

  onSearch = (search = {}) => {
    let table = this.grid.refs.grid;

    table.setState({ search }, () => {
      table.handleFilter({});

      this.filterBar.handleCollapse();
    });
  };
  render() {
    let {
      fields,
      url,
      beforeLoad,
      gridWrapClassName,
      dataSource,
      children,
      noRowSelection,
      rowKey,
      disabledAutoLoad,
      scroll,
      loadSuccess,
      columns,
      ...others
    } = this.props;

    columns = this.state.columns || this.getColumns();

    this.scrollValue = this.state.gridWidth
      ? {
          x: this.state.gridWidth || 1720,
          y: scroll ? scroll.y : null
        }
      : scroll || {
          x: "100%"
        };
    return (
      <div className={gridWrapClassName ? gridWrapClassName : "grid-panel"}>
        {children}
        {/*<GridColumnsSetting
          columns={columns}
          fields={this.props.fields}
          ref="gridColumnsSetting"
          onSave={::this.handleResetFields}
        />*/}
        <div className="grid" id={this.gridId}>
          {/* fields &&
            fields.length && (
              <a
                className="grid-setting"
                onClick={::this.showGridColumnsSetting}
              >
                <Icon type="setting" />
              </a>
            ) */}
          <DataGrid
            columns={columns}
            url={url}
            beforeLoad={params => this.beforeLoad(params)}
            rowSelection={!!noRowSelection ? null : this.initRowSelection()}
            dataSource={dataSource}
            rowKey={rowKey || "id"}
            onRowClick={(record, index, event) => {
              if (index !== this.state.selectedRowIndex) {
                this.setState({ selectedRowIndex: index });
              }
            }}
            rowClassName={(record, index) =>
              this.state.selectedRowIndex === index
                ? "ant-table-row-selected"
                : ""}
            disabledAutoLoad={disabledAutoLoad}
            onChange={(pagination, filters, sorter) => {
              this.handleChange(pagination, filters, sorter);
            }}
            scroll={this.scrollValue}
            loadSuccess={loadSuccess || (() => {})}
            ref={grid => {
              grid && (this.grid = grid);
            }}
            {...others}
          />
        </div>
      </div>
    );
  }
}

class FilterBar extends Component {
  constructor() {
    super();
    this.state = {
      collapse: false,
      filterList: []
    };
  }
  componentDidMount() {
    const elem = document.getElementById("grid-fitler-form");
    if (elem) {
      document.addEventListener(
        "click",
        e => {
          this.handleClick(e);
        },
        false
      );
    }
  }
  componentWillUnmount() {
    document.removeEventListener(
      "click",
      e => {
        this.handleClick(e);
      },
      false
    );
  }
  handleClick(e) {
    const { collapse } = this.state;
    const elem = document.getElementById("grid-fitler-form");
    const className = e.target.className;

    if (
      style.more === className ||
      className.indexOf("anticon") > -1 ||
      collapse === false ||
      elem === null
    )
      return;

    let rect = elem.getBoundingClientRect(); // 目标区域

    console.log("目标区域", rect);

    const x = e.clientX;
    const y = e.clientY;

    const left = rect.left;
    const top = rect.top;
    const areaX = left + rect.width;
    const areaY = rect.top + rect.height;

    if (x < left || x > areaX || y < top || y > areaY) {
      this.setState({ collapse: false });
    }
  }
  loadFilterTags() {
    let i, filterList, tags;

    filterList = this.state.filterList;
    tags = [];
    for (i = 0; i < filterList.length; i++) {
      let tag, filter;

      filter = filterList[i];
      if (
        (filter.value instanceof Array && filter.value.length) ||
        (!(filter.value instanceof Array) && filter.value)
      ) {
        let tagText = this.getFilterText(filter);

        tagText &&
          tags.push(
            <Tag
              closable
              key={filter.name}
              onClose={e => {
                this.delFilter(filter);
              }}
              ref={tag => {
                tag && tag.setState({ closed: false });
              }}
            >
              {tagText}
            </Tag>
          );
      }
    }
    return tags;
  }
  getFilterText(filter) {
    let title, filterText, filterMapData, filterValue, mappFilter, i;

    const {gridManager} = this.props;
    if (!gridManager || !gridManager.filterMapData ) {
      return null
    }

    filterMapData = gridManager.filterMapData;

    if (!filterMapData[filter.name]) return null;

    title = filterMapData[filter.name].title;
    mappFilter = filterMapData[filter.name].filter;
    filterValue = filter.value[0];

    filterText = [];

    if (filterValue && filterValue.filterType) {
      switch (filterValue.filterType) {
        case FILTER_TYPE.DATE_RANGE:
        case FILTER_TYPE.Month_RANGE:
          filterText = `${filterValue.values[0]} 至 ${filterValue.values[1]}`;
          break;
        case FILTER_TYPE.NUMBER_RANGE:
          if (filterValue.values[0] == null) {
            filterText = `最大 ${filterValue.values[1]}`;
          } else if (filterValue.values[1] == null) {
            filterText = `最小 ${filterValue.values[0]}`;
          } else {
            filterText = `${filterValue.values[0]} - ${filterValue.values[1]}`;
          }
          break;
        case FILTER_TYPE.CITYS:
          let text, tmpText;

          if (filter) {
            text = filterValue.values.text;
            if (text.length > 3) {
              tmpText = text.slice(0, 3);
              filterText = `${tmpText.join(",")} 等${text.length}个城市`;
            } else {
              filterText = text.join(",");
            }
          }
          break;
      }
    } else if (filter.value instanceof Array) {
      for (i = 0; i < filter.value.length; i++) {
        filterValue = filter.value[i];
        filterText.push(mappFilter[filterValue] || filterValue);
      }
      filterText = filterText.join(",");
    } else {
      filterText = filter.value;
    }
    return (
      <span>
        {title}：<span className="tag_value">{filterText}</span>
      </span>
    );
  }

  loadSortTags() {
    let title, type, gridState, gridManager, sortOrder;
    gridManager = this.props.gridManager;
    if (gridManager && gridManager.filterMapData && gridManager.grid) {
      gridState = gridManager.grid.state;
      title =
        gridManager.filterMapData[
          gridState.sortField || (gridState.sorter && gridState.sorter.field)
        ];
      if (title) {
        title = title.title;
        sortOrder = gridManager.grid.state.sortOrder;
        if (sortOrder) {
          sortOrder = sortOrder.replace("end", "");
        }
        if (sortOrder == "asc") {
          type = sortAsc;
          title = `${title}A-Z`;
        } else if (sortOrder == "desc") {
          type = sortDesc;
          title = `${title}Z-A`;
        }
        if (type) {
          return (
            <Tag
              closable
              onClose={() => this.props.gridManager.grid.toggleSortOrder()}
              ref={tag => {
                tag && tag.setState({ closed: false });
              }}
            >
              <img src={type + ".png"} srcSet={type + "@2x.png"} />排序：<span className="tag_value">{title}</span>
            </Tag>
          );
        }
      }
    }
  }
  /**
   * 清除单个过滤条件
   * @param {*} filter
   */
  delFilter(filter) {
    let table = this.props.gridManager.grid.refs.grid;
    let search = table.state.search;

    for (var key in search) {
      if (search.hasOwnProperty(key) && key === filter.name) {
        delete search[key];
        break;
      }
    }

    table.setState({ search }, () =>
      this.props.gridManager.grid.refs.grid.handleFilter(
        {
          dataIndex: filter.name
        },
        []
      )
    );
  }
  /**
   * 清空所有筛选条件
   */
  clearAllFilter = () => {
    let table = this.props.gridManager.grid.refs.grid;

    table.setState(
      {
        search: {},
        filters: {},
        sortOrder: null,
        sortColumn: null,
        sorter: {}
      },
      () => {
        table.handleFilter({});
      }
    );
  };

  handleCollapse = () => {
    this.setState({ collapse: !this.state.collapse });
  };
  render() {
    let filterTag = this.loadFilterTags();
    let sortTag = this.loadSortTags();

    const { collapse } = this.state;

    return (
      <div
        className={ClassNames("vant-filter-bar-list", {
          [style.advancedsearch]: this.props.children
        })}
      >
        <div>
          {this.props.children ? (
            <a className={style.more} onClick={this.handleCollapse}>
              更多筛选 {collapse ? <Icon type="up" /> : <Icon type="down" />}
            </a>
          ) : null}

          {filterTag}
          {sortTag}

          {filterTag.length > 0 || sortTag ? (
            <a onClick={this.clearAllFilter}>清空</a>
          ) : null}

          {this.props.children ? (
            <div
              className={ClassNames(style.filterForm, {
                [style.show]: collapse
              })}
              id="grid-fitler-form"
            >
              {this.props.children}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

const exp = {
  FILTER_TYPE,
  GridInputFilter,
  GridSortFilter,
  GridDateFilter,
  GridRangeFilter,
  GridCheckboxFilter,
  GridCitysFilter,
  GridManager,
  FilterBar
};

export default exp;
