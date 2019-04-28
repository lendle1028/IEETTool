require('geckodriver');
const jsonexport=require('jsonexport');
var username=process.argv[2];
var password=process.argv[3];
var course=process.argv[4];
var examType=process.argv[5];

var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

var driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();

driver.get('https://portalx.yzu.edu.tw/PortalSocialVB/Login.aspx');
driver.findElement(By.id('Txt_UserID')).sendKeys(username);
driver.findElement(By.id('Txt_Password')).sendKeys(password);
driver.findElement(By.id("ibnSubmit")).click();
async function enter(){
    //await driver.wait(until.elementLocated(By.id("MainLeftMenu_divMyPage"), 600000));
    await driver.wait(until.elementLocated(By.xpath("//div[@id='MainLeftMenu_divMyPage']/table/tbody/tr/td"), 600000));
    let elements=await driver.findElements(By.xpath("//div[@id='MainLeftMenu_divMyPage']/table/tbody/tr/td[text()='"+course+"']"));
    let td=elements[0];
    td.click();
    await driver.wait(until.elementLocated(By.id("divMenuSco"), 600000));
    let divMenuSco=await driver.findElement(By.id("divMenuSco"));
    divMenuSco.click();
    await driver.wait(until.elementLocated(By.xpath("//a[text()='"+examType+"']"), 600000));
    elements=await driver.findElements(By.xpath("//a[text()='"+examType+"']"));
    let exam=await elements[0];
    exam.click();
    await driver.wait(until.elementLocated(By.className("record2"), 600000));
    let record2s=await driver.findElements(By.className("record2"));
    let hi_lines=await driver.findElements(By.className("hi_line"));
    let results=[];
    if(record2s){
        for(let record2 of record2s){
            let tds=await record2.findElements(By.tagName("td"));
            results.push({
                id: await tds[1].getText(),
                name: await tds[2].getText(),
                score: await tds[5].getText()
            });
        }
    }

    if(hi_lines){
        for(let hi_line of hi_lines){
            let tds=await hi_line.findElements(By.tagName("td"));
            results.push({
                id: await tds[1].getText(),
                name: await tds[2].getText(),
                score: await tds[5].getText()
            });
        }
    }

    console.log(results);

    results.sort(function(o1, o2){
        return parseFloat(o1.score)-parseFloat(o2.score);
    });
    jsonexport(results, function(err, csv){
        if(err) return console.log(err);
        console.log(csv);
    });

    driver.quit();
};
enter();
//driver.quit();