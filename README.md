To run index.js on localhost, Express.js and Node.js should be installed in the path.

Install NVM 
    
    $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
    
Install Node.js
    
    
    $ nvm install <latest version number>
    e.g. $ nvm install 11
    
Install Express.js


    $ npm init
    $ npm install express --save-dev
just use the default settings when installing and use $ ls to check if you have node_modules directory and package.json after you install

Install rethinkdb


    $ npm install rethinkdb
Run code


    $node index.js
