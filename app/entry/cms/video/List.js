import React from "react";
import ReactDom from "react-dom";
import extend from "extend";
import PropTypes from "prop-types";

import {Link} from "react-router-dom";

import {
  Breadcrumb,
  Icon,
  Select,
  Button,
  Layout,
  Popover,
  Popconfirm,
  Dropdown,
  message,
  Menu,
  Modal,
  Radio
} from "antd";

const RadioGroup = Radio.Group;

import Base from "components/main/Base";
import Page from "components/main/Page";

import Utils from "utils/";
import GM from "lib/gridManager";

import EditVideoUploadListModal from "services/cms/Video/editVideoUploadListModal";
import EditVideoModal from "services/cms/Video/editVideoModal";

import Dictionary from "model/dictionary";
import Product from "model/Product/";
import ProductCategory from "model/Product/category";
// import NewsColumn from "model/CMS/News/column";
import Video from "model/CMS/Video/index";

import EnumProduct from "enum/enumProduct";

import Permission from "components/permission";

const {
  GridManager,
  FilterBar,
  GridInputFilter,
  GridRangeFilter,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter
} = GM;

const {Option} = Select;

const {EnumProductStatus} = EnumProduct;

const icon_add = "/assets/images/icon/新增";
const icon_operation = "/assets/images/icon/操作";
const icon_question = "/assets/images/icon/问号";

export default class VideoList extends Base {
  static get NAME() {
    return "VideoList";
  }

  static get contextTypes() {
    return {data: PropTypes.object};
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[VideoList.NAME]) {
      this.context = context;
    }
    this.state = {
      productCategory: [],
      declaractionModel: 2,
      filters: {
        product_level: [],
        product_risk_level: [],
        dic_product_issued_status: [],
        dic_product_examine_status: []
      }
    };
  }

  componentWillMount() {
    this.video = new Video();
    this.dictionary = new Dictionary();

    this.getColumns();
  }
  componentDidMount() {
    if (this.gridManager && this.refs.filterBar) {
      this
        .gridManager
        .setFilterBar(this.refs.filterBar);
    }

    this.getDictionary();
  }
  getFloatToolsBarCls() {
    let cls;

    cls = ["vant-float-bar"];
    if (this.state.selectRowsCount) {
      cls.push("open");
    }
    return cls.join(" ");
  }
  getDictionary() {
    this
      .dictionary
      .gets("dic_video_status")
      .then(res => {
        if (res.success && res.result) {
          let filters = {};
          res
            .result
            .map(item => {
              filters[item.value] = item.selections;
            });

          this.setState({filters});
        }
      });
  }

  getColumns() {
    let {filters, productCategory} = this.state;
    const columns = [
      {
        title: "视频名称",
        dataIndex: "name",
        width: 200,
        fixed: "left",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter
              filterKey="name"
              mod={this}
              placeholder="请输入视频名称"
            />
          </div>
        ),
        render: (text, record) => {
          return (
            <a onClick={e=>{
              this.editVideoModal.show(record)
            }}>
              {text}
            </a>
          );
        }
      }, {
        title: "状态",
        dataIndex: "statuss",
        filters:filters.dic_video_status,
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridCheckboxFilter
              filterKey="statuss"
              mod={this}
              placeholder="请输入视频名称"
            />
          </div>
        ),
        render: (text, record) => {
          return record.statusText;
        }
      }, {
        title: "时长",
        dataIndex: "duration",
        sorter:true,
        render: (text, record) => {
          return record.duration ? Utils.formatTime(record.duration):null
        }
      }, {
        title: "大小",
        dataIndex: "size",
        sorter:true,
        render: (text, record) => {
          return record.size?Utils.bytesToSize(record.size):null
        }
      }, 
       {
        title: "创建人",
        dataIndex: "createUserName",
        filterDropdown: (
          <div className={"filter_dropdown"}>
            <GridInputFilter
              filterKey="createUserName"
              mod={this}
              placeholder="请输入创建人"
            />
          </div>
        ),
        render: (text, record) => {
          return record.createUserName;
        }
      }, {
        title: "创建时间",
        sorter:true,
        dataIndex: "createDate",
        filterDropdown: (
          <div className={"filter_dropdown"}>
          <GridSortFilter filterKey="createDate"  mod={this}/>
          <GridDateFilter filterKey="createDate"  mod={this} />
          </div>
        ),
        render: (text, record) => {
          return  record.createDate?Utils.formatDate(record.createDate):null
        }
      },
      {
        title: "操作",
        dataIndex: "operation",
        render: (text, record) => {
          return  record.status != 1?<a onClick={()=>{
            this.handleTranscode(record.id)
          }}>重新压缩</a>: <Popover
          placement="topRight"
          content={'压缩完成的无须重新压缩'}
          arrowPointAtCenter
        >
          <span className="disabled">重新压缩</span>
        </Popover>
        }
      },
    ];

    return columns;
  }
  beforeLoad(params) {
    this
      .gridManager
      .makeFilterMapData();
    this.resetFilterByKey(params, "name");
    this.resetFilterByKey(params, "statuss");
    this.resetFilterByKey(params, "size");
    this.resetFilterByKey(params, "duration");
    this.resetFilterByKey(params, "createUserName");
    this.resetFilterByKey(params, "createDate");

    if ("sortField" in params) {
      if (params.sortField) {
        params.orderColumn = params.sortField;
      }
      delete params.sortField;
    }

    if (params.createDate && params.createDate.length) {
      params.createDateBegin = params.createDate[0];
      params.createDateEnd = params.createDate[1];
      delete params.createDate;
    }

    if ("sortOrder" in params) {
      if (params.sortOrder) {
        params.sort = params.sortOrder;
      }
      delete params.sortOrder;
    }
    if (params.sort) {
      params.sort = params
        .sort
        .replace("end", "");
    }

    return params;
  }

  resetFilterByKey(params, key, newKey) {
    if (params[key]) {
      if (params[key]instanceof Array) {
        if (params[key].length === 1 && ["numberRange", "dateRange"].indexOf(params[key][0].filterType) > -1) {
          params[key] = params[key][0].values;
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
    let {
      selectIds,
      selectRowsCount = 0,
      selectRowsData
    } = selectData;
    this.setState({selectIds, selectRowsCount, selectRowsData});
  }

  reload = () => {
    this
      .gridManager
      .grid
      .reload();
  }

  handleDelete = () => {
    let {selectIds} = this.state,
      _this = this,
      ids = selectIds.join(",");

    Modal.confirm({
      width: 350,
      title: "删除后不可撤回，确定吗?",
      onOk: () => {
        return this
          .video
          .delete(ids)
          .then(res => {
            const {
              failList = [],
              passList = []
            } = res.result || {};
            if (failList && failList.length) {
              let successIds = [],
                messageContent = [],
                messages = {};

              passList.map(item => {
                successIds.push(item.id);
              });

              //汇总错误信息
              failList.map(item => {
                if (!messages[item.code]) {
                  messages[item.code] = {
                    message: item.message,
                    name: [item.name]
                  };
                } else {
                  messages[item.code]
                    .name
                    .push(item.name);
                }
              });

              for (var key in messages) {
                if (messages.hasOwnProperty(key)) {
                  let item = messages[key];
                  messageContent.push(
                    <div key={`message_${key}`}>
                      <p>{`${item.message}:`}</p>
                      <p>{item
                          .name
                          .join("、")}</p>
                    </div>
                  );
                }
              }

              if (successIds.length > 0) {
                Modal.confirm({
                  width: 460,
                  title: `您选择的视频中，以下${failList.length}个无法删除：`,
                  content: (
                    <div>
                      <div
                        style={{
                        paddingTop: 15,
                        paddingBottom: 15
                      }}>
                        {messageContent}
                      </div>
                      <p style={{
                        fontSize: "14px"
                      }}>
                        是否继续删除其他选中视频`？
                      </p>
                    </div>
                  ),
                  onOk: () => {
                    return _this
                      .video
                      .delete(successIds.join(","))
                      .then(res => {
                        if (res.success) {
                          message.success("删除成功");
                          this.reload()
                        }
                      });
                  }
                });
              } else {
                _this.gridManager.clearRowSelect()
                // _this.setState({selectRowsCount: 0, selectIds: []});

                //错误同一个原因时
                if (messageContent.length === 1) {
                  messageContent = <p>{failList[0].message}</p>;
                }

                Modal.info({
                  title: "您选择的视频无法删除：", content: <div style={{
                    paddingTop: 15
                  }}>{messageContent}</div>,
                  okText: "确定"
                });
              }
            } else if (res.success) {
              message.success("删除成功");
              this.reload()
            }
          });
      }
    });
  };

  handleTranscode=(ids)=>{
    // let {selectIds} = this.state,
    const _this = this;
    // ids = selectIds.join(",");
    Modal.confirm({
      width: 350,
      title: "重新压缩后不可撤回，确定吗?",
      onOk: () => {
        return this
          .video
          .transcode(ids)
          .then(res => {
            const {
              failList = [],
              passList = []
            } = res.result || {};
            if (failList && failList.length) {
              let successIds = [],
                messageContent = [],
                messages = {};

              passList.map(item => {
                successIds.push(item.id);
              });

              //汇总错误信息
              failList.map(item => {
                if (!messages[item.code]) {
                  messages[item.code] = {
                    message: item.message,
                    name: [item.name]
                  };
                } else {
                  messages[item.code]
                    .name
                    .push(item.name);
                }
              });

              for (var key in messages) {
                if (messages.hasOwnProperty(key)) {
                  let item = messages[key];
                  messageContent.push(
                    <div key={`message_${key}`}>
                      <p>{`${item.message}:`}</p>
                      <p>{item
                          .name
                          .join("、")}</p>
                    </div>
                  );
                }
              }

              if (successIds.length > 0) {
                Modal.confirm({
                  width: 460,
                  title: `您选择的视频中，以下${failList.length}个无法压缩：`,
                  content: (
                    <div>
                      <div
                        style={{
                        paddingTop: 15,
                        paddingBottom: 15
                      }}>
                        {messageContent}
                      </div>
                      <p style={{
                        fontSize: "14px"
                      }}>
                        是否继续压缩其他选中视频`？
                      </p>
                    </div>
                  ),
                  onOk: () => {
                    return _this
                      .video
                      .transcode(successIds.join(","))
                      .then(res => {
                        if (res.success) {
                          message.success("压缩中...");
                          this.reload()
                        }
                      });
                  }
                });
              } else {
                _this.gridManager.clearRowSelect()
                // _this.setState({selectRowsCount: 0, selectIds: []});

                //错误同一个原因时
                if (messageContent.length === 1) {
                  messageContent = <p>{failList[0].message}</p>;
                }

                Modal.info({
                  title: "您选择的视频无法压缩：", content: <div style={{
                    paddingTop: 15
                  }}>{messageContent}</div>,
                  okText: "确定"
                });
              }
            } else if (res.success) {
              message.success("压缩中...");
              this.reload()
            }
          });
      }
    });
  }
  showModal(modal, data) {
    this
      .refs[modal]
      .show(data);
  }
  render() {
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>内容配置</Breadcrumb.Item>
          <Breadcrumb.Item>路演视频管理</Breadcrumb.Item>
        </Breadcrumb>
        <Layout.Content>
          <div className="page-content">
            <GridManager
              gridWrapClassName="grid-panel auto-width-grid"
              url="/video/get_page"
              onSelect={selectData => {
              this.handleSelect(selectData);
            }}
              columns={this.getColumns()}
              beforeLoad={params => {
              return this.beforeLoad(params);
            }}
              mod={this}
              ref={gridManager => {
              gridManager && (this.gridManager = gridManager);
            }}>
              <div className={`vant-filter-bar clearfix`}>
                <div className="fl">
                  <FilterBar gridManager={this.gridManager} ref="filterBar"/>
                </div>
                <div className="vant-filter-bar-action fr">
                    <Button className="btn_add" onClick={()=>{
                        this.editVideoUploadListModal.show()
                    }}>
                      {`上传视频(${window.APP.state.uploadVideoList?window.APP.state.uploadVideoList.length:0})`}
                    </Button>
                    
                </div>
                <div className={this.getFloatToolsBarCls()}>
                  已选中
                  <span className="count">{this.state.selectRowsCount}</span>
                  项
                  <span className="separator">|</span>
                  <a className="ant-btn-link" onClick={this.handleDelete}>
                    <Icon type="delete"/>删除
                  </a>
                  {/* <span className="separator">|</span>
                  <a className="ant-btn-link" onClick={this.handleTranscode}>
                    <Icon type="retweet" />
                    重新转码
                  </a> */}
                </div>
              </div>
            </GridManager>
          </div>
        </Layout.Content>
        <EditVideoUploadListModal reload={this.reload} ref={ref=>{
            if(ref){
                this.editVideoUploadListModal = ref
            }
        }}/>
        <EditVideoModal reload={this.reload} ref={ref=>{
            if(ref){
                this.editVideoModal = ref
            }
        }}/>
      </Page>
    );
  }
}
