const axios = require('axios')
const SUCCESS_CODE = 0

const dingding = async ({ title = '', content = '' } = {}, config = {}) => {
  const { dingdingWebhook = '' } = config

  if (!dingdingWebhook) {
    return
  }

  try {
    const response = await axios.post(dingdingWebhook, {
      msgtype: 'markdown',
      markdown: {
        title,
        text: content,
      },
    })

    if (response?.data?.errcode !== SUCCESS_CODE) {
      throw new Error(response?.data?.errmsg)
    }
  } catch (error) {
    console.log(error.stack)
  }
}

module.exports = dingding
