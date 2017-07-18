# Wanchain Explorer (In Progress)

##License

GPL (see LICENSE)


##Installation (Test under ubuntu 14.04)
Install Docker 
Install [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git "Git installation") if you haven't already

###start a wanchain node for test explorer
Clone the repo
`git clone https://github.com/wanchain/wanchain.git`
`cd wanchain`
`sudo ./release_mkimg.sh`
`sudo docker run -it -p 8545:8545 wanchainrelease /bin/sh `

In docker container:
`geth --verbosity 5 --datadir /wanchain/data --etherbase '0x2d0e7c0813a51d3bd1d08246af2a8a7a57d8922e' --networkid 5201314 --mine --minerthreads 1 --nodiscover --rpc --rpcaddr 0
.0.0.0 --rpccorsdomain "http://localhost:8000"`

Clone the repo

`git clone https://github.com/etherparty/explorer`

Download [Nodejs and npm](https://docs.npmjs.com/getting-started/installing-node "Nodejs install") if you don't have them

Start the program. All dependencies will be automatically downloaded

`npm start`

Then visit http://localhost:8000 in your browser of choice.
