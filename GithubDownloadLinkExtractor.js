require('geckodriver');
const request = require('request-promise');
const fs = require('fs');

class GithubDownloadLinkExtractor {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    getDownloadLinks(course, examName, returnCallback) {
        var username = this.username;
        var password = this.password;
        var webdriver = require('selenium-webdriver'),
            By = webdriver.By,
            until = webdriver.until;

        var driver = new webdriver.Builder()
            .forBrowser('firefox')
            .build();

        let visibleUrlCount = -1;
        let roster = [];
        let result=[];
        let paging = async function (callback, lastExecutionCallback) {
            while (true) {
                await callback();
                try {
                    element = await driver.findElement(By.className("next"));
                    if (!element) {
                        break;
                    }
                    let classValue = await element.getAttribute("class");
                    if (classValue.indexOf("disable") != -1) {
                        break;
                    }
                    let url = await element.getAttribute("href");
                    await driver.get(url);
                } catch (e) {
                    break;
                }
            }
            await lastExecutionCallback();
        };
        let prepareDownloads = async function () {
            await driver.wait(until.elementLocated(By.xpath("//a[text()='View repository']"), 600000));
            let elements = await driver.findElements(By.xpath("//a[text()='View repository']"));
            if (visibleUrlCount == -1 || elements.length != visibleUrlCount) {
                visibleUrlCount = elements.length;
                setTimeout(prepareDownloads, 500);
            } else {
                paging(
                    async function () {
                        await driver.wait(until.elementLocated(By.className("assignment-repo-list-item"), 600000));
                        let elements = await driver.findElements(By.className("assignment-repo-list-item"));
                        for (let student of elements) {
                            let id = null;
                            try {
                                id = await student.findElement(By.className("assignment-repo-github-url"));
                            } catch (e) { continue; }
                            id = "@" + await id.getText();
                            let name = null;
                            for (let s of roster) {
                                if (s.id == id) {
                                    name = s.name;
                                    break;
                                }
                            }
                            let link = await student.findElement(By.className("repo-detail-item"));
                            link = await link.getAttribute("href");
                            if (!link) {
                                //skip unsubmitted student
                                continue;
                            }
                            let values = link.split("/");
                            let owner = values[values.length - 4];
                            let repo = values[values.length - 3];
                            let url = "https://api.github.com/repos/" + owner + "/" + repo + "/zipball";
                            result.push({
                                id: id.substring(1),
                                url: url
                            });
                        }

                    }, function () {
                        driver.quit();
                        returnCallback(result);
                    }
                );
            }
        };
        let main = async function () {
            driver.get('https://classroom.github.com/login');
            await driver.wait(until.elementLocated(By.className("btn-primary"), 600000));
            await driver.findElement(By.id('login_field')).sendKeys(username);
            await driver.findElement(By.id('password')).sendKeys(password);
            await driver.findElement(By.className("btn-primary")).click();
            await driver.wait(until.elementLocated(By.xpath("//h1[text()='" + course + "']"), 600000));
            let element = await driver.findElement(By.xpath("//h1[text()='" + course + "']"));
            element.click();
            await driver.wait(until.elementLocated(By.xpath("//a[text()='Manage classroom']"), 600000));
            element = await driver.findElement(By.xpath("//a[text()='Manage classroom']"));
            element.click();
            await driver.wait(until.elementLocated(By.xpath("//a[text()='Roster management']"), 600000));
            element = await driver.findElement(By.xpath("//a[text()='Roster management']"));
            element.click();

            paging(async function () {
                await driver.wait(until.elementLocated(By.className("assignment-list-item"), 600000));
                let elements = await driver.findElements(By.className("assignment-list-item"));
                for (let item of elements) {
                    let name = await item.findElement(By.className("assignment-name-link"));
                    let id = await item.findElement(By.tagName("a"));
                    if ((await id.getText()) != "Link to GitHub account") {
                        roster.push({
                            name: await name.getText(),
                            id: await id.getText()
                        });
                    }
                }
            }, async function () {
                //console.log(roster);
                let element = await driver.findElement(By.xpath("//a[text()='" + course + "']"));
                element.click();
                await driver.wait(until.elementLocated(By.xpath("//a[text()='" + examName + "']"), 600000));
                element = await driver.findElement(By.xpath("//a[text()='" + examName + "']"));
                element.click();
                setTimeout(prepareDownloads, 500);
            });
        };
        main();
    }
}

module.exports=GithubDownloadLinkExtractor;