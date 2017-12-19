import React, {Component} from "react";

import {
    Layout,
    Form,
    Tabs,
    Input,
    InputNumber,
    Select,
    Checkbox,
    Radio,
    Button,
    Row,
    Col,
    DatePicker
} from 'antd'

const InputGroup = Input.Group

const {Option} = Select

const {MonthPicker, RangePicker} = DatePicker;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;

const FormItem = Form.Item

import Base from 'components/main/Base'

import FormUtils from 'lib/formUtils'

import NumberRange from './NumberRange'
import SearchSelect from './SearchSelect'
import Upload from '../upload/'

import style from './DynamicFormItem.scss'

class DynamicFormItem extends Base {
    state = {
        provinceData: [],
        cityData: []
    }
    componentWillMount() {
        this.formUtils = this.props.formUtils
        const that = this
        require.ensure(['../../const/citys'], function () {
            const address = require('../../const/citys').default
            that.setState({provinceData: address})
        })
    }

    renderField(field) {
        const {fieldConfigDto} = field
        const elementsTypeList = {
            'text': (field) => {
                return fieldConfigDto && fieldConfigDto.initValue || null
            },
            'textarea': (field) => {
                return fieldConfigDto && fieldConfigDto.initValue || null
            },
            'image': (field) => {
                return (
                    <ul className="images">
                        {field.imageDtos && field
                            .imageDtos
                            .map(img => {
                                return <li className="image" key={img.id}>
                                    <a href={img.url} target="_blank">
                                        <img alt={img.name} src={img.url}/>
                                        </a>    
                                </li>
                            })}
                    </ul>
                )
            },
            'date': (field) => {
                return fieldConfigDto && fieldConfigDto.initValue || null
            },
            'date_range': (field) => {
                const range = fieldConfigDto && fieldConfigDto.initValue && field
                    .fieldConfigDto
                    .initValue
                    .split(',') || []
                return <span>{range && range[0] ?range.join(' 至 ') : null}</span>
            },
            'select': (field) => {
                const value = fieldConfigDto && fieldConfigDto.initValue;
                let label = null
                if (value) {
                    const filter = field
                        .selectDtos
                        .filter(select => select.value == value)
                    if(filter && filter.length){
                        label = filter[0].label
                    }
                }
                return label || null
            },
            'radio': (field) => {

                const value = fieldConfigDto && fieldConfigDto.initValue;
                let label = null
                if (value) {
                    const filter = field
                        .selectDtos
                        .filter(select => select.value == value)
                    if(filter && filter.length){
                        label = filter[0].label
                    }
                }
                return label || null
            },
            'checkbox': (field) => {

                const value = fieldConfigDto && fieldConfigDto.initValue;
                let label = []
                if (value) {
                    let valueArray = value.split(',')
                    field
                        .selectDtos
                        .map(select => {
                            if (valueArray.indexOf(select.value)>-1) {
                                label.push(select.label)
                            }
                        })
                }
                return label && label.length ?label.join(','): null
            },
            'number': (field) => {
                const value = fieldConfigDto && fieldConfigDto.initValue;
                const unit = field.numberDto && field.numberDto.unit;
                return <span className="number">
                    {value?<span className="value">{value}</span>:null}{value && unit?<span className="label"> {unit}</span>:null}
                </span>
            },
            'search_select': (field) => {
                const valueText = fieldConfigDto && fieldConfigDto.initValueText;
                return valueText || null
            },
            'number_range': (field) => {
                const range = fieldConfigDto && fieldConfigDto.initValue && field
                    .fieldConfigDto
                    .initValue
                    .split(',') || []
                return <span>{range.join('-') || null} ({field.numberDto && field.numberDto.unit})</span>

            },
            'address': (field) => {
                let value = fieldConfigDto && fieldConfigDto.initValue;
                if (value) {
                    value = JSON.parse(value)
                } else {
                    return null
                }
                const labels = []
                const province = value.province,
                    city = value.city,
                    address = value.address;
                let provinceLabel = '',
                    cityLabel = '';
                this.state.provinceData.map(item => {
                    if (item.value == province) {
                        // provinceLabel = item.label
                        labels.push(item.label)
                        item
                            .children
                            .map(child => {
                                if (child.value == city) {
                                    // cityLabel = child.label
                                    labels.push(child.label)
                                }
                            })
                    }
                })
                labels.push(value.address)
                return <span>
                    {labels.join(' ') || null}
                    {/* <span className="province">{provinceLabel}</span> */}
                    {/* <span className="city">{cityLabel}</span> */}
                    {/* <span className="address">{address}</span> */}
                </span>

            }
        }
        return elementsTypeList[field.typeCode](field)
    }

    render() {
        const {
            field,
            ...others
        } = this.props
        return (
            <FormItem label={field.label} {...others}>
                {this.renderField(field)}
            </FormItem>
        )
    }
}

export default DynamicFormItem