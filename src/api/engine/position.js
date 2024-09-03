import request from '@/utils/request'

// 查询地名地址引擎库列表
export function listPosition(query) {
  return request({
    url: '/engine/position/list',
    method: 'get',
    params: query
  })
}

// 查询地名地址引擎库详细
export function getPosition(id) {
  return request({
    url: '/engine/position/' + id,
    method: 'get'
  })
}


// 新增地名地址引擎库
export function addPosition(data) {
  return request({
    url: '/engine/position',
    method: 'post',
    data: data
  })
}

// 修改地名地址引擎库
export function updatePosition(data) {
  return request({
    url: '/engine/position',
    method: 'put',
    data: data
  })
}

// 删除地名地址引擎库
export function delPosition(id) {
  return request({
    url: '/engine/position/' + id,
    method: 'delete'
  })
}
