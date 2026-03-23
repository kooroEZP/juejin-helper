const axios = require('axios')
const SUCCESS_CODE = 200

const pushplus = async ({ title = '', content = '' } = {}, config = {}) => {
  const { pushplusToken = '' } = config

  if (!pushplusToken) {
    return
  }

  try {
    const response = await axios.post('http://www.pushplus.plus/send', {
      token: pushplusToken,
      template: 'markdown',
      title,
      content,
    })

    if (response?.data?.code !== SUCCESS_CODE) {
      throw new Error(response?.data?.msg)
    }
  } catch (error) {
    console.log(error.stack)
  }
}

module.exports = pushplus
