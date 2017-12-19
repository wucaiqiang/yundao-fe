import React, { Component } from "react";
import { Link } from "react-router-dom";

import Base from "./Base";

import style from "./Footer.scss";

export default class Header extends Base {
  render() {
    return (
      <footer className={style.footer}>
        {/*<section className="section_content">
          <div>
            <h5>深圳知人网络有限公司</h5>
            <p>400-0000-000</p>
            <p>深圳市南山区软件产业基地</p>
            <p>service@yundaojinfu.com</p>
          </div>
          <div>
            <img src="/assets/images/index/logo.png" alt="云道金服" />
            <p>Copyright@2013 深圳知人网络有限公司版权所有</p>
          </div>
        </section>*/}
      </footer>
    );
  }
}
