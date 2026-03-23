const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key)

const getStringValue = (target, keys) => {
  for (const key of keys) {
    if (hasOwn(target, key)) {
      const value = target[key]

      if (value === undefined || value === null) {
        return ''
      }

      return String(value).trim()
    }
  }

  return undefined
}

const getRequiredStringValue = (target, keys) => getStringValue(target, keys) || ''

const getDefaultPushConfig = () => ({
  email: getRequiredStringValue(process.env, ['EMAIL']),
  authorizationCode: getRequiredStringValue(process.env, ['AUTHORIZATION_CODE']),
  pushplusToken: getRequiredStringValue(process.env, ['PUSHPLUS_TOKEN']),
  dingdingWebhook: getRequiredStringValue(process.env, ['DINGDING_WEBHOOK']),
  feishuWebhook: getRequiredStringValue(process.env, ['FEISHU_WEBHOOK']),
})

const mergePushConfig = account => {
  const defaultPushConfig = getDefaultPushConfig()

  return {
    email: account.email !== undefined ? account.email : defaultPushConfig.email,
    authorizationCode:
      account.authorizationCode !== undefined ? account.authorizationCode : defaultPushConfig.authorizationCode,
    pushplusToken: account.pushplusToken !== undefined ? account.pushplusToken : defaultPushConfig.pushplusToken,
    dingdingWebhook:
      account.dingdingWebhook !== undefined ? account.dingdingWebhook : defaultPushConfig.dingdingWebhook,
    feishuWebhook: account.feishuWebhook !== undefined ? account.feishuWebhook : defaultPushConfig.feishuWebhook,
  }
}

const normalizeAccount = (account = {}, index = 0) => {
  const name = getStringValue(account, ['name', 'NAME']) || `账号${index + 1}`
  const cookie = getRequiredStringValue(account, ['cookie', 'COOKIE'])

  return {
    name,
    cookie,
    email: getStringValue(account, ['email', 'EMAIL']),
    authorizationCode: getStringValue(account, ['authorizationCode', 'AUTHORIZATION_CODE']),
    pushplusToken: getStringValue(account, ['pushplusToken', 'PUSHPLUS_TOKEN']),
    dingdingWebhook: getStringValue(account, ['dingdingWebhook', 'DINGDING_WEBHOOK']),
    feishuWebhook: getStringValue(account, ['feishuWebhook', 'FEISHU_WEBHOOK']),
  }
}

const parseAccounts = () => {
  const rawAccounts = getRequiredStringValue(process.env, ['ACCOUNTS'])

  if (!rawAccounts) {
    return []
  }

  try {
    const accounts = JSON.parse(rawAccounts)

    if (!Array.isArray(accounts)) {
      throw new Error('ACCOUNTS 必须是 JSON 数组')
    }

    return accounts.map((account, index) => {
      const normalizedAccount = normalizeAccount(account, index)

      if (!normalizedAccount.cookie) {
        throw new Error(`${normalizedAccount.name} 缺少 cookie 配置`)
      }

      return {
        ...normalizedAccount,
        pushConfig: mergePushConfig(normalizedAccount),
      }
    })
  } catch (error) {
    throw new Error(`ACCOUNTS 配置解析失败: ${error.message}`)
  }
}

const getLegacyAccount = () => {
  const cookie = getRequiredStringValue(process.env, ['COOKIE'])

  if (!cookie) {
    return null
  }

  return {
    name: '',
    cookie,
    pushConfig: getDefaultPushConfig(),
  }
}

const getAccounts = () => {
  const accounts = parseAccounts()
  const legacyAccount = getLegacyAccount()

  if (!legacyAccount) {
    return accounts
  }

  const mergedAccounts = [legacyAccount]

  for (const account of accounts) {
    const duplicateIndex = mergedAccounts.findIndex(item => item.cookie === account.cookie)

    if (duplicateIndex >= 0) {
      mergedAccounts.splice(duplicateIndex, 1, account)
      continue
    }

    mergedAccounts.push(account)
  }

  return mergedAccounts
}

module.exports = {
  COOKIE: getRequiredStringValue(process.env, ['COOKIE']),
  ACCOUNTS: getRequiredStringValue(process.env, ['ACCOUNTS']),
  EMAIL: getRequiredStringValue(process.env, ['EMAIL']),
  AUTHORIZATION_CODE: getRequiredStringValue(process.env, ['AUTHORIZATION_CODE']),
  PUSHPLUS_TOKEN: getRequiredStringValue(process.env, ['PUSHPLUS_TOKEN']),
  DINGDING_WEBHOOK: getRequiredStringValue(process.env, ['DINGDING_WEBHOOK']),
  FEISHU_WEBHOOK: getRequiredStringValue(process.env, ['FEISHU_WEBHOOK']),
  getAccounts,
  getDefaultPushConfig,
}
