const fetch = require("node-fetch");
const path = require("path");
const { SourceMapConsumer } = require("source-map");
const fs = require("fs");
const os = require("os");

const desktopDir = path.join(os.homedir(), "Desktop");

const cleanupFunc = require('./cleanup-func')

const applySourceMapsToNodes = async (sourceMap, trace, dstFile, opts = {}) => {
  const { sterilize } = opts
  if (sterilize) {
    console.log('sterilize option enabled')
  }
  const rawSourceMap = {
    version: Number(sourceMap.version),
    sources: sourceMap.sources,
    mappings: sourceMap.mappings,
    names: sourceMap.names,
  };

  const consumer = await new SourceMapConsumer(rawSourceMap);
  if (!trace.nodes) {
    const traceEvents= trace.traceEvents
    if (!traceEvents) {
      throw new Error('something wrong with profile, adjust script to find nodes')
    }
    const profile = traceEvents[traceEvents.length - 1].args.data.cpuProfile

    trace = profile
  }
  trace.nodes.forEach((ev) => {
    if (ev.callFrame && ev.callFrame.lineNumber) {
      const sm = consumer.originalPositionFor({
        line: ev.callFrame.lineNumber,
        column: ev.callFrame.columnNumber,
      });

      const name = ev.callFrame.functionName;

      sm.source = sm.source?.replace(os.homedir(), "~");
      
      let functionName = name.substring(0, name.indexOf("(")) +
        `(${sm.source}:${sm.line}:${sm.column})`
      
      if (sterilize){
        functionName = cleanupFunc(functionName)
      }

      ev.callFrame = {
        ...ev.callFrame,
        url: sm.source,
        lineNumber: sm.line,
        columnNumber: sm.column,
        functionName,
      };
    } else if (ev.callFrame) {
      if (sterilize){
        ev.callFrame.functionName = cleanupFunc(ev.callFrame.functionName)
      }
    }
  });

  fs.writeFileSync(dstFile, JSON.stringify(trace), (err) => {
    if (err) {
      console.error(err);
    }
  });
  console.log("Map cleaned", dstFile);
  consumer.destroy();
};

const init = async (argv) => {
  const tracePath = argv["_"][0];
  const fileName = path.basename(tracePath);
  const dstDir = argv["dst"] || desktopDir;
  const dstFile = dstDir + "/FIXED_" + fileName;
  const sterilize = argv["sterilize"]

  try {
    const traceData = JSON.parse(fs.readFileSync(tracePath, "utf8"));

    const mapUrl = `http://localhost:8081/index.map?platform=${
      argv["platform"] || "ios"
    }&dev=${argv["dev"] || "true"}&minify=${
      argv["minify"] || "false"
    }&modulesOnly=${argv["modulesOnly"] || "false"}&runModule=${
      argv["runModule"] || "true"
    }&app=${argv["app"] || "exodus-movement.exodus"}`;

    console.log("Downloading map from:", mapUrl);

    const sourceMap = await (await fetch(mapUrl)).json();

    applySourceMapsToNodes(sourceMap, traceData, dstFile, {sterilize});
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  init,
};
