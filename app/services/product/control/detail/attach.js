import React, { Component } from "react";

import ReactDOM from 'react-dom'

import {
  Layout,
  Tabs,
  Icon,
  Row,
  Col,
  message,
  Popconfirm,
  Progress,
  Checkbox,
  Select,
  Form,
} from "antd";


const FormItem = Form.Item

import UploadCard from "components/upload/";

import Product from "model/Product/";

import style from "./productDetailInfo.scss";

const CheckboxGroup = Checkbox.Group;

const Option = Select.Option


import SingleEditForm from 'components/Form/SingleEditForm'

const generatorEditForm = (ComposedComponent, props, rules) => {
  class EditFormComponent extends SingleEditForm {
    render() {

      // const formItemLayout = {
      //   labelCol: {
      //     span: 24
      //   },
      //   wrapperCol: {
      //     span: 24
      //   }
      // };

      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 8 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
      };
      const {isEdit, value, name} = this.state;
      const {label} = this.props

      let canEdit = true
      if(typeof props.canEdit != 'undefined'){
        canEdit = props.canEdit
      }

      let triggerEvents = {};
      let events = ['onBlur','onPressEnter'];
      if (props.events && props.events.length) {
        events = props.events
      }

      events.map(item => {
        triggerEvents[item] = (res) => {
          let value = res &&  res.target
            ? res.target.value
            : res;

          let updatedFields = {}
          updatedFields[name] = value
          this
            .formUtils
            .setFieldsValue(updatedFields)

          if (props.formatSubmit ) {
            value = props.formatSubmit(value);
          }
          this.submit(value)
        }
      })
      return (
        <Form >
          <FormItem
            label={label}
            {...formItemLayout}
            validateStatus={this.state.validateStatus}>
            <div style={{
              display: "flex"
            }}>
              {!isEdit
                ? props.formatView && value
                  ? props.formatView(value)
                  : value
                : this
                  .formUtils
                  .getFieldDecorator(name, {
                    initialValue: value,
                    rules: rules
                  })(<ComposedComponent
                    {...props}
                    {...triggerEvents}
                    ref={ref=>{
                      if(ref){
                        const dom = ReactDOM.findDOMNode(ref)
                        dom.click()
                        try {
                          //尝试移动光标到最后
                          var sPos = dom.value.length;
                          setCaretPosition(dom, sPos);
                        } catch (error) {

                        }

                        try {
                            //针对日历等嵌套组件
                          dom.children[0].click()
                        } catch (error) {

                        }

                        dom.focus()
                      }
                    }}
                    disabled={this.state.disabled}/>)}
              {isEdit || !canEdit
                ? null
                : (
                  <div style={{padding:'0px 5px'}}>
                    <img
                      className="anticon"
                      src="/assets/images/icon/编辑@1x.png"
                      onClick={this.toggleEdit}/>
                  </div>
                )}
            </div>
          </FormItem>
        </Form>
      );
    }

  }
  EditFormComponent = Form.create()(EditFormComponent);
  return EditFormComponent
}

export default class ProductAttach extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    productId: null,
    uploadFile: {},
    fileList: []
  };
  mime2icon = {
    "application/pdf": "pdf",
    "application/vnd.ms-excel": "xls",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "text/plain": "txt",
    "image/jpeg": "jpg",
    "image/png": "png"
  };
  componentWillMount() {
    let { data } = this.props;

    this.product = new Product();

    this.setState({
      productId: data.id,
      fileList: this.getFiles(data)
    });
  }
  componentWillReceiveProps(nextProps) {
    let { data = {} } = nextProps,
      fileList = this.getFiles(data);
    this.setState({ fileList, productId: data.id });
  }
  getFiles(data) {
    let fileList = [];
    if (data.attachDtos && data.attachDtos.length > 0) {
      data.attachDtos.map(attach => {
        fileList.push({
          uid: attach.id,
          id: attach.id,
          name: attach.sourceName,
          type: attach.type,
          showType:attach.showType,
          status: "done",
          url: attach.url
        });
      });
    }

    return fileList;
  }
  handleRemove = id => {
    let _this = this;
    this.product.attach_delete(id).then(res => {
      if (res.success) {
        //更新附件列表
        let fileList = _this.state.fileList.filter(file => {
          return file.id !== id;
        });

        _this.setState({ fileList });

        message.success("附件删除成功");
      }
    });
  };
  handleSave = file => {
    const _this = this,
      { productId, fileList } = this.state,
      { originalName: sourceName, url } = file.response.result;
    

    console.log('file',file)
    let model = {
      productId,
      sourceName,
      url,
      type: file.type
    };

    this.product.attach_add(model).then(res => {
      let fileList;
      if (res.success) {
        fileList = _this.state.fileList.map(item => {
          //更新附件记录id
          if (file.uid == item.uid) {
            item.id = res.result;
          }

          return item;
        });
        // file.id = res.result;
        // fileList.push(file);
        message.success("附件保存成功");
        // this.props.mod.loadData()
      } else {
        //更新附件列表
        fileList = _this.state.fileList.filter(item => {
          return file.uid !== item.uid;
        });

        message.success("附件保存失败");
      }
      _this.setState({ fileList });
    });
  };
  handleUploadChange = fileList => {

    this.setState({ fileList:fileList.filter(item=>item.status=='error'?false:true).map(item=>{
      if(item.showType === undefined){
        item.showType =0
      }
      return item
    }) });
    // this.setState({ fileList });
  };
  handleUploadProgress = ({ file, fileList }) => {
    // console.log()
    // this.setState({ uploadFile: file, fileList });
  };
  showTypeOptions =[
    { label: '理财师可见', value: '1' },
    { label: '客户可见', value: '2' },
  ]
  render() {
    let { data } = this.props;
    if (!data) {
      return null;
    }
    const { fileList, uploadFile } = this.state;
    const canEdit =
      data.productDto.permission.editPermission && data.examineStatus != 1;

      const options = [
        { label: '内部可见', value: '1' },
        { label: '客户可见', value: '2' },
      ]



    return (
      <div id='product_detail_attach' ref={ref=>{
        if(ref){
          this.container = ReactDOM.findDOMNode(ref)
        }
      }}>
      <div className={style.card}>
        <div className={style.header}>
          <div className={style.title}>附件信息</div>
          <div className={style.icons}>
            <UploadCard
              listType="picture"
              accept="pdf,jpg,jpeg,png"
              showUploadList={false}
              fileCount={20}
              fileSize="30MB"
              fileList={fileList}
              onSave={this.handleSave}
              onChange={this.handleUploadChange}
            >
              {canEdit ? <Icon type="plus" /> : <span />}
            </UploadCard>
          </div>
        </div>
        <div
          className={style.content}
          style={{
            padding: "0"
          }}
        >
          <ul className={style.filelist}>
            {!fileList || !fileList.length ? <div style={{
              textAlign: 'center',
              padding: '20px'
            }}>暂无附件信息</div>:fileList.map(file => {


              const FilePublicScope = generatorEditForm(
                Select,
                {
                  size: "small",
                  mode: "multiple",
                  getPopupContainer: () => this.container,
                  allowClear: true,
                  events: ["onBlur"],
                  canEdit,
                  placeholder: "请选择可见范围",
                  formatView: value =>{
                    return value && value.length
                      ? options &&
                        options
                          .filter(
                            item =>
                              value.indexOf(item.value) > -1
                                ? true
                                : false
                          )
                          .map(item => item.label)
                          .join(",")
                      : '全部不可见'},

                  formatSubmit: value =>
                    value && value.length
                      ? {
                          fileId: file.id,
                          showType:value.length === options.length?0: value.join(",")
                        }
                      : {
                          fileId: file.id,
                          showType: 3
                        },
                  style: {
                    width: "100%"
                  },
                  children:
                    options &&
                    options.map(item => {
                      return (
                        <Option key={item.value}>
                          {item.label}
                        </Option>
                      );
                    })
                },
                [
                  {
                    type: "array",
                    required:true,
                    min:1,
                    message: "请选择可见范围",
                  }
                ]
              );
              return (
                <div className={style.item} key={file.uid}>
                  <Row className={style.info}>
                    <Col span="3" className={style.hd}>
                      <img
                        className={style.icon}
                        src={`/assets/images/ext/${
                          file.type?this.mime2icon[file.type]:file.name.split('.')[file.name.split('.').length-1]
                        }@1x.png`}
                        srcSet={`/assets/images/ext/${
                          file.type?this.mime2icon[file.type]:file.name.split('.')[file.name.split('.').length-1]
                        }@2x.png 2x`}
                      />
                    </Col>
                    <Col span="17"  className={style.bd}>
                    <a href={file.url} target="_blank" ><p style={{color:'#666'}}>{file.name}</p></a>
                      {file.status === "done" && canEdit ?<FilePublicScope request={this.product.attach_update} data={{
                        id:file.id,
                        name:'附件可见',
                        value:file.showType === 0? ['1','2']:file.showType === 3?[]:file.showType?[file.showType.toString()]:[]
                      }}/>:null}
                    </Col>
                    {file.status === "done" ? (
                      <Col span="4">
                        <span className={style.ft}>
                          <a href={file.url} download={file.name}>
                            <Icon type="download" />
                          </a>
                          {canEdit ? (
                            <Popconfirm
                            getPopupContainer={()=>this.container}
                              placement="topRight"
                              title="删除后不可撤回，确定吗?"
                              onConfirm={() => {
                                this.handleRemove(file.id);
                              }}
                            >
                              <Icon type="delete" />
                            </Popconfirm>
                          ) : null}
                        </span>
                      </Col>
                    ) : file.status == "uploading" ?<Col span="4"><span>上传中...</span></Col>:null}
                  </Row>
                </div>
              ) })}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
