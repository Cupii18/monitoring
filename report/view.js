const fs = require('fs');
const puppeteer = require('puppeteer');
const mustache = require('mustache');


(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlBody = fs.readFileSync('./main.html', 'utf-8');
    const data = {
        
    };

    await page.setContent(mustache.render(htmlBody, data));
    const pdf = await page.pdf({ format: 'A4' });
    fs.writeFileSync("./report.pdf", pdf);

    page.close();
    browser.close();
})();