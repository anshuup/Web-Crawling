const {Matrix} = require("ml-matrix");
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017/';
const Crawler = require("crawler");
var euclidean = require( 'compute-euclidean-distance' );
let pval = 0;
let m1
let titleList = []
let array = {}

//performing page rank
//transferring database name from crawler pages
let createMat = function(databaseName){
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
		let mat
	  var dbo = db.db(databaseName);
	  dbo.collection(databaseName).find({}).toArray(function(err, result) {
	    if (err) throw err;
			//creating adjacency matrix for fruits web page
			if(databaseName == "crawlData"){
				mat = Matrix.zeros(1000,1000)
				for(i = 0; i<result.length;i++){
		      let k = parseInt(result[i].title.split("-")[1])
		      for(j=0;j<result[i].links.length;j++){
		        let m = parseInt(result[i].links[j].split("-")[1].split("."))
		        mat.set(k,m,1)
		      }
		    }
			}
			if(databaseName == "pData"){
				//creating adjacency matrix for personal web page
				//first creating json array of keys being the currLink and values being number of links associated with it
				mat = Matrix.zeros(500,500)
				for(i=0;i<result.length;i++){
					titleList.push(result[i].title)
					array[result[i].currLink] = []
					for(j=0;j<result[i].links.length;j++){
						array[result[i].currLink].push(result[i].links[j])
					}
				}
				//assigning values to the each value of array of either zero or 1 whichever matches at aij.
				//this assigns values right after the link. extracting those values and pushing in numArray
				let index = 0;
				let finalArray = {}
				for(x in array){
					finalArray[x] = {}
					for(y in array){
						finalArray[x][y] = 0
					}
					array[x].forEach(function(z){
							finalArray[x][z] = 1;
							index++
							return false;
						});
				}
				//creatinng numarray of only 0s and 1s, lenght will be of 10000
				let numArray = []
				for(i in finalArray){
					for(j in finalArray[i]){
						numArray.push(finalArray[i][j])
					}
				}
				//setting up matrix of 0s and 1s by retrieving values from array
				let jVal = 0;
				for(i=0;i<500;i++){
					let numVal = jVal + 500
					for(j=jVal;j<numVal;j++){
						mat.set(i,(j-jVal),numArray[j])
					}
					jVal = jVal+500
				}
			}
			//counting rows values and placing in an array
	    let rowsSum = []
	    for(i=0;i<mat.rows;i++){
	      let count = 0;
	      for(j=0;j<mat.columns;j++){
	        if(mat.get(i,j) == 1){
	          count++;
	        }
	      }
	      rowsSum.push(count)
	    }
			//if rows sum equals to 0 then ddivide by 1/N - number of pages
			//else 1/total sum of current row
	    for(i=0;i<rowsSum.length;i++){
	      if(rowsSum[i] == 0){
	        for(j = 0;j<mat.columns;j++){
	          mat.set(i,j,(1/mat.columns))
	        }
	      }
	      else{
	        for(k=0;k<mat.columns;k++){
	          if(mat.get(i,k) == 1){
	            mat.set(i,k,(1/rowsSum[i]))
	          }
	        }
	      }
	    }
			//multiply the matrix with 1-alpha and then divide cell by a/number of pages
	    x1 = Matrix.mul(mat, 0.9)
	    for(i=0;i<x1.rows;i++){
	      for(j=0;j<x1.columns;j++){
	        mat.set(i,j,x1.get(i,j)+(0.1/mat.rows))
	      }
	    }
			//until the threshold is mat keep looping to get page rank value
	    let pi = Matrix.zeros(1,mat.rows);
	    pi.set(0,0,1)
	    let threshold = 0.000000001
	    let m2
	    while(threshold >= 0.000000001){
	      m1 = []
	      m2 = []

				//multiply matrix with all zeros
	      let pi1 = pi.mmul(mat)
	      for(i=0;i<pi1.rows;i++){
	        for(j=0;j<pi1.columns;j++){
	          m1.push(pi1.get(i,j))
	        }
	      }
				//get the current matrix
	      for(i=0;i<pi.rows;i++){
	        for(j=0;j<pi.columns;j++){
	          m2.push(pi.get(i,j))
	        }
	      }
				//create matrix with one row and multiple colums
				//set the each column with new values
	      pi = Matrix.zeros(1,mat.rows);
	      for(i=0;i<m1.length;i++){
	        pi.set(0,i,m1[i])
	      }
				//calculate threshold using euclidean distance
	      threshold = euclidean(m1,m2)
	    }
			//updating ddatabase with page rank values
			if(databaseName == "crawlData"){
				for(i=0;i<mat.rows;i++){
					dbo.collection(databaseName).updateOne({"title":"N-"+i}, {$set:{"pageRankVal":m1[i]}}, function(err, res) {
					  if (err) throw err;
					  db.close();
					});
				}
			}
			if(databaseName == "pData"){
				for(i=0;i<mat.rows;i++){
					dbo.collection("p1Data").updateOne({"title":titleList[i]}, {$set:{"pageRankVal":m1[i]}}, function(err, res) {
						if (err) throw err;
						db.close();
					});
				}
			}
			db.close();
	  });
	});
}
module.exports = {
	createMat
}
