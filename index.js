const GithubDownloadLinkExtractor=require("./GithubDownloadLinkExtractor");
let downloader=new GithubDownloadLinkExtractor("lendle1028", "len10281");
downloader.getDownloadLinks("視窗程式設計", "107 Final", function(result){
    console.log(result);
});