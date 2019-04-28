require('geckodriver');
const jsonexport = require('jsonexport');
const request = require('request-promise');
const fs = require('fs');
// var username=process.argv[2];
// var password=process.argv[3];
// var course=process.argv[4];
// var examType=process.argv[5];

var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

var driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();

let visibleUrlCount = -1;
let roster = [];
async function paging(callback, lastExecutionCallback) {
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
}
async function prepareDownloads() {
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
                for(let student of elements){
                    let id=null;
                    try{
                        id=await student.findElement(By.className("assignment-repo-github-url"));
                    }catch(e){continue;}
                    id="@"+await id.getText();
                    let name = null;
                    for (let s of roster) {
                        if (s.id == id) {
                            name = s.name;
                            break;
                        }
                    }
                    let link=await student.findElement(By.className("repo-detail-item"));
                    link=await link.getAttribute("href");
                    if(!link){
                        //skip unsubmitted student
                        continue;
                    }
                    let values = link.split("/");
                    let owner = values[values.length - 4];
                    let repo = values[values.length - 3];
                    let url="https://api.github.com/repos/" + owner + "/" + repo + "/zipball";
                    let download = await request.get({
                        uri: url,
                        encoding: null,
                        headers: {
                            'User-Agent': 'gecko',
                            'Content-type': "application/zip"
                        },
                        resolveWithFullResponse: true
                    });
                    let buffer = Buffer.from(download.body);
                    let wstream = fs.createWriteStream(name + '.zip');
                    console.log(name + '.zip');
                    wstream.write(buffer);
                    wstream.end();
                }
                /*await driver.wait(until.elementLocated(By.xpath("//a[text()='View repository']"), 600000));
                let elements = await driver.findElements(By.xpath("//a[text()='View repository']"));
                //collect urls for students
                let urls = [];
                for (let link of elements) {
                    let href = await link.getAttribute("href");
                    let values = href.split("/");
                    let owner = values[values.length - 2];
                    let repo = values[values.length - 1];
                    urls.push("https://api.github.com/repos/" + owner + "/" + repo + "/zipball");
                }
                //collect student names
                let names = [];
                await driver.wait(until.elementLocated(By.className("assignment-repo-github-url"), 600000));
                let assignments = await driver.findElements(By.className("assignment-repo-github-url"));
                for (let assignment of assignments) {
                    let id = await assignment.getText();
                    id = "@" + id;
                    let name = null;
                    for (let s of roster) {
                        if (s.id == id) {
                            name = s.name;
                            break;
                        }
                    }
                    console.log(name);
                    names.push(name);
                }
                for (let i = 0; i < urls.length; i++) {
                    console.log(urls[i]);
                    let download = await request.get({
                        uri: urls[i],
                        encoding: null,
                        headers: {
                            'User-Agent': 'gecko',
                            'Content-type': "application/zip"
                        },
                        resolveWithFullResponse: true
                    });
                    let buffer = Buffer.from(download.body);
                    let wstream = fs.createWriteStream(names[i] + '.zip');
                    wstream.write(buffer);
                    wstream.end();
                }*/
            }, function(){
                driver.quit();
            }
        );
    }
}
async function main() {
    driver.get('https://classroom.github.com/login');
    await driver.wait(until.elementLocated(By.className("btn-primary"), 600000));
    await driver.findElement(By.id('login_field')).sendKeys("lendle1028");
    await driver.findElement(By.id('password')).sendKeys("len10281");
    await driver.findElement(By.className("btn-primary")).click();
    await driver.wait(until.elementLocated(By.xpath("//h1[text()='視窗程式設計']"), 600000));
    let element = await driver.findElement(By.xpath("//h1[text()='視窗程式設計']"));
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
        console.log(roster);
        let element = await driver.findElement(By.xpath("//a[text()='視窗程式設計']"));
        element.click();
        await driver.wait(until.elementLocated(By.xpath("//a[text()='107 Final']"), 600000));
        element = await driver.findElement(By.xpath("//a[text()='107 Final']"));
        element.click();
        setTimeout(prepareDownloads, 500);
    });
}

main();