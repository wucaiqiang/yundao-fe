import React from "react";
import PropTypes from "prop-types";
import {
  Breadcrumb,
  Button,
  Card,
  Input,
  Progress,
  Pagination,
  Spin
} from "antd";

import Base from "components/main/Base";
import Page from "components/main/Page";
import Permission from "components/permission";

import FundFloatPane from "services/assets/fund/detail/fundFloatPane";
import ProductDetailFloat from "services/product/control/detail/productDetailFloat";
import EditWithdrawalModal from "services/assets/editWithdrawalModal";

import Withdrawal from "model/Assets/withdrawal";

import style from "./Withdraw.scss";

const InputGroup = Input.Group;

export default class AssetsWithdraw extends Base {
  static get NAME() {
    return "AssetsWithdraw";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[AssetsWithdraw.NAME]) {
      this.context = context;
    }
    this.state = {
      loading: false,
      currentPage: 1,
      pageSize: 10,
      datas: null,
      totalCount: 0
    };
  }
  componentWillMount() {
    this.withdrawal = new Withdrawal();

    this.getData();
  }

  componentDidMount() {
    window.productFloatPane = this.productDetailFloat;
  }
  getData(currentPage = 1, pageSize = 10) {
    const { fundName } = this.state;
    this.setState({ loading: true });

    this.withdrawal.get_page({ fundName, currentPage, pageSize }).then(res => {
      this.setState({ loading: false });

      if (res.success) {
        let { currentPage, pageSize, datas, totalCount } = res.result;

        this.setState({ currentPage, pageSize, datas, totalCount });
      }
    });
  }
  onChange = (currentPage, pageSize) => {
    this.getData(currentPage, pageSize);
  };
  onBlur = e => {
    this.setState({ fundName: e.target.value });
  };
  onSearch = () => {
    const { currentPage, pageSize } = this.state;

    this.getData(currentPage, pageSize);
  };
  handleAdd = () => {
    this.editWithdrawalModal.show();
  };
  reload = () => {
    const { currentPage, pageSize } = this.state;

    this.getData(currentPage, pageSize);
  };
  render() {
    let { loading, currentPage, pageSize, datas, totalCount } = this.state;
    const PermissionButton = Permission(
      <Button
        className={style.searchBar_btn}
        type="primary"
        icon="plus"
        onClick={this.handleAdd}
      >
        新增退出
      </Button>
    );

    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>投资管理</Breadcrumb.Item>
          <Breadcrumb.Item>退出管理</Breadcrumb.Item>
        </Breadcrumb>
        <div className={style.page}>
          <div className={`${style.searchBar} clearfix`}>
            <div className="fl">
              <InputGroup compact>
                <Input
                  style={{ width: 200 }}
                  placeholder="请输入基金名称"
                  ref="keyWord"
                  onBlur={this.onBlur}
                />
                <Button
                  className={style.searchBar_btn}
                  type="primary"
                  onClick={this.onSearch}
                >
                  搜索
                </Button>
              </InputGroup>
            </div>
            <div className="fr">
              <PermissionButton auth="assets.withdrawal.add" />
            </div>
          </div>

          <Spin spinning={loading}>
            {datas &&
              datas.map(item => {
                return (
                  <Card
                    key={item.fundId}
                    noHovering
                    title={
                      <div>
                        <a
                          role="floatPane"
                          onClick={() => {
                            this.fundFloatPane.show({
                              id: item.fundId,
                              activeKey: "6"
                            });
                          }}
                        >
                          {item.fundName}
                        </a>
                        <span className={style.subTitle}>
                          已退出：{`${item.totalWithdrawalAmount}万`}
                        </span>
                      </div>
                    }
                    bodyStyle={{ padding: 0 }}
                    onClick={() => {
                      this.fundFloatPane.show({
                        id: item.fundId,
                        activeKey: "6"
                      });
                    }}
                  >
                    {item.withdrawalPageInfoList &&
                      item.withdrawalPageInfoList.map((project, index) => {
                        if (index > 3) return null;

                        let percent =
                          project.totalWithdrawalShareRaio *
                          100 /
                          (project.remainingRatio +
                            project.totalWithdrawalShareRaio);

                        let totalWithdrawalShareRaio =
                          project.totalWithdrawalShareRaio;
                        let remainingRatio = project.remainingRatio;

                        if (~~percent !== percent) {
                          percent = percent.toFixed(2);
                        }
                        if (
                          ~~totalWithdrawalShareRaio !==
                          totalWithdrawalShareRaio
                        ) {
                          totalWithdrawalShareRaio = totalWithdrawalShareRaio.toFixed(
                            2
                          );
                        }
                        if (~~remainingRatio !== remainingRatio) {
                          remainingRatio = remainingRatio.toFixed(2);
                        }

                        return (
                          <Card.Grid
                            className={style.grid}
                            key={project.projectId}
                          >
                            <h2
                              className={style.grid_name}
                              title={project.projectName}
                            >
                              {project.projectName}
                            </h2>
                            <div className={style.grid_summary}>
                              <p>退出价格：{project.totalWithdrawalAmount}万</p>
                              <p>
                                <span>
                                  退出股份：{totalWithdrawalShareRaio}%
                                </span>
                                <span>剩余股份：{remainingRatio}%</span>
                              </p>
                            </div>
                            <div className={style.grid_progress}>
                              <Progress percent={percent} />
                            </div>
                          </Card.Grid>
                        );
                      })}
                  </Card>
                );
              })}
            {totalCount / pageSize > 1 ? (
              <Pagination
                className={style.pagination}
                showQuickJumper
                showSizeChanger
                current={currentPage}
                pageSize={pageSize}
                total={totalCount}
                showTotal={total => {
                  return `共${total}条`;
                }}
                onShowSizeChange={this.onChange}
                onChange={this.onChange}
              />
            ) : null}
          </Spin>
          <FundFloatPane
            ref={ref => (this.fundFloatPane = ref)}
            reload={this.reload}
          />
          <EditWithdrawalModal
            reload={this.onSearch}
            ref={ref => {
              ref && (this.editWithdrawalModal = ref);
            }}
          />
        </div>
        <ProductDetailFloat ref={ref => (this.productDetailFloat = ref)} />
      </Page>
    );
  }
}
