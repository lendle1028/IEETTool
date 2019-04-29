const GithubDownloadLinkExtractor=require("./GithubDownloadLinkExtractor");
const ScoreLoader=require("./ScoreLoader");
let scoreLoader=new ScoreLoader("lendle", "len1028");
let downloader=new GithubDownloadLinkExtractor("lendle1028", "len10281");
// scoreLoader.getScores("邏輯電路設計", "期中考", function(result){
//     console.log(result);
// });
scoreLoader.getScores("邏輯電路設計", "期中考").then(function(result){
    console.log(result);
});
// downloader.getDownloadLinks("視窗程式設計", "107 Final", function(result){
//     console.log(result);
// });