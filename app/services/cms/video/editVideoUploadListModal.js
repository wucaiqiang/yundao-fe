
import React from "react";
import { Button, Icon, Modal, Spin, message } from "antd";
import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import utils from 'utils/index'


import GM from "lib/gridManager";
const {
  GridManager,
  FilterBar,
  GridInputFilter,
  GridRangeFilter,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter
} = GM;

const icon_add = "/assets/images/icon/新增";
const icon_operation = "/assets/images/icon/操作";
const icon_question = "/assets/images/icon/问号";

import AddUploadVideoModal from './addUploadVideoModal'


import EnumUploading from "enum/enumUploading";

const { EnumRefundStatus } = EnumUploading;

import style from "./editVideoUploadListModal.scss"

export default class EditVideoUploadListModal extends Base {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visible: false,
      canEdit: false,
      isEdit: false,
      hasReSubmit: false,
      dataSource:window.APP.state.uploadVideoList ||[]
    };

    this.formUtils = new FormUtils("EditVideoUploadListModal");
  }
  componentWillMount() {
  }
  componentDidMount() {}
  /**
   *
   *
   * @param {any} data
   * @param {boolean} [canEdit=true]  是否显示编辑按钮
   * @param {boolean} [hasReSubmit=false]  是否有重新提交按钮
   * @memberof EditCustomerModal
   */


  getColumns() {
    let {filters, productCategory} = this.state;
    const columns = [
      {
        title: "上传文件",
        dataIndex: "name",
        width: 200,
        fixed: "left",
        render: (text, record) => {
          return text
        }
      }, {
        title: "视频名称",
        dataIndex: "videoName",
        render: (text, record) => {
          return record.videoName;
        }
      }, {
        title: "视频大小",
        dataIndex: "size",
        render: (text, record) => {
          return utils.bytesToSize(record.size);
        }
      }, {
        title: "状态",
        render: (text, record) => {
          return EnumRefundStatus.keyValue[record.status]
        }
      }, 
      {
        title: "进度",
        render: (text, record) => {
          return record.percent? record.percent % 1 == 0?`${record.percent}%`:`${record.percent.toFixed(2)}%`:null;
        }
      }
    ];

    return columns;
  }

  show() {
    
    this.setState({
      visible: true,
      hidden:false,
    });

   
  }
  handleClose = () => {
    this.hide()
    this.props.reload && this.props.reload()
    // this.formUtils.resetFields()
    // this.setState({ visible: false,formData:{} });
  };
  hide =()=>{
    this.setState({
      visible: false
    });
  }

 
 
  renderFooterBtn() {
    let { loading, formData, isEdit, hasReSubmit } = this.state;
    const btns = [
      <Button key="close" onClick={this.handleClose}>
      关闭
    </Button>
    ];
    return btns;
  }
  render() {
    let { visible, isEdit, canEdit, formData,hidden } = this.state;

    return (
      <Modal
        visible={visible}
        title={'上传视频'
        }
        width={800}
        className={`vant-modal yundao-modal ${style.modal} `}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleClose}
        closable={false}
        footer={this.renderFooterBtn()}
      >
      <GridManager
              gridWrapClassName="grid-panel auto-width-grid"
              dataSource={window.APP.state.uploadVideoList ||[]}
              noRowSelection={true}
              rowKey={'uid'}
              disabledAutoLoad={true}
              onSelect={selectData => {
              this.handleSelect(selectData);
            }}
              columns={this.getColumns()}
              beforeLoad={params => {
              return this.beforeLoad(params);
            }}
              mod={this}
              pagination={false}
              ref={gridManager => {
              gridManager && (this.gridManager = gridManager);
            }}>
              <div className={`vant-filter-bar clearfix`}>
                <div className="fl">
                  <FilterBar gridManager={this.gridManager} ref="filterBar"/>
                </div>
                <div className="vant-filter-bar-action fl">
                    <Button className="btn_add" onClick={()=>{
                      this.addUploadVideoModal.show()
                    }}>
                      新增上传
                    </Button>
                </div>
              </div>
            </GridManager>
            <AddUploadVideoModal ref={ref=>{
              if(ref){
              this.addUploadVideoModal= ref
            }
              }}/>
      </Modal>
    );
  }
}
