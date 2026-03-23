const axios = require('axios')
const SUCCESS_CODE = 0

const feishu = async ({ title = '', content = '' } = {}, config = {}) => {
  const { feishuWebhook = '' } = config

  if (!feishuWebhook) {
    return
  }

  try {
    const response = await axios.post(feishuWebhook, template(title, content))

    if (response?.data?.StatusCode !== SUCCESS_CODE) {
      throw new Error(response?.data?.msg)
    }
  } catch (error) {
    console.log(error.stack)
  }
}

const template = (title, content) => ({
  msg_type: 'interactive',
  card: {
    header: {
      title: {
        tag: 'plain_text',
        content: title,
      },
    },
    elements: [
      {
        tag: 'div',
        text: {
          content,
          tag: 'lark_md',
        },
      },
    ],
  },
})

module.exports = feishu
