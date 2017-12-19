import React, {Component} from "react";
import ReactDOM from 'react-dom'
import {
    Button,
    Icon,
    DatePicker,
    Form,
    Radio,
    Select,
    Input,
    Row,
    Col,
    message,
    Affix,
    Tooltip
} from "antd";

import Base from "components/main/Base";
import Upload from "components/upload/";

import FormUtils from "lib/formUtils";

import Utils from 'utils/index'

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

function setCaretPosition(tObj, sPos){  
  if(tObj.setSelectionRange){  
      setTimeout(function(){  
          tObj.setSelectionRange(sPos, sPos);  
          tObj.focus();  
      }, 0);  
  }else if(tObj.createTextRange){  
      var rng = tObj.createTextRange();  
      rng.move('character', sPos);  
      rng.select();  
  }  
}   

class SingleEditForm extends Component {
    
    constructor(props) {
        super(props);
        const {data} = this.props
        this.state = {
            isEdit: false,
            name: data? data.name : null,
            value: data ?data.value : null
        }
    }
    componentWillMount() {
        this.formUtils = new FormUtils(this.state.name);
        this
            .formUtils
            .setForm(this.props.form);
    }

    submit = (formatedValue) => {
        const {data, request} = this.props
        let values = false;
        this
            .formUtils
            .validateFields((errors,values) => {
                if (!errors) {
                    values = this
                        .formUtils
                        .getFieldsValue();
                    if( Utils.deepCompare(values[this.state.name],this.state.value)){
                        console.log('no change')
                        this.toggleEdit();
                        return;
                    }else{
                        this.setState({validateStatus: 'validating', disabled: true})
                        request(formatedValue).then(res => {
                            this.setState({validateStatus: null, disabled: false})
                            if (res.success) {
                              const value = values[this.state.name]
                                this.setState({
                                  value
                                })
                                this.props.onChange && this.props.onChange(value)
                            }
                            this.toggleEdit()
                        })
                    }
                }
            });
    }


    toggleEdit = () => {
        this.setState({
            isEdit: !this.state.isEdit
        })
    }

}


const generatorEditForm = (ComposedComponent, props, rules) => {
    class EditFormComponent extends SingleEditForm {
      render() {
  
        const formItemLayout = {
          labelCol: {
            span: 24
          },
          wrapperCol: {
            span: 24
          }
        };
        const {isEdit, value, name} = this.state;
        const {label} = this.props
  
        let canEdit = true
        if(typeof props.canEdit != 'undefined'){
          canEdit = props.canEdit
        }
  
        let triggerEvents = {};
        let events = ['onBlur','onPressEnter'];
        if (props.events && props.events.length) {
          events = props.events
        }
        
        events.map(item => {
          triggerEvents[item] = (res) => {
            let value = res &&  res.target
              ? res.target.value
              : res;
  
            let updatedFields = {}
            updatedFields[name] = value
            this
              .formUtils
              .setFieldsValue(updatedFields)
  
            if (props.formatSubmit ) {
              value = props.formatSubmit(value);
            }
            this.submit(value)
          }
        })
        return (
          <div>
          <Form >
            <FormItem
              label={label}
              {...formItemLayout}
              validateStatus={this.state.validateStatus}>
              <div style={{
                display: "flex"
              }}>
                {!isEdit
                  ? props.formatView && value
                    ? props.formatView(value)
                    : value
                  : this
                    .formUtils
                    .getFieldDecorator(name, {
                      initialValue: value,
                      rules: rules
                    })(<ComposedComponent
                      {...props}
                      {...triggerEvents}
                      ref={ref=>{
                        if(ref){
                          const dom = ReactDOM.findDOMNode(ref)
                          dom.click()
                          try {
                            //尝试移动光标到最后
                            var sPos = dom.value.length;  
                            setCaretPosition(dom, sPos);  
                          } catch (error) {
                            
                          }
                          
                          try {
                              //针对日历等嵌套组件 
                            dom.children[0].click()
                          } catch (error) {
                              
                          }
                          
                          dom.focus()
                        }
                      }}
                      disabled={this.state.disabled}/>)}
                {isEdit || !canEdit
                  ? null
                  : (
                    <div style={{padding:'0px 5px'}}>
                      <img
                        className="anticon"
                        src="/assets/images/icon/编辑@1x.png"
                        onClick={e=>{
                          e.preventDefault();
                          e.stopPropagation();
                          this.toggleEdit();
                          return false;
                        }}/>
                    </div>
                  )}
              </div>
            </FormItem>
          </Form>
          </div>
        );
      }
  
    }
    EditFormComponent = Form.create()(EditFormComponent);
    return EditFormComponent
  }
  

export {
    generatorEditForm
}

export default SingleEditForm