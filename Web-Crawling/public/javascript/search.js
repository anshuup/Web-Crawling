function search(){
	let req = new XMLHttpRequest()
	req.onreadystatechange = function (){
	if(this.readyState == 4 && this.status == 200){
		let searchText =  document.getElementById("search").value
		let maxValue = document.getElementById("maxVal").value
		let boostVal = document.getElementById("boost").value
		if(maxValue.length == 0){
			maxValue = 10;
		}
		else if(maxValue >  50){
			maxValue = 50;
		}
		if(searchText.length == 0 || isNaN(maxValue)){
			document.getElementById("invalidText").style.display = "block"
		}
		else{
			window.location.href = "/fruitsList?name=" + searchText + "&maxPages="+ parseInt(maxValue) + "&boost=" +boostVal
		}
	}
}
req.open("GET","/fruits",true)
req.send()
}
function personalsearch(){
	let req = new XMLHttpRequest()
	req.onreadystatechange = function (){
	if(this.readyState == 4 && this.status == 200){
		let searchText =  document.getElementById("search").value
		let maxValue = document.getElementById("maxVal").value
		let boostVal = document.getElementById("boost").value
		if(maxValue.length == 0){
			maxValue = 10;
		}
		else if(maxValue >  50){
			maxValue = 50;
		}
		if(searchText.length == 0 || isNaN(maxValue)){
			document.getElementById("invalidText").style.display = "block"
		}
		else{
			window.location.href = "/personalList?name=" + searchText + "&maxPages="+ parseInt(maxValue) + "&boost=" +boostVal
		}
	}
}
req.open("GET","/personal",true)
req.send()
}
