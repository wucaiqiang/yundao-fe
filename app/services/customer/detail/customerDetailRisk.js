import React from "react";
import moment from "moment";

import Customer from "model/Customer";

import style from "./customerDetail.scss";

import { Button, Row,Icon, Modal, Spin, message } from "antd";

import CustomerDetailAssets from './customerDetailAssets'
import CustomerDetailID from './customerDetailID'

export default class CustomerDetailRisk extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customerId: this.props.customerId,
      qaList: null
    };
  }
  componentWillMount() {
    this.customer = new Customer();
    this.getData(this.state.customerId);
  }
  componentWillReceiveProps(nextProps) {
    const customerId = this.state.customerId;
    if (nextProps.customerId !== customerId) {
      this.setState(
        {
          customerId: nextProps.customerId
        },
        () => {
          this.getData(nextProps.customerId);
        }
      );
    }
  }
  getData(customerId) {
    this.customer.getRiskEvaluationResult(customerId).then(res => {
      if (res.success) {
        this.setState({ qaList: res.result });
      }
    });
  }
  showDetail=()=>{
    this.setState({
      visible:true
    })
  }
  render() {
    let { customerId, qaList } = this.state;

    const { data,mod } = this.props;
    if (!data) {
      return null;
    }

    const canEdit = data.info.permission.editPermission;
    const canRead = data.info.permission.readPermission;
    let info = JSON.parse(JSON.stringify(data.info.data));
    const icons = [];
    if (this.state.isEdit) {
      icons.push(
      
        <img
          className="anticon"
          index={0}
          src="/assets/images/icon/取消@1x.png"
          srcSet="/assets/images/icon/取消@2x.png"
          onClick={e => {
            this.setState({ isEdit: false });
          }}
        />
        
      );
      icons.push(
        <img
          className="anticon"
          index={1}
          src="/assets/images/icon/确认@1x.png"
          srcSet="/assets/images/icon/确认@2x.png"
          onClick={this.submit}
        />
      );
    } else {
      if (canRead && canEdit) {
        icons.push(
          
          <img
            className="anticon anticon-edit"
            index={2}
            src="/assets/images/icon/编辑@1x.png"
            srcSet="/assets/images/icon/编辑@2x.png"
            onClick={e => {
              this.setState({ isEdit: true });
            }}
          />
        );
      }
    }
    return (
      <Row>
         <div className={style.card}>
        <div className={style.header}>
          <div className={style.title}>风险偏好测评</div>
          {qaList && qaList.riskValue?<a  onClick={this.showDetail} style={{cursor:'pointer'}}>查看详情>>></a>:null}
        </div>
        <div className={style.content} style={{
          overflow:'hidden'
        }}>
        {qaList && qaList.riskValue? (
          <div className={style.risk}>
            <div className={style.risk_head_noBefore}>
              <h1 className={style.risk_head_title}>
                客户风险测评结果：<em>{qaList.riskText}</em>
              </h1>
              <p className={style.risk_head_caption}>
                <span>分数：{qaList.grade} </span>
                <span>
                  测评时间：{qaList.evaluationTime && moment(qaList.evaluationTime).format("YYYY-MM-DD")}
                </span>
              </p>
            </div>
          </div>
        ) : '客户尚未进行风险测评'}
      </div>
      </div>
         <CustomerDetailID data={data} mod={mod} />
         <CustomerDetailAssets data={data} mod={mod} />
          <Modal
        visible={this.state.visible}
        title={'客户风险测评结果'}
        width={500}
        maskClosable={false}
        className={`vant-modal showfloat yundao-modal  ${style.modal} `}
        wrapClassName="vertical-center-modal"
        footer={[<Button key="close" onClick={e=>{
          this.setState({
            visible:false
          })
          }}>
            关闭
          </Button>]}
        closable={false}
      >
      {qaList && qaList.riskValue? (
          <div className={style.customer_detail}>
          <div className={style.risk}>
            <div className={style.risk_head}>
              <h1 className={style.risk_head_title}>
                客户风险测评结果：<em>{qaList.riskText}</em>
              </h1>
              <p className={style.risk_head_caption}>
                <span>分数：{qaList.grade} </span>
                <span>
                  测评时间：{qaList.evaluationTime && moment(qaList.evaluationTime).format("YYYY-MM-DD")}
                </span>
              </p>
            </div>
            <div className={style.risk_list}>
              {qaList.questionDtos &&
                qaList.questionDtos.map((item, index) => {
                  return (
                    <div className={style.risk_list_group} key={index}>
                      <p className={style.risk_list_group_question}>
                        {`${index + 1}、${item.questionText}`}
                      </p>
                      <p className={style.risk_list_group_answer}>
                        {item.optionText}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
          </div>
        ) : null}
      </Modal>
      </Row>
    );
  }
}
