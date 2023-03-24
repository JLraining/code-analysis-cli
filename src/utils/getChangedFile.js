import { Project as TSProject } from 'ts-morph';
import { execSync } from 'child_process';
import path from 'path';
import { IMPORT_FILE_PATH } from '../defaultConfig.js';

const rootPath = process.cwd();

export const getChangesInFile = (filePath) => {
  const gitOutput = execSync(`git diff --unified=0 -- ${filePath}`, {
    cwd: rootPath,
  });
  const gitOutputLines = gitOutput.toString().split('\n');
  const changes = [];
  let currentChange;
  for (const line of gitOutputLines) {
    if (line.startsWith('@@ ')) {
      const matches = /@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line);
      const start = parseInt(matches[1]);
      const length = parseInt(matches[2] ?? '1');
      currentChange = { start, end: start + length - 1 };
      changes.push(currentChange);
    }
  }
  return changes;
};

export const getChangedFilesNodes = () => {
  const changedFilesNodes = {};
  const diffOutput = execSync('git status --short -uall', { encoding: 'utf8' });
  const changedFiles =
    diffOutput
      .split('\n')
      .map((line) => line?.substr(2)?.trim())
      .filter((line) => line.startsWith(IMPORT_FILE_PATH))
      .map((line) => path.resolve(rootPath, line)) || []; // absolute path

  changedFiles.forEach((changedFile) => {
    changedFilesNodes[changedFile] = changedFilesNodes[changedFile] || [];
    const changePositions = getChangesInFile(changedFile) || [];
    const project = new TSProject();
    const modifiedSourceFile = project.addSourceFileAtPath(changedFile);

    changePositions.forEach((changePosition) => {
      const { start, end } = changePosition;
      modifiedSourceFile.forEachChild((node) => {
        const nStartLine = node.getStartLineNumber();
        const nEndLine = node.getEndLineNumber();
        if (
          (start >= nStartLine && start <= nEndLine) ||
          (end >= nStartLine && end <= nEndLine)
        ) {
          if (node.getName && node.getName()) {
            changedFilesNodes[changedFile].push(node.getName());
          }
        }
      });
    });

    changedFilesNodes[changedFile] = Array.from(
      new Set(changedFilesNodes[changedFile]),
    );
  });

  return {
    changedFiles,
    changedFilesNodes,
  };
};
