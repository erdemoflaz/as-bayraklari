const fs = require('mz/fs');
const http = require('http');
const {Readable} = require('stream');
const colors = require('colors/safe');
const frames = [];

fs.readdir('./frames').then(data => {
  data.forEach(async frame => {
    const f = await fs.readFile(`./frames/${frame}`);
    frames.push(f.toString());
  })
});

const streamer = stream => {
  let index = 0;
  return setInterval(() => {
    if (index >= frames.length) index = 0; stream.push('\033[2J\033[H');
      stream.push(colors['red'](frames[index]));
      index++;
  }, 150);
}

const server = http.createServer((req, res) => {
  const stream = new Readable();
  stream._read = function noop () {};
  stream.pipe(res);
  const interval = streamer(stream);
  req.on('close', () => {
    stream.destroy();
    clearInterval(interval);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, err => {
  if (err) throw err;
  console.log(`Listening on locahost:${port}`);
});
