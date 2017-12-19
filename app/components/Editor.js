import React, {Component} from "react";
import Base from "components/main/Base";
import CKEditor from "react-ckeditor-component";
class Editor extends Base {
  constructor(props) {
    super(props)
    this.state = {
      content: props.content
    }
  }

  onChange = (evt) => {
    const {callback} = this.props
    // console.log("onChange fired with event info: ", evt);
    var newContent = evt
      .editor
      .getData();
    // console.log("newContent", newContent)
    this.setState({content: newContent})
    callback && callback(newContent)

  }

  onBlur = (evt) => {
    // console.log("onBlur event called with event info: ", evt);
  }

  clean =()=>{
    const {instances} = CKEDITOR
    for (var key in instances) {
      try {
        instances[key].setData('')
      } catch (error) {
        console.log('error',error)
      }
      
    }
  }

  afterPaste = (evt) => {
    // console.log("afterPaste event called with event info: ", evt);
  }
  render() {
    let content = null
    if (this.props.content) {
      content = this.props.content
    }
    return (<CKEditor
      activeClass="p10"
      content={content}
      /* scriptUrl={'/assets/js/ckeditor/ckeditor.js'} */
      config={{
      language: 'zh-cn',
      filebrowserUploadUrl: '/api/file/upload_callback'
    }}
      events={{
      "blur": this.onBlur,
      "afterPaste": this.afterPaste,
      "change": this.onChange
    }}/>)
  }
}

export default Editor