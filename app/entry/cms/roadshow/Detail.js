import React, {Component} from "react";
import ReactDOM from "react-dom";
import {
    Input,
    DatePicker,
    Form,
    InputNumber,
    Select,
    Radio,
    Checkbox,
    Row,
    Col,
    Icon,
    Button,
    Breadcrumb,
    Spin,
    message,
    Popover,
    Modal
} from "antd";
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;

const CheckboxGroup = Checkbox.Group;
import Base from "components/main/Base";
import Page from "components/main/Page";
import FormUtils from "lib/formUtils";
import UploadCard from "components/upload/";

import moment from "moment";

import Roadshow from "model/CMS/Roadshow/index";
import Platform from "model/CMS/platform";
import RoadshowColumn from "model/CMS/Roadshow/column";

import Dictionary from "model/dictionary";
import Product from "model/Product/index"
import Video from 'model/CMS/Video/index'

import EnumProduct from "enum/enumProduct";

import SearchSelect from "components/Form/SearchSelect";

import style from "./Index.scss";

const {EnumProductIssuedStatus} = EnumProduct;

class CoverTemplate extends Base {
    state = {
        visible: false,
        fileList: ["http://file.yundaojishu.com/roadshow/roadshow_cover_001.jpg", "http://file.yundaojishu.com/roadshow/roadshow_cover_002.jpg", "http://file.yundaojishu.com/roadshow/roadshow_cover_003.jpg", "http://file.yundaojishu.com/roadshow/roadshow_cover_004.jpg", "http://file.yundaojishu.com/roadshow/roadshow_cover_005.jpg"]
    }
    hide = () => {
        this.setState({visible: false});
    }
    changeCover = (index) => {
        const cover = this.state.fileList[index]
        this.props.onChange && this
            .props
            .onChange(cover)
        this.hide()
    }
    handleVisibleChange = (visible) => {
        this.setState({visible});
    }
    render() {

        const template = (
            <div className={style.coverTemplate}>
                <ul>
                    {this
                        .state
                        .fileList
                        .map((item, index) => {
                            return (
                                <li
                                    key={index}
                                    onClick={() => {
                                    this.changeCover(index)
                                }}>
                                    <img width="692" height="388" src={item}/>
                                </li>
                            )
                        })}
                </ul>
            </div>
        )

        return (
            <Popover
                content={template}
                title="点击选择路演封面模板"
                visible={this.state.visible}
                onVisibleChange={this.handleVisibleChange}
                trigger="click">
                <Button>从模板选择</Button>
            </Popover>
        )

    }
}

class Detail extends Base {
    state = {
        loading: true,
        visible: false,
        activeKey: "1"
    };
    constructor(props) {
        super(props);

        const {location, match} = this.props;

        const {id} = match.params;

        this.state = {
            id: id,
            data: {},
            isEdit: false,
            current_product: {},
            visible: true,
            filters: {}
        };

        this.formUtils = new FormUtils("Detail");
    }
    product_list = []
    componentWillMount() {
        this.formUtils = this.props.formUtils || this.formUtils;
        this
            .formUtils
            .setForm(this.props.form);
        if (this.props.setForm) {
            this
                .props
                .setForm
                .call(this, this);
        }
        this.roadshow = new Roadshow();
        this.platform = new Platform();
        this.dictionary = new Dictionary();
        this.product = new Product();
        this.video = new Video();
        this.roadshowColumn = new RoadshowColumn();
        this.loadData();
        this.getDictionary();
    }
    loadData = () => {
        this.loadDesc();
        this.get_platform();
    };

    getDictionary() {
        this
            .dictionary
            .gets("dic_roadshow_status")
            .then(res => {
                if (res.success && res.result) {
                    let filters = {};
                    res
                        .result
                        .map(item => {
                            filters[item.value] = item.selections;
                        });

                    this.setState({filters});
                }
            });
    }

    loadDesc = () => {
        const {id} = this.state;
        this
            .roadshow
            .get(id)
            .then(res => {
                this.setState({loading: false});
                if (res.success) {
                    let data = res.result;
                    data.id = id;
                    // if (data.coverUrl) {
                    //     data.coverUrl = [
                    //         {
                    //             name: data.coverUrl,
                    //             uid: data.coverUrl,
                    //             url: data.coverUrl,
                    //             type: "image/png",
                    //             status: "done"
                    //         }
                    //     ];
                    // }
                    if (data.columnIds) {
                        data.columnIds = data
                            .columnIds
                            .split(",");
                    }
                    data.status = data
                        .status
                        .toString();
                    this.setState({
                        data,
                        current_product:{
                            issuedStatusText:data.issuedStatusText
                        },
                        id
                    });
                    this.get_column(data.platformId);
                } else {
                    this.setState({loading: false, error: true, message: res.message});
                }
            });
    };

    get_platform = () => {
        return this
            .platform
            .get_roadshow_platform()
            .then(res => {
                this.setState({platforms: res.result});
                // this.formUtils.setFieldsValue({platforms:res.result[0].id})
            });
    };

    get_column = platformId => {
        return this
        .roadshowColumn
        .get_platform_column(platformId)
            .then(res => {
                this.setState({columns: res.result});
            });
    };

    cancel = () => {
        Modal.confirm({
            title: "确定取消编辑路演？",
            okText: "确定",
            cancelText: "继续编辑",
            onOk: () => {
                this.setState({isEdit: false});
            }
        });
    };
    save = e => {
        e && e.preventDefault();
        this
            .formUtils
            .validateFields(errors => {
                if (!errors) {
                    let formData = this
                        .formUtils
                        .getFieldsValue();
                    // if (formData.coverUrl && formData.coverUrl.length) {
                    //     formData.coverUrl = formData.coverUrl[0].url;
                    // }
                    formData = this.formatData(formData);

                    const request = this.roadshow.update;
                    formData.id = this.state.id;

                    request(formData).then(res => {
                        if (res.success) {
                            message.success("路演编辑成功");
                            this.loadData();
                            this.setState({isEdit: false});
                        }
                    });
                }
            });
    };

    intoEdit = () => {
        let formatData = Object.assign({}, this.state.data);
        if (formatData.releaseTime) {
            formatData.releaseTime = moment(formatData.releaseTime);
        }
        this.setState({
            isEdit: true
        }, () => {
            this
                .formUtils
                .setFieldsValue(formatData);
        });
    };

    formatData(values) {
        for (var key in values) {
            if (values.hasOwnProperty(key)) {
                var v = values[key];
                if (typeof v == "string") {
                    v = v.replace(/^\s*|\s*$/g, "");
                }
                if (v instanceof Date) {
                    v = moment(v).format("YYYY-MM-DD HH:mm");
                } else if (v instanceof moment) {
                    v = moment(v).format("YYYY-MM-DD HH:mm");
                }
                if (v instanceof Array) {
                    v = v.join(",");
                }
                if (v instanceof Object && v._isAMomentObject) {
                    v = v.format("YYYY-MM-DD HH:mm");
                }
                values[key] = v;
            }
        }
        return values;
    }

    render() {
        const formItemLayout = {
            labelCol: {
                span: 7
            },
            wrapperCol: {
                span: 17
            }
        };
        const {
            activeKey,
            data,
            isEdit,
            platforms,
            current_product,
            positions,
            columns,
            filters
        } = this.state;

        let fileList = this
            .formUtils
            .getFieldValue("coverUrl");
        // const platformId = this.formUtils.getFieldValue("platformId");
        let platformUrl = 'www.xxx.com'
        // console.log('platforms && platformId',platforms,platformId)
        if (platforms && data.platformId) {
            platformUrl = platforms.filter(item => item.id == data.platformId)[0] && platforms.filter(item => item.id == data.platformId)[0].url || 'www.xxx.com'
        }
        return (
            <Page {...this.props}>
                <div
                    className={style.page}
                    ref={ref => {
                    if (ref) {
                        const container = ref.parentNode.parentNode;
                        this.affixContainer = container
                    }
                }}>
                    <Breadcrumb className="page-breadcrumb">
                        <Breadcrumb.Item>内容配置</Breadcrumb.Item>
                        <Breadcrumb.Item>路演内容配置</Breadcrumb.Item>
                        <Breadcrumb.Item>路演详情</Breadcrumb.Item>
                    </Breadcrumb>
                    <div className="page-content">
                        <Spin spinning={this.state.loading}>
                            <div className={style.operation}>
                                {isEdit
                                    ? <div className={style.operation}>
                                            <Button onClick={this.cancel} className={style.clear}>取消</Button>
                                            <Button className={style.submit} onClick={this.save}>保存</Button>
                                        </div>
                                    : <Button className={style.submit} onClick={this.intoEdit}>编辑</Button>}
                            </div>
                            <Form>
                                <FormItem label="路演标题" {...formItemLayout}>
                                    {!isEdit
                                        ? data.title
                                        : this
                                            .formUtils
                                            .getFieldDecorator("title", {
                                                initialValue: data.title
                                                    ? data.title
                                                    : null,
                                                validateTrigger: [
                                                    "onChange", "onBlur"
                                                ],
                                                rules: [
                                                    {
                                                        required: true,
                                                        min: 1,
                                                        max: 100,
                                                        message: "请输入路演标题，长度1-100"
                                                    }
                                                ]
                                            })(<Input/>)}
                                </FormItem>
                                <FormItem label="选择视频" {...formItemLayout}>
                                    {!isEdit
                                        ? data.videoName
                                        : <div id={"videoId_FormItem"}>
                                            <SearchSelect
                                                placeholder="请输入选择视频"
                                                request={this.video.gets_by_name}
                                                format={r => {
                                                r.value = r.id;
                                                
                                                r.disabled = r.status !=1 ?true:false
                                                r.label = r.disabled?`${r.name}(${r.statusText},不可用)`:r.name;
                                                return r
                                            }}
                                                name="videoId"
                                                callback={(value => {
                                                const id = value?value.key:'';
                                                this
                                                    .formUtils
                                                    .setFieldsValue({videoId: id});
                                            })}
                                                initData={{
                                                label: data.videoName,
                                                value: data.videoId
                                            }}/> {this
                                                .formUtils
                                                .getFieldDecorator("videoId", {
                                                    initialValue: null,
                                                    validateTrigger: [
                                                        "onChange", "onBlur"
                                                    ],
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: "请输入选择视频"
                                                        }
                                                    ]
                                                })(<Input type="hidden"/>)}
                                        </div>}
                                </FormItem>
                                <div id="platformId">
                                    <FormItem label="所属平台" {...formItemLayout}>
                                        {!isEdit
                                            ? data.platformName
                                            : this
                                                .formUtils
                                                .getFieldDecorator("platformId", {
                                                    initialValue: null,
                                                    validateTrigger: [
                                                        "onChange", "onBlur"
                                                    ],
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: "请选择所属平台"
                                                        }
                                                    ]
                                                })(
                                                    <Select
                                                        onChange={value => {
                                                        this.get_column(value);
                                                    }}
                                                        disabled={this.props.isEdit && data.id
                                                        ? true
                                                        : false}
                                                        getPopupContainer={() => document.getElementById("platformId")}
                                                        placeholder={"请选择平台"}>
                                                        {this.state.platforms && this
                                                            .state
                                                            .platforms
                                                            .map(item => {
                                                                return (
                                                                    <Option value={item.id} key={item.id}>
                                                                        {item.name}
                                                                    </Option>
                                                                );
                                                            })}
                                                    </Select>
                                                )}
                                    </FormItem>
                                </div>
                                <div id="columnContainer">
                                    <FormItem label="所属栏目" {...formItemLayout}>
                                        {!isEdit
                                            ? data.columnNames
                                            : this
                                                .formUtils
                                                .getFieldDecorator("columnIds", {
                                                    initialValue: data.columnIds|| [],
                                                    validateTrigger: ["onChange", "onBlur"]
                                                })(
                                                    <Select
                                                        mode={"multiple"}
                                                        getPopupContainer={() => document.getElementById('columnContainer')}
                                                        placeholder={"请选择所属栏目"}>
                                                        {this.state.columns && this
                                                            .state
                                                            .columns
                                                            .map(item => {
                                                                return (
                                                                    <Option
                                                                        value={item
                                                                        .id
                                                                        .toString()}
                                                                        key={item.id}>
                                                                        {item.name}
                                                                    </Option>
                                                                );
                                                            })}
                                                    </Select>
                                                )}
                                    </FormItem>
                                </div>
                                <FormItem label="关联产品" {...formItemLayout}>
                                    {!isEdit
                                        ? data.productName
                                        : <div id={"productId_FormItem"}>
                                            <SearchSelect
                                                placeholder="请输入选择关联产品"
                                                request={this.product.get_product}
                                                format={r => {
                                                r.value = r.id;
                                                r.label = r.name;
                                                this.product_list[r.id] = r;
                                                return r
                                            }}
                                                callback={(value => {
                                                const id = value?value.key:'';
                                                this
                                                    .formUtils
                                                    .setFieldsValue({productId: id});
                                                this.setState({current_product: this.product_list[id]})
                                            })}
                                                name="productId"
                                                initData={{
                                                label: data.productName,
                                                value: data.productId
                                            }}/> {this
                                                .formUtils
                                                .getFieldDecorator("productId", {
                                                    initialValue: data.productId,
                                                })(<Input type="hidden"/>)}
                                        </div>}
                                </FormItem>
                                {isEdit || data.issuedStatusText?<FormItem label=" " {...formItemLayout}>
                                    该产品的发行状态:{isEdit?current_product? current_product.issuedStatusText:'':data.issuedStatusText}
                                </FormItem>:null}
                                <FormItem label="封面" {...formItemLayout}>
                                    {!this.state.isEdit
                                        ? (<img width="692" height="388" src={data.coverUrl}/>)
                                        : <div >

                                            {this
                                                .formUtils
                                                .getFieldDecorator("coverUrl", {initialValue: data.coverUrl,rules:[{
                                                    required:true,
                                                    message: "请选择或上传封面"
                                                  }]})(<Input type="hidden"/>)}
                                            <div className={style.image}>
                                                <UploadCard
                                                    showUploadList={false}
                                                    accept="png,jpg,jpeg,gif"
                                                    max={1}
                                                    fileSize={'500kb'}
                                                    onSave={file => {
                                                    this
                                                        .formUtils
                                                        .setFieldsValue({coverUrl: file.url});
                                                }}>
                                                    {this
                                                        .formUtils
                                                        .getFieldValue("coverUrl")
                                                        ? (
                                                            <div className={style.uploaded}>
                                                                <img
                                                                    width="692"
                                                                    height="388"
                                                                    src={this
                                                                    .formUtils
                                                                    .getFieldValue("coverUrl")}
                                                                    alt="封面"/>
                                                                <div className={style.btns}>
                                                                    <Icon
                                                                        type="close"
                                                                        onClick={e => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        this
                                                                            .formUtils
                                                                            .setFieldsValue({coverUrl: ""});
                                                                    }}/>
                                                                </div>
                                                            </div>
                                                        )
                                                        : (
                                                            <div className={style.upload_btn}>
                                                                <Icon type="plus"/>
                                                                <p>拖入或点击上传封面</p>
                                                            </div>
                                                        )}
                                                </UploadCard>
                                            </div>
                                            <p>最优分辨率：692X388，大小不超过500KB</p>
                                            <CoverTemplate
                                                onChange={(cover) => {
                                                this
                                                    .formUtils
                                                    .setFieldsValue({coverUrl: cover})
                                            }}/>
                                        </div>}
                                </FormItem>

                                <FormItem label="主讲人" {...formItemLayout}>
                                    {!this.state.isEdit
                                        ? data.speaker
                                        : this
                                            .formUtils
                                            .getFieldDecorator("speaker", {
                                                initialValue: data.speaker,
                                                validateTrigger: [
                                                    "onChange", "onBlur"
                                                ],
                                                rules: [
                                                    {
                                                        min: 1,
                                                        max: 20,
                                                        message: "请输入主讲人,长度不超过20"
                                                    }
                                                ]
                                            })(<Input placeholder="请输入主讲人"/>)}
                                </FormItem>
                                <FormItem label="主办方" {...formItemLayout}>
                                    {!this.state.isEdit
                                        ? data.sponsor
                                        : this
                                            .formUtils
                                            .getFieldDecorator("sponsor", {
                                                initialValue: data.sponsor,
                                                validateTrigger: [
                                                    "onChange", "onBlur"
                                                ],
                                                rules: [
                                                    {
                                                        min: 1,
                                                        max: 20,
                                                        message: "请输入主办方,长度不超过20"
                                                    }
                                                ]
                                            })(<Input placeholder="请输入主办方"/>)}
                                </FormItem>
                                <FormItem label="路演简介" {...formItemLayout}>
                                    {!this.state.isEdit
                                        ? data.introduction
                                        : this
                                            .formUtils
                                            .getFieldDecorator("introduction", {
                                                initialValue: data.introduction,
                                                validateTrigger: [
                                                    "onChange", "onBlur"
                                                ],
                                                rules: [
                                                    {
                                                        max: 100,
                                                        message: "请输入路演简介,长度不超过100"
                                                    }
                                                ]
                                            })(<Input className={style.feature} placeholder="请输入路演简介"/>)}
                                </FormItem>
                                <FormItem label="排序" {...formItemLayout}>
                                    {!this.state.isEdit
                                        ? data.sequence
                                        : this
                                            .formUtils
                                            .getFieldDecorator("sequence", {
                                                initialValue: data.sequence,
                                                validateTrigger: ["onBlur"],
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请输入排序"

                                                    }
                                                ]
                                            })(<InputNumber precision={0} min={0} max={999999999} placeholder="排序"/>)}(数值越小越靠前)
                                </FormItem>

                                <FormItem label="状态" {...formItemLayout}>
                                    {!isEdit
                                        ? filters.dic_roadshow_status && filters
                                            .dic_roadshow_status
                                            .filter(item => item.value == data.status)[0] && filters
                                            .dic_roadshow_status
                                            .filter(item => item.value == data.status)[0]
                                            .label
                                        : this
                                            .formUtils
                                            .getFieldDecorator("status", {
                                                initialValue: data.status != undefined || data.status != null
                                                    ? data
                                                        .status
                                                        .toString()
                                                    : "1",
                                                validateTrigger: [
                                                    "onChange", "onBlur"
                                                ],
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: "请选择是否启用"
                                                    }
                                                ]
                                            })(
                                                <RadioGroup placeholder={"排序"}>
                                                    {filters.dic_roadshow_status && filters
                                                        .dic_roadshow_status
                                                        .map(item => {
                                                            return (
                                                                <Radio
                                                                    key={item.value}
                                                                    value={item
                                                                    .value
                                                                    .toString()}>
                                                                    {item.label}
                                                                </Radio>
                                                            );
                                                        })}
                                                </RadioGroup>
                                            )}
                                </FormItem>
                                <FormItem label="发布时间" {...formItemLayout}>
                                    {!this.state.isEdit
                                        ? data.releaseTime ?moment(data.releaseTime).format('YYYY-MM-DD HH:mm'):null
                                        : this
                                            .formUtils
                                            .getFieldDecorator("releaseTime", {
                                                initialValue:data.releaseTime ?moment(data.releaseTime):null,
                                                validateTrigger: [
                                                    "onChange", "onBlur"
                                                ],
                                                rules: [
                                                    {
                                                        required: true,
                                                        message: '请输入发布时间'
                                                    }
                                                ]
                                            })(<DatePicker showTime format="YYYY-MM-DD HH:mm" placeholder="请输入发布时间"/>)}(默认立即发布，您可以修改发布时间用于定时发布)
                                </FormItem>
                            </Form>
                        </Spin>
                    </div>
                </div>
            </Page>
        );
    }
}

Detail = Form.create()(Detail);

export default Detail;
