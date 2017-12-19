
import React from "react";
import { Button, Icon, Modal, Spin, message } from "antd";
import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import RoadshowColumn from "model/CMS/Roadshow/column";

import EditColumnForm from "./editColumnForm";

import style from "./editColumnModal.scss"

export default class EditColumnModal extends Base {
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

    this.formUtils = new FormUtils("EditColumnModal");
  }
  componentWillMount() {
    this.roadshowColumn = new RoadshowColumn();
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
      hidden:false,
      canEdit,
      isEdit:false,
      hasReSubmit
    });

    if (data) {
      data= JSON.parse(JSON.stringify(data))
      console.log('data',data)
      if (data.id) {
        this.setState({
          loading:true
        })
        
        data.status = data.status.toString()
        data.platformId = data.platformId.toString()
        this.setState({
          formData: data,
          isEdit: false,
          canEdit:true,
          loading:false
        });
        if (this.form) {
          this.formUtils.resetFields();
          this.formUtils.setFieldsValue(data);
        }
        this.formUtils.setFieldsValue(data);
        // this.roadshowColumn.get(data.id).then(res => {
        //   if (res.success) {
        //     const data = res.result.data;
        //     this.setState({ formData: data, loading: false });
        //     if (this.form) {
        //       this.formUtils.resetFields();
        //       this.formUtils.setFieldsValue(data);
        //     }
        //   }
        // });
      }
    } else {
      this.setState({ formData: {}, isEdit: true });
      this.formUtils.resetFields();
    }
  }
  handleClose = () => {
    this.hide()
    // this.formUtils.resetFields()
    // this.setState({ visible: false,formData:{} });
  };
  handleSubmit = e => {
    e && e.preventDefault();

    const { id } = this.state.formData;

    this.formUtils.validateFields(errors => {
      if (!errors) {
        let formData = this.formUtils.getFieldsValue();
        console.log('formData',formData)
        if(formData.coverUrl && formData.coverUrl.length){
          formData.coverUrl = formData.coverUrl[0].url
        }
        formData = this.formatData(formData);

        //来自产品中心预约 使用不同的接口
        const request = id
          ? this.roadshowColumn.update
          : this.roadshowColumn.add;

        if (id) {
          formData.id = id;
        }

        request(formData).then(res => {
          if (res.success) {
            if (this.state.hasReSubmit) {
              this.setState({
                isEdit: false
              });
            } else {
              this.hide()
            }
            message.success(`${id ? "编辑" : "新增"}路演栏目成功.`);
            this.props.reload();
          }
        });
      }
    });
  };

  hide =()=>{
    this.formUtils.resetFields()
    this.setState({
      formData:{},
      visible: false
    },()=>{
      this.setState({
        hidden:true
      })
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
  handleResubmit = () => {
    let id = this.state.formData.id;
    this.appoint.again_commit({ id }).then(res => {
      if (res.success) {
        message.success("重新提交成功");

        this.hide()

        this.props.reload();
      }
    });
  };
  renderFooterBtn() {
    let { loading, formData, isEdit, hasReSubmit } = this.state;
    const btns = [
      isEdit && formData.id
        ? <Button
            key="cancel"
            onClick={() => {
              this.setState({
                isEdit: false
              });
            }}
          >
            取消
          </Button>
        : <Button key="close" onClick={this.handleClose}>
            关闭
          </Button>,
      loading
        ? null
          : isEdit
            ? <Button key="save" type="primary" onClick={this.handleSubmit}>
                保存
              </Button>
            : null
    ];
    return btns;
  }
  render() {
    let { visible, isEdit, canEdit, formData,hidden } = this.state;

    return (
      <Modal
        visible={visible}
        title={
          <div>
            {(formData.id ? (isEdit ? "编辑栏目" : "栏目详情") : "新增栏目")}
            {canEdit && !isEdit
              ? <Icon
                  className={"fr"}
                  type="edit"
                  onClick={() => {
                    this.setState({
                      isEdit: true
                    },()=>{
                      this.formUtils.setFieldsValue(this.state.formData)
                    });
                    
                  }}
                />
              : null}
          </div>
        }
        width={520}
        className={`vant-modal yundao-modal ${style.modal} `}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleClose}
        closable={false}
        footer={this.renderFooterBtn()}
      >
        {!visible?<Spin />:<EditColumnForm
          initFields={this.props.initFields}
          ref={form => (this.customerForm = form)}
          data={formData}
          formUtils={this.formUtils}
          isEdit={isEdit}
          setForm={form => (this.form = form)}
          callback={this.props.callback}
        />}
      </Modal>
    );
  }
}
