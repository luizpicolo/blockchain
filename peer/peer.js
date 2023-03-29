const net = require('net');
const fs = require('fs');
const chokidar = require('chokidar');
const Blockchain = require('../blockchain')
const Block = require('../blockchain/block');

class Peer {
  constructor(watchDir, isServer, fileOutPut = null) {
    this.watchDir = watchDir;
    this.isServer = isServer;
    this.watcher = null;
    this.socket = null;
    this.fileOutPut = fileOutPut;
    this.difficulty = 2
  }

  createServer(port) {
    // Create a TCP server to listen for incoming connections
    const server = net.createServer(socket => {
      console.log(`Connected to server ${port}: ${socket.remoteAddress}:${socket.remotePort}`);

      // Watch the specified directory for changes and send updates to the remote peer
      this.watcher = chokidar.watch(`${this.watchDir}/chain.json`, { persistent: true });
      this.watcher.on('change', (path) => {
        //console.log(`File changed in Server: ${path}`);
        const fileContent = fs.readFileSync(path, 'utf-8');
        socket.write(`FILE_CHANGE::${fileContent}`);
      });

      // Handle the socket closing
      socket.on('close', () => {
        console.log(`Disconnected: ${socket.remoteAddress}:${socket.remotePort}`);
        this.watcher.close();
      });

      // Handle any errors that occur on the socket
      socket.on('error', error => {
        console.error(`Socket error: ${error}`);
        this.watcher.close();
      });
    });

    // Start the server listening on the specified port
    server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }

  createClient(host, port) {
    // Create a TCP client to connect to the remote peer
    const client = net.createConnection({ host: host, port: port }, () => {
      console.log(`Connected to server ${port}: ${client.localAddress}:${client.localPort}`);

      // Handle incoming data from the remote peer
      client.on('data', data => {
        const [command, payload] = data.toString().split('::');
        switch (command) {
          case 'FILE_CHANGE':
            this.createFile(this.fileOutPut, payload)
            break;
          default:
            console.log(`Received unknown command: ${command}`);
        }
      });

      // Handle the socket closing
      client.on('close', () => {
        console.log(`Disconnected from server: ${client.remoteAddress}:${client.remotePort}`);
        this.watcher.close();
      });

      // Handle any errors that occur on the socket
      client.on('error', error => {
        console.error(`Socket error: ${error}`);
        this.watcher.close();
      });
    });

    this.socket = client;
  }

  startMiner(){
    if (this.isServer == true){
      let myCoin = new Blockchain(this.difficulty);
      setInterval(() => {
        myCoin.addBlock(new Block(new Date(), { amount: 4 }));
        if (myCoin.isChainValid()){
          console.log('Storage block');
          this.createFile('./storage/chain.json', JSON.stringify(myCoin, null, 4));
        }
      }, 1000);      
    } else {
      console.log('Not a server')
    }
  }

  createFile(outPut, data){
    fs.writeFileSync(outPut, data, function (err) {
      if (err) throw err;
      console.log('File created!');
    });
  }
}

module.exports = Peer
