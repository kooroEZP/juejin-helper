<p align="center">
  <img src="./docs/logo.svg" />
</p>

<h1 align="center">稀土掘金助手</h1>

<p align="center">
  <a href="https://github.com/remy/nodemon">
    <img src="https://img.shields.io/badge/nodemon-2.0.16-blue.svg" alt="nodemon" />
  </a>
  <a href="https://github.com/axios/axios">
    <img src="https://img.shields.io/badge/axios-0.27.2-brightgreen.svg" alt="axios" />
  </a>
  <a href="https://github.com/nodemailer/nodemailer">
    <img src="https://img.shields.io/badge/nodemailer-6.7.6-important.svg" alt="nodemailer" />
  </a>
</p>

## 简介

&emsp;&emsp;依赖 [GitHub Actions](https://docs.github.com/cn/actions/learn-github-actions/understanding-github-actions) 的稀土掘金助手，用于自动化每日签到、沾喜气、免费抽奖、`BugFix`等。

> 为保证脚本更好的运行，`Fork`仓库后请根据 [指南](https://juejin.cn/post/7108615649777156104#heading-14) 手动启用一次

## 异常

&emsp;&emsp;若仓库在`60`天内如果没有活动，工作流将被禁止，暂停签到。请手动点击`Enable workflow`以再次启用工作流。

<p align="left">
  <img src="./docs/60.png" />
</p>

## 使用

### 环境机密 Secrets

| `Name` | `Value` | `Required` |
| --- | --- | --- |
| `COOKIE` | 稀土掘金用户`cookie` | 单账号时必填 |
| `ACCOUNTS` | 多账号 JSON 配置 | 多账号时必填 |
| `EMAIL` | 邮箱地址 | 否 |
| `AUTHORIZATION_CODE` | 邮箱`POP3/SMTP`服务授权码 | 否 |
| `PUSHPLUS_TOKEN` | 微信公众号`pushplus` `token` | 否 |
| `DINGDING_WEBHOOK` | 钉钉机器人`Webhook` | 否 |
| `FEISHU_WEBHOOK` | 飞书机器人`Webhook` | 否 |

### 配置说明

#### 单账号配置（兼容原有方式）

保持原来的配置即可，无需改动：

- 必填：`COOKIE`
- 选填：`EMAIL`、`AUTHORIZATION_CODE`、`PUSHPLUS_TOKEN`、`DINGDING_WEBHOOK`、`FEISHU_WEBHOOK`

只配置 `COOKIE` 时，项目仍按原来的单账号逻辑执行。

#### 多账号配置（新增方式）

如果需要多账号签到，请新增一个 `GitHub Secrets`：`ACCOUNTS`。

`ACCOUNTS` 的值必须是一个 **JSON 数组字符串**，数组里的每一项代表一个账号。示例：

```json
[
  {
    "name": "主账号",
    "cookie": "你的第一个掘金 cookie",
    "pushplusToken": "账号1自己的pushplus token"
  },
  {
    "name": "备用账号",
    "cookie": "你的第二个掘金 cookie",
    "email": "example@qq.com",
    "authorizationCode": "邮箱授权码",
    "dingdingWebhook": "https://oapi.dingtalk.com/robot/send?access_token=xxx"
  }
]
```

#### `ACCOUNTS` 字段详细说明

每个账号对象支持以下字段：

| 字段 | 是否必填 | 说明 |
| --- | --- | --- |
| `name` | 否 | 账号备注名称，用于区分推送消息中的账号 |
| `cookie` | 是 | 当前账号的掘金 `cookie` |
| `email` | 否 | 当前账号专属邮箱地址 |
| `authorizationCode` | 否 | 当前账号专属邮箱授权码 |
| `pushplusToken` | 否 | 当前账号专属 `pushplus token` |
| `dingdingWebhook` | 否 | 当前账号专属钉钉机器人 Webhook |
| `feishuWebhook` | 否 | 当前账号专属飞书机器人 Webhook |

同时也兼容大写写法，例如：`COOKIE`、`EMAIL`、`AUTHORIZATION_CODE`。

#### 多账号与原配置的兼容规则

为保证兼容老配置，项目按以下顺序读取：

1. 如果配置了原有的 `COOKIE`，这个老账号会继续保留并正常执行。
2. 如果再新增 `ACCOUNTS`，则会把 `ACCOUNTS` 里的账号追加进去一起执行。
3. 如果是全新环境，也可以完全不配置 `COOKIE`，只配置 `ACCOUNTS` 直接运行多账号。
4. 如果 `COOKIE` 对应的老账号，和 `ACCOUNTS` 中某个账号是同一个 `cookie`，则以 `ACCOUNTS` 中该账号的配置为准，避免重复执行。

也就是说：

- 老用户不需要改任何配置。
- 在现有单账号基础上新增账号时，只需要额外在 `ACCOUNTS` 里补新账号信息。
- 原有 `COOKIE`、推送配置不会被强制修改。
- 全新部署时，可以只配 `ACCOUNTS`，不配旧版单账号字段。

#### 多账号推送配置继承规则

每个账号都可以分别配置自己的推送方式。

- 如果账号对象里写了推送字段，就优先使用该账号自己的配置。
- 如果账号对象里没写推送字段，就自动继承全局的 `EMAIL`、`AUTHORIZATION_CODE`、`PUSHPLUS_TOKEN`、`DINGDING_WEBHOOK`、`FEISHU_WEBHOOK`。
- 这意味着：老版本已经配置好的邮箱、`pushplus`、钉钉、飞书等推送信息，可以直接给新增账号复用，不需要重复搬到新 key 下。

例如：

- 全局配置了 `PUSHPLUS_TOKEN`
- `ACCOUNTS` 中第一个账号没有写 `pushplusToken`
- 那么第一个账号会直接复用全局的 `PUSHPLUS_TOKEN`

如果你想让某个账号不继承某个全局推送配置，可以在该账号里把对应字段显式写成空字符串，例如：`"pushplusToken": ""`。

#### 典型使用场景

##### 场景一：老用户已在跑单账号，现在想加一个新账号

假设你原来已经配好了这些旧配置：

- `COOKIE`
- `EMAIL`
- `AUTHORIZATION_CODE`
- `PUSHPLUS_TOKEN`

此时你只需要新增一个 `ACCOUNTS`，例如：

```json
[
  {
    "name": "新增账号",
    "cookie": "新账号 cookie"
  }
]
```

这样运行结果就是：

- 原来的老账号继续执行
- 新增账号也会执行
- 新增账号如果没单独写推送配置，就自动复用原来已有的 `EMAIL`、`PUSHPLUS_TOKEN` 等配置

##### 场景二：某个新账号想单独推送

```json
[
  {
    "name": "新增账号",
    "cookie": "新账号 cookie",
    "pushplusToken": "这个账号自己的 token"
  }
]
```

此时这个账号优先使用它自己的 `pushplusToken`，没有写的其它推送字段仍然继续继承全局配置。

##### 场景三：全新环境直接跑多账号

此时可以不配置旧版的 `COOKIE`，只配置 `ACCOUNTS` 即可。

#### 运行时间说明

多账号不会新增额外的定时任务，仍然使用同一个 GitHub Actions 定时器：

- 当前工作流时间：`UTC 0 点`
- 所有账号会在同一次工作流触发时依次执行

这样可以保证所有账号的运行时间保持一致，且不影响现有定时配置。

### 效果预览

<br/>
<p align="left">
  <img src="./docs/email.png" /></br></br>
  <img src="./docs/pushplus.png" /></br></br>
  <img src="./docs/dingding.png" /></br></br>
  <img src="./docs/feishu.png" />
</p>

## 第三方插件

* [nodemon](https://github.com/remy/nodemon)
* [axios](https://github.com/axios/axios)
* [nodemailer](https://github.com/nodemailer/nodemailer)
