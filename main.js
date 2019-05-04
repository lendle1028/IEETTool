const { app, BrowserWindow, Menu } = require('electron');
const { start, shutdown, setLogLevel, update } = require('webdriver-manager-replacement');
const process=require('process');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null;

function createWindow() {
    win = new BrowserWindow({ width: 800, height: 600 });
    win.loadFile('index.html');
    win.on('closed', () => {
        win = null;
    })
}

let serverOptions={};

async function execute(options) {
    const GithubDownloadLinkExtractor = require("./GithubDownloadLinkExtractor");
    const ScoreLoader = require("./ScoreLoader");
    const fs = require("fs");
    const path = require("path");
    const jsonexport = require('jsonexport');
    const request = require('request-promise');
    const BROWSER_MAPPINGS={
        "chromedriver": "chrome",
        "geckodriver": "firefox"
    };
    serverOptions={
        browserDrivers: [{
            name: options.driver     // For browser drivers, we just need to use a valid
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
    setLogLevel('info');
    
    await update(serverOptions);
    await start(serverOptions);

    const GROUP_THRESHOLD = 5;//if number of students >= 3*GROUP_THRESHOLD, then do grouping
    let scoreLoader = new ScoreLoader(options.portalUserName, options.portalPassword, GROUP_THRESHOLD, BROWSER_MAPPINGS[options.driver]);
    let downloader = new GithubDownloadLinkExtractor(options.githubUserName, options.githubPassword, BROWSER_MAPPINGS[options.driver]);

    // scoreLoader.getScores("邏輯電路設計", "期中考", function(result){
    //     console.log(result);
    // });
    let scores = null;

    let courseNamePortal = options.portalCourseName;
    let courseNameGithub = options.githubCourseName;

    async function downloadFromGithub(url, file) {
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
        let wstream = fs.createWriteStream(file);
        console.log(file);
        await wstream.write(buffer);
        wstream.end();
    }

    scoreLoader.getScores(courseNamePortal, options.portalExamType)
        .then(function (result) {
            scores = result;
            console.log(scores);
            return downloader.getDownloadLinks(courseNameGithub, options.githubExamName);
        })
        .then(function (result) {
            console.log(scores);
            if (fs.existsSync(courseNamePortal)) {
                fs.rmdirSync(courseNamePortal);
            }
            fs.mkdirSync(courseNamePortal);
            fs.mkdirSync(path.join(courseNamePortal, "同學作答"));
            jsonexport(scores, function (err, csv) {
                if (err) return console.log(err);
                //console.log(csv);
                fs.writeFileSync(path.join(courseNamePortal, "scores.csv"), csv);
            });
            if (scores.length < 3 * GROUP_THRESHOLD) {
                for (let record of result) {
                    downloadFromGithub(record.url, path.join(courseNamePortal, "同學作答", record.studentId + "_" + record.name + ".zip"));
                }
            } else {
                let name2RecordMap = {};
                for (let record of result) {
                    name2RecordMap[record.name] = record;
                }
                let clonedScoresList = [...scores];
                for (let s of clonedScoresList) {
                    if (name2RecordMap[s.name] && s.level.length > 0) {
                        let record = name2RecordMap[s.name];
                        let folder = path.join(courseNamePortal, "同學作答", s.level);
                        if (!fs.existsSync(folder)) {
                            fs.mkdirSync(folder);
                        }
                        downloadFromGithub(record.url, path.join(folder, record.studentId + "_" + record.name + ".zip"));
                    }
                }
            }
            //shutdown(serverOptions);
        });
}

module.exports={execute};
app.on('ready', createWindow);
app.on('window-all-closed', function(){
    console.log("shutdown......");
    shutdown(serverOptions);
});