import request from '@/utils/request'

// 获取视频列表
export function getVideoList(params) {
  return request({
    url: '/videos',
    method: 'get',
    params
  })
}

// 获取视频详情
export function getVideoDetail(id) {
  return request({
    url: `/videos/${id}`,
    method: 'get'
  })
}

// 获取字幕数据
export function getSubtitles(videoId) {
  return request({
    url: `/videos/${videoId}/subtitles`,
    method: 'get'
  })
}

// 提交练习结果
export function submitPractice(data) {
  return request({
    url: '/practice/submit',
    method: 'post',
    data
  })
}

// 获取用户学习进度
export function getLearningProgress() {
  return request({
    url: '/user/progress',
    method: 'get'
  })
}
