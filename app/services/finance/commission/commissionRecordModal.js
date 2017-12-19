import React from "react";
import { Button, Modal, Icon, message, Popover } from "antd";
import moment from "moment";

import Base from "components/main/Base";
import FormUtils from "lib/formUtils";

import Commission from "model/Finance/commission";
import Dictionary from "model/dictionary";

import EnumKnotCommission from "enum/EnumKnotCommission";

import style from "./commissionRecordModal.scss";

const icon_add = "/assets/images/icon/新增";
const icon_question = "/assets/images/icon/问号";

import GM from "lib/gridManager";

import Utils from "utils/";

const {
  GridManager,
  GridInputFilter,
  FilterBar,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter,
  GridRangeFilter
} = GM;

import SettleCommissionModal from "./settleCommissionModal";
import CommissionTableModal from "./commissionTableModal";

const { EnumKnotCommissionStatus } = EnumKnotCommission;

function formatMoney(value) {
  return `${value}元`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default class CommissionRecordModal extends Base {
  constructor() {
    super();
    this.state = {
      loading: false,
      visible: false,
      isEdit: false,
      submitting: false,
      formData: {},
      filters: {},
      data: {},
      action: null
    };
  }
  componentWillMount() {
    this.dictionary = new Dictionary();
    this.commission = new Commission();
  }

  componentDidMount() {
    this.getDictionary();
  }

  getDictionary() {
    this.dictionary
      .gets("dic_knotcommission_type,dic_knotcommission_status")
      .then(res => {
        if (res.success && res.result) {
          let filters = {};
          res.result.map(item => {
            filters[item.value] = item.selections;
          });

          this.setState({ filters });
        }
      });
  }
  show(data = {}) {
    this.setState({ formData: data, visible: true }, () => {
      this.loadData();
    });
  }
  loadData = () => {
    const { id } = this.state.formData;
    this.commission.get(id).then(res => {
      if (res.success) {
        this.setState({
          data: res.result
        });
      }
    });
    this.commission.get_record(id).then(res => {
      if (res.success) {
        this.setState({
          recordList: res.result
        });
      }
    });
  };
  handleClose = () => {
    this.setState({ visible: false });
  };

  reload = () => {
    this.loadData();
  };

  renderFooter() {
    const btns = [
      <Button key="cancel" onClick={this.handleClose}>
        关闭
      </Button>
    ];
    return btns;
  }
  getColumns = () => {
    const {
      dic_knotcommission_type,
      dic_knotcommission_status
    } = this.state.filters;
    const columns = [
      {
        title: "佣金类型",
        dataIndex: "type",
        render: (text, record) => {
          return dic_knotcommission_type
            ? dic_knotcommission_type.filter(
                item => item.value == record.type
              )[0].label
            : "";
        }
      },
      {
        title: "佣金费率",
        dataIndex: "rate",
        render: (text, record) => {
          return `${record.rate}%`;
        }
      },
      {
        title: "发放金额",
        dataIndex: "amount",
        render: (text, record) => {
          return formatMoney(record.amount);
        }
      },
      {
        title: "发放日期",
        dataIndex: "provideDate",
        render: (text, record) => {
          return Utils.formatDate(record.provideDate, "YYYY-MM-DD");
        }
      },
      {
        title: "备注",
        dataIndex: "remark"
      },
      {
        title: "审批状态",
        dataIndex: "status",
        fixed: "right",
        width: 80,
        render: (text, record) => {
          const { status, auditReason } = record;
          let statusText = null;
          let content = null;
          let popover = text => (
            <Popover placement="topLeft" content={text} arrowPointAtCenter>
              <img
                src={icon_question + "@1x.png"}
                srcSet={icon_question + "@2x.png 2x"}
              />
            </Popover>
          );
          if (dic_knotcommission_status) {
            statusText = dic_knotcommission_status.filter(
              item => item.value == record.status
            ).length
              ? dic_knotcommission_status.filter(
                  item => item.value == record.status
                )[0].label
              : "";
          }
          if (status == EnumKnotCommissionStatus.enum.UNDO) {
            content = (
              <div>
                <span className="red">{statusText}</span>
                {popover(`结佣已否决，原因：${auditReason}`)}
              </div>
            );
          } else {
            content = statusText;
          }
          return content;
        }
      }
    ];

    return columns;
  };
  render() {
    let { visible, data, recordList } = this.state;
    return (
      <Modal
        visible={visible}
        title={"佣金记录"}
        width={680}
        className={`vant-modal yundao-modal ${style.modal}`}
        wrapClassName="vertical-center-modal"
        onCancel={this.handleClose}
        footer={this.renderFooter()}
      >
        <div className={style.header}>
          <p>
            <span className={style.label}>关联回款计划：</span>
            <span className={style.content}>
              {data.receiptPlanId ? (
                <span>
                  计划总金额：{formatMoney(data.totalAmount)}，实际回款金额：{formatMoney(data.realityAmount)}
                  <a
                    target="_blank"
                    href={`/finance/receiptplan/detail/${data.receiptPlanId}`}
                  >
                    查看详情>>
                  </a>
                </span>
              ) : (
                "暂无，可在回款计划详情中关联"
              )}
            </span>
          </p>
          <p>
            <span className={style.label}>产品佣金信息：</span>
            <span className={style.content}>
              {data.productCommissionRules ? (
                <a
                  onClick={() =>
                    this.commissionTableModal.show(data.productCommissionRules)}
                >
                  查看详情>>
                </a>
              ) : (
                "暂无，请联系产品经理录入"
              )}
            </span>
          </p>
        </div>
        <div className={style.body}>
          <GridManager
            gridWrapClassName="grid-panel auto-width-grid"
            noRowSelection={true}
            dataSource={recordList}
            columns={this.getColumns()}
            mod={this}
            scroll={{
              x: "100%",
              y: 200
            }}
            pagination={false}
            disabledAutoLoad={true}
            ref={gridManager => {
              gridManager && (this.gridManager = gridManager);
            }}
          >
            <div className={`vant-filter-bar clearfix`}>
              <div className="fl">结佣记录</div>
              <div className="vant-filter-bar-action fr">
                <a
                  onClick={() =>
                    this.settleCommissionModal.show(this.state.formData)}
                >
                  <Icon type="plus" />新增
                </a>
              </div>
            </div>
          </GridManager>
        </div>
        <SettleCommissionModal
          reload={this.reload}
          ref={ref => {
            if (ref) {
              this.settleCommissionModal = ref;
            }
          }}
        />
        <CommissionTableModal
          ref={ref => {
            if (ref) {
              this.commissionTableModal = ref;
            }
          }}
        />
      </Modal>
    );
  }
}
