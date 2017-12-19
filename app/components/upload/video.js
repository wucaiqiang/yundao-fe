import React, {Component} from "react";
import {Upload, Icon, message,notification} from "antd";
const Dragger = Upload.Dragger
import PropTypes from "prop-types";
import Mime from "./mime";

import Video from 'model/CMS/Video/index'

export default class UploadCard extends Component {
    static propTypes = {
        multiple: PropTypes.bool,
        fileCount: PropTypes.number
    }


    static defaultProps = {
        multiple: false,
        accept: "wmv,wm,asf,asx,rm,rmvb,ra,ram,mpg,mpeg,mpe,vob,dat,mov,3gp,mp4,mp4v,m4v,mkv,avi,flv,f4v",
        fileCount: 10,
        fileSize: "infinite"
    }


    constructor(props) {
        super(props);
        this.mime = new Mime();
        const accept = this
        .mime
        .extList2mimes(this.props.accept,true)
        this.state = {
            fileList: [],
            msgList: {},
            accept
        };
        console.log('accept',accept)
    }

    componentWillMount() {
        if(this.props.fileSize !== 'infinite'){
            this.fileSize = this.parseFileSize(this.props.fileSize);
        }
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
            this.setState({fileList: []});
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

        size = /^([0-9]+)([mgk]?)$/.exec(size.toLowerCase().replace(/[^0-9mkg]/g, ""));
        mul = size[2];
        size = +size[1];

        if (muls.hasOwnProperty(mul)) {
            size *= muls[mul];
        }
        return size;
    }
    beforeUpload = (file, fileList) => {
        let {accept, fileSize} = this.props;
        // let supportedType = true
        // const type  = file.type? file.type:file.name.split('.')[file.name.split('.').length-1]
        const extName = file.name.split('.')[file.name.split('.').length-1]
        const supportedType = this.state.accept
            .indexOf(file.type) > -1 || this.props.accept.indexOf(extName) > -1;
        if (!supportedType) {
            message.error(`不支持的文件格式`);
        }
        let isLtMax=true
        if(this.fileSize){
            isLtMax = file.size < this.fileSize;
            if (!isLtMax) {
                message.error(`文件大小不能大于${fileSize}`);
            }
        }
        return supportedType && isLtMax;
    };
    onRemove = file => {
        this.setState(({fileList}) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);

            if (this.props.onRemove) {
                this
                    .props
                    .onRemove
                    .call(this, file, this);
            }

            return {fileList: newFileList};
        });
    };
    handleProgress = () => {
        this
            .uploader
            .onProgress((e, file) => {
                console.log(e.state, e.percent);
            });
    };
    msgList = {}
    showUploadMsg = (file, msg) => {
        const {msgList} = this.state

        if (msgList[file.uid] && msgList[file.uid].show) {
            msgList[file.uid].content = msg
            this.setState({msgList: msgList})
            message.destroy()
            message.success(msg)
        } else {
            msgList[file.uid] = {
                content: msg,
                show: true
            }
            this.setState({
                msgList: msgList
            }, () => {
                message.info(msgList[file.uid].content, () => {
                    msgList[file.uid].show = false
                    this.setState({msgList})
                })
            })
        }
    }

    start = (file,cacheName) => {
        const {APP} = window
        const {uid} = file
        
        

        const getCacheList=()=>{
            let uploadVideoList=null
            if(cacheName){
                uploadVideoList = APP.state[cacheName] ||[]
            }else{
                uploadVideoList = APP.state['uploadVideoList'] ||[]
            }
            return  uploadVideoList
        }
        const setCacheList=(list)=>{
            let state={}
            if(cacheName){
                state[cacheName] =list
            }else{
                state['uploadVideoList']  = list
            }
            APP.setState(state)
        }
        const that = this;
        const video = new Video()
       
        require.ensure(['../../public/js/jquery'], () => {
            const $ = require('../../public/js/jquery')
            window.$ = $
            window.jQuery = $
            window
                .qcVideo
                .ugcUploader
                .start({
                    videoFile: file,
                    getSignature: (callback) => {
                        video
                            .getSignature()
                            .then(res => {
                                if (res && res.success && res.result) {
                                    callback(res.result)
                                }else{
                                    // const {
                                    //     uploadVideoList
                                    // } = APP.state

                                    let uploadVideoList=getCacheList()
            
                                    const list = uploadVideoList ? uploadVideoList.map(item => {
                                        if (item.uid == uid) {
                                            item.status = 'error'
                                        }
                                        return item
                                    }) : []
                                    setCacheList(list)
                                    if(that.props.onError){
                                        that.props.onError(res)
                                    }
                                    // APP.setState({uploadVideoList:list})
                                }
                            })
                    },
                    success: function (result) {
                        console.log('success')
                       
                    },
                    error: function (result) {

                        console.log('上传失败:', result);
                        console.log('上传失败的文件类型：' + result.type);
                        console.log('上传失败的原因：' + result.msg);
                        result.status = 'error'

                        // const {
                        //     uploadVideoList
                        // } = APP.state

                        let uploadVideoList=getCacheList()

                        const list = uploadVideoList ? uploadVideoList.map(item => {
                            if (item.uid == uid) {
                                item.status = 'error'
                            }
                            return item
                        }) : []
                        if(that.props.onError){
                            that.props.onError(result)
                        }
                        setCacheList(list)
                        // APP.setState({uploadVideoList:list})
                    },
                    progress: function (result) {

                        console.log('上传进度:', result);
                        console.log('上传进度的文件类型：' + result.type);
                        console.log('上传进度的文件名称：' + result.name);
                        console.log('上传进度：' + result.shacurr);

                        // const {
                        //     uploadVideoList
                        // } = APP.state

                        let uploadVideoList=getCacheList()

                        const list = uploadVideoList?uploadVideoList.map(item => {
                            if (item.uid == uid) {
                                item.status = 'uploading'
                                item.percent = (result.shacurr * 100) || 0
                            }
                            return item
                        }):[]
                        if(that.props.onProgress){
                            that.props.onProgress(result)
                        }
                        setCacheList(list)
                        // APP.setState({uploadVideoList:list})
                    },
                    finish: function (result) {

                        console.log('finish')

                        // const {
                        //     uploadVideoList
                        // } = APP.state

                        let uploadVideoList=getCacheList()
                        console.log('uploadVideoList',uploadVideoList)
                        console.log('uid',uid)

                        let file = uploadVideoList?uploadVideoList.filter(item=>item.uid==uid)[0]:{}
                        
                        file.fileId =result.fileId
                        if(that.props.onSave){
                            that.props.onSave(file)
                            return ;
                        }
                        video
                        .add(file)
                        .then(res => {
                            let status= 'done'
                            if (!res.success) {
                                status = 'error'
                            }

                            if(status =='done'){
                                // notification.config({
                                //     placement:'topRight'
                                // })
                                notification.success({
                                    message: '视频上传成功',
                                    description: `${file.name},该视频已成功上传`,
                                });
                            }
                               
                            // const {
                            //     uploadVideoList
                            // } = APP.state

                            let uploadVideoList=getCacheList()

                            const list = uploadVideoList?uploadVideoList.map(item => {
                                if (item.uid == uid) {
                                    item.status = status
                                }
                                return item
                            }):[]
                            setCacheList(list)
                            // APP.setState({uploadVideoList:list})
                        })

                        console.log('上传成功:', result);
                        console.log('上传成功的文件类型：' + result.type);

                    }
                });
        })
    }

    customRequest = ({
        onProgress,
        onError,
        onSuccess,
        data,
        filename,
        file,
        withCredentials,
        action,
        headers
    }) => {

        console.log('file', file)
        this.props.onAdd && this
            .props
            .onAdd(file)
    }

    render() {
        let count = this.props.fileCount,
            showUploadBtn = true;

        const {fileList} = this.state,
            uploadButton = (
                <div>
                    <Icon type="plus"/>
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
            children,
            ...others
        } = this.props

        const UploadComponent = dragger
            ? Dragger
            : Upload

        return (
            <div
                className={"upload-card" + (!showUploadBtn
                ? " upload-card-uploaded"
                : "")}>
                <UploadComponent
                    ref={ref => (this.uploader = ref)}
                    uploader="uploader"
                    name="file"
                    action={action}
                    showUploadList={showUploadList}
                    multiple={multiple}
                    onRemove={onRemove}
                    beforeUpload={this.beforeUpload}
                    withCredentials={true}
                    customRequest={this.customRequest}
                    fileList={this.state.fileList}
                    >
                    {showUploadBtn
                        ? children || uploadButton
                        : null}
                </UploadComponent>
            </div>
        );
    }
}
