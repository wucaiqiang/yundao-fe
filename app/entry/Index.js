import React,{Component} from 'react'
import PropTypes from "prop-types";

import Base from '../components/main/Base'

import Page from '../components/main/Page'

import wrapAuth from '../components/permission'

class Index extends Base {
  static get NAME() {
    return "Index";
  }

  static get contextTypes() {
    return {data: PropTypes.object};
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[Index.NAME]) {
      this.context = context;
    }
    this.state = context.data[Index.NAME] || {
      items: []
    };
  }
  render() {
    const {
      children,
      ...others
    } = this.props
    return (
      <Page {...this.props}>
        <section className="banner">
          <h1>云道金服</h1>
          <p>为私募金融提供专业科技服务</p>
          <a href="">申请试用</a>
        </section>
        <section className="tips">
          10年金融行业沉淀+10年互联网研发经验，实力碰撞出最强团队打造私募金融IT服务系统
        </section>
        <section>
          <img src="/assets/images/index/s1.png" alt=""/>
          <h2>专业服务</h2>
          <p>
            云道金服，专注于私募金融IT服务领域。从立项投决到投后服务，从销售管理到客户管理，从品牌包装到日常运维，从流程标准化到深度定制开发，云道金服以专业的金融服务致力于帮助每个客户实现可持续的业务增长!
          </p>
        </section>
        <section>
          <img src="/assets/images/index/s2.png" alt=""/>
          <h2>信息安全</h2>
          <p>
            区块链：云道金服引入区块链3.0技术，以去中心化的方式来保证电子数据安全无法篡改，彻底解决第三方存证系统可能读取、伪造、篡改数据的问题，客户信息的加密也得到了保证。
          </p>
          <p>数据隔离：此外，云道金服提供的服务器独立部署方案，也从根本上解决金融公司信息独立安全的问题。</p>
        </section>
        <section>
          <img src="/assets/images/index/s3.png" alt=""/>
          <h2>合规管理</h2>
          <p>
            云道金服密切关注监管部门出台的最新行业法律法规，及时更新产品合规服务，并引入标准化的产品成立及销售流程，保障客户公司运营安全合规。
          </p>
        </section>
        <section>
          效率提升 理财师 工作台
          <ul>
            <li>• 销售机会管理</li>
            <li>• 售后管理</li>
            <li>• 关键日提醒</li>
          </ul>
          产品经理 工作台
          <ul>
            <li>• 产品导入</li>
            <li>• 订单管理</li>
            <li>• 存续期管理</li>
          </ul>

          管理层 工作台
          <ul>
            <li>• 销售进程管理</li>
            <li>• 销售业绩报表</li>
            <li>• 团队工作轨迹</li>
          </ul>
        </section>
        <section>
          移动方案 随时随地，高效管理 云道SaaS系统 公众号 客户版APP 员工版APP
        </section>
      </Page>
    );
  }
}

function Mod(props) {
  return <Index {...props}/>
}

export default Mod