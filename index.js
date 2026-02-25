const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });

  const page = await browser.newPage();

  await page.goto("https://web.snapchat.com", {
    waitUntil: "networkidle2"
  });

  console.log("Ждём логин...");

  // Ждём появления любого элемента после авторизации
  await page.waitForSelector("body", { timeout: 0 });

  // Ждём появления одной из нужных кнопок после авторизации
  await page.waitForFunction(() => {
    return document.querySelector('.FBYjn.gK0xL.W5dIq') || document.querySelector('.OK7va');
  }, { timeout: 0 });

  console.log("Страница активна. Запускаем проверку...");

  while (true) {
    const unlockButton = await page.$(".FBYjn.gK0xL.W5dIq");

    if (unlockButton) {
      await unlockButton.click();
      console.log("Нажали кнопку разблокировки");

      // Ждём появления кнопки снимка
      try {
        await page.waitForSelector(".fE2D5", { timeout: 5000 });
        await new Promise(r => setTimeout(r, 500)); // уменьшена пауза до 0.5 сек
        const snapButton = await page.$(".fE2D5");
        if (snapButton) {
          let snapClickAttempts = 0;
          let snapGone = false;
          while (snapClickAttempts < 3 && !snapGone) {
            await snapButton.click();
            await new Promise(r => setTimeout(r, 500));
            const stillExists = await page.$(".fE2D5");
            if (!stillExists) {
              console.log("Кнопка снимка успешно нажата и исчезла");
              snapGone = true;
            } else {
              console.log("Кнопка снимка нажата, но она осталась на экране, попытка " + (snapClickAttempts + 1));
            }
            snapClickAttempts++;
          }
          if (!snapGone) {
            console.log("Кнопка снимка не исчезла после 3 попыток, переход к следующей итерации");
            continue;
          }

          // 1. Кнопка отправки нажата
          const sendButton = await page.$(".YatIx.fGS78.eKaL7.Bnaur");
          await new Promise(r => setTimeout(r, 500)); // уменьшена пауза до 0.5 сек
          if (sendButton) {
            await sendButton.click();
            console.log("Кнопка отправки нажата");

            // 2. Ждём появления кнопки с огоньком
            try {
              await page.waitForSelector('div.THeKv', { timeout: 5000 });
              await new Promise(r => setTimeout(r, 500)); // уменьшена пауза до 0.5 сек
              const theKvDiv = await page.$('div.THeKv');
              if (theKvDiv) {
                const fireButtons = await theKvDiv.$$('button.c47Sk');
                let fireClicked = false;
                for (let i = 0 ; i < fireButtons.length; i++) {
                  const content = await page.evaluate(el => el.textContent, fireButtons[i]);
                  if (content.includes('🔥')) {
                    await fireButtons[i].click();
                    console.log('Кнопка с огоньком 🔥 нажата (div.THeKv > button.c47Sk)');
                    fireClicked = true;
                    break;
                  }
                }
                await new Promise(r => setTimeout(r, 500)); // уменьшена пауза до 0.5 сек
                if (!fireClicked) {
                  console.log('Кнопка с огоньком 🔥 не найдена среди div.THeKv > button.c47Sk');
                }
              } else {
                console.log('div.THeKv не найден');
              }
            } catch {
              console.log("Кнопка с огоньком 🔥 не появилась в течение 5 секунд");
            }

            // 3. Ждём появления всех блоков hSQnC
            try {
              await page.waitForSelector(".hsqnc", { timeout: 5000 });
              await new Promise(r => setTimeout(r, 500)); // уменьшена пауза до 0.5 сек
              const blocks = await page.$$(".hsqnc");
              if (blocks.length > 0) {
                for (let i = 0; i < blocks.length; i++) {
                  await blocks[i].click();
                  console.log(`Блок hSQnC ${i+1} нажат`);
                  await new Promise(r => setTimeout(r, 500)); // уменьшена пауза до 0.5 сек
                }
                // 4. Ждём появления кнопки посылки
                try {
                  await page.waitForSelector(".TYX6O.eKaL7.Bnaur", { timeout: 5000 });
                  await new Promise(r => setTimeout(r, 500)); // уменьшена пауза до 0.5 сек
                  const finalSend = await page.$(".TYX6O.eKaL7.Bnaur");
                  if (finalSend) {
                    await finalSend.click();
                    console.log("Финальная кнопка посылки нажата");
                    // Возврат к первой кнопке отправки
                    continue;
                  } else {
                    console.log("Финальная кнопка посылки не найдена");
                  }
                } catch {
                  console.log("Финальная кнопка посылки не появилась в течение 5 секунд");
                }
              } else {
                console.log("Блоки hSQnC не найдены");
              }
            } catch {
              console.log("Блоки hSQnC не появились в течение 5 секунд");
            }

            // 3.1 Ждём и нажимаем кнопку Y7u8A перед JwhOC
            let y7u8aAttempts = 0;
            let y7u8aClicked = false;
            while (y7u8aAttempts < 3 && !y7u8aClicked) {
              try {
                await page.waitForSelector(".Y7u8A", { timeout: 3000 });
                await new Promise(r => setTimeout(r, 500)); // уменьшена пауза до 0.5 сек
                const y7u8aButton = await page.$(".Y7u8A");
                if (y7u8aButton) {
                  await y7u8aButton.click();
                  console.log("Кнопка Y7u8A нажата");
                  y7u8aClicked = true;
                } else {
                  console.log("Кнопка Y7u8A не найдена, попытка " + (y7u8aAttempts + 1));
                }
              } catch {
                console.log("Кнопка Y7u8A не появилась, попытка " + (y7u8aAttempts + 1));
                // Новый шаг: если кнопка Y7u8A не появилась, нажать .xHw7V.T0LP0.STlkX и сразу продолжить с шага снимка
                try {
                  await page.waitForSelector(".xHw7V.T0LP0.STlkX", { timeout: 1000 });
                  const closeButton = await page.$(".xHw7V.T0LP0.STlkX");
                  if (closeButton) {
                    await closeButton.click();
                    console.log("Кнопка .xHw7V.T0LP0.STlkX (Close snap preview) нажата после неудачи с Y7u8A, возврат к шагу снимка");
                  } else {
                    console.log("Кнопка .xHw7V.T0LP0.STlkX не найдена после неудачи с Y7u8A");
                  }
                } catch {
                  console.log("Кнопка .xHw7V.T0LP0.STlkX не появилась после неудачи с Y7u8A");
                }
                // Сразу переход к шагу снимка
                break;
              }
              y7u8aAttempts++;
              await new Promise(r => setTimeout(r, 500)); // уменьшена пауза до 0.5 сек
            }

            // 3. Ждём появления всех блоков JwhOC
            try {
              await page.waitForSelector(".JwhOC", { timeout: 5000 });
              await new Promise(r => setTimeout(r, 500)); // уменьшена пауза до 0.5 сек
              const jwhocBlocks = await page.$$(".JwhOC");
              if (jwhocBlocks.length > 0) {
                for (let i = 0; i < jwhocBlocks.length; i++) {
                  await jwhocBlocks[i].click();
                  console.log(`Блок JwhOC ${i+1} нажат`);
                  await new Promise(r => setTimeout(r, 500)); // уменьшена пауза до 0.5 сек
                }
                // 4. Ждём появления div.s53_U
                let s53uAttempts = 0;
                let s53uClicked = false;
                while (s53uAttempts < 3 && !s53uClicked) {
                  try {
                    await page.waitForSelector("div.s53_U", { timeout: 3000 });
                    await new Promise(r => setTimeout(r, 500)); // уменьшена пауза до 0.5 сек
                    const s53uDiv = await page.$("div.s53_U");
                    if (s53uDiv) {
                      await s53uDiv.click();
                      console.log("div.s53_U нажат");
                      s53uClicked = true;
                    } else {
                      console.log("div.s53_U не найден, попытка " + (s53uAttempts + 1));
                    }
                  } catch {
                    console.log("div.s53_U не появился, попытка " + (s53uAttempts + 1));
                  }
                  s53uAttempts++;
                  await new Promise(r => setTimeout(r, 500)); // уменьшена пауза до 0.5 сек
                }
                // Новый шаг: кнопка AJ_5h (Turn off camera)
                let aj5hAttempts = 0;
                let aj5hClicked = false;
                while (aj5hAttempts < 3 && !aj5hClicked) {
                  try {
                    await page.waitForSelector("button.AJ_5h", { timeout: 3000 });
                    await new Promise(r => setTimeout(r, 500));
                    const aj5hButton = await page.$("button.AJ_5h");
                    if (aj5hButton) {
                      await aj5hButton.click();
                      console.log("Кнопка AJ_5h (Turn off camera) нажата");
                      aj5hClicked = true;
                    } else {
                      console.log("Кнопка AJ_5h не найдена, попытка " + (aj5hAttempts + 1));
                    }
                  } catch {
                    console.log("Кнопка AJ_5h не появилась, попытка " + (aj5hAttempts + 1));
                  }
                  aj5hAttempts++;
                  await new Promise(r => setTimeout(r, 500));
                }
                if (!aj5hClicked) {
                  continue;
                }
                // 5. Возврат к шагу снимка
                let snapAttempts = 0;
                let snapFound = false;
                while (snapAttempts < 3 && !snapFound) {
                  try {
                    await page.waitForSelector(".fE2D5", { timeout: 3000 });
                    await new Promise(r => setTimeout(r, 500)); // уменьшена пауза до 0.5 сек
                    const snapButton = await page.$(".fE2D5");
                    if (snapButton) {
                      console.log("Готов к шагу снимка");
                      snapFound = true;
                      break; // выйти из while, чтобы цикл продолжился с шага снимка
                    } else {
                      console.log("Кнопка снимка не найдена, попытка " + (snapAttempts + 1));
                    }
                  } catch {
                    console.log("Кнопка снимка не появилась, попытка " + (snapAttempts + 1));
                  }
                  snapAttempts++;
                  await new Promise(r => setTimeout(r, 500)); // уменьшена пауза до 0.5 сек
                }
                if (!snapFound) {
                  console.log("Кнопка снимка не найдена за 3 попытки, возвращаемся к разблокировке");
                }
                // если snapFound, цикл продолжит с шага снимка
                continue;
              } else {
                console.log("Блоки JwhOC не найдены");
              }
            } catch {
              console.log("Блоки JwhOC не появились в течение 5 секунд");
            }
          } else {
            console.log("Кнопка отправки не найдена после снимка");
          }
        } else {
          console.log("Кнопка снимка не найдена после ожидания");
        }
      } catch {
        console.log("Кнопка снимка не появилась в течение 5 секунд после разблокировки");
      }
    } else {
      console.log("Кнопка разблокировки не найдена, ждём...");
    }

    await new Promise(r => setTimeout(r, 5000)); // проверяем каждые 5 секунд
  }

})();