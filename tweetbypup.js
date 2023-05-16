import puppeteer from "puppeteer";

(async () => {
    // Launch browser and navigate to Twitter login page
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://twitter.com/i/flow/login', { waitUntil: 'networkidle2' });

    // Fill in login credentials and click login button
    // await page.type('input[name="session[username_or_email]"]', 'your_username');
    // const inputField = await page.$x(`//input[@class="r-30o5oe"]`);
    const inputField = await page.$('.r-30o5oe');
    await inputField.type('solana_faqs');

    await page.waitForSelector('.css-18t94o4');
    await page.click('.css-18t94o4');

    // await page.type('input[name="session[password]"]', 'your_password');
    // await page.click('div[data-testid="LoginForm_Login_Button"]');

    // // Wait for successful login and tweet input field to appear
    // await page.waitForSelector('div[data-testid="tweetTextarea_0"]');

    // // Enter tweet text and click tweet button
    // await page.type('div[data-testid="tweetTextarea_0"]', 'Hello, Twitter!');
    // await page.click('div[data-testid="tweetButtonInline"]');

    // // Wait for tweet to be posted (optional)
    // await page.waitForTimeout(2000);

    // Close the browser
    // await browser.close();
})();
