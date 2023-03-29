const Block = require('./block');

class Blockchain {
  constructor(difficulty = 2) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = difficulty;
  }

  createGenesisBlock() {
    return new Block('01/01/2022', 'Genesis block', '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    if (this.isChainValid()){
      newBlock.previousHash = this.getLatestBlock().hash;
      newBlock.mineBlock(this.difficulty);
      this.chain.push(newBlock);
    }
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

module.exports = Blockchain