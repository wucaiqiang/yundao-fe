import React, { Component } from "react";

import Utils from "utils/";

import DataGrid from "components/dataGrid";

import Channel from "model/Channel";

import EnumAppointment from "enum/enumAppointment";
import EnumDeclaration from "enum/enumDeclaration";

import EditAppointmentModal from "services/sale/appointment/editAppointmentModal";

import GM from "lib/gridManager";

const {
  GridManager,
  FilterBar,
  GridInputFilter,
  GridRangeFilter,
  GridSortFilter,
  GridDateFilter,
  GridCheckboxFilter
} = GM;

import style from "./index.scss";

const { EnumAppointmentStatus } = EnumAppointment;
const { EnumDeclarationStatus } = EnumDeclaration;

export default class ChannelTradingInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      channelId: this.props.channelId,
      count: {
        reservationCount: 0,
        declarationCount: 0
      }
    };
  }
  componentWillMount() {
    this.channel = new Channel();
    // this.getCount(this.props.channelId);
  }

  componentWillReceiveProps(nextProps) {
    const channelId = this.state.channelId;
    if (nextProps.channelId !== channelId) {
      this.setState(
        {
          channelId: nextProps.channelId
        },
        () => {
          // this.getCount(nextProps.channelId);
          this.grid.load();
          this.grid1.load();
        }
      );
    }
  }
  // getCount(channelId) {
  //   this.channel.get_count(channelId).then(res => {
  //     if (res.success) {
  //       this.setState({ count: res.result });
  //     }
  //   });
  // }
  getColumns = () => {
    const columns = [
      {
        title: "预约编号",
        dataIndex: "number",
        fixed: "left",
        render: (text, record) => {
          return (
            <a
              onClick={() =>
                this.editAppointmentModal.show({ id: record.number }, false)
              }
            >
              {text}
            </a>
          );
        }
      },
      {
        title: "产品名称",
        dataIndex: "productName",
        width: 200,
        className: "ant-table-col"
      },
      {
        title: "预约金额",
        dataIndex: "reservationAmount",
        render: (text, record) => {
          return `${text}万`;
        }
      },
      {
        title: "预计打款日期",
        dataIndex: "estimatePayDate",
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD");
        }
      },
      {
        title: "预约日期",
        dataIndex: "reservationDate",
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD");
        }
      },
      {
        title: "创建人",
        dataIndex: "createRealName"
      },
      {
        title: "状态",
        dataIndex: "status",
        render: (text, record) => {
          let content;
          if (record.status === EnumAppointmentStatus.enum.PASS) {
            content = <span className="green">{record.statusText}</span>;
          } else if (record.status === EnumAppointmentStatus.enum.REJECT) {
            content = <span className="red">{record.statusText}</span>;
          } else {
            content = record.statusText;
          }
          return content;
        }
      }
    ];

    return columns;
  };
  getColumns1 = () => {
    const columns = [
      {
        title: "报单编号",
        dataIndex: "number",
        fixed: "left",
        render: (text, record) => {
          return (
            <a href={`/declaration/detail/${record.number}`} target="_blank">
              {text}
            </a>
          );
        }
      },
      {
        title: "产品名称",
        dataIndex: "productName",
        width: 200,
        className: "ant-table-col"
      },
      {
        title: "认购金额",
        dataIndex: "dealAmount",
        render: (text, record) => {
          return `${text}万`;
        }
      },
      {
        title: "打款日期",
        dataIndex: "payDate",
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD");
        }
      },
      {
        title: "报单日期",
        dataIndex: "commitDate",
        render: (text, record) => {
          return Utils.formatDate(text, "YYYY-MM-DD");
        }
      },
      {
        title: "创建人",
        dataIndex: "createUserName"
      },
      {
        title: "状态",
        dataIndex: "status",
        render: (text, record) => {
          let content;
          if (record.status === EnumDeclarationStatus.enum.PASS) {
            content = <span className="green">{record.statusName}</span>;
          } else if (record.status === EnumDeclarationStatus.enum.REJECT) {
            content = <span className="red">{record.statusName}</span>;
          } else {
            content = record.statusName;
          }
          return content;
        }
      }
    ];

    return columns;
  };
  render() {
    let { channelId, count } = this.state;
    return (
      <div className={style.trading}>
        <div className={style.tags}>
          <span>额度预约({count.reservationCount})</span>
          <span>报单({count.declarationCount})</span>
        </div>
        <div className={style.title} id="reservationList">
          额度预约
        </div>
        <GridManager
          url={`/channel/gets_reservation?channelId=${channelId}`}
          noRowSelection={true}
          columns={this.getColumns()}
          ref={grid => {
            grid && (this.grid = grid);
          }}
        />
        <div className={style.title} id="declarationList">
          报单
        </div>
        <GridManager
          url={`/channel/gets_declaration?channelId=${channelId}`}
          noRowSelection={true}
          columns={this.getColumns1()}
          ref={grid => {
            grid && (this.grid1 = grid);
          }}
        />

        <EditAppointmentModal
          reload={this.reloadGrid}
          ref={ref => (this.editAppointmentModal = ref)}
        />
      </div>
    );
  }
}
