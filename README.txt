Name  : Anshu Patel
----------------------


Instructions for running the page on server
-> use npm install to install the required modules
-> Then node crawler.js to crawl the fruit links and place in the database
-> Then node personalCrawler.js to crawl personal website links and plce in databbse
-> Then node server.js in cmd and type localhost:3000 in the browser, this will run the page


Files Included
Lab4-> views	   	   -> mainPage.pug	         -- Main page to navigate to either personal or fruits search bar
			   -> fruitsPageList.pug	 -- Displays list of pages that contains the keyword
			   -> fruitsPage.pug             -- Displays the search interface, includes searching for queries, boosting 
			   -> fruitObtainedInfo.pug      -- Displays the information retrieved from the particular page

			   -> webList.pug	 	 -- Displays list of pages that contains the keyword from personal website
			   -> webPage.pug                -- Displays the search interface, includes searching for queries, boosting 
			   -> webObtainedInfo.pug        -- Displays the information retrieved from the particular page of the personal site


    -> server.js     		-- server side script
    -> crawler.js    		-- Crawling the fruits page and saving to database
    -> personalCrawler.js 	-- crawling personal website
    -> matrix.js 		-- calculates page rank value for fruits data and personal website data
