/**
 * 类别配置
 */
import React from "react";
import extend from "extend";
import PropTypes from "prop-types";
import ClassNames from "classnames";

import { Prompt, Link, Redirect } from "react-router-dom";

import Base from "components/main/Base";

import Page from "components/main/Page";

import {
  Breadcrumb,
  Table,
  Icon,
  Form,
  Input,
  Button,
  Modal,
  Radio,
  Affix,
  Spin,
  Tooltip,
  message
} from "antd";

const confirm = Modal.confirm;

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

import style from "./EditCategory.scss";

import GM from "lib/gridManager.js";

const {
  GridManager,
  GridInputFilter,
  FilterBar,
  GridSortFilter,
  GridDateFilter
} = GM;

import EditElementsModal from "services/product/config/editElementsModal";
import AddRelatedElements from "services/product/config/addRelatedElements";

import ProductCategory from "model/Product/category";
import Elements from "model/Product/elements";

import utils from "utils/";
import FormUtils from "lib/formUtils";

const icon_export = "/assets/images/icon/导出@2x.png";
const icon_add = "/assets/images/icon/新增@2x.png";

const icon_moveup = "/assets/images/icon/上移";
const icon_movedown = "/assets/images/icon/下移";

/**
 * 防操作过频繁
 * @param {Function} fn
 * @param {Number} delay
 */
function debounce(fn, delay) {
  var timer = null; // 声明计时器
  return function() {
    var context = this;
    var args = arguments;

    console.log("timer=", timer);

    clearTimeout(timer);
    timer = setTimeout(function() {
      fn.apply(context, args);
    }, delay);
  };
}

let showMoveMessage = false;

const DURATION = 1.5;

class ProductConfigCategoryEdit extends Base {
  static get NAME() {
    return "ProductConfigCategoryEdit";
  }

  static get contextTypes() {
    return { data: PropTypes.object };
  }

  constructor(props, context) {
    super(props, context);
    if (context.data[ProductConfigCategoryEdit.NAME]) {
      this.context = context;
    }

    const { location, match } = this.props;

    const action = match.params.action;

    let id = null;
    if (action != "new") {
      id = action;
    }
    this.state = {
      loading: true,
      data: [],
      formData: {
        id
      },
      isBlocking: true,
      columns: [],
      relatedFields: [],
      notRelatedFields: [],
      selectData: {}
    };

    this.formUtils = new FormUtils("editCategoryForm");
  }

  componentWillMount() {
    this.mounted = true;
    this.formUtils = this.props.formUtils || this.formUtils;
    this.formUtils.setForm(this.props.form);
    if (this.props.setForm) {
      this.props.setForm.call(this, this);
    }

    this.category = new ProductCategory();
  }

  componentDidMount() {
    const id = this.state.formData.id;
    //编辑
    if (id) {
      this.category.get(id).then(res => {
        if (res && res.success) {
          const { data, permission } = res.result;
          //已关联要素
          const relatedFields = data.existObjectField;
          const noFileds = relatedFields.map(data => data.id);
          //查找未关联要素
          const notRelatedFields = data.allObjectField.filter(field => {
            return noFileds.indexOf(field.id) == -1;
          });

          this.setState({
            formData: data.fieldGroup,
            canEdit: permission && permission.editPermission,
            relatedFields,
            notRelatedFields,
            loading: false
          });
        }
      });
    } else {
      //新增
      const elements = new Elements();
      //获取全部的要素
      elements.get_list().then(res => {
        if (res && res.success) {
          const relatedFields = [];
          const notRelatedFields = [];
          res.result.map(data => {
            //区分通用与否的要素
            if (data.isShare == 1) {
              relatedFields.push(data);
            } else {
              notRelatedFields.push(data);
            }
          });

          this.setState({
            relatedFields,
            notRelatedFields,
            canEdit: true,
            editing: true,
            loading: false
          });
        }
      });
    }
  }

  getFloatToolsBarCls() {
    let cls;

    cls = ["vant-float-bar"];
    if (this.state.selectRowsCount) {
      cls.push("open");
    }
    return cls.join(" ");
  }
  getColumns() {
    const columns = [
      {
        title: "要素名称",
        dataIndex: "name",
        fixed: "left",
        render: (text, record) => {
          return text || "--";
        }
      },
      {
        title: "类型",
        dataIndex: "type",
        render: (text, record) => {
          return record.typeText;
        }
      },
      {
        title: "是否必填",
        dataIndex: "isMandatory",
        render: (text, record) => {
          return record.isMandatoryText;
        }
      },
      {
        title: "是否通用",
        dataIndex: "isShare",
        render: (text, record) => {
          return record.isShareText;
        }
      },
      {
        title: "是否启用",
        dataIndex: "isEnabled",
        render: (text, record) => {
          return record.isEnabledText;
        }
      }
    ];

    return columns;
  }
  beforeLoad(params) {
    this.gridManager.makeFilterMapData();

    if ("sortField" in params) {
      if (params.sortField) {
        params.orderColumn = params.sortField;
      }
      delete params.sortField;
    }
    if ("sortOrder" in params) {
      if (params.sortOrder) {
        params.sort = params.sortOrder;
      }
      delete params.sortOrder;
    }
    if (params.sort) {
      params.sort = params.sort.replace("end", "");
    }
    return params;
  }

  handleSelect(selectData) {
    this.setState({ ...selectData });
  }
  showModal(modal, data) {
    this.refs[modal].show(data);
  }
  /**
   * 上移
   */
  moveUp = () => {
    let relatedFields,
      prevField,
      fields,
      len,
      showedFields = this.state.relatedFields;

    len = showedFields.length;

    if (len < 2) {
      return;
    }

    relatedFields = extend([], showedFields);

    showedFields = relatedFields;

    const { selectIds } = this.state;

    // selectIds &&
    //   selectIds.map((item, index) => {
    //     item === showedFields[index].id;
    //   });

    for (let i = 1; i < len; i++) {
      let field = showedFields[i];
      let prevField = showedFields[i - 1];

      if (
        selectIds.indexOf(field.id) > -1 &&
        selectIds.indexOf(prevField.id) == -1
      ) {
        relatedFields = this.swapItems(relatedFields, i - 1, i);
      }
    }

    let id = this.state.formData.id;
    //编辑时，自动保存
    if (id) {
      let fieldGroupRelIds = relatedFields.map(field => field.id).join(",");
      this.category.update_rel({ id, fieldGroupRelIds }).then(res => {
        if (res.success) {
          if (!showMoveMessage) {
            showMoveMessage = true;
            message.success("保存成功", DURATION, () => {
              showMoveMessage = false;
            });

            this.setState({
              relatedFields
            });
          }
        }
      });
    } else {
      this.setState({ relatedFields });
    }
  };

  /**
   * 下移
   */
  moveDown = () => {
    let relatedFields,
      prevField,
      fields,
      len,
      showedFields = this.state.relatedFields;

    if (showedFields.length < 2) {
      return;
    }
    relatedFields = extend([], showedFields);

    showedFields = relatedFields;
    len = showedFields.length;
    const { selectIds } = this.state;
    for (let i = len - 2; i >= 0; i--) {
      let field = showedFields[i];
      let nextField = showedFields[i + 1];

      if (
        selectIds.indexOf(field.id) > -1 &&
        selectIds.indexOf(nextField.id) == -1
      ) {
        relatedFields = this.swapItems(relatedFields, i, i + 1);
      }
    }

    let id = this.state.formData.id;
    let fieldGroupRelIds = relatedFields.map(field => field.id).join(",");
    //编辑时，自动保存
    if (id) {
      this.category.update_rel({ id, fieldGroupRelIds }).then(res => {
        if (res.success) {
          if (!showMoveMessage) {
            showMoveMessage = true;
            message.success("保存成功", DURATION, () => {
              showMoveMessage = false;
            });
            this.setState({
              relatedFields
            });
          }
        }
      });
    } else {
      this.setState({ relatedFields });
    }
  };
  swapItems = (arr, index1, index2) => {
    //数据下标调换位置
    const temp = JSON.parse(JSON.stringify(arr[index1]));
    arr[index1] = arr[index2];
    arr[index2] = temp;
    return arr;
  };

  /**
   * 保存类别
   */
  handleSave = e => {
    e && e.preventDefault();
    this.formUtils.validateFields((errors, values) => {
      if (!errors) {
        const values = this.formUtils.getFieldsValue();

        //格式化关联要素id
        values.fieldGroupRelIds = this.state.relatedFields
          .map(field => field.id)
          .join(",");

        this.category.add(values).then(res => {
          if (res.success) {
            message.success("保存成功");
            this.setState({ leave: true });
          }
        });
      }
    });
  };

  /**
   * 解除关联
   */
  handleRemove = () => {
    let CANTDELETE = [];
    const data = this.state.selectRowsData.filter(item => {
      if (item.isShare && item.isSystem) {
        CANTDELETE.push(item);
      }
      return !(item.isShare && item.isSystem);
    });
    const notRelatedFields = this.state.notRelatedFields.concat(data);
    const relatedFields = this.state.relatedFields.filter(field => {
      return data.map(item => item.id).indexOf(field.id) == -1;
    });

    const update = () => {
      let id = this.state.formData.id;

      //编辑时，自动保存
      if (id) {
        let fieldGroupRelIds = relatedFields.map(field => field.id).join(",");
        this.category.update_rel({ id, fieldGroupRelIds }).then(res => {
          if (res.success) {
            message.success("保存成功");

            this.setState({
              relatedFields,
              notRelatedFields
            });
          }
        });
      } else {
        this.setState({
          relatedFields,
          notRelatedFields
        });
      }
    };

    if (CANTDELETE.length) {
      const fieldGrops = CANTDELETE.map(item => item.name).join(",");
      confirm({
        iconType: "exclamation-circle",
        title: "以下系统通用要素无法解除关联",
        content: (
          <div>
            {fieldGrops}
            <br />
          </div>
        ),
        onOk: () => {
          // 提交表单
          update();
        },
        okText: "确定",
        cancelText: "取消"
      });
    } else {
      update();
    }
  };

  /**
   * 新增关联
   */
  handleAdd = datas => {
    const ids = datas.map(data => data.id);

    const categoryId = this.state.formData.id;

    const relatedFields = this.state.relatedFields.concat(datas);
    const notRelatedFields = this.state.notRelatedFields.filter(field => {
      return ids.indexOf(field.id) == -1;
    });

    //如果是编辑直接保存入库
    if (categoryId) {
      //格式化关联要素id
      let fieldGroupRelIds = relatedFields.map(field => field.id).join(",");

      this.category
        .update_rel({ id: categoryId, fieldGroupRelIds })
        .then(res => {
          if (res.success) {
            message.success("保存成功");

            this.setState({
              relatedFields,
              notRelatedFields
            });
          }
        });
    } else {
      this.setState({
        relatedFields,
        notRelatedFields
      });
      Modal.info({
        width: 440,
        title: `要素已导入，点击页面底部“保存”按钮实现关联`,
        okText: "确定"
      });
    }
  };

  handleEdit = () => {
    this.setState({ editing: true });
  };
  handleCancel = () => {
    this.setState({ editing: false });
  };
  handleInfoSave = () => {
    this.formUtils.validateFields((errors, values) => {
      if (!errors) {
        let values = this.formUtils.getFieldsValue();
        let { formData } = this.state;

        values.id = formData.id;

        let newFormData = Object.assign(formData, values);

        this.category.update_info(values).then(res => {
          if (res.success) {
            message.success("保存成功");
            this.setState({ editing: false, formData: newFormData });
          }
        });
      }
    });
  };
  render() {
    const { children, ...others } = this.props;
    if (this.gridManager && this.refs.filterBar) {
      this.gridManager.setFilterBar(this.refs.filterBar);
    }

    const data = this.state.formData;
    const { leave, loading, canEdit, selectRowsCount, editing } = this.state;

    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 18
      }
    };

    const table = (
      <div className={`vant-panel ${style.table}`}>
        <Spin spinning={loading}>
          <GridManager
            onSelect={selectData => {
              this.handleSelect(selectData);
            }}
            noRowSelection={canEdit ? false : true}
            disabledAutoLoad={true}
            columns={this.getColumns()}
            dataSource={this.state.relatedFields}
            gridWrapClassName="grid-panel auto-width-grid"
            mod={this}
            pagination={false}
            ref={gridManager => {
              gridManager && (this.gridManager = gridManager);
            }}
          >
            <div className={`vant-filter-bar clearfix`}>
              <div className="fl">
                <FilterBar gridManager={this.gridManager} ref="filterBar" />
              </div>
              <div className="vant-filter-bar-action fr">
                {!canEdit ? null : (
                  <Button
                    className="btn_add"
                    onClick={() =>
                      this.showModal(
                        "AddRelatedElements",
                        this.state.notRelatedFields
                      )
                    }
                  >
                    新增关联
                  </Button>
                )}
              </div>

              <div className={this.getFloatToolsBarCls()}>
                已选中
                <span className="count">{selectRowsCount}</span>
                项
                <span className="separator">|</span>
                <a className="ant-btn-link" onClick={this.handleRemove}>
                  <Icon type="delete" />解除关联
                </a>
                <span className="separator">|</span>
                <a className="ant-btn-link" onClick={this.moveDown}>
                  <img
                    src={icon_movedown + "@1x.png"}
                    srcSet={icon_movedown + "@2x.png 2x"}
                    alt="下移"
                  />
                  下移
                </a>
                <span className="separator">|</span>
                <a className="ant-btn-link" onClick={this.moveUp}>
                  <img
                    src={icon_moveup + "@1x.png"}
                    srcSet={icon_moveup + "@2x.png 2x"}
                    alt="上移"
                  />
                  上移
                </a>
              </div>
            </div>
          </GridManager>
        </Spin>
      </div>
    );
    return leave ? (
      <Redirect to={"/product/config/category"} />
    ) : (
      <Page {...this.props}>
        <div className="page-breadcrumb">
          <Breadcrumb>
            <Breadcrumb.Item>基金产品配置</Breadcrumb.Item>
            <Breadcrumb.Item>类别配置</Breadcrumb.Item>
            <Breadcrumb.Item>
              <a>{data.id ? "编辑" : "新增"}类别</a>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="page-content">
          <Spin spinning={loading}>
            <Form>
              <div className={style.header}>
                <FormItem required={true} label="类别名称" {...formItemLayout}>
                  {!canEdit ? (
                    data.name
                  ) : editing ? (
                    <div>
                      {this.formUtils.getFieldDecorator("name", {
                        initialValue: data.name,
                        validateTrigger: ["onChange", "onBlur"],
                        rules: [
                          {
                            required: true,
                            type: "string",
                            whitespace: true,
                            message: "请填写长度不超过50个字符的产品类别名称",
                            min: 1,
                            max: 50
                          }
                        ]
                      })(<Input type="text" size="large" />)}
                      {data.id ? (
                        <span className={style.action}>
                          <img
                            className="anticon"
                            src="/assets/images/icon/取消@1x.png"
                            onClick={this.handleCancel}
                          />
                          <img
                            className="anticon"
                            src="/assets/images/icon/确认@1x.png"
                            onClick={this.handleInfoSave}
                          />
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div>
                      {data.name}
                      <span className={style.action}>
                        <img
                          className="anticon"
                          src="/assets/images/icon/编辑@1x.png"
                          onClick={this.handleEdit}
                        />
                      </span>
                    </div>
                  )}
                </FormItem>
                <FormItem required={true} label="是否启用" {...formItemLayout}>
                  {!canEdit ? (
                    data.isEnabled === 0 ? (
                      "关闭"
                    ) : (
                      "启用"
                    )
                  ) : editing ? (
                    <div>
                      {this.formUtils.getFieldDecorator("isEnabled", {
                        initialValue: data.isEnabled === 0 ? 0 : 1,
                        validateTrigger: ["onChange", "onBlur"],
                        rules: [
                          {
                            required: true
                          }
                        ]
                      })(
                        <RadioGroup>
                          <Radio value={1} className="radio-label">
                            启用
                          </Radio>
                          <Radio value={0} className="radio-label">
                            关闭
                          </Radio>
                        </RadioGroup>
                      )}
                      {data.id ? (
                        <span className={style.action}>
                          <img
                            className="anticon"
                            src="/assets/images/icon/取消@1x.png"
                            onClick={this.handleCancel}
                          />
                          <img
                            className="anticon"
                            src="/assets/images/icon/确认@1x.png"
                            onClick={this.handleInfoSave}
                          />
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div>
                      {data.isEnabled === 0 ? "关闭" : "启用"}
                      <span className={style.action}>
                        <img
                          className="anticon"
                          src="/assets/images/icon/编辑@1x.png"
                          onClick={this.handleEdit}
                        />
                      </span>
                    </div>
                  )}
                </FormItem>
              </div>
              <div
                className={ClassNames(style.body, {
                  [style["body--mb70"]]: !data.id
                })}
              >
                {table}
              </div>
              {!data.id ? (
                <div className={style.footer}>
                  <Link to="/product/config/category">
                    <Button className={"btn_export"}>取消</Button>
                  </Link>
                  {!canEdit ? null : (
                    <Button className={"btn_add"} onClick={this.handleSave}>
                      保存
                    </Button>
                  )}
                </div>
              ) : null}
            </Form>
          </Spin>
        </div>
        <AddRelatedElements submit={this.handleAdd} ref="AddRelatedElements" />
      </Page>
    );
  }
}

ProductConfigCategoryEdit = Form.create()(ProductConfigCategoryEdit);

function Mod(props) {
  return <ProductConfigCategoryEdit {...props} />;
}

export default Mod;
