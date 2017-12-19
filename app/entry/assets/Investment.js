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
import EditInvestModal from "services/assets/editInvestModal";

import GM from "lib/gridManager";
import Utils from "utils/";

import Investment from "model/Assets/investment";

import style from "./Investment.scss";

const InputGroup = Input.Group;

export default class AssetsInvestment extends Base {
  static get NAME() {
    return "AssetsInvestment";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[AssetsInvestment.NAME]) {
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
    this.investment = new Investment();
    this.getData();
  }
  componentDidMount() {
    window.productFloatPane = this.productDetailFloat;
  }
  getData(currentPage = 1, pageSize = 10) {
    const { fundName } = this.state;
    this.setState({ loading: true });

    this.investment.get_page({ fundName, currentPage, pageSize }).then(res => {
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
    this.editInvestModal.show();
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
        新增出资
      </Button>
    );
    return (
      <Page {...this.props}>
        <Breadcrumb className="page-breadcrumb">
          <Breadcrumb.Item>投资管理</Breadcrumb.Item>
          <Breadcrumb.Item>投资管理</Breadcrumb.Item>
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
              <PermissionButton auth="assets.investment.add" />
            </div>
          </div>

          <Spin spinning={loading}>
            {datas &&
              datas.map(item => {
                if (item.totalRatio && item.totalRatio > 100) {
                  item.totalRatio = 100;
                }

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
                              activeKey: "5"
                            });
                          }}
                        >
                          {item.fundName}
                        </a>
                        {item.totalAmount ? (
                          <span className={style.subTitle}>
                            规模：{item.totalAmount}万
                          </span>
                        ) : null}
                        <span className={style.subTitle}>
                          已投：{item.totalInvestedAmount
                            ? `${item.totalInvestedAmount}万`
                            : null}
                        </span>
                        {item.totalRatio !== null ? (
                          <Progress percent={item.totalRatio} />
                        ) : null}
                      </div>
                    }
                    bodyStyle={{ padding: 0 }}
                  >
                    {item.projectResDtoList &&
                      item.projectResDtoList.map((project, index) => {
                        if (index > 3) return null;

                        return (
                          <Card.Grid className={style.grid} key={project.id}>
                            <h2
                              className={style.grid_name}
                              title={project.projectName}
                            >
                              {project.projectName}
                            </h2>
                            <div className={style.grid_summary}>
                              <p>出资轮次：{project.roundText}</p>
                              <p>
                                <span>投资金额：{project.investAmount}万</span>
                                <span>占股比例：{project.shareRatio}%</span>
                              </p>
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

          <EditInvestModal
            ref={ref => (this.editInvestModal = ref)}
            reload={this.reload}
          />
        </div>
        <ProductDetailFloat ref={ref => (this.productDetailFloat = ref)} />
      </Page>
    );
  }
}
