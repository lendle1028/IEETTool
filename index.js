const GithubDownloadLinkExtractor=require("./GithubDownloadLinkExtractor");
const ScoreLoader=require("./ScoreLoader");
let scoreLoader=new ScoreLoader("lendle", "len1028");
let downloader=new GithubDownloadLinkExtractor("lendle1028", "len10281");
// scoreLoader.getScores("邏輯電路設計", "期中考", function(result){
//     console.log(result);
// });
let scores=null;

scoreLoader.getScores("邏輯電路設計", "期中考")
    .then(function(result){
        scores=result;
        console.log(scores);
        
    });

// scoreLoader.getScores("邏輯電路設計", "期中考")
//     .then(function(result){
//         scores=result;
//         console.log(scores);
//         return downloader.getDownloadLinks("視窗程式設計", "107 Final");
//     })
//     .then(function(result){
//         console.log(result);
//     });
