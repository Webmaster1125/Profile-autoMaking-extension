const express = require('express')
const cors = require("cors")
const axios = require("axios")
// const json = require("json");
const parser = require("body-parser");
const app = express()

const fs = require("file-system");

app.use(cors());
app.use(parser.json());
app.use(express.static('public'));

var db = JSON.parse(fs.readFileSync("db.json").toString());

var mail = fs.readFileSync("mail.json").toString();

console.log(db);

function nextMail(prev) {

  const sts = prev.split('@');

  let str = sts[0];
  let tmp = "";
  let val = 0;

  let i = 0;
  while (i < str.length - 1) {
    tmp = str[i++] + tmp;
    val <<= 1;
    if (str[i] == '.') val++, i++;
  }

  let len = tmp.length, res = str[str.length - 1];
  for (i = 0, val++; i < len; i++, val >>= 1) {
    if (val & 1) res = '.' + res;
    res = tmp[i] + res;
  }

  return res + '@' + sts[1];
}

app.get('/v1/getmail', async function (req, res) {

  // let rep = await axios.get("https://generator.email");
  // rep = rep.data;

  // const spanid = '<span id="email_ch_text">';
  // let index = rep.indexOf(spanid);

  // if (index == -1) {
  //   res.json({success: 0});
  //   return;
  // }

  // let indEnd = rep.indexOf("</span>", index);
  // rep = rep.slice(index + spanid.length, indEnd);

  mail = nextMail(mail);

  let rep = mail;

  fs.writeFileSync("mail.json", mail);

  res.json({
    success: 1,
    email: rep
  });
})

app.get('/v1/verifymail', async function (req, res) {

  const em = req.query.email;
  const dms = em.split("@");

  let rep = await axios.get("https://generator.email/", {
    headers: {
      cookie: 'embx=["' + em + '"]; surl=' + dms[1] + "/" + dms[0]
    }
  });
  rep = rep.data;

  // console.log(rep.headers);

  // return;
  
  const index = rep.indexOf("https://www.upwork.com/signup/verify-email");

  if (index == -1) {
    res.json({success: 0});
    return;
  }

  const indEnd = rep.indexOf('"', index + 1);

  rep = rep.slice(index, indEnd);

  res.json({
    success: 1,
    url: rep
  });

})

app.get('/v1/getpro', async function (req, res) {
  try {
    const files = fs.readdirSync("profiles");
    let filename;

    const id = req.query.id;
    const ne = req.query.new;

    const index = db.ids.indexOf(id);

    if (!ne && index != -1) {
      filename = db.names[index];
    } else {

      let i;

      for (i = 0; i < files.length; i++) {
        if (db.names.indexOf(files[i]) == -1)
          break;
      }
      
      if (i == files.length) i = 0;

      filename = files[i];
    }

    const data = fs.readFileSync("profiles/" + filename);

    if (index != -1) {
      db.names[index] = filename;
    }
    else {
      db.ids.push(id);
      db.names.push(filename);
    }

    fs.writeFileSync("db.json", JSON.stringify(db));

    res.set("Content-Type", "application/json");
    // res.set("access-control-allow-headers", "content-type");

    res.send(data);
  } catch (e) {
    console.log(e);
  }
})

app.get('/', async function (req, res) {

  res.send(req.connection.remoteAddress);
  
})

app.listen(3000);