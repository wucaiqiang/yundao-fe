import moment from "moment";

//  添加数据前缀
function addDataPrefix(prefix, data) {
  let newData;

  newData = {};
  for (let k in data) {
    let v;

    v = data[k];
    k = `${prefix}_${k}`;
    newData[k] = v;
  }
  return newData;
}

//  添加数组数据前缀
function addArrayPrefix(prefix, arr) {
  if (!arr) {
    return arr;
  }
  arr = arr.map(item => {
    return `${prefix}_${item}`;
  });
  return arr;
}

//  删除数据前缀
function removeDataPrefix(prefix, data, fn) {
  let newData;

  newData = {};
  for (let k in data) {
    let v;

    v = data[k];
    k = k.replace(`${prefix}_`, "");
    v = fn(v) || v;
    if (fn) {
      v = fn(v) || v;
    }
    newData[k] = v;
  }
  return newData;
}

/**
 * 表单工具类
 * @class FormUtils
 * @constructor
 * @param {string} prefix 表单字段前缀
 */
class FormUtils {
  constructor(prefix) {
    this.prefix = prefix;
  }
  /**
   * @method setForm
   * @param form 被Form.create包裹的form对象
   */
  setForm(form) {
    this.form = form;
  }
  /**
   * @method getFieldProps 添加前缀后生成表单元素对象
   * @param {string} id 唯一标示，会添加前缀
   * @param {object} setting 字段设置
   */
  getFieldProps(id, setting) {
    let formItemId;

    formItemId = `${this.prefix}_${id}`;
    return this.form.getFieldProps(formItemId, setting);
  }
  getFieldDecorator(id, setting) {
    let formItemId;

    formItemId = `${this.prefix}_${id}`;
    return this.form.getFieldDecorator(formItemId, setting);
  }
  /**
   * @method setFieldsValue 将传入的数组添加前缀后获取数据
   * @param {object} obj 获取字段数据的数组
   */
  setFieldsValue(obj) {
    if (obj) {
      obj = addDataPrefix(this.prefix, obj);
    }
    for (let k in obj) {
      let v, d;

      v = obj[k];
      if (/^\d{4}-\d{2}-\d{2}/.test(v)) {
        d = moment(v);
        if (d.isValid()) {
          obj[k] = d;
        }
      }
      // if (v == null) {
      //   delete obj[k];
      // }
    }
    this.form.setFieldsValue(obj);
  }
  getFieldsName(fields) {
    return fields.map(field => {
      return `${this.prefix}_${field}`;
    });
  }
  /**
   * @method getFieldsValue 添加前缀后获取数据
   * @fields {array} [fields] 需要获取的字段数组
   */
  getFieldsValue(fields) {
    let data;

    fields = addArrayPrefix(this.prefix, fields);
    data = this.form.getFieldsValue(fields);
    data = removeDataPrefix(this.prefix, data, v => {
      if (typeof v == "string") {
        v = v.replace(/^\s*|\s*$/g, "");
      }
      return v;
    });
    return data;
  }
  /**
   * @method getFieldValue 添加前缀后获取数据
   * @id {string} [id] 需要获取的字段名
   */
  getFieldValue(id) {
    let formItemId;

    formItemId = `${this.prefix}_${id}`;
    return this.form.getFieldValue(formItemId);
  }
  /**
   * @method resetFields 重置表单数据
   * @param [array] [fields] 需要重置的表单内容
   */
  resetFields(fields) {
    if (fields) {
      fields = addArrayPrefix(this.prefix, fields);
    }
    return this.form.resetFields(fields);
  }
  /**
   * @method triggerHandler 触发事件句柄
   * @param {string} field 字段名
   * @param {string} type 事件类型
   * @param {Object} e 事件对象可自己构造
   */
  triggerHandler(field, type, e) {
    let formItem;

    field = `${this.prefix}_${field}`;
    formItem = this.form.getFieldInstance(field);
    formItem.props["data-__meta"][type](e);
  }
  /**
   * @method triggerHandler 触发事件
   * @param {string} field 字段名
   * @param {string} type 事件类型
   * @param {Object} e 事件对象可自己构造
   */
  trigger(field, type, e) {
    let formItem;

    field = `${this.prefix}_${field}`;
    formItem = this.form.getFieldInstance(field);
    console.log("formItem", formItem);
    formItem.props[type](e);
  }
  /**
   * @method validateFields 校验表单
   * @param {function} fn 回调函数
   * @param {Object} fn.errors 错误信息
   */
  validateFields(...args) {
    const length = args.length;
    if (length === 1 && typeof args[0] === "function") {
      this.form.validateFields(args[0]);
    } else if (length === 2) {
      this.form.validateFields(this.getFieldsName(args[0]), args[1]);
    } else if (length === 3) {
      this.form.validateFields(this.getFieldsName(args[0]), args[1], args[2]);
    }
  }

  getRequireRules(msg, ...otherRules) {
    const rules = {
      rules: [
        { required: true, whitespace: true, message: msg },
        ...otherRules
      ],
      validateTrigger: "onBlur"
    };
    return rules;
  }
}

export default FormUtils;
