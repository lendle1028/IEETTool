const { start, shutdown, setLogLevel, update } = require('webdriver-manager-replacement');
async function main() {
    console.log("123");
    setLogLevel('info');
    let options = {
        browserDrivers: [{
            name: 'geckodriver'     // For browser drivers, we just need to use a valid
            // browser driver name. Other possible values
            // include 'geckodriver' and 'iedriver'.
        }],
        server: {
            name: 'selenium',
            runAsNode: true,          // If we want to run as a node. By default
            // running as detached will set this to true.
            runAsDetach: true         // To run this in detached. This returns the
            // process back to the parent process.
        }
    };
    try {
        await update(options);
        await start(options);
        var webdriver = require('selenium-webdriver'),
            By = webdriver.By,
            until = webdriver.until;

        var driver = new webdriver.Builder()
            .forBrowser('firefox')
            //.forBrowser('chrome')
            .usingServer('http://localhost:4444/wd/hub')
            .build();
        driver.get('https://classroom.github.com/login');
        await driver.wait(until.elementLocated(By.className("btn-primary"), 600000));
        await driver.findElement(By.id('login_field')).sendKeys(username);
        await driver.findElement(By.id('password')).sendKeys(password);
        await driver.findElement(By.className("btn-primary")).click();
        await driver.wait(until.elementLocated(By.xpath("//h1[text()='" + course + "']"), 600000));
        let element = await driver.findElement(By.xpath("//h1[text()='" + course + "']"));
        element.click();
        await driver.wait(until.elementLocated(By.xpath("//a[text()='Manage classroom']"), 600000));
    } catch (e) { }
    shutdown(options);
};

main();