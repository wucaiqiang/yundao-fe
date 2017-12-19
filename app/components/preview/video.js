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

import style from "./index.scss"

const width = 640

export default class EditVideoUploadListModal extends Base {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      data: {}
    };

    this.formUtils = new FormUtils("EditVideoUploadListModal");
  }
  componentWillMount() {}
  componentDidMount() {}


  initVideo = () => {
    const {data} = this.state
    require.ensure('lib/TcPlayer', () => {
      const {TcPlayer} = require('lib/TcPlayer')
      console.log('TcPlayer', TcPlayer)

      const video = data.video
      if (!video || this.player) {
        return;
      }
      
      let baseConfig = {
        "mp4": video
          ? video.url
          : null,
        "autoplay": false, //iOS下safari浏览器，以及大部分移动端浏览器是不开放视频自动播放这个能力的
        "flash":false,
        "coverpic": video
          ? video.coverUrl
          : null,
        "width": width,
        "height": width / 16 *9,
        "wording": {
          1:"网络错误，请检查网络配置或者播放链接是否正确",
          2:"网络错误，请检查网络配置或者播放链接是否正确",
          3:"视频解码错误",
          4:"当前系统环境不支持播放该视频格式",
          5:"当前系统环境不支持播放该视频格式",
          10:"请勿在file协议下使用播放器，可能会导致视频无法播放",
          11:"使用参数有误，请检查播放器调用代码	",
          12:"请填写视频播放地址",
          13:"直播已结束,请稍后再来",
          1001:"网络错误，请检查网络配置或者播放链接是否正确",
          1002:"获取视频失败，请检查播放链接是否有效",
          2032: "请求视频失败，请检查网络",
          2048: "请求m3u8文件失败，可能是网络错误或者跨域问题",
        }
      }
      this.player = new TcPlayer('preview', baseConfig);
      console.log('this.player', this.player)
    })
  }

  show(data, canEdit = true, hasReSubmit = false) {
    this.setState({data, isEdit: true, visible: true},()=>{
      this.initVideo(data)
    });
    
    // this.formUtils.resetFields();
  }
  handleClose = () => {
    this.hide()
    // this.formUtils.resetFields() this.setState({ visible: false,formData:{} });
  };

  hide = () => {
    try {
      this.player.pause();  
    } catch (error) {
      
    }
    this.player =null
    this.setState({dataSource: [], visible: false});
  }

  render() {
    let {visible, data, hidden} = this.state;

    return (
      <Modal
        visible={visible}
        closable={true}
        title={null}
        width={640}
        className={`vant-modal yundao-modal  ${style.modal} `}
        wrapClassName="vertical-center-modal"
        footer={null}
        onCancel={this.handleClose}
        closable={false}
        {...this.props}
        >
        <div id="preview"></div>
      </Modal>
    );
  }
}
