import React, {Component} from "react";
import Base from 'components/main/Base'

import {Layout, Tabs, Row, Col, Icon,message} from 'antd'

const {Header, Content, Footer, Sider} = Layout;

const {TabPane} = Tabs


import moment from 'moment'

import style from './productDetailInfo.scss'


import DynamicFormItemView from 'components/Form/DynamicFormItemView'

import Quote from './quote'
import Commission from './commission'

import Product from 'model/Product/'

import DetailSaleInfo from './productDetailSaleInfo'

class ProductDetail extends Base {

    state = {
        loading: true,
        visible: false
    }
    constructor(props) {
        super(props);

    }
    
    render() {
        const {data,mod} = this.props
        return (
            <div className={style.body}>
                <Row>
                    <DetailSaleInfo mod={mod} data={data}/>
                </Row>
                <Row>
                    <Quote mod={mod}  data ={data}/>
                </Row>
                 <Row>
                    <Commission mod={mod}  data ={data}/>
                </Row>
            </div>
        )
    }
}

export default ProductDetail