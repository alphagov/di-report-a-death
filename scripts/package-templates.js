// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");

const funDirs = getFunctionDirs();
const buildDirs = funDirs.map(srcToBuild);
buildDirs.forEach(ensureDirExists);
copyTemplates(funDirs);
copyBaseTemplate(buildDirs);
copyGovuk(buildDirs);

function getFunctionDirs() {
  const dirListing = fs.readdirSync("src/pages");
  const listOfDirs = dirListing.filter((path) =>
    fs.statSync(`src/pages/${path}`).isDirectory()
  );
  return listOfDirs.filter((path) =>
    fs.readdirSync(`src/pages/${path}`).includes("app.ts")
  );
}

function ensureDirExists(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function copyTemplates(funDirs) {
  funDirs.forEach((path) => {
    try {
      fs.copyFileSync(
        `src/pages/${path}/template.njk`,
        `${srcToBuild(path)}/template.njk`
      );
    } catch (_e) {
      // ignored
    }
  });
}

function copyBaseTemplate(buildDirs) {
  buildDirs.forEach((path) => {
    fs.cpSync("src/common/templates", path, { recursive: true });
  });
}

function copyGovuk(buildDirs) {
  buildDirs.forEach((path) => {
    fs.cpSync(`src/node_modules/govuk-frontend/govuk`, `${path}/govuk`, {
      recursive: true,
    });
  });
}

function srcToBuild(dirName) {
  return `.aws-sam/build/${toPascalCase(dirName)}Function`;
}

function toPascalCase(text) {
  return text.replace(/(^\w|-\w)/g, clearAndUpper);
}

function clearAndUpper(text) {
  return text.replace(/-/, "").toUpperCase();
}
