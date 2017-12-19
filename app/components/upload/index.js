import React, { Component } from "react";
import { Upload, Icon, message } from "antd";
const Dragger = Upload.Dragger;
import PropTypes from "prop-types";
import Mime from "./mime";

import Video from "./video";

class UploadCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: props.fileList || [],
      msgList: {}
    };
  }
  static get Video() {
    return <Video />;
  }
  componentWillMount() {
    this.Mime = new Mime();
    this.fileSize = this.parseFileSize(this.props.fileSize);
    this.accept = this.Mime.extList2mimes(this.props.accept).join(",");
  }
  componentWillReceiveProps(nextProps) {
    if ("fileList" in nextProps) {
      this.setState({
        fileList: nextProps.fileList || []
      });
    }
  }
  clear() {
    setTimeout(() => {
      this.setState({ fileList: [] });
    });
  }
  /*
  @method parseFileSize
	@static
	@param {String/Number} size String to parse or number to just pass through.
	@return {Number} Size in bytes.
	*/
  parseFileSize(size) {
    if (typeof size !== "string") {
      return size;
    }

    var muls = {
        t: 1099511627776,
        g: 1073741824,
        m: 1048576,
        k: 1024
      },
      mul;

    size = /^([0-9]+)([mgk]?)$/.exec(
      size.toLowerCase().replace(/[^0-9mkg]/g, "")
    );
    mul = size[2];
    size = +size[1];

    if (muls.hasOwnProperty(mul)) {
      size *= muls[mul];
    }
    return size;
  }
  beforeUpload = (file, fileList) => {
    let { accept, fileSize } = this.props;
    const supportedType = this.accept.indexOf(file.type) > -1;

    // const extName = file.name.split('.')[file.name.split('.').length-1]
    // const supportedType = this.accept
    //     .indexOf(file.type) > -1 || this.props.accept.indexOf(extName) > -1;
    if (!supportedType) {
      message.error(`只支持这些类型文件:${accept}!`);
    }
    const isLtMax = file.size < this.fileSize;
    if (!isLtMax) {
      message.error(`文件大小不能大于${fileSize}`);
    }
    return supportedType && isLtMax;
  };
  onRemove = file => {
    this.setState(({ fileList }) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);

      if (this.props.onRemove) {
        this.props.onRemove.call(this, file, this);
      }

      return {
        fileList: newFileList
      };
    });
  };
  handleProgress = () => {
    this.uploader.onProgress((e, file) => {
      // console.log(e.state, e.percent);
    });
  };
  msgList = {};
  showUploadMsg = (file, msg) => {
    const { msgList } = this.state;
    if (msgList[file.uid] && msgList[file.uid].show) {
      msgList[file.uid].content = msg;
      this.setState({
        msgList: msgList
      });
      message.destroy();
      message.success(msg);
    } else {
      msgList[file.uid] = {
        content: msg,
        show: true
      };
      this.setState(
        {
          msgList: msgList
        },
        () => {
          message.info(msgList[file.uid].content, () => {
            msgList[file.uid].show = false;
            this.setState({
              msgList
            });
          });
        }
      );
    }
  };
  handleChange = ({ file, fileList }) => {
    // console.log(file);
    // console.log(file.status, file.percent);
    if (file.status === "done") {
      this.showUploadMsg(file, "文件上传成功")
      const data = file.response;

      // if (data.code) {
      if (!data.success) {
        this.onRemove(file);
        switch (data.code) {
          case 900000:
          case 900001:
            location.href = "/login";
            return;
          default:
            message.destroy();
            message.error(data.message);
        }
      } else {
        const filterFile = fileList.filter(f => f.uid === file.uid)[0];
        const { response } = filterFile;
        // const index = fileList.findIndex(f => {
        //   return f.uid === file.uid;
        // });
        // const { response } = fileList[index];
        if (response && response.result) {
          filterFile.url = response.result.url;
          file.url = response.result.url;
        }
        if (this.props.onSave) {
          this.props.onSave.call(this, file, this);
        }

        if (this.props.onChange) {
          this.props.onChange.call(this, fileList, this);
        }
      }
      // }
    } else if (file.status === "uploading") {
      console.log('uploading')
      console.log(file)
      let msg = "";
      if (file.percent == 0) {
        this.showUploadMsg(file, "文件正在上传中...");
      } else if (file.percent == 100) {
        // msg='文件上传成功'
        // this.showUploadMsg(file,'文件上传成功')
      }
      // message.success(msg)
      this.props.onChange && this.props.onChange.call(this, fileList, this);
    } else if (file.status === "removed") {
      if (this.props.onChange) {
        this.props.onChange.call(this, fileList, this);
      }
    } else if (file.status === "error") {
      message.destroy();
      message.error("文件上传失败!");
      this.onRemove(file);
    }

    if (this.props.onChange) {
      this.props.onChange.call(this, fileList, this);
    }

    this.setState({ fileList });
  };
  handleEdit(e) {
    let isStopPropagation;

    if (this.props.onClickMask) {
      isStopPropagation = this.props.onClickMask.call(this, e);
    }
    if (this.props.editable === false || isStopPropagation) {
      e.stopPropagation();
    }
  }

  render() {
    let count = this.props.fileCount,
      showUploadBtn = true;

    const { fileList } = this.state,
      uploadButton = (
        <div>
          <Icon type="plus" />
          <div className="ant-upload-text">Upload</div>
        </div>
      );
    if (!fileList) {
      showUploadBtn = true;
    } else if (fileList.length >= count) {
      showUploadBtn = false;
    }

    if (count <= 0) {
      showUploadBtn = false;
    }

    const {
      dragger,
      action,
      showUploadList,
      multiple,
      onRemove,
      children
    } = this.props;

    const UploadComponent = dragger ? Dragger : Upload;

    return (
      <div
        className={
          "upload-card" + (!showUploadBtn ? " upload-card-uploaded" : "")
        }
      >
        <UploadComponent
          ref={ref => (this.uploader = ref)}
          uploader="uploader"
          name="file"
          action={action}
          showUploadList={showUploadList}
          multiple={multiple}
          onRemove={onRemove}
          onChange={this.handleChange}
          beforeUpload={this.beforeUpload}
          withCredentials={true}
          accept={`${this.accept},${this.props.accept.split(',').map(item=>'.'+item).join(',')}`}
          fileList={this.state.fileList}
        >
          {showUploadBtn ? children || uploadButton : null}
        </UploadComponent>
      </div>
    );
  }
}

UploadCard.propTypes = {
  multiple: PropTypes.bool,
  fileCount: PropTypes.number,
  action: PropTypes.string.isRequired
};

UploadCard.defaultProps = {
  multiple: false,
  accept: "doc,docx,xls,xlsx,pdf,png,jpg,jpeg,gif,txt",
  fileCount: 10,
  fileSize: "30MB",
  action: "/api/file/upload"
};

export default UploadCard;
