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
        
       
      </div>
    )
  }
}