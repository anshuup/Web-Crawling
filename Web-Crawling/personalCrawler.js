const Crawler = require("crawler");
const fs = require('fs')
const matrix = require("./matrix.js")
const {Matrix} = require("ml-matrix");
var euclidean = require( 'compute-euclidean-distance' );
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017/';

const seen = {}
let array = []
let newArray = []
let incomingLink = 0;
let linkArray = []
let bodyArray = []
let id = 0;
let countNum = 0;

//performs crawler for personal website data
const c = new Crawler({
  maxConnections : 10,

  callback : function (error, res, done) {
    if(error){
      console.log(error);
    }
    else{
      let $ = res.$;
      let links = $("a")
      let title = ""
      let body = ""
      let paragraph = $("p")
      let breakLoop = true;
      let currentLink = "";
      //traverse through each link for upto 100 links (kept 100 since it takes longer to crawl at least 500 pages)
      $(links).each(function(i, item) {
        if(newArray.length < 500){
          //check if the link value is not undefined or starts withh # or starts with http or https(since they will navigate to other different pages)
          if($(item).attr("href") == undefined || $(item).attr("href") == "/" || $(item).attr("href").startsWith("#") || $(item).attr("href").startsWith("http:") ||  $(item).attr("href").startsWith("https:")){
          }
          else{
            //adding titles in array if it does not include and keeping track of title, body and current link of the current page
            if(!array.includes($("title").text())){
              array.push($("title").text())
              title = $("title").text()
              bodyArray.push($("p").text().replace(/\n|\r/g, " "))
              body = $("p").text().replace(/\n|\r/g, " ")
              if(title == "Soma-notes"){
                currentLink = "https://homeostasis.scs.carleton.ca/wiki/index.php/Main_Page"
              }
              else{
                let splitTitle = title.substring(0,title.length-13)
                currentLink = "https://homeostasis.scs.carleton.ca/wiki/index.php/" + splitTitle
              }
            }
            incomingLink++;
            linkArray.push("https://homeostasis.scs.carleton.ca" +$(item).attr('href'))
            //check if the link value is not undefined or starts withh # or starts with http or https(since they will navigate to other different pages)
            if($(item).attr("href") == undefined || $(item).attr("href") == "/" || $(item).attr("href").startsWith("#") || $(item).attr("href").startsWith("http:") || $(item).attr("href").startsWith("https:")){
            }
            else if (!$(item).attr("href").startsWith("https")){
              if(!$(item).attr("href").startsWith("javascript:print()")){
                //traverse through each link and if link is already seen then place it in array as seen = true so thaat it does not keep traversing
                $(item).each(function(j,link){
                  if(seen["https://homeostasis.scs.carleton.ca" +$(link).attr('href')]){
                    return;
                  }
                  seen["https://homeostasis.scs.carleton.ca" +$(link).attr('href')] = true;
                  c.queue("https://homeostasis.scs.carleton.ca" +$(link).attr('href'))
                })
              }
            }
          }
        }
      });
      let parsedInfo = {}
      if(title == ""){
      }
      else{
        //assigning id, title, current page link, number of link , body and pagerank value to array and pushing it in new Array which will be then
        //inserted into database once crawling is finished
        parsedInfo.id = id;
        parsedInfo.title = title
        parsedInfo.currLink = currentLink
        parsedInfo.count = incomingLink
        parsedInfo.links = linkArray
        parsedInfo.body = body
        parsedInfo.pageRankVal = 0
        newArray.push(parsedInfo)
        id = id + 1;
      }
      incomingLink = 0;
      title = ""
      linkArray = []
      body = ""
      if(breakLoop == false){
        return false;
      }
    }
    done();
  }
});
c.on('drain',function(){
  const dbName = 'pData';
  MongoClient.connect(url, function(err,db) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const dbo = db.db("pData")

    //insert newarray of all the values in database
    /*dbo.collection("pData").drop(function(err, delOK) {
      if (err) throw err;
      if (delOK) console.log("Collection deleted");
      db.close();
    });*/
    dbo.collection("p1Data").insertMany(newArray, function(err,result){
      if(err) throw err
      console.log("Inserted Documents")
      matrix.createMat("pData")
      console.log("Finished crawling personal data")
      db.close()
    })
  });
  console.log("Done.");
});
//Queue a URL, which starts the crawl
c.queue('https://homeostasis.scs.carleton.ca/wiki/index.php/Main_Page');
