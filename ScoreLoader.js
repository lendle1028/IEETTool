//require('geckodriver');

class ScoreLoader {
    constructor(username, password, groupThreshold = 5, browser="firefox") {
        this.username = username;
        this.password = password;
        this.groupThreshold = groupThreshold;
        this.browser=browser;
    }

    getScores(courseName, examName) {
        let username = this.username;
        let password = this.password;
        let course = courseName;
        let examType = examName;
        let groupThreshold=this.groupThreshold;
        let browser=this.browser;
        return new Promise(function (resolve, reject) {
            let main = async function () {
                try {
                    var webdriver = require('selenium-webdriver'),
                        By = webdriver.By,
                        until = webdriver.until;

                    var driver = new webdriver.Builder()
                        .forBrowser(browser)
                        //.usingServer("http://localhost:4444/wd/hub")
                        .build();

                    await driver.get('https://portalx.yzu.edu.tw/PortalSocialVB/Login.aspx');
                    let element=await driver.findElement(By.id('Txt_UserID'));
                    await element.sendKeys(username);
                    element=await driver.findElement(By.id('Txt_Password'));
                    await element.sendKeys(password);
                    element=await driver.findElement(By.id('ibnSubmit'));
                    await element.click();
                    await driver.wait(until.elementLocated(By.xpath("//div[@id='MainLeftMenu_divMyPage']/table/tbody/tr/td"), 900000));
                    let elements = await driver.findElements(By.xpath("//div[@id='MainLeftMenu_divMyPage']/table/tbody/tr/td[text()='" + course + "']"));
                    let td = elements[0];
                    td.click();
                    await driver.wait(until.elementLocated(By.id("divMenuSco"), 900000));
                    let divMenuSco = await driver.findElement(By.id("divMenuSco"));
                    divMenuSco.click();
                    await driver.wait(until.elementLocated(By.xpath("//a[text()='" + examType + "']"), 900000));
                    elements = await driver.findElements(By.xpath("//a[text()='" + examType + "']"));
                    let exam = await elements[0];
                    exam.click();
                    await driver.wait(until.elementLocated(By.className("record2"), 900000));
                    let record2s = await driver.findElements(By.className("record2"));
                    let hi_lines = await driver.findElements(By.className("hi_line"));
                    let results = [];
                    if (record2s) {
                        for (let record2 of record2s) {
                            let tds = await record2.findElements(By.tagName("td"));
                            results.push({
                                id: await tds[1].getText(),
                                name: await tds[2].getText(),
                                score: await tds[5].getText(),
                                level: ""
                            });
                        }
                    }

                    if (hi_lines) {
                        for (let hi_line of hi_lines) {
                            let tds = await hi_line.findElements(By.tagName("td"));
                            results.push({
                                id: await tds[1].getText(),
                                name: await tds[2].getText(),
                                score: await tds[5].getText(),
                                level: ""
                            });
                        }
                    }

                    //console.log(results);

                    results.sort(function (o1, o2) {
                        return parseFloat(o1.score) - parseFloat(o2.score);
                    });

                    if (results.length >= 3 * groupThreshold) {
                        for (let i = 0; i < groupThreshold; i++) {
                            results[i].level = "低";
                        }
                        for (let i = results.length - groupThreshold; i < results.length; i++) {
                            results[i].level = "高";
                        }
                        let mid = Math.ceil(results.length / 2);
                        let offset = Math.floor(groupThreshold / 2);
                        //console.log("offset="+offset+", mid="+mid);
                        for (let i = mid - offset; i <= mid + offset; i++) {
                            //console.log(results[i].level);
                            if (results[i].level.length==0) {
                                results[i].level = "中";
                            }
                        }
                    }

                    driver.quit();
                    resolve(results);
                } catch (e) {
                    reject(e);
                }
            }

            main();
        });

    }
}

module.exports = ScoreLoader;

// let scoreLoader=new ScoreLoader("lendle", "len1028");
// scoreLoader.getScores("邏輯電路設計", "期中考", function(results){
//     console.log(results);
// });

// var username = process.argv[2];
// var password = process.argv[3];
// var course = process.argv[4];
// var examType = process.argv[5];

// var webdriver = require('selenium-webdriver'),
//     By = webdriver.By,
//     until = webdriver.until;

// var driver = new webdriver.Builder()
//     .forBrowser('firefox')
//     .build();

// driver.get('https://portalx.yzu.edu.tw/PortalSocialVB/Login.aspx');
// driver.findElement(By.id('Txt_UserID')).sendKeys(username);
// driver.findElement(By.id('Txt_Password')).sendKeys(password);
// driver.findElement(By.id("ibnSubmit")).click();
// async function enter() {
//     //await driver.wait(until.elementLocated(By.id("MainLeftMenu_divMyPage"), 600000));
//     await driver.wait(until.elementLocated(By.xpath("//div[@id='MainLeftMenu_divMyPage']/table/tbody/tr/td"), 600000));
//     let elements = await driver.findElements(By.xpath("//div[@id='MainLeftMenu_divMyPage']/table/tbody/tr/td[text()='" + course + "']"));
//     let td = elements[0];
//     td.click();
//     await driver.wait(until.elementLocated(By.id("divMenuSco"), 600000));
//     let divMenuSco = await driver.findElement(By.id("divMenuSco"));
//     divMenuSco.click();
//     await driver.wait(until.elementLocated(By.xpath("//a[text()='" + examType + "']"), 600000));
//     elements = await driver.findElements(By.xpath("//a[text()='" + examType + "']"));
//     let exam = await elements[0];
//     exam.click();
//     await driver.wait(until.elementLocated(By.className("record2"), 600000));
//     let record2s = await driver.findElements(By.className("record2"));
//     let hi_lines = await driver.findElements(By.className("hi_line"));
//     let results = [];
//     if (record2s) {
//         for (let record2 of record2s) {
//             let tds = await record2.findElements(By.tagName("td"));
//             results.push({
//                 id: await tds[1].getText(),
//                 name: await tds[2].getText(),
//                 score: await tds[5].getText()
//             });
//         }
//     }

//     if (hi_lines) {
//         for (let hi_line of hi_lines) {
//             let tds = await hi_line.findElements(By.tagName("td"));
//             results.push({
//                 id: await tds[1].getText(),
//                 name: await tds[2].getText(),
//                 score: await tds[5].getText()
//             });
//         }
//     }

//     console.log(results);

//     results.sort(function (o1, o2) {
//         return parseFloat(o1.score) - parseFloat(o2.score);
//     });
//     jsonexport(results, function (err, csv) {
//         if (err) return console.log(err);
//         console.log(csv);
//     });

//     driver.quit();
// };
// enter();
//driver.quit();