import React, { Component } from "react";
import { Button, Icon, Row, Col, Form } from "antd";

const FormItem = Form.Item;

import style from "./customerDetail.scss";

import Customer from "model/Customer/";

import PersonalBaseInfo from "./personalBaseInfo";
import OrganizationBaseInfo from "./organizationBaseInfo";
import PersonalContactInfo from "./personalContactInfo";
import LegalPersonInfo from "./legalPersonInfo";
import CustomerDetailInvestInfo from "./customerDetailInvestInfo";
import CustomerDetailBankInfo from "./customerDetailBankInfo";

export default class CustomerDetailMaterial extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocus: false
    };
  }
  componentWillMount() {
    this.customer = new Customer();
  }

  render() {
    const { data, mod } = this.props;
    const { info } = data;

    return (
      <div className={style.body}>
        {info.data.customerType === 1 ? (
          <Row>
            <Col span="11">
              <PersonalBaseInfo data={data} mod={mod} />
            </Col>
            <Col span="2" />
            <Col span="11">
              <PersonalContactInfo data={data} mod={mod} />
              <CustomerDetailInvestInfo data={data} mod={mod} />
              <CustomerDetailBankInfo data={data} mod={mod} />
            </Col>
          </Row>
        ) : null}
        {info.customerType === 2 ? (
          <Row>
            <Col span="11">
              <OrganizationBaseInfo data={data} mod={mod} />
            </Col>
            <Col span="2" />
            <Col span="11">
              <LegalPersonInfo data={data} mod={mod} />
              <CustomerDetailInvestInfo data={data} mod={mod} />
              <CustomerDetailBankInfo data={data} mod={mod} />
            </Col>
          </Row>
        ) : null}
      </div>
    );
  }
}
