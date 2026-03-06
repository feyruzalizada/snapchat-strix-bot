const puppeteer = require("puppeteer");

(async () => {

  // ─── Селекторы для перебора (только "безопасные" кнопки продвижения) ──────
  const ALL_SELECTORS = [
    ".FBYjn.gK0xL.W5dIq",
    ".fE2D5",
    ".YatIx.fGS78.eKaL7.Bnaur",
    "div.THeKv button.c47Sk",
    ".hsqnc",
    ".TYX6O.eKaL7.Bnaur",
    ".Y7u8A",
    ".JwhOC",
    "div.s53_U",
    "button.AJ_5h",
  ];

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  async function waitFor(page, selector, timeout = 6000) {
    try {
      await page.waitForSelector(selector, { timeout });
      return await page.$(selector);
    } catch {
      return null;
    }
  }

  async function waitGone(page, selector, timeout = 6000) {
    try {
      await page.waitForFunction(
        (sel) => !document.querySelector(sel),
        { timeout },
        selector
      );
      return true;
    } catch {
      return false;
    }
  }

  async function clickAll(page, selector, label) {
    const els = await page.$$(selector);
    if (!els.length) { console.log(`[${label}] блоков не найдено`); return false; }
    for (let i = 0; i < els.length; i++) {
      try { await els[i].click(); } catch {}
      console.log(`✅ [${label}] блок ${i+1}/${els.length} нажат`);
      await wait(400);
    }
    return true;
  }

  // ─── Перебор всех кнопок — возвращает true если ХОТЬ ЧТО-ТО нажалось ─────
  async function tryAllButtons(page) {
    console.log("\n⚡ Перебор всех известных кнопок...");
    let any = false;
    for (const sel of ALL_SELECTORS) {
      let clicked = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          // Для селекторов с несколькими элементами — кликаем все
          const els = await page.$$(sel);
          if (els.length > 0) {
            for (const el of els) {
              try { await el.click(); } catch {}
            }
            console.log(`  ✅ [${attempt}/2] ${sel} (${els.length} шт)`);
            any = true;
            clicked = true;
            await wait(400);
            break;
          } else {
            console.log(`  ❌ [${attempt}/2] ${sel}`);
          }
        } catch {
          console.log(`  ⚠️ [${attempt}/2] ошибка ${sel}`);
        }
        await wait(200);
      }
    }
    return any;
  }

  async function reload(page) {
    console.log("\n🔃 Перезагрузка страницы...\n");
    try {
      await page.reload({ waitUntil: "networkidle2", timeout: 15000 });
    } catch {
      console.log("⚠️ Reload завис, пробуем navigate...");
      await page.goto("https://web.snapchat.com", { waitUntil: "networkidle2", timeout: 15000 });
    }
    await wait(2000);
  }

  // ─── Если застряли: перебрать кнопки, если не помогло — reload ───────────
  async function unstuck(page) {
    const any = await tryAllButtons(page);
    await wait(1500);
    if (!any) {
      await reload(page);
      return false; // сигнал: нужен continue в главном цикле
    }
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();
  await page.goto("https://web.snapchat.com", { waitUntil: "networkidle2" });
  console.log("Ждём логин...");
  await page.waitForFunction(() =>
    document.querySelector('.FBYjn.gK0xL.W5dIq') || document.querySelector('.OK7va'),
    { timeout: 0 }
  );
  console.log("✅ Логин прошёл. Запускаем...\n");

  // ═══════════════════════════════════════════════════════════════════════════
  while (true) {

    // ── ШАГ 0: Разблокировка ────────────────────────────────────────────────
    console.log("── ШАГ 0: Разблокировка");
    {
      // Ждём до 30 секунд — кнопка появляется не сразу
      const el = await waitFor(page, ".FBYjn.gK0xL.W5dIq", 30000);
      if (!el) {
        console.log("⏳ Разблокировка не найдена за 30 сек, перезагружаем...");
        await reload(page);
        continue;
      }
      await el.click();
      await wait(800);
      console.log("✅ ШАГ 0 выполнен");
    }

    // ── ШАГ 1: Снимок ───────────────────────────────────────────────────────
    console.log("── ШАГ 1: Снимок");
    {
      const el = await waitFor(page, ".fE2D5", 8000);
      if (!el) {
        console.log("❌ Кнопка снимка не появилась");
        await unstuck(page);
        continue;
      }
      let gone = false;
      for (let i = 0; i < 4 && !gone; i++) {
        const btn = await page.$(".fE2D5");
        if (btn) { await btn.click(); await wait(600); }
        gone = await waitGone(page, ".fE2D5", 3000);
        if (!gone) console.log(`⚠️ Снимок не исчез, попытка ${i+1}`);
      }
      if (!gone) {
        console.log("❌ Снимок не исчез за 4 попытки");
        await unstuck(page);
        continue;
      }
      console.log("✅ ШАГ 1 выполнен");
    }

    // ── ШАГ 2: Кнопка отправки ──────────────────────────────────────────────
    console.log("── ШАГ 2: Кнопка отправки");
    {
      const el = await waitFor(page, ".YatIx.fGS78.eKaL7.Bnaur", 8000);
      if (!el) {
        console.log("❌ Кнопка отправки не появилась");
        await unstuck(page);
        continue;
      }
      await el.click();
      await wait(800);
      console.log("✅ ШАГ 2 выполнен");
    }

    // ── ШАГ 3: Огонёк 🔥 (не критично) ─────────────────────────────────────
    console.log("── ШАГ 3: Огонёк 🔥");
    {
      const container = await waitFor(page, "div.THeKv", 4000);
      if (container) {
        const buttons = await page.$$("div.THeKv button.c47Sk");
        let fireClicked = false;
        for (const btn of buttons) {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text.includes("🔥")) {
            await btn.click();
            await wait(500);
            fireClicked = true;
            console.log("✅ ШАГ 3 выполнен");
            break;
          }
        }
        if (!fireClicked) console.log("⚠️ 🔥 не найден, пропускаем");
      } else {
        console.log("⚠️ THeKv не найден, пропускаем");
      }
    }

    // ── ШАГ 4: Блоки hsqnc ──────────────────────────────────────────────────
    console.log("── ШАГ 4: Блоки hsqnc");
    {
      const el = await waitFor(page, ".hsqnc", 5000);
      if (el) {
        await clickAll(page, ".hsqnc", "hsqnc");

        const finalEl = await waitFor(page, ".TYX6O.eKaL7.Bnaur", 5000);
        if (finalEl) {
          await finalEl.click();
          await wait(600);
          console.log("✅ ШАГ 4 + финальная посылка выполнены → новый цикл\n");
          continue; // ← УСПЕШНЫЙ ПУТЬ, возврат к шагу 0
        }
        console.log("⚠️ Финальная кнопка не найдена после hsqnc");
      } else {
        console.log("⚠️ hsqnc не найдены, идём к шагу 5");
      }
    }

    // ── ШАГ 5: Y7u8A ────────────────────────────────────────────────────────
    console.log("── ШАГ 5: Y7u8A");
    {
      const el = await waitFor(page, ".Y7u8A", 5000);
      if (!el) {
        console.log("❌ Y7u8A не найден");
        await unstuck(page);
        continue;
      }
      await el.click();
      await wait(800);
      console.log("✅ ШАГ 5 выполнен");
    }

    // ── ШАГ 6: Блоки JwhOC ──────────────────────────────────────────────────
    console.log("── ШАГ 6: Блоки JwhOC");
    {
      const el = await waitFor(page, ".JwhOC", 8000);
      if (!el) {
        console.log("❌ JwhOC не появились");
        await unstuck(page);
        continue;
      }
      await clickAll(page, ".JwhOC", "JwhOC");
      console.log("✅ ШАГ 6 выполнен");
    }

    // ── ШАГ 7: div.s53_U ────────────────────────────────────────────────────
    console.log("── ШАГ 7: div.s53_U");
    {
      const el = await waitFor(page, "div.s53_U", 8000);
      if (!el) {
        console.log("❌ div.s53_U не появился");
        await unstuck(page);
        continue;
      }
      await el.click();
      await wait(800);
      console.log("✅ ШАГ 7 выполнен");
    }

    // ── ШАГ 8: AJ_5h (выкл камеры) ──────────────────────────────────────────
    console.log("── ШАГ 8: AJ_5h");
    {
      const el = await waitFor(page, "button.AJ_5h", 8000);
      if (!el) {
        console.log("❌ AJ_5h не появился");
        await unstuck(page);
        continue;
      }
      await el.click();
      await wait(800);
      console.log("✅ ШАГ 8 выполнен");
    }

    // ── ШАГ 9: Ждём снимок для нового цикла ─────────────────────────────────
    console.log("── ШАГ 9: Ждём новый снимок");
    {
      const el = await waitFor(page, ".fE2D5", 8000);
      if (el) {
        console.log("✅ Готов к новому снимку! Цикл продолжается...\n");
      } else {
        console.log("⚠️ Снимок не появился, возвращаемся к шагу 0");
      }
      // В любом случае возвращаемся к шагу 0
    }
  }

})();