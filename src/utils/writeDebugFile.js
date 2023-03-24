import { LOG_PREFIX, DEBUG_REPORT_PATH as debugPath } from '../defaultConfig.js';
import fse from 'fs-extra';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const PROJECT_ROOT = process.cwd();
const DEBUG_REPORT_PATH = path.join(PROJECT_ROOT, debugPath);

// Ensure that the directory exists
fse.ensureDirSync(DEBUG_REPORT_PATH);

export function writeImportItemsMapDebugFile(content) {
  fs.writeFileSync(
    path.join(DEBUG_REPORT_PATH, 'importItemsMap.json'),
    JSON.stringify(content, null, 2),
  );

  console.log(
    chalk.white(
      `${LOG_PREFIX} LOG: generate importItemsMap successly \n file path: ${path.join(
        DEBUG_REPORT_PATH,
        'importItemsMap.json',
      )}`,
    ),
  );
}

export function writeAnalyzeReportDebugFile(content) {
  fs.writeFileSync(
    path.join(DEBUG_REPORT_PATH, 'analyzeReport.json'),
    JSON.stringify(content, null, 2),
  );

  console.log(
    chalk.blue(
      `${LOG_PREFIX} LOG: generate analyzeReport successly \n file path: ${path.join(
        DEBUG_REPORT_PATH,
        'analyzeReport.json',
      )}`,
    ),
  );
}

export function writeChangeFilesDebugFile(changedFiles, changedFilesNodes) {
  const content = {
    changedFiles,
    changedFilesNodes,
  };

  fs.writeFileSync(
    path.join(DEBUG_REPORT_PATH, 'changedFiles.json'),
    JSON.stringify(content, null, 2),
  );

  console.log(chalk.white(`${LOG_PREFIX} LOG: scan changedFiles successly`));


  // console.log(
  //   chalk.white(
  //     `${LOG_PREFIX} LOG: generate changedFiles successly, file path: \n${path.join(
  //       DEBUG_REPORT_PATH,
  //       'changedFiles.json',
  //     )}`,
  //   ),
  // );
}
