// Minimal stub - real implementation deferred to native-ts port
class ColorDiff {
  constructor(patch, firstLine, filePath, fileContent) {
    this.patch = patch;
    this.firstLine = firstLine;
    this.filePath = filePath;
    this.fileContent = fileContent;
  }
  render(theme, width, dim) {
    return [];
  }
}
class ColorFile {
  constructor(code, filePath) {
    this.code = code;
    this.filePath = filePath;
  }
  render(theme, width, dim) {
    return this.code.split('\n');
  }
}
function getSyntaxTheme() { return null; }
module.exports = { ColorDiff, ColorFile, getSyntaxTheme };
module.exports.default = { ColorDiff };
