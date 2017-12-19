import React, {Component} from 'react'
import {
    Radio
} from 'antd'
const RadioGroup = Radio.Group

class ViewRadioGroup extends RadioGroup{
   
     render(){
        const { children} = this.props
        const text= children.filter(item=>item.props.value == this.props.value)[0].props.children
        return this.props.isEdit ?(
            <RadioGroup {...this.props}/>
        ):<div >{text}</div>   
    }
}


class ViewRadio extends Radio{
    static get Group (){
       return ViewRadioGroup
    } 
    render(){
        
        return this.props.isEdit ?(
            <Radio {...this.props}/>
        ):<span>{this.props.value}</span>
    }
}




export default ViewRadio
    