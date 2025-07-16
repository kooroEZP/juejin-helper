// 支持多个cookie配置的函数
const getCookies = () => {
  // 优先使用 COOKIES（多账号配置），如果没有则使用 COOKIE（单账号配置）
  const cookiesStr = process.env.COOKIES || process.env.COOKIE
  if (!cookiesStr) {
    return []
  }

  // 如果包含分号或逗号，则认为是多个cookie
  if (cookiesStr.includes(';') || cookiesStr.includes(',')) {
    return cookiesStr.split(/[;,]/).map(cookie => cookie.trim()).filter(Boolean)
  }

  // 否则认为是单个cookie
  return [cookiesStr.trim()]
}

module.exports = {
  COOKIE: process.env.COOKIE,
  COOKIES: getCookies(),
  EMAIL: process.env.EMAIL,
  AUTHORIZATION_CODE: process.env.AUTHORIZATION_CODE,
  PUSHPLUS_TOKEN: process.env.PUSHPLUS_TOKEN,
  DINGDING_WEBHOOK: process.env.DINGDING_WEBHOOK,
  FEISHU_WEBHOOK: process.env.FEISHU_WEBHOOK,
}