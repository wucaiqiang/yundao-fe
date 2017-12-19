import React from "react";
import PropTypes from "prop-types";
import {
  Breadcrumb,
  Button,
  Dropdown,
  Icon,
  Menu,
  Modal,
  Popconfirm,
  Popover,
  Select,
  Tooltip,
  message
} from "antd";
import ClassNames from "classnames";

import Base from "components/main/Base";
import Page from "components/main/Page";
import Permission from "components/permission";

import GM from "lib/gridManager";
import Utils from "utils/";

import Dictionary from "model/dictionary";
import Customer from "model/Customer";

import EditChannelModal from "services/channel/editChannelModal";
import ImportChannelModal from "services/channel/importChannelModal";
import ChannelFloatPane from "services/channel/detail/floatPane";
import ChannelDeployModal from "services/channel/channelDeployModal";

import style from "./Index.scss";

const {
  GridManager,
  FilterBar,
  GridInputFilter,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter,
  GridCitysFilter
} = GM;

const icon_deploy = "/assets/images/customer/调配";

export default class CustomerChannel extends Base {
  static get NAME() {
    return "CustomerChannel";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[CustomerChannel.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: true,
      menuName: {
        text: "我负责的渠道",
        value: "my"
      },
      filters: {
        dic_customer_level: [],
        dic_channel_company_type: []
      }
    };
  }
  componentWillMount() {
    this.dictionary = new Dictionary();
    this.customer = new Customer();

    this.getDictionary();
    this.getColumns();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }
  }

  getDictionary() {
    this.dictionary
      .gets("dic_customer_level,dic_yes_or_no,dic_channel_company_type")
      .then(res => {
        if (res.success && res.result) {
          let filters = {};
          res.result.map(item => {
            filters[item.value] = item.selections;
          });

          this.setState({ filters });
        }
      });
  }
  getAreaText(record) {
    if (record.provinceText && record.cityText) {
      return `${record.provinceText}/${record.cityText}`;
    } else if (!record.provinceText) {
      return record.cityText;
    } else if (!record.cityText) {
      return record.provinceText;
    } else {
      return null;
    }
  }
  getColumns = () => {
    const {
        dic_customer_level,
        dic_yes_or_no,
        dic_channel_company_type
      } = this.state.filters,
      columns = [
        {
          title: "渠道名称",
          dataIndex: "name",
          width: 120,
          fixed: "left",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="name" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return (
              <a
                role="floatPane"
                onClick={e => {
                  this.channelFloatPane.show(record);
                }}
              >
                {record.name}
              </a>
            );
          }
        },
        {
          title: "渠道编号",
          dataIndex: "number",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="number" mod={this} />
            </div>
          )
        },
        {
          title: "电话号码",
          dataIndex: "mobile",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter
                filterKey="mobile"
                mod={this}
                placeholder="请输入正确电话号码"
              />
            </div>
          )
        },
        {
          title: "类型",
          dataIndex: "type",
          filters: dic_channel_company_type,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="type" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.typeText;
          }
        },
        {
          title: "当前对接人",
          dataIndex: "ssssss",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="ssssss" mod={this} />
            </div>
          )
        },
        {
          title: "地域",
          dataIndex: "cityCodes",
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCitysFilter filterKey="cityCodes" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return this.getAreaText(record);
          }
        },
        {
          title: "重要级别",
          dataIndex: "level",
          sorter: true,
          filters: dic_customer_level,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="level" mod={this} />
              <GridCheckboxFilter filterKey="level" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.levelText;
          }
        },
        {
          title: "是否成交",
          dataIndex: "isBargain",
          width: 90,
          filters: dic_yes_or_no,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridCheckboxFilter filterKey="isBargain" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return record.isBargainText;
          }
        },
        {
          title: "负责人",
          dataIndex: "leadName",
          width: 120,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="leadName" mod={this} />
            </div>
          )
        },
        {
          title: "负责人所在部门",
          dataIndex: "leadOrg",
          width: 150,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridInputFilter filterKey="leadOrg" mod={this} />
            </div>
          )
        },
        {
          title: "最近成交日期",
          dataIndex: "dealDate",
          width: 130,
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="dealDate" mod={this} />
              <GridDateFilter filterKey="dealDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(text, "YYYY-MM-DD");
          }
        },
        {
          title: "分配日期",
          dataIndex: "transferDate",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="transferDate" mod={this} />
              <GridDateFilter filterKey="transferDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(text, "YYYY-MM-DD");
          }
        },
        {
          title: "创建日期",
          dataIndex: "createDate",
          sorter: true,
          filterDropdown: (
            <div className={"filter_dropdown"}>
              <GridSortFilter filterKey="createDate" mod={this} />
              <GridDateFilter filterKey="createDate" mod={this} />
            </div>
          ),
          render: (text, record) => {
            return Utils.formatDate(text, "YYYY-MM-DD");
          }
        }
      ];

    return columns;
  };
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();
    this.resetFilterByKey(params, "name");
    this.resetFilterByKey(params, "number");
    this.resetFilterByKey(params, "mobile");
    this.resetFilterByKey(params, "type");
    this.resetFilterByKey(params, "cityCodes");
    this.resetFilterByKey(params, "level");
    this.resetFilterByKey(params, "isBargain");
    this.resetFilterByKey(params, "leadName");
    this.resetFilterByKey(params, "leadOrg");
    this.resetFilterByKey(params, "dealDate");
    this.resetFilterByKey(params, "transferDate");
    this.resetFilterByKey(params, "createDate");

    if (params.cityCodes && params.cityCodes.length) {
      params.cityCodes = params.cityCodes.join(",");
    }

    if (params.dealDate && params.dealDate.length) {
      params.dealDateBegin = params.dealDate[0];
      params.dealDateEnd = params.dealDate[1];
      delete params.dealDate;
    }
    if (params.transferDate && params.transferDate.length) {
      params.transferDateBegin = params.transferDate[0];
      params.transferDateEnd = params.transferDate[1];
      delete params.transferDate;
    }
    if (params.createDate && params.createDate.length) {
      params.createDateBegin = params.createDate[0];
      params.createDateEnd = params.createDate[1];
      delete params.createDate;
    }

    if ("sortField" in params) {
      if (params.sortField) {
        params.orderColumn = params.sortField;
      }
      delete params.sortField;
    }
    if ("sortOrder" in params) {
      if (params.sortOrder) {
        params.sort = params.sortOrder;
      }
      delete params.sortOrder;
    }
    if (params.sort) {
      params.sort = params.sort.replace("end", "");
    }

    params.scope = this.state.menuName.value;

    return params;
  }

  resetFilterByKey(params, key, newKey) {
    if (params[key]) {
      if (params[key] instanceof Array) {
        if (
          params[key].length === 1 &&
          params[key][0] &&
          params[key][0].filterType === "dateRange"
        ) {
          params[key] = params[key][0].values;
        } else if (key === "birthday") {
          params[key] = params[key][0].values.splice(2);
        } else if (
          params[key].length === 1 &&
          params[key][0] &&
          params[key][0].filterType === "citys"
        ) {
          params[key] = params[key][0].values.value;
        } else {
          params[key] = params[key].join(",");
        }
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
  handleSelect(selectData) {
    this.setState({ ...selectData });
  }
  showModal(modal, data) {
    this.refs[modal].show(data);
  }
  /**
   * 关注
   *
   * @returns
   * @memberof CustomerChannel
   */
  handleFollow = () => {
    let { selectIds: customerIds } = this.state,
      _this = this;
    this.customer.focus(customerIds).then(res => {
      if (res.success) {
        Modal.success({
          title: "关注成功",
          content: "可在左上角筛选项中选择我关注的渠道查看。",
          okText: "确定"
        });

        _this.gridManager.clearRowSelect();
      }
    });
  };
  /**
   * 调配
   *
   * @returns
   */
  handleModal = modal => {
    let { selectRowsData, selectIds } = this.state,
      channelNames = [];

    selectRowsData.map(item => {
      channelNames.push(item.name);
    });

    let data = {
      ids: selectIds.join(","),
      names: channelNames.join("、")
    };
    this[modal].show(data);
  };
  handleMenuClick = e => {
    let menuName = {
      text: e.item.props.children,
      value: e.key
    };

    this.setState({ menuName }, () => {
      this.gridManager.grid.reload();
    });
  };
  reload = () => {
    this.gridManager.grid.reload();
  };
  render() {
    const hasAdd = Utils.checkPermission("channel.add");
    const hasImport = Utils.checkPermission("channel.import");

    const PermissionButton = ((hasAdd, hasImport) => {
      if (hasAdd) {
        if (hasImport) {
          return (
            <div className={style.import_btn}>
              <Dropdown.Button
                overlay={
                  <div className={style.import}>
                    <Menu
                      onClick={(item, key, selectedKeys) => {
                        this.importChannelModal.show({
                          request: "/api/customer/v2/import/multi"
                        });
                      }}
                    >
                      <Menu.Item key="import_customer">
                        <span>导入渠道</span>
                      </Menu.Item>
                    </Menu>
                  </div>
                }
                onClick={() => {
                  this.editChannelModal.show();
                }}
              >
                <img src={"/assets/images/icon/新增@2x.png"} alt="" />
                新增渠道
              </Dropdown.Button>
            </div>
          );
        } else {
          return (
            <div className={style.import_btn}>
              <Button
                onClick={() => {
                  this.editChannelModal.show();
                }}
              >
                <img src={"/assets/images/icon/新增@2x.png"} alt="" />
                新增渠道
              </Button>
            </div>
          );
        }
      } else if (hasImport) {
        return (
          <div className={style.import_btn}>
            <Button
              onClick={() => {
                this.importCustomerModal.show({
                  request: "/api/customer/v2/import/multi"
                });
              }}
            >
              <img src={"/assets/images/icon/新增@2x.png"} alt="" />
              导入客户
            </Button>
          </div>
        );
      }
      return null;
    })(hasAdd, hasImport);

    const PermissionAllotFp = Permission(
      <span>
        <span className="separator">|</span>
        <a
          className="ant-btn-link"
          onClick={() => this.handleModal("channelDeployModal")}
        >
          <img src={icon_deploy + "@1x.png"} />调配
        </a>
      </span>
    );

    const PermissionFocus = Permission(
      <span>
        <span className="separator">|</span>
        <a className="ant-btn-link" onClick={this.handleFollow}>
          <Icon type="heart-o" />关注
        </a>
      </span>
    );

    let { menuName, selectRowsCount } = this.state;
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>客户管理</Breadcrumb.Item>
          <Breadcrumb.Item>渠道</Breadcrumb.Item>
        </Breadcrumb>
        <div className="page-content">
          <GridManager
            onSelect={selectData => {
              this.handleSelect(selectData);
            }}
            columns={this.getColumns()}
            url="/channel/get_page"
            beforeLoad={params => {
              return this.beforeLoad(params);
            }}
            gridWrapClassName="grid-panel auto-width-grid"
            mod={this}
            scroll={{
              x: "100%"
            }}
            ref={gridManager => {
              gridManager && (this.gridManager = gridManager);
            }}
          >
            <div className={`vant-filter-bar clearfix`}>
              <div className="vant-filter-bar-title fl">
                <Dropdown
                  className={style.drop_menu}
                  overlay={
                    <Menu onClick={this.handleMenuClick}>
                      <Menu.Item key="my">我负责的渠道</Menu.Item>
                      <Menu.Item key="focus">我关注的渠道</Menu.Item>
                      <Menu.Item key="department">我部门的渠道</Menu.Item>
                      <Menu.Item key="public">全部渠道</Menu.Item>
                    </Menu>
                  }
                >
                  <a className={`ant-dropdown-link ${style.title}`}>
                    {menuName.text}
                    <Icon type="down" />
                  </a>
                </Dropdown>
              </div>
              <div className="vant-filter-bar-action fl">
                <FilterBar gridManager={this.gridManager} ref="filterBar" />
              </div>
              <div className="vant-filter-bar-action fr">
                {PermissionButton}
              </div>

              <div
                className={ClassNames({
                  "vant-float-bar": true,
                  open: selectRowsCount
                })}
              >
                已选中
                <span className="count">{selectRowsCount}</span>
                项
                <PermissionFocus auth="channel.focus" />
                <PermissionAllotFp auth="channel.allot" />
              </div>
            </div>
          </GridManager>
        </div>
        <ChannelFloatPane ref={ref => (this.channelFloatPane = ref)} />
        <EditChannelModal
          ref={ref => (this.editChannelModal = ref)}
          reload={this.reload}
        />
        <ImportChannelModal
          ref={ref => (this.importChannelModal = ref)}
          callback={this.reload}
        />
        <ChannelDeployModal
          ref={ref => (this.channelDeployModal = ref)}
          reload={this.reload}
        />
      </Page>
    );
  }
}
