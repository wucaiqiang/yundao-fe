import React, {Component} from "react";
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
  Affix,
  InputNumber,
  message,
  Tooltip,
  Card
} from "antd";

const FormItem = Form.Item;

const MonthPicker = DatePicker.MonthPicker
const RangePicker = DatePicker.RangePicker

const Option = Select.Option;
const RadioGroup = Radio.Group;

import extend from "extend";

import style from "./index.scss";

import Assets from "model/Assets/";
import Dictionary from "model/dictionary";

import FormUtils from "lib/formUtils";

import Base from "components/main/Base";

const NAME = "CompanyInfoForm";

import moment from "moment";

import {generatorEditForm} from 'components/Form/SingleEditForm'


export default class CompanyInfo extends Component {
  state = {
    isEdit: false,
    company_info: {},
    filters:{}
  };
  constructor(props) {
    super(props);
  }
  componentWillMount() {
    this.assets = new Assets()
    this.dictionary = new Dictionary()
    this.getDictionary();
    this.formUtils = new FormUtils(NAME);
    this.loadData()

  }
  loadData = () => {
    const projectId = this.props.data.data.id
    this
      .assets
      .company_info(projectId)
      .then(res => {
        this.setState({company_info: res.result})
      })
  }

  getDictionary() {
    this
      .dictionary
      .gets("dic_project_company_type")
      .then(res => {
        if (res.success && res.result) {
          let filters = {};
          res
            .result
            .map(item => {
              filters[item.value] = item.selections;
            });

          this.setState({filters});
        }
      });
  }

  render() {
    const {data} = this.props;
    if (!data) {
      return null;
    }

    //无编辑权限
    const canEdit = data.permission.editPermission;

    const canRead = data.permission.readPermission;

    const formItemLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };

    const icons = [];

    const {filters} = this.state

    const {dic_project_company_type}= filters

    let info = this.state.company_info

    const CompanyName = generatorEditForm(Input, {
      size: "large",
      placeholder: "请输入公司名称",
      canEdit,
      formatSubmit: value =>{
        return {
          id:info.id,
          name:'name',
          value:value
        }
      },
      style: {
        width: "100%"
      },
    }, [
      {
        max:30,
        message: '请输入公司名称(长度不超过30)'
      }
    ])

    const RegistrationNumber = generatorEditForm(Input, {
      size: "large",
      placeholder: "请输入注册号",
      canEdit,
      formatSubmit: value => {return {
        id:info.id,
        name:'registrationNumber',
        value:value
      }},
      style: {
        width: "100%"
      },
    }, [
      {
        max:30,
        message: '请输入注册号(长度不超过30)'
      }
    ])
    const LegalRepresentative = generatorEditForm(Input, {
      size: "large",
      placeholder: "请输入法定代表",
      canEdit,
      formatSubmit: value => {return {
        id:info.id,
        name:'legalRepresentative',
        value:value
      }},
      style: {
        width: "100%"
      },

    }, [
      {
        max:10,
        message: '请输入法定代表(长度不超过10)'
      }
    ])

    const RegistrationAuthority = generatorEditForm(Input, {
      size: "large",
      placeholder: "请输入登记机关",
      canEdit,
      formatSubmit: value => {return {
        id:info.id,
        name:'registrationAuthority',
        value:value
      }},
      style: {
        width: "100%"
      },

    }, [
      {
        max:30,
        message: '请输入登记机关(长度不超过30)'
      }
    ])
    const RegistrationCapital = generatorEditForm(InputNumber, {
      size: "large",
      placeholder: "请输入注册资本",
      formatSubmit: value => {return{
        id:info.id,
        name:'registrationCapital',
        value:value
      }},
      canEdit,
      style: {
        width: "100%"
      },
      precision:0
    })
    const ApprovalDate = generatorEditForm(DatePicker, {
      getCalendarContainer:() => document.getElementById(NAME),
      size: "large",
      placeholder: "请选择发照日期",
      canEdit,
      events:['onChange','onBlur'],
      allowClear:true,
      style: {
        width: "100%"
      },
      formatView:value=>value?value.format('YYYY-MM-DD'):null,
      formatSubmit:value=>{
        console.log(value)
        return {
        id:info.id,
        name:'approvalDate',
        value:value?value.format('YYYY-MM-DD'):null
      }},
    }, [
      {
        type:'object',
        message: '请选择发照日期'
      }
    ])
    const RegistrationDate = generatorEditForm(DatePicker, {
      getCalendarContainer:() => document.getElementById(NAME),
      size: "large",
      placeholder: "请选择注册时间",
      events:['onChange','onBlur'],
      canEdit,
      allowClear:true,
      style: {
        width: "100%"
      },
      formatView:value=>value?value.format('YYYY-MM-DD'):null,
      formatSubmit:value=>value?{
        id:info.id,
        name:'registrationDate',
        value:value.format('YYYY-MM-DD')
      }:{
        id:info.id,
        name:'registrationDate',
        value:''
      },
    }, [
      {
        type:'object',
        message: '请选择注册时间'
      }
    ])

    const BusinessTerm = generatorEditForm(RangePicker, {
      getCalendarContainer:() => document.getElementById(NAME),
      size: "large",
      events:['onChange','onBlur'],
      canEdit,
      style: {
        width: "100%"
      },
      allowClear:true,
      formatView:value=>value?value.map(item=>item.format('YYYY-MM-DD')).join('至'):null,
      formatSubmit:value=>{
        const params=[];
        // if(value && value.length){
          ['businessTermBegin','businessTermEnd'].map((item,index)=>{
            params.push({
              id: data.id,
              name:item,
              value:value.map(item=>item.format('YYYY-MM-DD'))[index]
            })
          })
        // }
        return {
          data:JSON.stringify(params)
        }
      },
    }, [
      {
        type:'array',
        message: '请选择营业期限'
      }
    ])

    const CompanyType = generatorEditForm(Select, {
      size: "large",
      getPopupContainer: () => document.getElementById(NAME),
      labelInValue: true,
      placeholder: "请选择公司类型",
      formatView: value => value ?value.label
      : null,
      allowClear:true,
      formatSubmit: value => {return {
        id:info.id,
        name:'type',
        value:value?value.key:''
      }},
      canEdit,
      style: {
        width: '100%'
      },
      children:dic_project_company_type && dic_project_company_type.map(item=>{
        return <Option key={item.value}>{item.label}</Option>
      })
    }, )


    const Address = generatorEditForm(Input, {
      size: "large",
      placeholder: "请输入公司地址",
      canEdit,
      formatSubmit: value => {return {
        id:info.id,
        name:'address',
        value:value
      }},
      style: {
        width: "100%"
      },
    }, [
      {
        max:50,
        message: '请输入公司地址(长度不超过50)'
      }
    ])

    return (
      <div className={style.card} id={NAME}>

        <Card title="公司信息" >
        <div className={style.content}>

            <Row >
              <Col span={12} style={{
                paddingRight: 20
              }}>
                <CompanyName
                  label="公司名称"
                  request={this.assets.company_info_update_only}
                  data={{
                  id: info.id,
                  name: 'name',
                  value: info.name
                }}/>
                <RegistrationNumber
                  label="注册号"
                  request={this.assets.company_info_update_only}
                  data={{
                  id: info.id,
                  name: 'registrationNumber',
                  value: info.registrationNumber
                }}/>
                <CompanyType label="公司类型"
                  request={this.assets.company_info_update_only} data={{
                    id: info.id,
                    name: 'type',
                    value: info.type !== undefined || info.type !== null?{
                      label:info.typeText,
                      key:info.type
                    }:{}
                  }}/>
                <LegalRepresentative
                  label="法定代表"
                  request={this.assets.company_info_update_only}
                  data={{
                  id: info.id,
                  name: 'legalRepresentative',
                  value: info.legalRepresentative
                }}/>
                <ApprovalDate
                  label="发照日期"
                  request={this.assets.company_info_update_only}
                  data={{
                  id: info.id,
                  name: 'approvalDate',
                  value:info.approvalDate? moment(info.approvalDate):null
                }}/>

              </Col>
              <Col span={12}>
              <RegistrationAuthority label="登记机关"
                  request={this.assets.company_info_update_only}
                  data={{
                  id: info.id,
                  name: 'registrationAuthority',
                  value:info.registrationAuthority
                }} />

                <RegistrationDate
                  label="注册时间"
                  request={this.assets.company_info_update_only}
                  data={{
                  id: info.id,
                  name: 'registrationDate',
                  value:info.registrationDate? moment(info.registrationDate):null
                }}/>
                <BusinessTerm
                  label="营业期限"
                  request={this.assets.company_info_update_multiple}
                  data={{
                  id: info.id,
                  name: ['businessTermBegin','businessTermEnd'],
                  value:info.businessTermBegin?[ moment(info.businessTermBegin), moment(info.businessTermEnd)]:null
                }}/>
                <RegistrationCapital label="注册资本(万)"
                  request={this.assets.company_info_update_only}
                  data={{
                  id: info.id,
                  name: 'registrationCapital',
                  value:info.registrationCapital
                }} />

                <Address label="公司地址"
                  request={this.assets.company_info_update_only}
                  data={{
                  id: info.id,
                  name: 'address',
                  value:info.address
                }} />
              </Col>
            </Row >
        </div>
        </Card>
      </div>
    );
  }
}
