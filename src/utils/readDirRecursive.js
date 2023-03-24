import fs from 'fs';
import path from 'path';

// get file list from a folder recursively
export function readDirRecursive(folderPath) {
  if (
    ['node_modules', '__tests__', 'assets'].find((i) => folderPath.includes(i))
  ) {
    return [];
  }

  let files;
  try {
    files = fs.readdirSync(folderPath);
  } catch (err) {
    console.error(`Failed to read directory ${folderPath}: ${err.message}`);
    return;
  }

  const fileList = [];

  files.forEach((fileName) => {
    const filePath = path.join(folderPath, fileName);

    let stats;
    try {
      stats = fs.statSync(filePath);
    } catch (err) {
      console.error(`Failed to get file stats for ${filePath}: ${err.message}`);
      return;
    }

    if (stats.isDirectory()) {
      const subFileList = readDirRecursive(filePath);
      fileList.push(...subFileList);
    } else {
      if (['.ts', '.js', '.tsx', '.jsx'].includes(path.extname(filePath))) {
        fileList.push({
          filePath,
          fileName,
        });
      }
    }
  });

  return fileList;
}

