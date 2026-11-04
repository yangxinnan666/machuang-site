// Vercel Serverless Function：表单发信
// 依赖环境变量（Vercel -> Settings -> Environment Variables）：
//   QQ_SMTP_USER = 收件邮箱，如 2597252592@qq.com
//   QQ_SMTP_PASS = 该 QQ 邮箱的 SMTP 授权码（不是 QQ 密码，16 位字母）
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method-not-allowed' });
  }

  const b = req.body || {};
  // 蜜罐字段：正常用户不会填，机器人会填 -> 直接假装成功
  if (b._honey) return res.status(200).json({ ok: true });

  const name = String(b.name || '').trim().slice(0, 60);
  const contact = String(b.contact || '').trim().slice(0, 120);
  const type = String(b.type || '').trim().slice(0, 60);
  const budget = String(b.budget || '').trim().slice(0, 60);
  const message = String(b.message || '').trim().slice(0, 3000);

  if (!name || !contact || !message) {
    return res.status(400).json({ ok: false, error: 'missing-fields' });
  }

  const user = process.env.QQ_SMTP_USER;
  const pass = process.env.QQ_SMTP_PASS;
  if (!user || !pass) {
    return res.status(500).json({ ok: false, error: 'not-configured' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.qq.com',
      port: 465,
      secure: true,
      auth: { user: user, pass: pass }
    });

    await transporter.sendMail({
      from: '"码创工坊官网" <' + user + '>',
      to: user,
      replyTo: contact.indexOf('@') > 0 ? contact : undefined,
      subject: '【官网询盘】' + name + ' · ' + (type || '未分类') + ' · ' + (budget || '预算未填'),
      text:
        '称呼：' + name + '\n' +
        '联系方式：' + contact + '\n' +
        '项目类型：' + (type || '未填') + '\n' +
        '预算范围：' + (budget || '未填') + '\n' +
        '来源：' + (req.headers.referer || '-') + '\n' +
        '\n需求描述：\n' + message
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('send mail failed:', err && err.message);
    return res.status(500).json({ ok: false, error: 'send-failed' });
  }
};
