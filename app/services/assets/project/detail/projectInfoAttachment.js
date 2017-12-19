import React, { Component } from "react";

import {
  Layout,
  Tabs,
  Icon,
  Row,
  Col,
  message,
  Popconfirm,
  Progress,
  Button,
  Card
} from "antd";

import UploadCard from "components/upload/";

import Assets from "model/Assets/";

import Decision from "model/Project/decision";

import style from "./projectInfoAttachment.scss";

export default class ProductAttach extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    projectId: null,
    uploadFile: {},
    currentPage: 1,
    pageSize: 10,
    totalPage: 0,
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

    this.assets = new Assets();
    this.decision = new Decision();

    this.setState({
      projectId: data ? data.data.id : null
    });
    this.getData(data.data.id, 1, 10);
  }
  componentWillReceiveProps(nextProps) {
    let { data = {} } = nextProps;
    const projectId = data.data ? data.data.id : null;
    if (projectId != this.state.projectId) {
      this.setState({ projectId: data.data.id }, () => {
        this.getFiles();
      });
    }
  }
  getFiles() {
    this.getData(this.state.projectId, 1, 10);
  }
  getData = (projectId, currentPage = 1, pageSize = 10) => {
    const { data } = this.props;
    const canRead = data.permission && data.permission.readPermission;
    if (!canRead) {
      return;
    }
    let params = {
      currentPage,
      pageSize,
      projectId
    };

    this.assets.get_attach(params).then(res => {
      if (res.success) {
        let { currentPage, pageSize, datas, totalPage } = res.result;

        this.setState({
          currentPage,
          pageSize,
          fileList: datas.map(item => {
            item.name = item.sourceName;
            item.status = "done";
            item.uid = item.id;
            return item;
          }),
          totalPage
        });
      }
    });
  };
  handleRemove = id => {
    let _this = this;
    this.assets.attach_delete(id).then(res => {
      let { projectId, currentPage, pageSize,fileList } = _this.state;

      if (res.success) {
        const page =  fileList.length-1 == 0 ?Math.max(currentPage-1,1):currentPage
        this.getData(projectId,page, pageSize);

        message.success("附件删除成功");
      }
    });
  };
  handleSave = file => {
    const _this = this,
      { projectId, fileList } = this.state,
      { originalName: sourceName, url } = file.response.result;

    let model = {
      projectId,
      sourceName,
      url,
      type: file.type
    };

    this.assets.attach_add(model).then(res => {
      let { fileList, projectId, currentPage, pageSize } = _this.state;

      if (res.success) {
        //当文件数与分页大小相等时，刷新数据

        if(fileList.length % pageSize >= currentPage){
          this.getData(projectId, currentPage, pageSize);
          return;
        }

        fileList = fileList.map(item => {
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
        //保存失败，从附件列表删除
        fileList = fileList.filter(item => {
          return file.uid !== item.uid;
        });

        message.success("附件保存失败");
      }

      _this.setState({ fileList });
    });
  };
  handleUploadChange = fileList => {
    console.log('fileList',fileList)
    this.setState({ fileList:fileList.filter(item=>item.status=='error'?false:true) });
  };

  handleDownload(data) {
    this.decision.record_download(data);
  }

  render() {
    let { data } = this.props;
    if (!data) {
      return null;
    }
    const {
      fileList,
      uploadFile,
      projectId,
      currentPage,
      pageSize,
      totalPage
    } = this.state;
    const canEdit = data.permission.editPermission;
    return (
      <div id="product_detail_attach">
        <div className={style.card}>
          <Card
            title="项目文档"
            bodyStyle={{ padding: 0 }}
            extra={
              <div className={style.icons}>
                <UploadCard
                  listType="picture"
                  showUploadList={false}
                  fileCount={10000}
                  fileSize="30MB"
                  fileList={fileList}
                  onSave={this.handleSave}
                  onChange={this.handleUploadChange}
                >
                  {canEdit ? <Icon type="plus" /> : <span />}
                </UploadCard>
              </div>
            }
          >
            <div
              className={style.content}
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
                            {file.url ? <a href={file.url} target="_blank">
                                {file.name}
                              </a>: file.name}
                            </span>
                          </Col>
                          {file.status === "done" ? (
                            <Col span="4">
                              <span className={style.ft}>
                                <a
                                  href={file.url}
                                  download={file.name}
                                  onClick={() => {
                                    this.handleDownload({
                                      fileId: file.id,
                                      type: 1
                                    });
                                  }}
                                >
                                  <Icon type="download" />
                                </a>
                                {canEdit ? (
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
                          ) :file.status === "uploading" ?  <Col span="4">上传中...</Col>:null}
                        </Row>
                      </div>
                    );
                  })
                )}
              </ul>
              {fileList === null || fileList.length === 0 ? null : (
                <div className={style.pagination}>
                  <Button
                    disabled={currentPage === 1}
                    onClick={() => {
                      this.getData(projectId, currentPage - 1, pageSize);
                    }}
                  >
                    <Icon type="left" />
                  </Button>
                  <Button
                    disabled={currentPage >= totalPage}
                    onClick={() => {
                      this.getData(projectId, currentPage + 1, pageSize);
                    }}
                  >
                    <Icon type="right" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }
}
