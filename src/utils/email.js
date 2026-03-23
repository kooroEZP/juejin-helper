const nodemailer = require('nodemailer')

const email = async ({ title = '', content = '' } = {}, config = {}) => {
  const { email: receiverEmail = '', authorizationCode = '' } = config

  if (!receiverEmail || !authorizationCode) {
    return
  }

  try {
    const suffix = /@(?<suffix>.*)/.exec(receiverEmail).groups.suffix
    const options = {
      host: `smtp.${suffix}`,
      auth: {
        user: receiverEmail,
        pass: authorizationCode,
      },
    }
    const transporter = nodemailer.createTransport(options)

    await transporter.verify()

    return transporter.sendMail({
      from: `稀土掘金助手 <${receiverEmail}>`,
      to: receiverEmail,
      subject: title,
      html: content,
    })
  } catch (error) {
    console.log(error.stack)
  }
}

module.exports = email
