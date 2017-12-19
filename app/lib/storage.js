import utils from 'utils/'

const handleLocalKey = k=>{
  const {id} = utils.getStorage('userInfo')
  return k = k+'_'+id
}

const prefix ='__yundao__';


class Storage {
  constructor(type = "local",scope='global') {
    //scope local为限定登录用户
    if (type == "session") {
      this.storage = window.sessionStorage;
    } else {
      this.storage = window.localStorage;
    }
    this.scope = scope
  }
  set(k, v) {
    k= prefix+k
    if(this.scope == 'local'){
       k = handleLocalKey(k)
    }
    let data, d;

    try {
      v = JSON.stringify(v);
    } catch (e) {}
    data = {
      value: v
    };
    data = JSON.stringify(data);
    this.storage.setItem(k, data);
  }

  get(k) {
    
    let data, d, v;

    if (!this.has(k)) {
      return null;
    }

    k= prefix+k
    if(this.scope == 'local'){
      k = handleLocalKey(k)
    }
    data = this.storage.getItem(k);
    data = JSON.parse(data);
    v = data.value;
    try {
      v = JSON.parse(v);
    } catch (e) {}
    return v;
  }

  remove(k) {
    k= prefix+k
    if(this.scope == 'local'){
      k = handleLocalKey(k)
    }
    this.storage.removeItem(k);
  }

  has(k) {
    k= prefix+k
    if(this.scope == 'local'){
      k = handleLocalKey(k)
    }
    let data, d, v;

    data = this.storage.getItem(k);
    return data;
  }
}

export default Storage;
