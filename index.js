const sass = require("sass");
const postcss = require("postcss");
const paths = require("path");
const fs = require("fs");

/**
 * Parses :root { --var: value ... } into JSON to be required in styled components.
 */
const generateVariables = (css) => {
  const p = postcss.parse(css);
  const variables = {};
  const vars = p.nodes
    .filter(
      (r) =>
        r.selector &&
        (r.selector === ":root" ||
          r.selector.startsWith(":root,") ||
          r.selector.endsWith(",:root") ||
          r.selector.endsWith("\n:root"))
    )
    .map((root) => root.nodes.filter((n) => n.prop && n.value).filter((n) => n.prop.startsWith("--")))
    .flat(1);

  vars
    .map((n) => {
      const ref = /^var\(([a-zA-Z_0-9-]+)\)$/;
      const m = n.value.match(ref);
      if (m) {
        return {
          name: n.prop,
          ref: m[1],
        };
      } else {
        return {
          name: n.prop,
          value: n.value,
        };
      }
    })
    .forEach(({ name, value, ref }) => {
      if (name && value) {
        variables[name] = value;
      } else if (name && ref) {
        if (config.variables[ref]) {
          variables[name] = config.variables[ref];
        } else {
          throw new Error("Cannot found CSS variable reference: var(" + ref + ")");
        }
      }
    });

  // console.info("generateVariables", variables);
  return variables;
};

const resolveNodeModules = (path, srcFile) => {
  let resolvedPath = paths.resolve(srcFile ? paths.dirname(srcFile) : ".", path);
  while (!fs.existsSync(resolvedPath)) {
    const parent = paths.dirname(paths.dirname(resolvedPath));
    if (parent === resolvedPath || parent === "/") {
      throw new Error("Cannot find node_modules folder");
    }
    resolvedPath = parent + "/node_modules";
  }
  const url = new URL(resolvedPath, "file:///");
  //console.info("Resolved", url);
  return url;
};

const getVariables = (file) => {
  const result = sass.compile(file, {
    includePaths: ["node_modules"],
    importers: [
      {
        findFileUrl: (url) => {
          if (!url.startsWith("~")) return null;
          const finalUrl = new URL("node_modules/" + url.substring(1), resolveNodeModules("node_modules", file));
          // console.info("Resolved import", url, "to", finalUrl);
          return finalUrl;
        },
      },
    ],
  });
  const vars = generateVariables(result.css.toString());
  return vars;
};

const getTailwindColors = (variables, useAsVars) => {
  const colors = Object.fromEntries(
    Object.keys(variables)
      .map((key) => [key, variables[key]])
      .filter((entry) => entry[0].startsWith("--") && entry[1].startsWith("#"))
      .map((entry) => [entry[0].substring(2), useAsVars ? "var(" + entry[0] + ")" : entry[1]])
  );

  // If all colors start with color-, change name to remove color- prefix
  if (Object.keys(colors).filter((k) => k.startsWith("color-")).length === Object.keys(colors).length) {
    const newColors = {};
    Object.keys(colors).forEach((k) => {
      newColors[k.substring(6)] = colors[k];
    });
    // console.info("getTailwindColors", newColors);
    return newColors;
  }

  // console.info("getTailwindColors", colors);
  return colors;
};

if (require.main === module) {
  // Invoke for args
  const args = process.argv.slice(2);
  const file = args[0];
  if (file) {
    const vars = getVariables(file);
    const colors = getTailwindColors(vars, args[1] === "1");
    console.info("colors", colors);
  } else {
    console.error("Please provide a SCSS/CSS file path as argument.");
  }
}

function generateColors(file, useAsVars) {
  const vars = getVariables(file);
  const colors = getTailwindColors(vars, useAsVars);
  return colors;
}

module.exports = generateColors;

module.exports.getTailwindColors = getTailwindColors;
module.exports.getVariables = getVariables;
module.exports.generateColors = generateColors;
