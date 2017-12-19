import React from "react";

import Page from '../main/Page'

export default class NoMatch extends React.Component {
    componentDidMount(){
        NProgress.done()
    }
    render() {
        return (
            <Page title="Not Found">
            <section className="app-content">
                <header className="section-header" style={{
                    borderTop:'0px',
                    borderBottom:'0px',
                    textAlign:'center'
                }}>
                    <h3 className="title">此页面不存在，或无法访问,请选择其它菜单访问</h3>
                </header>
            </section>
            </Page>
        );
    }
}
