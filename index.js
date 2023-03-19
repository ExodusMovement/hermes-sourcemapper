const path = require("path");
const { SourceMapConsumer } = require("source-map");
const fs = require("fs");

const cpuprofile = require("./profile.json");
const map = require("./map.json");

const applySourceMapsToEvents = async (
  sourceMap,
  trace,
  indexBundleFileName
) => {
  // SEE: Should file here be an optional parameter, so take indexBundleFileName as a parameter and use
  // a default name of `index.bundle`
  const rawSourceMap = {
    version: Number(sourceMap.version),
    file: indexBundleFileName || "index.bundle",
    sources: sourceMap.sources,
    mappings: sourceMap.mappings,
    names: sourceMap.names,
  };

  const consumer = await new SourceMapConsumer(rawSourceMap);

  trace.nodes.forEach((ev) => {
    if (ev.callFrame && ev.callFrame.lineNumber) {
      // console.log("event", ev);

      const sm = consumer.originalPositionFor({
        line: ev.callFrame.lineNumber,
        column: ev.callFrame.columnNumber,
      });

      const name = ev.callFrame.functionName;
      console.log("sm", ev.callFrame.functionName);

      ev.callFrame = {
        ...ev.callFrame,
        url: sm.source,
        lineNumber: sm.line,
        columnNumber: sm.column,
        functionName: name.substring(0, name.indexOf("(")),
      };
    }``
  });

  fs.writeFileSync(
    "/Users/alexanderpataridze/Desktop/clean.cpuprofile",
    JSON.stringify(trace),
    (err) => {
      if (err) {
        console.error(err);
      }
      // file written successfully
    }
  );

  // console.log(trace);

  consumer.destroy();
};

applySourceMapsToEvents(map, cpuprofile);
