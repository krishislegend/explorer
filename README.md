# Wanchain Explorer (In Progress)

## License

GPL (see LICENSE)

## Installation (Test under ubuntu 16.04LTS)
Install [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git "Git installation") if you haven't already

### Build a wanchain node for test explorer
Clone the repo 
'git clone https://github.com/wanchain/go-wanchain.git'

Following the instruction under go-wanchain
Build the go_wanchain executable using CLI or Gogland

### Prepare wanchain explorer
Download [Nodejs and npm](https://docs.npmjs.com/getting-started/installing-node "Nodejs install") if you don't have them

Clone the repo 
'git clone https://github.com/wanchain/explorer.git'

### Run in local mode
### i.e. node.js web server, go_wanchain node server, and brower all run on the same host machine

Start the go_wanchain node
'go_wanchain --datadir ./data --networkid 5201314 --mine --minerthreads 1 --nodiscover --rpc --rpcaddr 0.0.0.0 --rpcapi eth,personal,net,admin --rpccorsdomain "http://localhost:8000"'

Start the explorer program. All dependencies will be automatically downloaded
'cd wanchain/explorer'
'npm start'

Then visit http://localhost:8000 in your browser of choice.

### Run in remote mode
### i.e. node.js web server, and go_wanchain node server run on the same host machine. But brower accesses the webpage from another host machine

'cd wanchain/explorer/app'
edit app.js

  uncomment this line

    var eth_node_url = new URL(eth_node_url_string);        // for remote host mode

  comment this

    //var eth_node_url = 'http://localhost:8545';           // for local host mode

Start the go_wanchain node on host 192.168.x.y		    // check your host IP address. rpccorsdomain setting is important
'go_wanchain --datadir ./data --networkid 5201314 --mine --minerthreads 1 --nodiscover --rpc --rpcaddr 0.0.0.0 --rpcapi eth,personal,net,admin --rpccorsdomain "http://192.168.x.y:8000"'

Start the explorer program on same host 192.168.x.y
'cd wanchain/explorer'
'npm start'

Then visit http://192.168.x.y:8000 in your browser of choice from another host machine that has network access to 192.168.x.y  
