import React, { Component } from "react";
import { Button, Icon, Row, Col, Form, Alert } from "antd";

const FormItem = Form.Item;

import style from "./declarationDetail.scss";

import Declaration from "model/Declaration/";
import DeclarationDetailBaseInfo from "./declarationDetailBaseInfo";
import DeclarationDetailBuyInfo from "./declarationDetailBuyInfo";
import DeclarationDetailBankInfo from "./declarationDetailBankInfo";
import DeclarationDetailDocumentInfo from "./declarationDetailDocumentInfo";
import utils from "utils/";
export default class DeclarationDetailMaterial extends Component {
  state = {
    loading: true,
    visible: false,
    showWarn: false
  };
  constructor(props) {
    super(props);
  }
  resetShowWarn = data => {
    const showProdocutEditWarn =
      utils.getStorage("hideDeclarationEditWarn") == true ? false : true;
    if (data.status == 4 && showProdocutEditWarn) {
      this.setState({ showWarn: true });
    }
  };

  hideProdocutEditWarn = () => {
    this.setState({ showWarn: false });
    utils.setStorage("hideDeclarationEditWarn", false);
  };

  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded
    // render
    if (nextProps.data !== this.state.data) {
      this.resetShowWarn(nextProps.data);
    }
  }

  render() {
    const { data, mod, parent } = this.props;
    let name,
      tags = [],
      sunmmary;

    if (!data || !data.data) {
      return <div>找不到订单</div>;
    }

    return (
      <div className={style.body}>
        <div
          className={style.message}
          style={{
            marginBottom: "20px",
            display: this.state.showWarn ? "block" : "none"
          }}
        >
          <Alert
            message={
              <p>
                已取消的报单不可编辑。 <a onClick={this.hideProdocutEditWarn}> 不再提醒 </a>
              </p>
            }
            type="warning"
            showIcon
          />
        </div>
        <div
          style={{
            display: "flex"
          }}
        >
          <div
            style={{
              flex: 1,
              marginRight: "20px"
            }}
          >
            <DeclarationDetailBaseInfo data={data} mod={mod} parent={parent} />
            <DeclarationDetailDocumentInfo
              data={data}
              mod={mod}
              parent={parent}
            />
          </div>
          <div
            style={{
              flex: 1
            }}
          >
            <DeclarationDetailBuyInfo data={data} mod={mod} parent={parent} />
            <DeclarationDetailBankInfo data={data} mod={mod} parent={parent} />
          </div>
        </div>
      </div>
    );
  }
}
