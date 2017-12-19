import React from "react";
import { Input, Button, message } from "antd";
import Base from "components/main/Base";
import Upload from "components/upload/";

import style from "./importChannelForm.scss";

export default class ImportChannelForm extends Base {
  constructor(props) {
    super(props);
    this.state = {
      file: this.props.file || null
    };
  }

  clean() {
    this.setState({
      file: null
    });
  }

  // componentWillReceiveProps(nextProps) {
  //   console.log('nextProps',nextProps)
  //   // if(nextProps.file){
  //     this.setState({
  //       file:nextProps.file || null
  //     })
  //   // }
  // }

  render() {
    const { file } = this.state;

    const { data } = this.props;

    const tip = file
      ? `<span>尝试上传 ${file.total} 条，成功 ${file.successCount} 条${
          file.failureCount > 0
            ? `，失败<span class='red'> ${
                file.failureCount
              } </span>条，点击<a href=${
                file.filePath
              } target='_blank'> 这里 </a>查看错误信息`
            : ""
        }</span>`
      : null;

    return (
      <div className={style.body}>
        <div className={style.case}>
          <p className={style.header}>
            第一步,请按照数据模板的格式准备要导入的数据
          </p>
          <p className={style.download}>
            <a
              href="http://file.yundaojishu.com/template/%E5%AE%A2%E6%88%B7%E6%89%B9%E9%87%8F%E5%AF%BC%E5%85%A5%E6%A8%A1%E7%89%88.xlsx"
              target="_blank"
            >
              下载数据模板
            </a>
          </p>
          <ul className={style.tips}>
            <li>1、模板中的表头名称不可修改，表头行不能删除</li>
            <li>2、单次导入不能超过500条</li>
            <li>3、请按照表格单元格的格式要求填写</li>
            <li>4、渠道名称不能为空</li>
          </ul>
        </div>
        <div className={style.import_form}>
          <p className={style.header}>第二步,导入按照模版填写好的表格</p>
          <div className={style.import}>
            <div>
              <ul>
                <li
                  style={{
                    display: "inline-block"
                  }}
                >
                  <Upload
                    showUploadList={false}
                    max={1}
                    accept="xls,xlsx"
                    ref={ref => {
                      if (ref) {
                        this.uploader = ref;
                      }
                    }}
                    action={data.request}
                    onChange={fileList => {
                      const file = fileList && fileList[fileList.length - 1];
                      if (file.status == "done" && file.response.result) {
                        console.log("file", file);
                        file.total = file.response.result.total;
                        file.successCount = file.response.result.successCount;
                        file.failureCount = file.response.result.failureCount;
                        file.filePath = file.response.result.filePath;

                        this.setState({ file: file });

                        //如果有导入成功，刷新列表
                        if (file.successCount > 0 && this.props.callback) {
                          this.props.callback();
                        }
                      } else if (file.status == "uploading") {
                        console.log("file", file.percent);
                        if (file.percent == 0) {
                          // message.info('开始上传中...')
                          // this.uploader.showUploadMsg(file,'开始上传中...')
                          this.setState({
                            file: null
                          });
                        }
                      } else if (file.status == "removed") {
                        this.setState({ file: null });
                      } else if (file.status == "error") {
                        this.setState({ file: null });
                      }
                    }}
                    onSave={file => {
                      file.total = file.response.result.total;
                      file.successCount = file.response.result.successCount;
                      file.failureCount = file.response.result.failureCount;
                      file.filePath = file.response.result.filePath;
                      this.setState({ file: file });
                    }}
                  >
                    <Button icon="plus">点击上传</Button>
                  </Upload>
                </li>
                {file ? (
                  <li className={style.file}>
                    <a target="_blank" href={file.url}>
                      <span className={style.name}>{file.name}</span>
                    </a>
                    <div>
                      <span
                        className={style.del}
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          this.setState({ file: null });
                        }}
                      >
                        删除
                      </span>
                    </div>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
          {file ? (
            <p
              className={style.tip}
              dangerouslySetInnerHTML={{ __html: tip }}
            />
          ) : null}
        </div>
      </div>
    );
  }
}
