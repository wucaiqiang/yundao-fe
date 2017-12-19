import React, {Component} from "react";
import {Spin, Breadcrumb} from "antd";

import DeclarationDetail from "services/sale/declaration/detail/declarationDetail";

import Declaration from 'model/Declaration/'

import Base from 'components/main/Base'
import Page from "components/main/Page";

import style from "./Index.scss";

class DeclarationDetailFloat extends Base {
    state = {
        loading: true,
        visible: true
    };
    constructor(props) {
        super(props);
        this.declaration = new Declaration()
        const {location, match} = this.props;

        const {id} = match.params;

        this.state = {
            id: id,
            visible: true
        }
    }

    componentWillMount() {
        this.loadData()
    }

    loadData = () => {
        const {id} = this.state
        this
            .declaration
            .get_detail(id)
            .then(res => {
                if (res.success) {
                    let data = res.result;
                    data.id = id
                    this.setState({data, id, loading: false})
                } else {
                    this.setState({loading: false, error: true, message: res.message})
                }
            })
    }

    reloading = () => {
        this.setState({loading: true})
        this.loadData()
    }

    render() {
        return (
            <Page {...this.props}>
                <div
                    ref={ref => {
                    if (ref) {
                        const container = ref.parentNode.parentNode;
                        this.affixContainer = container
                    }
                }}>
                    <Breadcrumb className="page-breadcrumb">
                        <Breadcrumb.Item>报单详情</Breadcrumb.Item>
                    </Breadcrumb>
                    <div className="page-content">
                        <Spin spinning={this.state.loading}>
                            {this.state.error
                                ? <div className="error" onClick={this.reloading}>{this.state.message},点击重新加载</div>
                                : this.state.data
                                    ? <DeclarationDetail mod={this} data={this.state.data}/>
                                    : null}
                        </Spin>
                    </div>
                </div>
            </Page>
        );
    }
}

export default DeclarationDetailFloat;
