const GithubDownloadLinkExtractor=require("./GithubDownloadLinkExtractor");
const ScoreLoader=require("./ScoreLoader");
const fs=require("fs");
const path=require("path");
const jsonexport = require('jsonexport');
const request = require('request-promise');

let scoreLoader=new ScoreLoader("lendle", "len1028");
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
            
        if(scores.length<15){
            fs.mkdirSync(path.join(courseNamePortal, "同學作答"));
            for(let record of result){
                downloadFromGithub(record.url, path.join(courseNamePortal, "同學作答", record.studentId+"_"+record.name+".zip"));
            }
            jsonexport(scores, function (err, csv) {
                if (err) return console.log(err);
                //console.log(csv);
                fs.writeFileSync(path.join(courseNamePortal, "scores.csv"), csv);
            });
        }else{

        }
    });
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
