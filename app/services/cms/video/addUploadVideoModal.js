import React from "react";
import {
  Button,
  Icon,
  Modal,
  Spin,
  message,
  Input
} from "antd";
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

import NewsColumn from "model/CMS/News/column";

import AddUploadVideoModal from './addUploadVideoModal'

import style from "./editVideoUploadListModal.scss"

import UploadVideo from 'components/upload/video'

export default class EditVideoUploadListModal extends Base {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visible: false,
      canEdit: false,
      isEdit: false,
      hasReSubmit: false,
      dataSource: []
    };

    this.formUtils = new FormUtils("EditVideoUploadListModal");
  }
  componentWillMount() {
    this.newsColumn = new NewsColumn();
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
        width: 120,
        fixed: "left",
        render: (text, record) => {
          return text
        }
      }, {
        title: "视频大小",
        width: 60,
        dataIndex: "size",
        render: (text, record) => {
          return utils.bytesToSize(record.size);
        }
      }, {
        title: "视频名称",
        dataIndex: "platformIds",
        render: (text, record) => {
          return <Input value={record.videoName} onChange={e=>{
            const {value} = e.target
            const {dataSource} = this.state
            this.setState({
              dataSource:dataSource.map(item=>{
                if(item.uid==record.uid){
                  item.videoName=value
                }
                return item
              })
          })}}/>
        }
      }, {
        title: "操作",
        width: 60,
        render: (text, record) => {
          return <a onClick={() => {
            this.remove(record.uid)
          }}>删除</a>
        }
      }
    ];

    return columns;
  }

  show(data, canEdit = true, hasReSubmit = false) {

    this.setState({dataSource: [], isEdit: true, visible: true});
    // this.formUtils.resetFields();
  }
  handleClose = () => {
    this.hide()
    // this.formUtils.resetFields() this.setState({ visible: false,formData:{} });
  };
  handleSubmit = e => {
    e && e.preventDefault();

    let {uploadVideoList} = APP.state
    if(!uploadVideoList){
      uploadVideoList = []
    }

    let {dataSource} = this.state
    let isValid = true
    dataSource.map(item=>{
      if(item.videoName.trim() == '' || (item.videoName.length<1 || item.videoName.length>50)){
        isValid = false
      }
    })
    let list =  []
    if (isValid) {
      message.info('视频上传中...')
      dataSource=dataSource.filter(item=>item.status==undefined).map(item => {

        item.status = 'start'
        list = list.concat(item)
        return item
      })

      APP.setState({
        uploadVideoList: uploadVideoList.concat(dataSource)
      }, () => {
        console.log('list',list)
        list.map(item => {
          this
            .uploadVideo
            .start(item)
        })
      })

      this.hide()
      
    }else{
      message.error('视频名称不能为空,长度1-50')
    }

  };

  hide = () => {
    this.setState({dataSource: [], visible: false});
  }

  renderFooterBtn() {
    let {loading, formData, isEdit, hasReSubmit} = this.state;
    const btns = [<Button key = "close" onClick = {
        this.handleClose
      } > 取消上传 </Button>,
      <Button key="submit" disabled={this.state.dataSource.length>0?false:true} onClick={this.handleSubmit}>
      开始上传
    </Button >];
    return btns;
  }

  onAdd = (res) => {
    console.log('onAdd:', res)
    const video = res;
    video.videoName = res
      .name
      .split('.')[0];
    this.setState({
      dataSource: this
        .state
        .dataSource
        .concat(video)
    })
  }
  remove = (id) => {
    this.setState({
      dataSource: this
        .state
        .dataSource
        .filter(data => data.uid != id)
    })
  }
  render() {
    let {visible, isEdit, canEdit, formData, hidden} = this.state;

    return (
      <Modal
        visible={visible}
        title={'上传视频'}
        width={580}
        className={`vant-modal yundao-modal ${style.modal} `}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleClose}
        closable={false}
        footer={this.renderFooterBtn()}>
        <GridManager
          gridWrapClassName="grid-panel auto-width-grid"
          dataSource={this.state.dataSource}
          noRowSelection={true}
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
              <UploadVideo
                multiple={true}
                ref={ref => {
                if (ref) {
                  this.uploadVideo = ref
                }
              }}
                showUploadList={false}
                onAdd={this.onAdd}>
                <Button>添加视频</Button>
              </UploadVideo>
            </div>
          </div>
        </GridManager>
      </Modal>
    );
  }
}
