let env = '<#ENVIRONMENT#>' //根据环境替换  local dev test prod

const apiList = {
	mock: {
		host: 'http://localhost:3000/',
		apiURL: '/mock/'
	},
	local: {
		host: 'http://localhost:3000/',
		// apiURL: 'http://121.43.189.237:8203/',
		apiURL: 'http://192.168.1.109:8203/',
		mURL:'http://kf.m.zcmall.com:8080/'
	},
	dev: {
		host: 'http://121.43.189.237:8001/',
		apiURL: 'http://121.43.189.237:8203/',
		mURL:'http://kf.m.zcmall.com:8080/'
	},
	test: {
		host: 'https://trm.zcmall.com/',
		// apiURL: 'http://121.43.182.205:8108/',
		apiURL: 'https://tuser.zcmall.com/',
		mURL:'http://tm.zcmall.com/',
	},
	uat: {
		host: 'https://trm.zcmall.com/',
		// apiURL: 'http://121.43.182.205:8108/',
		apiURL: 'https://tuser.zcmall.com/',
		mURL:'http://tm.zcmall.com/',
	},
	prod: {
		host: 'https://rm.zcmall.com/',
		apiURL: 'https://open.zcmall.com/',
		mURL:'http://m.zcmall.com/',
	}
}


const errors = {
	15017:{
		msg:'您输入的手机号码已注册，请更换其他手机号码',
		noCode:true
	}
}

if(env == '<#ENVIRONMENT#>'){
    env = 'local'
}


const appConf = {
	ENV: env,
	protocol: 'zcmallcrm://',
	prefixer:'zcmallcrm',
	appUrl:'http://a.app.qq.com/o/simple.jsp?pkgname=com.zcmall.crmapp',
	apiURL: apiList[env].apiURL,
	host: apiList[env].host,
	mURL: apiList[env].mURL,
	getApi:()=>{
		return apiList[env].apiURL;
	},
	getHost:()=>{
		return apiList[env].host;
	},
	version: '<#VERSION#>', //取git commit id
    setEnv:(value)=>{
        env=value
    }
}


export default appConf
