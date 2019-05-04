window.$=require('jquery');
const remote=require('electron').remote;
const main=remote.require('./main');
$(document).ready(function(){
    let options={
        portalUserName: $("#portalUserName").val(),
        portalPassword: $("#portalPassword").val(),
        portalCourseName: $("#portalCourseName").val(),
        portalExamType: $("#portalExamType").val(),
        githubUserName: $("#githubUserName").val(),
        githubPassword: $("#githubPassword").val(),
        githubCourseName: $("#githubCourseName").val(),
        githubExamName: $("#githubExamName").val(),
        driver: $("#driver").val()
    };
    $("#goButton").click(function(){
        main.execute(options);
    });
});
/*
const GithubDownloadLinkExtractor=require("./GithubDownloadLinkExtractor");
const ScoreLoader=require("./ScoreLoader");
const fs=require("fs");
const path=require("path");
const jsonexport = require('jsonexport');
const request = require('request-promise');

const GROUP_THRESHOLD=5;//if number of students >= 3*GROUP_THRESHOLD, then do grouping
let scoreLoader=new ScoreLoader("lendle", "len1028", GROUP_THRESHOLD);
let downloader=new GithubDownloadLinkExtractor("lendle1028", "len10281");

// scoreLoader.getScores("邏輯電路設計", "期中考", function(result){
//     console.log(result);
// });
let scores=null;

let courseNamePortal="服務導向架構程式設計";
let courseNameGithub="服務導向@YZU";

async function downloadFromGithub(url, file){
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

scoreLoader.getScores(courseNamePortal, "期中考")
    .then(function(result){
        scores=result;
        console.log(scores);
        return downloader.getDownloadLinks(courseNameGithub, "Midterm");
    })
    .then(function(result){
        console.log(scores);
        if(fs.existsSync(courseNamePortal)){
            fs.rmdirSync(courseNamePortal);
        }
        fs.mkdirSync(courseNamePortal);
        fs.mkdirSync(path.join(courseNamePortal, "同學作答"));
        jsonexport(scores, function (err, csv) {
            if (err) return console.log(err);
            //console.log(csv);
            fs.writeFileSync(path.join(courseNamePortal, "scores.csv"), csv);
        });
        if(scores.length<3*GROUP_THRESHOLD){
            for(let record of result){
                downloadFromGithub(record.url, path.join(courseNamePortal, "同學作答", record.studentId+"_"+record.name+".zip"));
            }
        }else{
            let name2RecordMap={};
            for(let record of result){
                name2RecordMap[record.name]=record;
            }
            let clonedScoresList=[...scores];
            for(let s of clonedScoresList){
                if(name2RecordMap[s.name] && s.level.length>0){
                    let record=name2RecordMap[s.name];
                    let folder=path.join(courseNamePortal, "同學作答", s.level);
                    if(!fs.existsSync(folder)){
                        fs.mkdirSync(folder);
                    }
                    downloadFromGithub(record.url, path.join(folder, record.studentId+"_"+record.name+".zip"));
                }
            }
        }
    });

*/
//服務導向@YZU

// scoreLoader.getScores("邏輯電路設計", "期中考")
//     .then(function(result){
//         scores=result;
//         console.log(scores);
//         return downloader.getDownloadLinks("視窗程式設計", "107 Final");
//     })
//     .then(function(result){
//         console.log(result);
//     });
