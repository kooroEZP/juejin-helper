const Juejin = require('./juejin/index.js')
const pushMessage = require('./utils/pushMessage.js')
const { COOKIES } = require('./ENV.js')

const growth = {
  userName: '', // 用户名
  checkedIn: false, // 是否签到
  incrPoint: 0, // 签到获得矿石数
  sumPoint: 0, // 总矿石数
  contCount: 0, // 连续签到天数
  sumCount: 0, // 累计签到天数
  luckyValue: 0, // 总幸运值
  freeCount: 0, // 免费抽奖次数
  freeDrawed: false, // 是否免费抽奖
  lotteryName: '', // 奖品名称
  collectedBug: false, // 是否收集 Bug
  collectBugCount: 0, // 收集 Bug 的数量
}

const message = (accountIndex) => {
  const accountInfo = COOKIES.length > 1 ? `账号${accountIndex + 1}: ` : ''
  return `
${accountInfo}Hello ${growth.userName}
${growth.checkedIn ? `签到 +${growth.incrPoint} 矿石` : '今日已签到'}
当前矿石数 ${growth.sumPoint}
连续签到天数 ${growth.contCount}
累计签到天数 ${growth.sumCount}
当前幸运值 ${growth.luckyValue}
免费抽奖次数 ${growth.freeCount}
`.trim()
}

// 重置账号数据
const resetGrowth = () => {
  growth.userName = ''
  growth.checkedIn = false
  growth.incrPoint = 0
  growth.sumPoint = 0
  growth.contCount = 0
  growth.sumCount = 0
  growth.luckyValue = 0
  growth.freeCount = 0
  growth.freeDrawed = false
  growth.lotteryName = ''
  growth.collectedBug = false
  growth.collectBugCount = 0
}

// 单个账号签到处理
const processAccount = async (cookie, accountIndex) => {
  const juejin = new Juejin()

  // 重置账号数据
  resetGrowth()

  try {
    // 登录
    try {
      await juejin.login(cookie)
      growth.userName = juejin.user.user_name
    } catch {
      throw new Error(`账号${accountIndex + 1} 登录失败, 请尝试更新 Cookies`)
    }

    // 签到
    const checkIn = await juejin.getTodayStatus()

    if (!checkIn.check_in_done) {
      const checkInResult = await juejin.checkIn()

      growth.checkedIn = true
      growth.incrPoint = checkInResult.incr_point
    }

    // 签到天数
    const counts = await juejin.getCounts()

    growth.contCount = counts.cont_count
    growth.sumCount = counts.sum_count

    // 免费抽奖
    const lotteryConfig = await juejin.getLotteryConfig()
    growth.freeCount = lotteryConfig.free_count || 0

    // 当前矿石数
    growth.sumPoint = await juejin.getCurrentPoint()

    // 当前幸运值
    const luckyResult = await juejin.getLucky()
    growth.luckyValue = luckyResult.total_value

    // 发送成功通知
    pushMessage({
      type: 'info',
      message: message(accountIndex),
    })

    console.log(`账号${accountIndex + 1} (${growth.userName}) 签到处理完成`)

  } catch (error) {
    // 发送失败通知
    pushMessage({
      type: 'error',
      message: `账号${accountIndex + 1} 签到失败: ${error.message}`,
    })

    console.error(`账号${accountIndex + 1} 签到失败:`, error.message)
  }
}

const main = async () => {
  console.log(`开始处理 ${COOKIES.length} 个账号的签到`)

  if (COOKIES.length === 0) {
    throw new Error('未配置任何 Cookie，请设置 COOKIE 或 COOKIES 环境变量')
  }

  // 依次处理每个账号
  for (let i = 0; i < COOKIES.length; i++) {
    const cookie = COOKIES[i]
    console.log(`\n处理账号${i + 1}...`)

    await processAccount(cookie, i)

    // 如果不是最后一个账号，等待一下避免请求过于频繁
    if (i < COOKIES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 等待2秒
    }
  }

  console.log('\n所有账号处理完成')
}

main().catch(error => {
  console.error('程序执行失败:', error.message)
  pushMessage({
    type: 'error',
    message: error.stack,
  })
})