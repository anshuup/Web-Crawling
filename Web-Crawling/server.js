const fs = require("fs");
const express = require("express")
const bodyParser = require('body-parser');
let app = express();
const http = require('http').createServer(app);
const pug = require('pug')
const elasticlunr = require("elasticlunr");


const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017/';
let myArray = []

let allArray = []

app.set("view engine", "pug");
app.use(express.static(__dirname + "/public"))
app.use(bodyParser.urlencoded({ extended: true }));

//loads main page
app.get("/",(req,res) => {
	res.render("mainPage")
})
//navigates to seearch in fruits data
app.get("/fruits",(req,res) => {
	res.render("fruitsPage")
})
//navigates to seearch in personal data
app.get("/personal",(req,res) => {
	res.render("webPage")
})

app.get("/fruitsList",displaySearchedPages)
app.get("/fruitsList/:uid",displayFruitInfo)
app.get("/personalList",displayPersonalSearchPages)
app.get("/personalList/:uid",displayPersonalInfo)

function sortByProperty(property){
   return function(a,b){
      if(a[property] > b[property])
         return 1;
      else if(a[property] < b[property])
         return -1;

      return 0;
   }
}
//displays searched pages for thr fruits
function displaySearchedPages(req,res,next){
	let array = []
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db("crawlData");
		dbo.collection("crawlData").find({}).toArray(function(err, result) {
			if (err) throw err;
			var index = elasticlunr()

			//indexing fields
			index.addField("title")
			index.addField("body")
			index.addField("pageRankVal")
			index.setRef('id');

			for(i=0;i<result.length;i++){
				index.addDoc(result[i])
			}
			const queries = [
				req.query.name
			]
			let idArray = []
			queries.forEach(query =>{
				if(index.search(query).length == 0 || index.search(query) == "undefined" ){
					res.send("Could not find the query")
				}
				else{
					//display requestedd number of pages
					for(i=0;i<req.query.maxPages;i++){
						//checks if requried boosting
						if(req.query.boost == "true"){
							let arrayList = {}
							idArray.push(parseInt(index.search(query)[i].ref))
							//boosting search score
							arrayList.searchScore = index.search(query)[i].score + (0.1 * result[parseInt(index.search(query)[i].ref)].pageRankVal)
							arrayList.title  = result[parseInt(index.search(query)[i].ref)].title
							arrayList.url  = 'https://people.scs.carleton.ca/~davidmckenney/fruitgraph/'+result[parseInt(index.search(query)[i].ref)].title + ".html"
							arrayList.pageRank = result[parseInt(index.search(query)[i].ref)].pageRankVal
							array.push(arrayList)
							array.sort(sortByProperty("searchScore"))
						}
						//if boosting is not required then do not boost
						if(req.query.boost == "false"){
							let arrayList = {}
							idArray.push(parseInt(index.search(query)[i].ref))
							arrayList.searchScore = index.search(query)[i].score
							arrayList.title  = result[parseInt(index.search(query)[i].ref)].title
							arrayList.url  = 'https://people.scs.carleton.ca/~davidmckenney/fruitgraph/'+result[parseInt(index.search(query)[i].ref)].title + ".html"
							arrayList.pageRank = result[parseInt(index.search(query)[i].ref)].pageRankVal
							array.push(arrayList)
						}
					}
					res.render("fruitsPageList",{array:array})
				}
			})
			db.close()
			next()
		});
	})
}
//displays particular fruit info
function displayFruitInfo(req,res,next){
	let title = req.params.uid
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db("crawlData");
		dbo.collection("crawlData").find({}).toArray(function(err, result) {
			if (err) throw err;
			let found = false;
			for(i = 0; i<result.length;i++){
				if(result[i].title == title){
					found = true;
					res.render("fruitObtainedInfo",{fruitInfo:result[i]})
					break;
				}
			}
			if(found == false){
				res.send("No info")
			}
			db.close();
		});
	});
}
//simialr as displaying fruits page list, but displays personal website data
function displayPersonalSearchPages(req,res,next){
	let array = []
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db("pData");
		dbo.collection("p1Data").find({}).toArray(function(err, result) {
			if (err) throw err;
			var index = elasticlunr()

			//indexing fields
			index.addField("title")
			index.addField("body")
			index.addField("pageRankVal")
			index.setRef('id');

			for(i=0;i<result.length;i++){
				index.addDoc(result[i])
			}
			const queries = [
				req.query.name
			]
			let idArray = []
			if(req.query.name == "undefined"){
				res.send("Could not find the query")
			}
			queries.forEach(query =>{
				if(index.search(query).length == 0 || index.search(query) == "undefined" ){
					res.send("Could not find the query")
				}
				else{
					//display requested number of pages
					for(i=0;i<req.query.maxPages;i++){
						//if requested for boosting then boost the page using search score otherwise perform regular search
						if(req.query.boost == "true"){
							let arrayList = {}
							if(index.search(query)[i] == undefined){
							}
							else{
								idArray.push(parseInt(index.search(query)[i].ref))
								arrayList.searchScore = index.search(query)[i].score + (0.1 * result[parseInt(index.search(query)[i].ref)].pageRankVal)
								arrayList.title  = result[parseInt(index.search(query)[i].ref)].title
								arrayList.url  = result[parseInt(index.search(query)[i].ref)].currLink
								arrayList.pageRank = result[parseInt(index.search(query)[i].ref)].pageRankVal
								array.push(arrayList)
								array.sort(sortByProperty("pageRank"))
							}
						}
						if(req.query.boost == "false"){
							let arrayList = {}
							idArray.push(parseInt(index.search(query)[i].ref))
							arrayList.searchScore = index.search(query)[i].score
							arrayList.title  = result[parseInt(index.search(query)[i].ref)].title
							arrayList.url  = result[parseInt(index.search(query)[i].ref)].currLink
							arrayList.pageRank = result[parseInt(index.search(query)[i].ref)].pageRankVal
							array.push(arrayList)
						}
					}
					res.render("webList",{array:array})
				}
			})
			db.close()
			next()
		});
	})
}
//displays particular requested page info
function displayPersonalInfo(req,res,next){
	let title = req.params.uid
	MongoClient.connect(url, function(err, db) {
	if (err) throw err;
	var dbo = db.db("pData");
	dbo.collection("p1Data").find({}).toArray(function(err, result) {
		if (err) throw err;
		let found = false;
		console.log(result[i])
		for(i = 0; i<result.length;i++){
			if(result[i].title == title){
				found = true;
				res.render("webObtainedInfo",{personalInfo:result[i]})
				break;
			}
		}
		if(found == false){
			res.send("No info")
		}
		db.close();
	});
});
}
http.listen(3000,() =>{
	console.log('Server running at http://127.0.0.1:3000/');
});
