import axios from 'axios'
import { ElNotification, ElMessage } from 'element-plus'
import { tansParams } from '@/utils/ruoyi'

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: 'https://test.honlife.com.cn/',
  // 超时
  timeout: 10000
})

// request拦截器
service.interceptors.request.use(config => {
  // get请求映射params参数
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params);
    url = url.slice(0, -1);
    config.params = {};
    config.url = url;
  }
  return config
}, error => {
    console.log(error)
    Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(res => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 1000;
    // 获取错误信息
    const msg = res.data.message;
    // 二进制数据则直接返回
    if(res.request.responseType === 'blob' || res.request.responseType ===  'arraybuffer'){
      return res.data
    }
    return Promise.resolve(res.data)
    /*if (code !== 1000) {
      ElNotification.error({
        title: msg
      })
      return Promise.reject('error')
    } else {
      return Promise.resolve(res.data)
    }*/
  },
  error => {
    console.log('err' + error)
    let { message } = error;
    if (message == "Network Error") {
      message = "后端接口连接异常";
    }
    else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    }
    else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    ElMessage({
      message: message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
