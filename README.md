To run index.js, Express.js and Node.js should be installed in the path. If you run the code on localhost, the address should be "localhost:3000". If you run it on our server, the address should be "http://3.93.183.130:3000/"

Install NVM 
    
    $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
    
Install Node.js
    
    
    $ nvm install <latest version number>
    e.g. $ nvm install 11
    
Install Express.js


    $ npm init
    $ npm install express --save-dev
    $ npm install body-parser --save
Just use the default settings when installing and use $ ls to check if you have node_modules directory and package.json after you install

Install rethinkdb


    $ npm install rethinkdb
Run code


    $node index.js

Node.js and Express.js and rethinkdb have already been installed on our server. You just need the final step to run the code if you run the code on server. 
