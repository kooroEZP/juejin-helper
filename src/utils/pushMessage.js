const email = require('./email.js')
const pushplus = require('./pushplus.js')
const dingding = require('./dingding.js')
const feishu = require('./feishu.js')
const { getDefaultPushConfig } = require('../ENV.js')

const pushMessage = ({ type, message, titlePrefix = '' }, config = getDefaultPushConfig()) => {
  console.log(message)

  const formattedTitlePrefix = titlePrefix ? `${titlePrefix} ` : ''
  const payloadForEmail = formatter(type, message, {
    style: 'html',
    bold: true,
    titlePrefix: formattedTitlePrefix,
  })
  const payloadForMarkdown = formatter(type, message, {
    style: 'markdown',
    bold: true,
    wordWrap: true,
    titlePrefix: formattedTitlePrefix,
  })
  const payloadForFeishu = formatter(type, message, {
    style: 'markdown',
    bold: true,
    titlePrefix: formattedTitlePrefix,
  })

  config.email && config.authorizationCode && email(payloadForEmail, config)
  config.pushplusToken && pushplus(payloadForMarkdown, config)
  config.dingdingWebhook && dingding(payloadForMarkdown, config)
  config.feishuWebhook && feishu(payloadForFeishu, config)
}

/**
 * @desc 格式化消息内容
 * @param type 类型
 * @param message 内容
 * @param options 配置
 * {
 *   style: String 风格
 *   bold: Boolean 是否数字加粗
 *   wordWrap: Boolean 是否换行
 *   titlePrefix: String 标题前缀
 * }
 * @returns {Object}
 * {
 *   title: String 标题
 *   content: String 内容
 * }
 */
const formatter = (type = 'info', message = '', options = {}) => {
  const { style = 'html', bold = false, wordWrap = false, titlePrefix = '' } = options

  if (bold && type === 'info') {
    style === 'html' && (message = message.replace(/\+?\d+/g, ' <b>$&</b> '))
    style === 'markdown' && (message = message.replace(/\+?\d+/g, ' **$&** '))
  }

  if (wordWrap) {
    style === 'markdown' && (message = message.replace(/\n/g, ' \n\n > ').replace(/ +/g, ' '))
  }

  return {
    title: `${titlePrefix}签到${type === 'info' ? '成功 🎉' : '失败 💣'}`.trim(),
    content: style === 'html' ? `<pre>${message}</pre>` : message,
  }
}

module.exports = pushMessage
