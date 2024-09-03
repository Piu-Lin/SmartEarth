import Cookies from 'js-cookie'

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop',
  size: Cookies.get('size') || 'default',
  myChart: '', // myChart
  normArr: '', // 指标
  selectItem: '', // selectItem
  xLabel: [], // xLabel
  environmentTemperature: [], // 环境温度
  environmentHumidity: [], // 环境湿度
  soilTemperature: [], // 土壤温度
  soilHumidity: [], // 土壤湿度
  PH: [], // PH
  EC: [], // EC
  nitrogen: [], // 氮
  phosphorus: [], // 磷
  potassium: [], // 钾
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_SIZE: (state, size) => {
    state.size = size
    Cookies.set('size', size)
  },
  SET_VARIATE(state, { key, value }) {
    state[key] = value
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  setSize({ commit }, size) {
    commit('SET_SIZE', size)
  },
  setVariate({ commit }, data) {
    commit("SET_VARIATE", data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
