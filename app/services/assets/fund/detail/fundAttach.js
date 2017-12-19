import React, { Component } from "react";

import { Icon, Row, Col, message, Popconfirm, Progress } from "antd";

import UploadCard from "components/upload/";

import Fund from "model/Assets/fund";

import style from "./tabs.scss";

export default class FundAttach extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    fundId: null,
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

    this.fund = new Fund();

    this.setState({
      fundId: data.id,
      fileList: this.getFiles(data)
    });
  }
  componentWillReceiveProps(nextProps) {
    let { data = {} } = nextProps,
      fileList = this.getFiles(data);
    this.setState({ fileList, fundId: data.id });
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
          status: "done",
          url: attach.url
        });
      });
    }

    return fileList;
  }
  handleRemove = id => {
    let _this = this;
    this.fund.attach_delete(id).then(res => {
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
      { fundId, fileList } = this.state,
      { originalName: sourceName, url } = file.response.result;

    let model = {
      fundId,
      sourceName,
      url,
      type: file.type
    };

    this.fund.attach_add(model).then(res => {
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
    // this.setState({
    //   fileList
    // })
    this.setState({
      fileList: fileList.filter(item => (item.status == "error" ? false : true))
    });
  };
  handleUploadProgress = ({ file, fileList }) => {};
  render() {
    let { data } = this.props;
    if (!data) {
      return null;
    }
    const { fileList, uploadFile } = this.state;
    const { permission } = data.fundDto;
    return (
      <div id="product_detail_attach">
        <div className={style.card}>
          <div className={style.header}>
            <div className={style.title}>附件信息</div>
            <div className={style.icons}>
              <UploadCard
                listType="picture"
                showUploadList={false}
                fileCount={20}
                fileSize="30MB"
                fileList={fileList}
                onSave={this.handleSave}
                onChange={this.handleUploadChange}
              >
                {permission.editPermission ? <Icon type="plus" /> : <span />}
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
              {!fileList || !fileList.length ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px"
                  }}
                >
                  暂无附件信息
                </div>
              ) : (
                fileList.map(file => {
                  return (
                    <div className={style.item} key={file.uid}>
                      <Row className={style.info}>
                        <Col span="3" className={style.hd}>
                          <img
                            className={style.icon}
                            src={`/assets/images/ext/${
                              file.type?this.mime2icon[file.type]:file.name.split('.')[file.name.split('.').length-1]
                            }@1x.png`}
                          />
                        </Col>
                        <Col span="17">
                          <span className={style.bd}>
                            {" "}
                            <a href={file.url} target="_blank">
                              {file.name}
                            </a>
                          </span>
                        </Col>
                        {file.status === "done" ? (
                          <Col span="4">
                            <span className={style.ft}>
                              <a href={file.url} download={file.name}>
                                <Icon type="download" />
                              </a>
                              {permission.editPermission ? (
                                <Popconfirm
                                  getPopupContainer={() =>
                                    document.getElementById(
                                      "product_detail_attach"
                                    )
                                  }
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
                        ) : file.status == "uploading" ? (
                          <Col span="4">
                            <span>上传中...</span>
                          </Col>
                        ) : null}
                      </Row>
                    </div>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
