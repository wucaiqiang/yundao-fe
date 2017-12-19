import React, {Component} from "react";
import Base from 'components/main/Base'

import {Layout, Tabs,Row,Icon} from 'antd'

const {Header, Content, Footer, Sider} = Layout;

const {TabPane} = Tabs



import Profit from './profit'


import style from './productDetailInfo.scss'

class ProductDetail extends Base {

    state = {
        loading: true,
        visible: false,
        isEdit:false
    }
    constructor(props) {
        super(props);

    }
     render() {
        const {data,mod} = this.props
        const icons = []
        return (
            <div className={style.body}>
                <Profit data ={data} mod={mod}/>
            </div>
        )
    }
}

export default ProductDetail