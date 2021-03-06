import React, {Component} from "react";
import Base from "components/main/Base";

import {
  Layout,
  Tabs,
  Icon,
  Row,
  Col,
  message,
  Affix
} from "antd";

const {Header, Content, Footer, Sider} = Layout;

import style from "./productDetailInfo.scss";

import moment from "moment";

import DynamicFormItem from "components/Form/DynamicFormItem";
import DynamicFormItemView from "components/Form/DynamicFormItemView";
import DetailBaseInfoForm from "./detailBaseInfoForm";
import ProductAttach from "./attach";

import Product from "model/Product/";

class DetailBaseInfo extends Base {
  state = {
    edit: false
  };
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.id != this.props.data.id) {
      //加载不同的资料 设置为非编辑状态
      this.setState({isEdit: false});
    }
  }

  submit = () => {
    const {data, mod} = this.props;
    this
      .DetailBaseInfoForm
      .submit(values => {
        values.id = data.id;
        values.typeId = data.typeId;
        const product = new Product();
        product
          .update_base(values)
          .then(res => {
            if (res.success) {
              message.success("产品基本信息更新成功");
              // mod.reloading();
              mod.loadData()
              this.setState({isEdit: false});
            }
          });
      });
  };

  formatFieldType = field => {
    if (field.name == "assistantId") {
      //助理
      field.typeCode = "search_select";
    } else if (field.name == "receiverId") {
      //负责人
      field.typeCode = "search_select";
    }

    return field;
  };

  genneratorFix= (children)=>{
    const {mod} = this.props
    return mod.state.visible ?<Affix target={() => mod.affixContainer}>
    {children}
    </Affix>:children
}

  render() {
    const {data} = this.props;
    if (!data) {
      return null;
    }
    const fields = data
      .productDto
      .data
      .productFieldDtos
      .map(this.formatFieldType);

    const canEdit = data.productDto.permission.editPermission && data.examineStatus != 1;
    const canRead = data.productDto.permission.readPermission;

    const {formLayout} = this.state;
    const formItemLayout = formLayout === "horizontal"
      ? {
        labelCol: {
          span: 4
        },
        wrapperCol: {
          span: 14
        }
      }
      : null;
    const renderFormItem = (field, index) => {
      return (<DynamicFormItemView
        key={index}
        field={field}
        formUtils={this.formUtils}
        {...formItemLayout}/>);
    };

    let leftCol = [],
      rightCol = [],
      index = 0;
    while (index < fields.length) {
      var field = fields[index];
      var nextField = fields[index + 1];

      {
        !field
          ? null
          : leftCol.push(renderFormItem(field, index));
      }
      {
        !nextField
          ? null
          : rightCol.push(renderFormItem(nextField, index + 1));
      }
      index = index + 2;
    }

    const icons = [];

    if (this.state.isEdit) {
      icons.push(<img
        key="action1"
        className="anticon"
        src="/assets/images/icon/取消@1x.png"
        srcSet="/assets/images/icon/取消@2x.png"
        onClick={e => {
        this.setState({isEdit: false});
      }}/>);
      icons.push(<img
        key="action2"
        className="anticon"
        src="/assets/images/icon/确认@1x.png"
        srcSet="/assets/images/icon/确认@2x.png"
        onClick={this.submit}/>);
    } else {
      if (canRead && canEdit) {
        icons.push(<img
          key="action3"
          className="anticon anticon-edit"
          src="/assets/images/icon/编辑@1x.png"
          srcSet="/assets/images/icon/编辑@2x.png"
          onClick={e => {
          this.setState({isEdit: true});
        }}/>);
      }
    }

    return (
      <div className={style.card} style={{
        marginRight: "24px"
      }}>
        {this.genneratorFix(
          <div className={style.header}>
            <div className={style.title}>产品信息</div>
            <div className={style.icons}>{icons}</div>
          </div>)}
        <div className={style.content}>
          {this.state.isEdit
            ? (<DetailBaseInfoForm
              data={data}
              ref={ref => {
              if (ref) {
                this.DetailBaseInfoForm = ref;
              }
            }}/>)
            : (
              <Row>
                <Col span={12} style={{paddingRight:20}}>{leftCol}</Col>
                <Col span={12}>{rightCol}</Col>
              </Row>
            )}
        </div>
      </div>
    );
  }
}

class ProductDetail extends Base {
  state = {
    loading: true,
    visible: false,
    edit: false
  };
  constructor(props) {
    super(props);
  }

  render() {
    const {data, mod} = this.props;

    return (
      <div className={style.body}>
        <Row>
          <Col span="14">
            <DetailBaseInfo mod={mod} data={data}/>
          </Col>
          <Col span="10">
            <ProductAttach data={data} mod={mod}/>
          </Col>
        </Row>
      </div>
    );
  }
}

export default ProductDetail;
