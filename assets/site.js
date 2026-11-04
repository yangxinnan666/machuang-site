/* 全站通用：配置、案例卡片、滚动出现、导航、表单 */
var SITE = {
  email: '2597252592@qq.com',                                    // 收件邮箱（改了这里两端都变）
  wechat: 'DYBSSG666',                                            // ← 你的微信号
  formEndpoint: '/api/send',  // Vercel 自建发信接口（QQ 邮箱 SMTP），配置见 README
  heroMode: 'images',                                             // 'video' 用示例视频；'images' 用你的截图

  // 换成自己的小程序截图：heroMode 改 'images'，把 10 张竖图地址填进来
  // 图片建议 9:16（如 540×960），放在同目录 img/ 下即可写 'img/shot-1.jpg'
  heroImages: [
    'img/shot-hotpot-home.jpg', 'img/shot-noodle-home.jpg', 'img/shot-bakery-home.jpg',
    'img/shot-burger-home.jpg', 'img/shot-coffee-home.jpg', 'img/shot-mall-home.jpg',
    'img/shot-hotpot-order.jpg', 'img/shot-coffee-order.jpg', 'img/shot-bakery-recharge.jpg',
    'img/shot-mall-vip.jpg'
  ],

  // 案例：img 留空则用内置图；填了（如 'img/case-tea.jpg'）就换成你的截图
  // c / r 是内置 5×2 图册里的格位（第几列 / 第几行），换成自己的图后可以不管
  cases: [
    { title: '山野菌菇火锅', tag: '餐饮 · 点单', c: 0, r: 0, img: 'img/shot-hotpot-home.jpg', desc: '山野主题火锅店点单系统：堂食、自取、外卖三种模式分流，会员储值六档赠送自动入账。' },
    { title: '李沐禾手擀面', tag: '餐饮 · 点单', c: 0, r: 0, img: 'img/shot-noodle-home.jpg', desc: '面馆点单 + 链接 WiFi 二合一：顾客扫码下单的同时连上店内网络，菜品分类清晰、价格透明。' },
    { title: '今日甜烘焙', tag: '烘焙 · 预订', c: 0, r: 0, img: 'img/shot-bakery-home.jpg', desc: '蛋糕预订通道独立开启，支持款式与口味个性化定制；充值活动档位灵活，储值直抵消费。' },
    { title: "Co's Burger 汉堡", tag: '快餐 · 点单', c: 0, r: 0, img: 'img/shot-burger-home.jpg', desc: '卡通 IP 主题首页，堂食点单、自提、外送三个入口清晰分流，领券中心与会员充值常驻。' },
    { title: '醒醒咖啡', tag: '咖啡 · 轻食', c: 0, r: 0, img: 'img/shot-coffee-home.jpg', desc: '咖啡轻食小程序：点单页带 WiFi 密码直达，果咖系列分类展示，会员中心积分权益一站搞定。' },
    { title: '百变潮鞋', tag: '商城 · 会员', c: 0, r: 0, img: 'img/shot-mall-vip.jpg', desc: '潮鞋商城：首页整合分类、营销活动与热类推荐，VIP 至尊会员三档开通，售后无忧。' }
  ]
};
window.SITE = SITE;

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* ---------- 配置注入 DOM ----------  */
  document.getElementById('year').textContent = new Date().getFullYear();
  ['wechatText', 'wechatText2'].forEach(function (id) {
    var el = document.getElementById(id); if (el) el.textContent = SITE.wechat;
  });
  ['mailLink', 'mailLink2'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) { el.textContent = SITE.email; el.href = 'mailto:' + SITE.email; }
  });

  /* ---------- 1. 案例卡片 ---------- */
  (function renderCases() {
    var grid = document.getElementById('caseGrid');
    if (!grid) return;
    SITE.cases.forEach(function (c, i) {
      var el = document.createElement('article');
      el.className = 'case';
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--d', (i % 3) * 0.07 + 's');
      var shot = c.img
        ? '<img class="sheet" src="' + c.img + '" alt="" style="object-fit:cover">'
        : '<div class="sheet" style="--c:' + c.c + ';--r:' + c.r + '"></div>';
      el.innerHTML =
        '<div class="case-screen">' +
          '<div class="phone">' +
            '<div class="screen">' +
              shot +
              '<div class="pnav">' + c.title.replace('小程序', '') + '</div>' +
              '<div class="capsule"><i></i><i></i></div>' +
              '<div class="tabbar"><span>首页</span><span>订单</span><span>我的</span></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="case-body">' +
          '<div class="case-top"><h3>' + c.title + '</h3><span class="tag">' + c.tag + '</span></div>' +
          '<p>' + c.desc + '</p>' +
        '</div>';
      grid.appendChild(el);
    });
  })();
/* ---------- 滚动出现 + header 状态 ----------  */
  (function reveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('in');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    for (var k = 0; k < items.length; k++) io.observe(items[k]);
  })();

  var header = document.getElementById('siteHeader');
  function onScroll() { header.classList.toggle('is-stuck', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 9. 手机菜单 ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var menu = document.getElementById('mobileMenu');
  menuBtn.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      menu.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- 10. 联系表单 ---------- */
  (function form() {
    var card = document.getElementById('formCard');
    var form = document.getElementById('contactForm');
    var msg = document.getElementById('formMsg');
    var btn = document.getElementById('submitBtn');
    if (!card || !form || !msg || !btn) return;

    function readForm() {
      var fd = new FormData(form);
      var data = {};
      fd.forEach(function (v, k) { data[k] = String(v).trim(); });
      return data;
    }

    function fail(text) {
      msg.textContent = text;
      msg.classList.add('is-error');
    }

    function mailtoFallback(data) {
      var subject = '【小程序咨询】' + (data.type || '') + ' - ' + (data.name || '');
      var body = '称呼：' + (data.name || '') +
        '\n联系方式：' + (data.contact || '') +
        '\n项目类型：' + (data.type || '') +
        '\n预算范围：' + (data.budget || '') +
        '\n\n需求描述：\n' + (data.message || '');
      window.location.href = 'mailto:' + SITE.email +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    }

    function setBusy(on) {
      btn.disabled = on;
      btn.textContent = on ? '发送中…' : '发送需求';
      btn.style.opacity = on ? '.7' : '';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.classList.remove('is-error');
      msg.textContent = '';

      var data = readForm();
      if (data._honey) return;

      if (!data.name) { fail('先留个称呼吧。'); return; }
      if (!data.contact) { fail('留个微信或手机，方便我回复你。'); return; }
      if (!data.message || data.message.length < 6) { fail('简单说两句需求，比如行业和想解决的问题。'); return; }

      setBusy(true);

      fetch(SITE.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          contact: data.contact,
          type: data.type,
          budget: data.budget,
          message: data.message,
          _honey: data._honey || ''
        })
      })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          return { ok: r.ok, body: j || {} };
        });
      })
      .then(function (res) {
        if (res.ok && res.body.ok) {
          card.classList.add('is-sent');
          setBusy(false);
          return;
        }
        setBusy(false);
        var e = String(res.body.error || '');
        if (e === 'not-configured') {
          fail('表单服务还没配置好，暂时发不出去。可以直接邮件联系我：' + SITE.email);
        } else if (e === 'missing-fields') {
          fail('有几项没填全，检查一下再发一次。');
        } else {
          fail('发送失败，内容已保留。可以直接邮件给我：' + SITE.email);
        }
      })
      .catch(function () {
        setBusy(false);
        if (window.location.protocol === 'file:') {
          fail('本地双击打开时表单发不出去，线上网站正常。也可以直接邮件给我：' + SITE.email);
        } else {
          fail('网络异常，没发出去。内容还在，重试一次或直接邮件给我：' + SITE.email);
        }
      });
    });
  })();


  /* ---------- 价格卡：高亮跟随鼠标 ---------- */
  (function () {
    var wrap = document.querySelector('.plans');
    if (!wrap) return;
    var plans = Array.prototype.slice.call(wrap.querySelectorAll('.plan'));
    if (plans.length < 2) return;

    var defaultBest = wrap.querySelector('.plan--best') || plans[0];
    defaultBest.setAttribute('data-default-best', '1');

    function sync() {
      plans.forEach(function (p) {
        var best = p.classList.contains('plan--best');
        var btn = p.querySelector('.btn');
        if (btn) {
          btn.classList.toggle('btn--dark', best);
          btn.classList.toggle('btn--ghost', !best);
        }
        var flag = p.querySelector('.plan-flag');
        if (flag) flag.style.display = best ? '' : 'none';
      });
    }

    plans.forEach(function (p) {
      p.addEventListener('mouseenter', function () {
        plans.forEach(function (q) { q.classList.remove('plan--best'); });
        p.classList.add('plan--best');
        sync();
      });
    });

    wrap.addEventListener('mouseleave', function () {
      plans.forEach(function (q) { q.classList.remove('plan--best'); });
      defaultBest.classList.add('plan--best');
      sync();
    });

    sync();
  })();

  })();
