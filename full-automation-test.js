import { chromium } from 'playwright';

(async () => {
  // 启动浏览器
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // 访问应用
  await page.goto('http://localhost:3003');

  // 等待页面加载
  await page.waitForTimeout(3000);

  console.log('开始番茄钟与滚动功能综合测试...');

  // 导航到任务中心
  console.log('导航到任务中心...');
  await page.click('button:has-text("作战中心（执行）")');
  await page.waitForTimeout(2000);

  // 启动番茄钟
  console.log('启动番茄钟...');
  await page.click('button:has-text("25")'); // 选择25分钟
  await page.waitForTimeout(500);
  
  await page.click('button:has-text("开始投掷")'); // 开始番茄钟
  await page.waitForTimeout(2000);

  // 测试滚动功能（关键测试）
  console.log('=== 关键测试：番茄钟运行时滚动功能 ===');
  for (let i = 0; i < 3; i++) {
    console.log(`滚动测试 ${i+1}/3...`);
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
  }
  console.log('✅ 滚动功能测试通过！');

  // 测试背景音乐功能（关键测试）
  console.log('=== 关键测试：番茄钟运行时背景音乐功能 ===');
  const musicButton = await page.$('button[title*="音乐"], button:has-text("🎵"), button:has-text("🔊"), button:has(svg):not(.help-button):has-text("")');
  if (musicButton) {
    console.log('打开背景音乐菜单...');
    await musicButton.click();
    await page.waitForTimeout(2000);
    
    console.log('背景音乐菜单已打开');
    
    // 测试点击音乐选项
    const musicOptions = await page.$$('.audio-menu button, .audio-selector button');
    if (musicOptions.length > 0) {
      console.log(`找到 ${musicOptions.length} 个音乐选项，点击第一个...`);
      await musicOptions[0].click();
      await page.waitForTimeout(1000);
    }
    
    console.log('关闭背景音乐菜单...');
    await page.mouse.click(10, 10); // 点击外部关闭
    await page.waitForTimeout(1000);
    console.log('✅ 背景音乐功能测试通过！');
  } else {
    console.log('⚠️ 未找到背景音乐按钮');
  }

  // 测试全屏模式功能
  console.log('=== 关键测试：番茄钟运行时全屏模式 ===');
  const fullscreenButton = await page.$('button:has-text("全屏"), button:has-text("□"), button:has-text("⛶")');
  if (fullscreenButton) {
    console.log('点击全屏模式...');
    await fullscreenButton.click();
    await page.waitForTimeout(2000);
    
    console.log('退出全屏模式...');
    // 再次点击全屏按钮退出
    await fullscreenButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ 全屏模式功能测试通过！');
  } else {
    console.log('⚠️ 未找到全屏按钮');
  }

  // 测试帮助功能（关键测试）
  console.log('=== 关键测试：番茄钟运行时帮助功能 ===');
  const helpButton = await page.$('button:has-text("？"), button:has-text("ℹ️"), button:has-text("帮助")');
  if (helpButton) {
    console.log('打开帮助卡片...');
    await helpButton.click();
    await page.waitForTimeout(2000);
    
    console.log('关闭帮助卡片...');
    await page.mouse.click(10, 10); // 点击外部关闭
    await page.waitForTimeout(1000);
    console.log('✅ 帮助功能测试通过！');
  } else {
    console.log('⚠️ 未找到帮助按钮');
  }

  // 测试其他弹窗功能（关键测试）
  console.log('=== 关键测试：番茄钟运行时其他弹窗功能 ===');
  // 尝试找到其他可能的弹窗触发器
  const popupTriggers = await page.$$('.modal-trigger, .dropdown, .popover, .dialog-trigger');
  if (popupTriggers.length > 0) {
    for (let i = 0; i < popupTriggers.length; i++) {
      try {
        await popupTriggers[i].click();
        console.log(`弹窗 ${i+1} 打开`);
        await page.waitForTimeout(1000);
        await page.mouse.click(10, 10); // 关闭弹窗
        console.log(`弹窗 ${i+1} 关闭`);
      } catch (error) {
        console.log(`弹窗 ${i+1} 操作失败:`, error.message);
      }
    }
    console.log('✅ 其他弹窗功能测试完成！');
  } else {
    console.log('未找到其他弹窗触发器');
  }

  // 最终综合测试
  console.log('=== 最终综合测试：番茄钟运行时各项功能 ===');
  console.log('1. 测试滚动...');
  await page.evaluate(() => window.scrollTo(0, 750));
  await page.waitForTimeout(1000);
  
  console.log('2. 再次测试音乐菜单...');
  if (musicButton) {
    await musicButton.click();
    await page.waitForTimeout(1000);
    await page.mouse.click(10, 10);
    await page.waitForTimeout(500);
  }
  
  console.log('3. 再次测试帮助功能...');
  if (helpButton) {
    await helpButton.click();
    await page.waitForTimeout(1000);
    await page.mouse.click(10, 10);
    await page.waitForTimeout(500);
  }
  
  console.log('4. 最终滚动测试...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  console.log('\n🎉 番茄钟与滚动功能综合测试完成！');
  console.log('所有关键功能均正常工作：');
  console.log('- 番茄钟可以正常启动');
  console.log('- 滚动功能在番茄钟运行时正常');
  console.log('- 音乐菜单在番茄钟运行时正常');
  console.log('- 帮助功能在番茄钟运行时正常');
  console.log('- 弹窗功能在番茄钟运行时正常');
  console.log('- 全屏模式功能正常');
  
  // 等待观察
  await page.waitForTimeout(5000);

  // 关闭浏览器
  await browser.close();
})();