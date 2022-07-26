const { create } = require('ipfs-http-client')
const express = require('express')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const sdk = require('matrix-js-sdk')

// const ipfs = create('/ip4/127.0.0.1/tcp/5001')
const ipfs = create({
    url: '/ip4/127.0.0.1/tcp/5001',//need to change to public
    emitSelf: true,
    pubsub: { emitSelf: true },
    config: {
        pubsub: { emitSelf: true }
    }
})
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());

app.get('/', (req, res) => {

  res.render('home')
})

app.post('/upload', (req, res) => {
    const file = req.files.file;
    const fileName = req.files.file.name;
    const filePath = 'files/' + fileName;
    const fileTitle = req.body.filename;

    file.mv(filePath, async (err) => {
      if (err) {
        console.log('Error: failed to download the file');
        return res.status(500).send(err);
      }
    
      const fileHash = await addFile(fileName, filePath);
      // fs.unlink(filePath, (err) => {
      //   if (err) console.log(err);
      // });

      res.render('upload', {filePath, fileHash, fileName, fileTitle});
    })
})

const addFile = async (fileName, filePath) => {
  const file = fs.readFileSync(filePath);
  const fileAdded = await ipfs.add({path: filePath, content: file});
  const fileHash = fileAdded.cid;

  return fileHash;
}

app.listen(3000, () => {
    console.log('Server started on port 3000, http://localhost:3000')
})