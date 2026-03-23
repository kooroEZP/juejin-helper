const Juejin = require('./juejin/index.js')
const pushMessage = require('./utils/pushMessage.js')
const { getAccounts, getDefaultPushConfig } = require('./ENV.js')

const createGrowth = () => ({
  userName: '',
  checkedIn: false,
  incrPoint: 0,
  sumPoint: 0,
  contCount: 0,
  sumCount: 0,
  luckyValue: 0,
  freeCount: 0,
})

const formatMessage = ({ name, growth }) => {
  const header = name ? `账号 ${name}\n` : ''

  return `
${header}Hello ${growth.userName}
${growth.checkedIn ? `签到 +${growth.incrPoint} 矿石` : '今日已签到'}
当前矿石数 ${growth.sumPoint}
连续签到天数 ${growth.contCount}
累计签到天数 ${growth.sumCount}
当前幸运值 ${growth.luckyValue}
免费抽奖次数 ${growth.freeCount}
`.trim()
}

const formatErrorMessage = ({ name, error }) => {
  const accountMessage = name ? `账号 ${name}\n` : ''

  return `${accountMessage}${error.stack || error.message || String(error)}`.trim()
}

const runAccount = async account => {
  const juejin = new Juejin()
  const growth = createGrowth()

  try {
    await juejin.login(account.cookie)
    growth.userName = juejin.user.user_name
  } catch {
    throw new Error('登录失败, 请尝试更新 Cookies')
  }

  const checkIn = await juejin.getTodayStatus()

  if (!checkIn.check_in_done) {
    const checkInResult = await juejin.checkIn()
    growth.checkedIn = true
    growth.incrPoint = checkInResult.incr_point
  }

  const counts = await juejin.getCounts()
  growth.contCount = counts.cont_count
  growth.sumCount = counts.sum_count

  const lotteryConfig = await juejin.getLotteryConfig()
  growth.freeCount = lotteryConfig.free_count || 0

  growth.sumPoint = await juejin.getCurrentPoint()

  const luckyResult = await juejin.getLucky()
  growth.luckyValue = luckyResult.total_value

  return {
    name: account.name || growth.userName,
    message: formatMessage({
      name: account.name,
      growth,
    }),
  }
}

const main = async () => {
  let accounts = []

  try {
    accounts = getAccounts()
  } catch (error) {
    pushMessage(
      {
        type: 'error',
        message: error.stack,
      },
      getDefaultPushConfig()
    )

    throw error
  }

  if (!accounts.length) {
    throw new Error('未找到可用账号配置，请配置 COOKIE 或 ACCOUNTS')
  }

  const failedAccounts = []

  for (const account of accounts) {
    try {
      const result = await runAccount(account)

      pushMessage(
        {
          type: 'info',
          message: result.message,
          titlePrefix: result.name,
        },
        account.pushConfig
      )
    } catch (error) {
      failedAccounts.push({
        name: account.name || '未命名账号',
        error,
      })

      pushMessage(
        {
          type: 'error',
          message: formatErrorMessage({ name: account.name, error }),
          titlePrefix: account.name,
        },
        account.pushConfig
      )
    }
  }

  if (failedAccounts.length) {
    const summary = failedAccounts.map(item => `${item.name}: ${item.error.message}`).join('\n')

    throw new Error(`以下账号执行失败:\n${summary}`)
  }
}

main().catch(error => {
  console.error(error.stack)
  process.exitCode = 1
})
