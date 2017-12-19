import React, {Component} from 'react'
import {
    TreeSelect,
} from 'antd'
class ViewTreeSelect extends TreeSelect{

    generatorText=()=>{

    }

    render(){
        const {value,treeData} =this.props
        let text =null;
        if(value == '0'){
            text=treeData.label
        }else{
            text= treeData.children && treeData.children.filter(item=> value.indexOf(item.value)>-1  ).map(item=>item.label).join(',')
        }
        console.log(this.props)
        return this.props.isEdit ?(
            <TreeSelect {...this.props}/>
        ):<span>{text}</span>
    }
}


export default ViewTreeSelect
    