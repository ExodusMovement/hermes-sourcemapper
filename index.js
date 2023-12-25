const fetch = require("node-fetch");
const path = require("path");
const { SourceMapConsumer } = require("source-map");
const fs = require("fs");
const os = require("os");

const desktopDir = path.join(os.homedir(), "Desktop");

const filterFunc = require("./filter-func");

const applySourceMapsToNodes = async (sourceMap, trace, dstFile, opts = {}) => {
  const { sterilize } = opts;
  if (sterilize) {
    console.log("sterilize option enabled");
  }

  const rawSourceMap = {
    version: Number(sourceMap.version),
    sources: sourceMap.sources,
    mappings: sourceMap.mappings,
    names: sourceMap.names,
  };

  const consumer = await new SourceMapConsumer(rawSourceMap);
  if (!trace.nodes) {
    const traceEvents = trace.traceEvents;
    if (!traceEvents) {
      throw new Error(
        "something wrong with profile, adjust script to find nodes",
      );
    }

    const profile = traceEvents[traceEvents.length - 1].args.data.cpuProfile;

    trace = profile;
  }

  const traceNodesById = new Map();
  trace.nodes.forEach((ev) => traceNodesById.set(ev.id, ev));

  const resultNodes = [];

  trace.nodes.forEach((ev) => {
    if (ev.callFrame && ev.callFrame.lineNumber) {
      const sm = consumer.originalPositionFor({
        line: ev.callFrame.lineNumber,
        column: ev.callFrame.columnNumber,
      });

      const name = ev.callFrame.functionName;

      sm.source = sm.source?.replace(os.homedir(), "~");

      const functionName =
        name.slice(0, Math.max(0, name.indexOf("("))) +
        `(${sm.source}:${sm.line}:${sm.column})`;

      // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
      ev.callFrame = {
        ...ev.callFrame,
        url: sm.source,
        lineNumber: sm.line,
        columnNumber: sm.column,
        functionName,
      };
    }

    if (sterilize && !filterFunc(ev.callFrame.functionName)) {
      const nodeChildren = ev.children;

      if (nodeChildren.length > 0) {
        const firstChildId = nodeChildren[0];
        const parent = trace.nodes.find((node) =>
          node.children.includes(ev.id),
        );

        // add children instead of this node to parent children
        if (parent) {
          parent.children = [
            ...parent.children.filter((id) => id !== ev.id),
            ...nodeChildren,
          ];
        }

        // replace sample id with first child id. function duration will be measured using it.
        // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
        trace.samples = trace.samples.map((id) => {
          if (id === ev.id) {
            return firstChildId;
          }

          return id;
        });
      } else {
        // replace sample id with root id to display nothing
        // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
        trace.samples = trace.samples.map((id) => {
          if (id === ev.id) {
            return 1;
          }

          return id;
        });
      }
    } else {
      resultNodes.push(ev);
    }
  });

  // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
  trace.nodes = resultNodes;

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
  const sterilize = argv["sterilize"];

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

    // eslint-disable-next-line unicorn/no-await-expression-member
    const sourceMap = await (await fetch(mapUrl)).json();

    applySourceMapsToNodes(sourceMap, traceData, dstFile, { sterilize });
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  init,
};
