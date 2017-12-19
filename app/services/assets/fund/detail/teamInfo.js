import React, { Component } from "react";
import { Icon, Button, message, Modal } from "antd";
import ClassNames from "classnames";

import Base from "components/main/Base";
import Confirm from "components/modal/Confirm";

import GM from "lib/gridManager.js";

import Team from "model/Assets/team";

import EditUserModal from "../editUserModal";

import style from "./tabs.scss";

const GridManager = GM.GridManager;

export default class TeamInfo extends Base {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.team = new Team();
  }
  getColumns(type, key) {
    const { permission } = this.props.data.fundDto;

    const columns = [
      {
        title: "姓名",
        dataIndex: "name",
        width: "20%",
        render: (text, record) => {
          record.editPermission = permission.editPermission;

          return (
            <a
              className="showfloat"
              onClick={() => {
                this.editUserModal.show(record);
              }}
            >
              {text}
            </a>
          );
        }
      },
      {
        title: "职位",
        dataIndex: "position",
        width: "20%"
      },
      {
        title: "简介",
        dataIndex: "remark",
        width: "60%",
        render: (text, record, index) => {
          return record.remark;
        }
      }
    ];

    return columns;
  }
  reload = () => {
    this.gridManager.grid.reload();
  };
  handleDel = () => {
    const _this = this;
    const { selectIds } = this.state;

    let ids = selectIds.join(",");

    Confirm({
      wrapClassName: "showfloat",
      width: 420,
      title: "确定删除选中成员?",
      onOk() {
        return _this.team.delete(ids).then(res => {
          if (res.success) {
            message.success("删除成功");
            _this.gridManager.grid.reload();
          }
        });
      }
    });
  };
  handleSelect(selectData) {
    this.setState({ ...selectData });
  }
  render() {
    const { selectRowsCount } = this.state;
    const { data } = this.props;
    const { permission } = data.fundDto;

    return (
      <div
        className={style.body}
        style={{
          background: "#fff",
          padding: "20px"
        }}
      >
        <GridManager
          columns={this.getColumns()}
          url={`/assets/fund/team/get_page?fundId=${data.id}`}
          gridWrapClassName={`grid-panel auto-width-grid`}
          mod={this}
          onSelect={selectData => {
            this.handleSelect(selectData);
          }}
          pagination={false}
          ref={gridManager => {
            gridManager && (this.gridManager = gridManager);
          }}
        >
          <div className={`vant-filter-bar clearfix`}>
            {permission.editPermission ? (
              <div className="vant-filter-bar-action fr">
                <Button
                  onClick={() => {
                    this.editUserModal.show({
                      fundId: data.id
                    });
                  }}
                >
                  新增成员
                </Button>
              </div>
            ) : null}
            {permission.editPermission ? (
              <div
                className={ClassNames({
                  "vant-float-bar": true,
                  open: selectRowsCount
                })}
              >
                已选中
                <span className="count">{selectRowsCount}</span>
                项
                <span className="separator">|</span>
                <a className="ant-btn-link" onClick={this.handleDel}>
                  <Icon type="delete" />删除
                </a>
              </div>
            ) : null}
          </div>
        </GridManager>
        <EditUserModal
          submit={this.reload}
          ref={ref => {
            if (ref) {
              this.editUserModal = ref;
            }
          }}
        />
      </div>
    );
  }
}
