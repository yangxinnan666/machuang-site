# 码创工坊 · 小程序定制开发

面向商家的小程序定制开发服务展示站，纯静态多页面站点。

## 页面

| 文件 | 说明 |
| --- | --- |
| `index.html` | 首页：弧形案例轮播、行业方案、能力矩阵、精选案例、客户评价、FAQ |
| `cases.html` | 案例：速览表、行业墙 |
| `services.html` | 服务：技术栈、支持平台、SLA |
| `process.html` | 流程：排期表 |
| `pricing.html` | 价格：功能对照、付款节点、增值服务 |
| `contact.html` | 联系：微信二维码、在线表单 |

## 技术

无框架、无构建步骤。原生 HTML + CSS + JavaScript。

- `assets/site.css` — 全站样式
- `assets/site.js` — 站点配置、案例渲染、表单提交、价格卡交互
- `assets/hero.js` — 首页弧形轮播与入场动画（仅首页加载）

## 本地预览

任选一种：

```bash
python -m http.server 8080
# 或
npx serve .
```

然后访问 http://localhost:8080

## 部署

已适配 Vercel，导入本仓库即可，构建配置全部留空（Framework Preset 选 Other）。

### 表单发信配置（必须）

表单通过 `api/send.js`（Vercel Serverless Function）用 QQ 邮箱 SMTP 直发，需要配置两个环境变量：

1. QQ 邮箱网页版 → 设置 → 账号 → 开启「IMAP/SMTP 服务」→ 生成**授权码**（16 位字母，不是 QQ 密码）
2. Vercel 项目 → Settings → Environment Variables 添加：

   | 名称 | 值 |
   | --- | --- |
   | `QQ_SMTP_USER` | `2597252592@qq.com` |
   | `QQ_SMTP_PASS` | 上一步生成的授权码 |

3. Deployments → Redeploy 使变量生效

## 需要修改的地方

站点内容集中在 `assets/site.js` 顶部的 `SITE` 对象：

```js
const SITE = {
  email: '2597252592@qq.com',
  wechat: 'DYBSSG666',
  formEndpoint: '/api/send',
  heroMode: 'images',
  heroImages: [ ... ],
  cases: [ ... ]
};
```

- 表单走自建 Vercel 接口直发邮箱（见上方「表单发信配置」），无第三方依赖
- 微信二维码图片位于 `img/wechat-qr.png`
