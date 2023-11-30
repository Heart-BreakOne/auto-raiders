const puppeteer = require('puppeteer');

//Stream raiders access token.
const authToken = 'Your token here, not URL encoded.';
const url = 'https://www.streamraiders.com';

//Install extension from the extension folder.
(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      `--disable-extensions-except=auto-raiders'`,
      `--load-extension=auto-raiders'`,
    ],
  });

  //Load new tab
  const page = await browser.newPage();

  //Set the authentication token
  await page.setCookie({
    name: 'ACCESS_INFO',
    value: authToken,
    domain: 'www.streamraiders.com',
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'None',
  });

  //Load stream raiders.
  await page.goto(url);

})();