To run index.js on localhost, Express.js and Node.js should be installed in the path.

1. install NVM
    $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
2. install Node.js
    $ nvm install <latest version number>
    e.g. $ nvm install 11
3. install Express.js
    $ npm init
    $ npm install express --save-dev
    just use the default settings when installing and use $ ls to check if you have node_modules directory and package.json after you install
4. install rethinkdb
    $ npm install rethinkdb
5. run code
    $node index.js
