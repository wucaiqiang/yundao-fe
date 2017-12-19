import React, { Component } from "react";
import ReactDOM from "react-dom";
import {
  Button,
  Input,
  Upload,
  Icon,
  Radio,
  message,
  Checkbox,
  Modal,
  Select
} from "antd";
import reqwest from "reqwest";
import moment from "moment";

const Option = Select.Option;
const RadioGroup = Radio.Group;

class WorkOrderDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: "",
      showOrNot: 0,
      visible: false,
      isShow: false,
      radioValue: "",
      dealResult: [],
      fileList: [],
      customers: [],
      ownerId: "",
      ownerName: ""
    };
  }
  replyContent(e) {
    this.setState({ content: e.target.value });
  }
  getResults() {
    reqwest({
      url: "/workorder/results/gets",
      method: "get",
      type: "json"
    }).then(data => {
      this.setState({ dealResult: data.result });
    });
  }
  showModal(type) {
    if (type === "visible") {
      this.getResults();
    }
    let obj = {};
    obj[type] = true;
    this.setState(obj);
  }
  selectValue(e) {
    this.setState({
      radioValue: e.target.value
    });
  }
  chooseCustomer(value, option) {
    this.setState({
      ownerId: value,
      ownerName: option.props.userName
    });
  }
  showAtApp(e) {
    if (e.target.checked) {
      this.state.showOrNot = 1;
      this.setState(this.state);
    } else {
      this.state.showOrNot = 0;
      this.setState(this.state);
    }
  }
  addReply() {
    let attach = "";
    this.state.fileList.map(item => {
      attach += `${item.response.result.cloudUrl}`;
    });
    reqwest({
      url: "/workorder/reply/add",
      method: "post",
      type: "json",
      data: {
        workId: this.props.record.id,
        content: this.state.content,
        attachment: attach,
        showOrNot: this.state.showOrNot
      }
    }).then(data => {
      if (data) {
        message.success(data.message);
        this.props.mod.doReloadGrid();
        this.props.mod.showDetail(this.props.record.id);
      }
    });
  }
  handleCancel(e, type) {
    let obj = {};
    obj[type] = false;
    this.setState(obj);
  }
  handleChange(info) {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === "done") {
      let r = info.file.response;
      if (r.success) {
        message.success(`${info.file.name} 上传成功`);
        this.state.fileList = info.fileList;
      }
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} 上传失败`);
    }
  }
  clearValue() {
    setTimeout(() => {
      this.setState({ content: "" });
    });
  }
  updateWorkOrder() {
    let record = this.props.record;
    if (this.state.radioValue === "") {
      message.error("请选择处理结果");
      return;
    }
    reqwest({
      url: "/workorder/closeOrder",
      method: "post",
      type: "json",
      data: {
        id: record.id,
        workTitle: record.workTitle,
        workType: record.workType,
        workSource: record.workSource,
        content: record.content,
        attachment: record.attachment.join(","),
        priority: record.priority,
        customerId: record.customerId,
        status: 2,
        showOrNot: record.showOrNot,
        remark: record.remark,
        result: this.state.radioValue
      }
    }).then(data => {
      if (data.success) {
        message.success(data.message);
        this.setState({
          visible: false
        });
        this.props.mod.doReloadGrid();
      } else {
        message.error(data.message);
      }
    });
  }
  turnWorkOrder() {
    reqwest({
      url: "/workorder/changeOwner",
      method: "post",
      type: "json",
      data: {
        id: this.props.record.id,
        ownerId: this.state.ownerId,
        ownerName: this.state.ownerName
      }
    }).then(data => {
      message.success(data.message);
    });
    this.handleCancel(event, "isShow");
  }
  getCustomer(type) {
    this.showModal(type);
    reqwest({
      url: "/workorder/servers/gets",
      method: "get",
      type: "json"
    }).then(data => {
      if (data.success) {
        this.setState({ customers: data.result });
        this.props.mod.doReloadGrid();
      }
    });
  }
  handleBeforeUpload() {
    this.refs.uploader.setState({ fileList: [] });
  }
  render() {
    const radioStyle = {
      display: "block",
      height: "30px",
      lineHeight: "30px"
    };
    let info = this.props.record;
    return (
      <div className={this.props.detailClassName}>
        <div className="order_info">
          <div className="logs">
            <div className="tit_lists">
              <div className="tit">
                <h3>
                  {info.workTitle ? info.workTitle : "客户留言"}
                </h3>
                <Button
                  onClick={type => this.showModal("visible")}
                  style={{
                    float: "right",
                    color: "#fff",
                    marginLeft: 10,
                    background: "#22282e"
                  }}
                  size="large"
                >
                  完结工单
                </Button>
                <Button
                  style={{ float: "right" }}
                  size="large"
                  onClick={type => this.getCustomer("isShow")}
                >
                  转交工单
                </Button>
              </div>
              <div className="leave_word">
                <span style={{ color: "#6cf" }}>
                  {moment(info.createTime).format("YYYY-MM-DD HH:mm")}
                </span>
                {info.content
                  ? <h5 style={{ marginBottom: 10 }}>
                      {info.content}
                    </h5>
                  : ""}
                <ImgGroup attach={info.attachment} />
              </div>
              <div className="question_list">
                <ul>
                  {info.quizsAndReplys && info.quizsAndReplys.length
                    ? info.quizsAndReplys.map(item => {
                        if (item.replyOrQuiz) {
                          return (
                            <li key={item.id}>
                              <h5 style={{ color: "#00a0f0" }}>
                                {moment(item.createTime).format(
                                  "YYYY-MM-DD HH:mm"
                                )}
                                <span
                                  style={{ fontSize: 12, color: "#00a0f0" }}
                                >
                                  ( 提问 )
                                </span>
                              </h5>
                              <span>客户提问内容: </span>
                              {item.content}
                              <ImgGroup attach={item.attachment} />
                            </li>
                          );
                        } else {
                          return (
                            <li key={item.key}>
                              <h5>
                                {moment(item.createTime).format(
                                  "YYYY-MM-DD HH:mm"
                                )}
                                <span style={{ fontSize: 12 }}>( 回复 )</span>
                              </h5>
                              <span>
                                {item.content}
                              </span>
                              <ImgGroup attach={item.attachment} />
                            </li>
                          );
                        }
                      })
                    : ""}
                </ul>
              </div>
            </div>
            <div className="content">
              <Input
                type="textarea"
                onChange={e => this.replyContent(e)}
                rows={6}
                value={this.state.content}
                className="reply"
              />
              <div className="upload">
                <div className="upload_file">
                  <Upload
                    name="file"
                    action="/file/new_upload"
                    onChange={info => this.handleChange(info)}
                    beforeUpload={() => this.handleBeforeUpload()}
                    ref="uploader"
                    uploader="uploader"
                  >
                    <Button type="ghost">
                      <Icon type="upload" /> 上传附件
                    </Button>
                  </Upload>
                </div>
                <div className="show_at_app">
                  <Checkbox onChange={e => this.showAtApp(e)} />
                  本次回复是否在百万理财app中展现
                  <Button type="primary" onClick={() => this.addReply()}>
                    回复
                  </Button>
                </div>
              </div>
            </div>
            <Modal
              title=""
              visible={this.state.visible}
              onCancel={(e, type) => this.handleCancel(e, "visible")}
              footer={[
                <Button
                  type="primary"
                  key="submit"
                  onClick={() => this.updateWorkOrder()}
                >
                  提交
                </Button>
              ]}
            >
              <h4>工单处理结果反馈</h4>
              <RadioGroup
                className="response_list"
                onChange={e => this.selectValue(e)}
              >
                {this.state.dealResult.map(item => {
                  return (
                    <Radio style={radioStyle} key={item.code} value={item.code}>
                      {item.name}
                    </Radio>
                  );
                })}
              </RadioGroup>
            </Modal>
            <Modal
              title="转交工单"
              visible={this.state.isShow}
              onCancel={(e, type) => this.handleCancel(e, "isShow")}
              footer={[
                <Button
                  type="primary"
                  key="turn"
                  onClick={() => this.turnWorkOrder()}
                >
                  提交
                </Button>
              ]}
            >
              <Select
                style={{ width: 180 }}
                defaultValue={this.state.ownerName}
                onSelect={(value, option) => this.chooseCustomer(value, option)}
              >
                {this.state.customers.map(item => {
                  return (
                    <Option
                      key={item.id}
                      userName={item.realName}
                      value={item.userId}
                    >
                      {item.realName}
                    </Option>
                  );
                })}
              </Select>
            </Modal>
          </div>
          <div className="info">
            <h3>工单信息</h3>
            <p>
              <span>工单号:</span> {info.workNumber}
            </p>
            <p>
              <span>创建时间:</span>
              {moment(info.createTime).format("YYYY-MM-DD HH:mm")}
            </p>
            <p>
              <span>优先级:</span>
              <span className="level">{info.priorityText}</span>
            </p>
            <p>
              <span>工单来源:</span> {info.workSourceText}
            </p>
            <p>
              <span>工单创建人:</span> {info.creatorText}
            </p>
            <p>
              <span>受理人:</span> {info.ownUserText}
            </p>
            <p>
              <span>类型:</span> {info.workTypeText}
            </p>
            <p>
              <span>状态:</span> {info.statusText}
            </p>
            <h3 className="userInfo">员工信息</h3>
            <p>
              <span>姓名:</span> {info.customerName}
            </p>
            <p>
              <span>手机号码:</span> {info.customerMobile}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

class ImgGroup extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let attachment = this.props.attach;
    return (
      <div className="img_group">
        {attachment && attachment.length
          ? attachment.map((item, index) => {
              return (
                <a href={item} target="_blank" key={index}>
                  <img
                    src={item}
                    key={index}
                    style={{ width: 138 }}
                    alt="图片没有加载出来"
                  />
                </a>
              );
            })
          : ""}
      </div>
    );
  }
}

export default WorkOrderDetail;
