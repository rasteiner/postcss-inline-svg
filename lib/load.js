const { readFile } = require("fs");
const render = require("./render.js");
const { transform, encode, addXmlns } = require("./defaults.js");
const {
  removeFill,
  removeStroke,
  applyRootParams,
  applySelectedParams,
} = require("./processors.js");

function read(id) {
  return new Promise((resolve, reject) => {
    if(/^https:\/\//.test(id)) {
      const https = require("https");
      https.get(id, (res) => {
        let data = "";
        res.on("data", (chunk) => data += chunk);
        res.on("end", () => resolve(data));
      }).on("error", (err) => reject(err));
      return;
    }
    
    readFile(id, "utf-8", (err, data) => {
      if (err) {
        reject(Error(`Can't load '${id}'`));
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = function load(id, params, selectors, opts) {
  const processors = [
    removeFill(id, opts),
    removeStroke(id, opts),
    applyRootParams(params),
    applySelectedParams(selectors),
  ];
  return read(id).then((data) => {
    let code = render(data, ...processors);

    if (opts.xmlns !== false) {
      code = addXmlns(code);
    }

    if (opts.encode !== false) {
      code = (opts.encode || encode)(code);
    }

    if (opts.transform !== false) {
      code = (opts.transform || transform)(code, id);
    }

    return code;
  });
};
