import {Builder, By, Key, until} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'assert';

describe('User Login Test', function() {
    let driver;
  
    before(async function() {
      driver = await new Builder().forBrowser('chrome').build();
    });
  
    after(async function() {
      await driver.quit();
    });
  
    it('should display the correct title', async function() {
      await driver.get('http://localhost:3000');
      const title = await driver.getTitle();
      assert.equal(title, 'NYU Inclusive Forum');
    });

    it('should get to the login page', async function() {
      const LoginLink = await driver.findElement(By.id('LogIn'));
      await driver.manage().setTimeouts({implicit: 5000});
      await LoginLink.click();
      await driver.manage().setTimeouts({implicit: 5000});
      assert.equal(await driver.getCurrentUrl(), 'http://localhost:3000/login');
    });

    it('should login with correct credentials', async function() {
      const usernameText = await driver.findElement(By.id('username'));
      const passwordText = await driver.findElement(By.id('password'));
      const loginBtn = await driver.findElement(By.id('LoginBtn'));
      await usernameText.sendKeys('ky2138');
      await passwordText.sendKeys('123');
      await loginBtn.click();
      await driver.manage().setTimeouts({implicit: 5000});
      assert.equal(await driver.getCurrentUrl(), 'http://localhost:3000/');
    });

  it('should logout', async function() {
    assert.equal(await driver.getCurrentUrl(), 'http://localhost:3000/');
    const LogoutLink = await driver.findElement(By.id('logout-form'));
    await driver.manage().setTimeouts({implicit: 5000});
    await LogoutLink.click();
    await driver.manage().setTimeouts({implicit: 5000});
    assert.equal(await driver.getCurrentUrl(), 'http://localhost:3000/');
  });
});