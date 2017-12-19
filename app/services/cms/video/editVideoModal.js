import React from "react";
import {Button, Icon, Modal, Spin, message} from "antd";
import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Video from "model/CMS/Video/index";

import EditVideoForm from "./editVideoForm";

import style from "./editVideoUploadListModal.scss"

import PreviewVideo from 'components/preview/video'

export default class EditRecommendModal extends Base {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visible: false,
      canEdit: false,
      isEdit: false,
      hasReSubmit: false,
      formData: {}
    };

    this.formUtils = new FormUtils("EditRecommendModal");
  }
  componentWillMount() {
    this.video = new Video();
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
  show(data, canEdit = true, hasReSubmit = false) {

    this.setState({
      visible: true,
      hidden: false,
      canEdit,

      isEdit:false,
      hasReSubmit
    })

      if (data && data.id) {
        this.video.get(data.id).then(res=>{
          if(res.success){
          this.setState({formData: res.result, loading: false, isEdit: false});
        }
        })
      } else {
        this.setState({formData: {}, isEdit: true});
        this
          .formUtils
          .resetFields();
      }
  }
  loadData=id=>{
    this.video.get()
  }
  handleClose = () => {
    this.hide()
    // this.formUtils.resetFields() this.setState({ visible: false,formData:{} });
  };
  handleSubmit = e => {
    e && e.preventDefault();

    const {id} = this.state.formData;

    this
      .formUtils
      .validateFields(errors => {
        if (!errors) {
          let formData = this
            .formUtils
            .getFieldsValue();

          formData = this.formatData(formData);

          //来自产品中心预约 使用不同的接口
          const request = id
            ? this.video.update
            : this.video.add;

          if (id) {
            formData.id = id;
          }

          console.log(this.state.formData)

          const msg = `${this.state.formData.id
            ? "编辑"
            : "新增"}视频成功.`
          request(formData).then(res => {
            if (res.success) {

              message.success(msg);
              this
                .props
                .reload();
              this.hide()
            }
          });
        }
      });
  };

  hide = () => {
    this
      .formUtils
      .resetFields()
    this.setState({
      formData: {},
      visible: false
    }, () => {
      this.setState({hidden: true})
    });
  }

  formatData(values) {
    for (var key in values) {
      if (values.hasOwnProperty(key)) {
        var v = values[key];
        if (typeof v == "string") {
          v = v.replace(/^\s*|\s*$/g, "");
        }
        if (v instanceof Date) {
          v = moment(v).format("YYYY-MM-DD HH:mm");
        } else if (v instanceof moment) {
          v = moment(v).format("YYYY-MM-DD HH:mm");
        }
        if (v instanceof Array) {
          v = v.join(",");
        }
        if (v instanceof Object && v._isAMomentObject) {
          v = v.format("YYYY-MM-DD HH:mm");
        }
        values[key] = v;
      }
    }
    return values;
  }
  renderFooterBtn() {
    let {loading, formData, isEdit, hasReSubmit} = this.state;
    const btns = [
      isEdit && formData.id
        ? <Button
            key="cancel"
            onClick={() => {
            this.setState({isEdit: false});
          }}>
            取消
          </Button>
        : <Button disabled={formData.sourceUrl?false:true} key="preview" onClick={()=>{
          const video_baseVideoTranscodes = formData.baseVideoTranscodes
          const  url = video_baseVideoTranscodes && video_baseVideoTranscodes[0].url
          url?this.previewVideo.show({
            video:{
              url:url,
              coverUrl:formData.coverUrl
            }
          }):window.open(formData.sourceUrl,'_blank')
        }} >
         {formData.sourceUrl?'预览':'暂无预览'}
        </Button>,
      loading
        ? <Button key="close" onClick={this.handleClose}>
        关闭
      </Button>
        : isEdit
          ? <Button key="save" type="primary" onClick={this.handleSubmit}>
              保存
            </Button>
          : <Button key="close" onClick={this.handleClose}>
          关闭
        </Button>
    ];
    return btns;
  }
  render() {
    let {visible, isEdit, canEdit, formData, hidden} = this.state;

    return (
      <Modal
        visible={visible}
        title={< div > {
        (formData.id
          ? (isEdit
            ? "编辑视频"
            : "视频详情")
          : "查看视频")
      }
      {
        canEdit && !isEdit
          ? <Icon
              className={"fr"}
              type="edit"
              onClick={() => {
              this.setState({isEdit: true},()=>{
                  this
                    .formUtils
                    .resetFields();
                  this
                    .formUtils
                    .setFieldsValue(formData);
              });
              
            }}/>
          : null
      } </div>}
        width={500}
        className={`vant-modal yundao-modal ${style.modal} `}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleClose}
        closable={false}
        footer={this.renderFooterBtn()}>
        {!visible
          ? <Spin/>
          : <EditVideoForm
            initFields={this.props.initFields}
            ref={form => (this.customerForm = form)}
            data={formData}
            formUtils={this.formUtils}
            isEdit={isEdit}
            setForm={form => (this.form = form)}
            callback={this.props.callback}/>}
            {visible?<PreviewVideo ref={ref=>{
              if(ref){
                this.previewVideo= ref
              }
            }}/>:null}
      </Modal>
    );
  }
}
