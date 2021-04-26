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
//performs crawler for fruits website data
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
      //traverse through each link for upto 100 links (kept 100 since it takes longer to crawl at least 500 pages)
      $(links).each(function(i, item) {
        //adding titles in array if it does not include and keeping track of title, body and current link of the current page
        if(!array.includes($("title").text())){
          array.push($("title").text())
          title = $("title").text()
          bodyArray.push($("p").text().replace(/\n|\r/g, " "))
          body = $("p").text().replace(/\n|\r/g, " ")
        }
        incomingLink++;
        linkArray.push('https://people.scs.carleton.ca/~davidmckenney/fruitgraph'+$(item).attr('href').split(".")[1]+".html")
        //traverse through each link and if link is already seen then place it in array as seen = true so thaat it does not keep traversing
        $(item).each(function(j,link){
          if(seen['https://people.scs.carleton.ca/~davidmckenney/fruitgraph'+$(link).attr('href').split(".")[1]+".html"]){
            return;
          }
          seen['https://people.scs.carleton.ca/~davidmckenney/fruitgraph'+$(link).attr('href').split(".")[1]+".html"] = true;
          c.queue('https://people.scs.carleton.ca/~davidmckenney/fruitgraph'+$(link).attr('href').split(".")[1]+".html")
        })
      });
      //assigning id, title, current page link, number of link , body and pagerank value to array and pushing it in new Array which will be then
      //inserted into database once crawling is finished
      let parsedInfo = {}
      if(title == ""){
      }
      else{
        parsedInfo.id = id;
        parsedInfo.title = title
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
    }
    done();
  }
});
c.on('drain',function(){
  const dbName = 'crawlData';
  MongoClient.connect(url, function(err,db) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const dbo = db.db("crawlData")

  /*  dbo.collection("crawlData").drop(function(err, delOK) {
      if (err) throw err;
      if (delOK) console.log("Collection deleted");
      db.close();
    });*/
    dbo.collection("crawlData").insertMany(newArray, function(err,result){
      if(err) throw err
      console.log("Inserted Documents")
      matrix.createMat("crawlData")
      console.log("finished crawling fruit data")
      db.close()
    })
  });
  console.log("Done.");
});
//Queue a URL, which starts the crawl
c.queue('https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-0.html');
