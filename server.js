const http = require('http'),
  fs = require('fs'),
  url = require('url');

http.createServer((request, response) => {
  let addr = request.url, // request.url gets the URL from the request
    q = url.parse(addr, true), // read the address
    filePath = ''; //creating a string variable for later

  fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
    if (err) {
      console.log(err);
    }else {
      console.log('Added to log.');
    }
  });

  if (q.pathname.includes('documentation')) { // searching for 'documentation' in the pathname
    filePath = (__dirname + '/documentation.html');
  }else {
    filePath = 'index.html';
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw err;
    }
  
    response.writeHead(200, {'Content-Type': 'text/html'}); //add a header to the response (code 200= "ok")
    response.write(data);
    response.end(); 
  });
}).listen(8080);
console.log('My first Node test server is running on Port 8080.');