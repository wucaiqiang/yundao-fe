import React, {Component} from 'react'
import EditInput from './Input'
import style from './InputEdit.scss'
export default class InputControl extends Component {
  state = {
    isEdit: false
  }

  toggleEdit = () => {
    this.setState({
      isEdit: !this.state.isEdit
    })
  }

  render() {
    const {onSave,onCancel} = this.props
    return (
      <div className={style.container}>
        <div className={style.input}><EditInput isEdit={this.state.isEdit} {...this.props}/></div>
        {this.state.isEdit
          ? <div className={style.action}>
              <img
                className="anticon"
                src="/assets/images/icon/取消@1x.png"
                onClick={()=>{
                  this.toggleEdit();
                  onCancel && onCancel()
                }}/>
              <img className="anticon" src="/assets/images/icon/确认@1x.png" onClick={()=>{
                onSave && onSave()
              }}/>
            </div>
          : <div className={style.action}><img
            className="anticon"
            src="/assets/images/icon/编辑@1x.png"
            onClick={this.toggleEdit}/></div>}
      </div>
    )
  }
}