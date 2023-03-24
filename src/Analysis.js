import { Project, SyntaxKind } from 'ts-morph';
import path from 'path';
import ora from 'ora';
import chalk from 'chalk';
import ProgressBar from 'progress';
import {
  IMPORT_FILE_PATH,
  SCAN_FILE_PATH,
  LOG_PREFIX,
  IMPORT_FILE_ALIAS,
  SCAN_CHANGED_FILE,
} from './defaultConfig.js';
import { readDirRecursive } from './utils/readDirRecursive.js';
import { getChangedFilesNodes } from './utils/getChangedFile.js';
import {
  writeAnalyzeReportDebugFile,
  writeChangeFilesDebugFile,
} from './utils/writeDebugFile.js';
const PROJECT_ROOT = process.cwd();
const SHARE_FILE_PATH = path.join(PROJECT_ROOT, IMPORT_FILE_PATH);
const ANALYZE_FILE_PATH = path.join(PROJECT_ROOT, SCAN_FILE_PATH);
const project = new Project();

export class CodeAnalysis {
  // config
  constructor() {
    this.importItemMap = {};
    this.changedFiles = [];
    this.changedFilesNodes = {};
    this.isScanChangedFiles = SCAN_CHANGED_FILE;
    this.plugins = [];
  }

  analyzeImport({ sourceFile, filePath }) {
    const handleImports = (item) => {
      const _addItem = () => {
        this.importItemMap[filePath] = this.importItemMap[filePath] || {};
        this.importItemMap[filePath][item.name] = {
          ...item,
          originName: item.originName || item.name,
          useDefault: !!item.useDefault,
          matchedFilePath: item.matchedFilePath,
          callLines: [],
        };
      };
      if (this.isScanChangedFiles) {
        this.changedFiles?.forEach((changedFile) => {
          if (changedFile.startsWith(item.importPath)) {
            const changedNodes = this.changedFilesNodes?.[changedFile] || [];
            if (changedNodes.includes(item.originName || item.name)) {
              _addItem();
            }
          }
        });
      } else {
        _addItem();
      }
    };

    const imports = sourceFile.getImportDeclarations();

    // judge whether import target file
    const isMatchedFilePath = (importDeclaration) => {
      const moduleSpecifier = importDeclaration.getModuleSpecifierValue() || '';
      let _filePath = '';

      if (moduleSpecifier.startsWith(IMPORT_FILE_ALIAS)) {
        _filePath = moduleSpecifier;
        _filePath = _filePath.replace(IMPORT_FILE_ALIAS, SHARE_FILE_PATH);
      } else {
        let namedImportsPath = moduleSpecifier;
        if (importDeclaration.isModuleSpecifierRelative()) {
          namedImportsPath = path.resolve(
            path.dirname(filePath),
            moduleSpecifier,
          );
        }
        if (namedImportsPath.startsWith(SHARE_FILE_PATH)) {
          _filePath = namedImportsPath;
        }
      }

      if (!_filePath || !this.isScanChangedFiles) {
        return _filePath;
      }

      // whether match changed file
      const findMatch = this.changedFiles?.find((changedFile) =>
        changedFile.startsWith(_filePath),
      );
      return findMatch ? _filePath : '';
    };

    for (const importDeclaration of imports) {
      // judge whether import target file
      const importClause = importDeclaration.getImportClause();
      const importPath = isMatchedFilePath(importDeclaration);
      if (!importClause || !importPath) {
        return;
      }
      let item = {
        importPath,
      };
      //  getDefaultImport
      //  import AFunc from 'A-file';
      const defaultImport = importClause.getDefaultImport();
      if (defaultImport) {
        item = {
          ...item,
          useDefault: true,
          name: defaultImport.getText(),
          pos: defaultImport.getPos(),
          end: defaultImport.getEnd(),
        };
        handleImports(item);
      } else {
        const namedBindings = importClause.getNamedBindings();
        if (namedBindings) {
          // isNamespaceImport
          // import * as alias from 'A-file';
          const namespaceImport = importClause.getNamespaceImport();
          // isNamedImports
          // import { CFunc} from 'C-file'; import { DFunc as DAlias } from 'B-file';
          const namedImports = importClause.getNamedImports();

          if (namespaceImport) {
            item = {
              ...item,
              useDefault: true,
              name: namespaceImport.getText(),
              pos: namespaceImport.getPos(),
              end: namespaceImport.getEnd(),
            };
            handleImports(item);
          } else if (namedImports) {
            namedImports.forEach((namedImport) => {
              const nameNode = namedImport.getNameNode();
              const aliasNode = namedImport.getAliasNode();
              item = {
                ...item,
                name: aliasNode?.getText() || nameNode?.getText(),
                originName: nameNode?.getText(),
                pos: namedImport.getPos(),
                end: namedImport.getEnd(),
              };
              handleImports(item);
            });
          }
        }
      }
    }
    return this._importItems;
  }

  analyzeImportCodeUsed({ sourceFile, filePath }) {
    const importItemMap = this.importItemMap;
    const importItems = importItemMap[filePath] || {};
    if (!Object.keys(importItems).length) {
      return;
    }
    sourceFile.forEachDescendant((node) => {
      if (node.getKind() !== SyntaxKind.Identifier) {
        return;
      }
      const name = node.getText();
      const matchImportItem = importItems[name];
      if (!matchImportItem) {
        return;
      }
      let symbol;

      try {
        symbol = node.getSymbol();
      } catch (error) {
        console.log(
          chalk.yellow(`[warning] ${filePath} ${name} getSymbol error`),
        );
      }

      if (symbol) {
        const symbolDeclarations = symbol.getDeclarations();
        if (symbolDeclarations && symbolDeclarations.length > 0) {
          const symbolPos = symbolDeclarations[0].getPos();
          const symbolEnd = symbolDeclarations[0].getEnd();
          // Identifier symbol.declarations pos and end must be equal to importItem symbol.declarations pos and end
          if (
            // exclude the reference from importItem
            matchImportItem.symbolPos !== symbolPos &&
            // matched
            matchImportItem.pos == symbolPos &&
            matchImportItem.end == symbolEnd
          ) {
            const line = node.getStartLineNumber();
            importItemMap[filePath]?.[name]?.callLines?.push(line);
          }
        }
      }
    });
  }

  scanCode() {
    // get Source File List
    const fileList = readDirRecursive(ANALYZE_FILE_PATH) || [];
    const bar = new ProgressBar('Scan Code \x1b[36m[:bar]\x1b[0m :percent', {
      total: fileList.length,
      width: 40,
      // complete: '\u2588',
      // incomplete: '\u2591',
      complete: '\u25A0',
      incomplete: '\u25A1',
      // complete: '●',
      // incomplete: '○',
    });

    fileList.forEach(({ filePath, fileName }, index) => {
      const sourceFile = project.addSourceFileAtPath(filePath);
      this.analyzeImport({ sourceFile, filePath });
      this.analyzeImportCodeUsed({
        sourceFile,
        filePath,
      });
      bar.tick();
    });
  }

  run() {
    let spinner = ora(
      chalk.blue(`${LOG_PREFIX} start scan code... \n`),
    ).start();

    process.on('SIGINT', () => {
      chalk.red(`${LOG_PREFIX} exit`);
      spinner.stop();
      process.exit();
    });

    try {
      // get changed files
      if (this.isScanChangedFiles) {
        // eslint-disable-next-line no-console
        console.log(chalk.white(`${LOG_PREFIX} LOG: analyze changed files...`));
        const { changedFiles, changedFilesNodes } = getChangedFilesNodes();
        if (this.isScanChangedFiles && !changedFiles.length) {
          spinner.succeed(chalk.blue(`${LOG_PREFIX} no changed files`));
          return;
        }
        this.changedFiles = changedFiles;
        this.changedFilesNodes = changedFilesNodes;
        writeChangeFilesDebugFile(changedFiles, changedFilesNodes);
      }

      // eslint-disable-next-line no-console
      console.log(chalk.white(`${LOG_PREFIX} LOG: analyze import files...`));

      this.scanCode();
      // writeImportItemsMapDebugFile(this.importItemMap);
      writeAnalyzeReportDebugFile({
        isScanChange: this.isScanChangedFiles,
        changedFilesNodes: this.changedFilesNodes,
        importItemMap: this.importItemMap,
      });

      spinner.succeed(chalk.green(`${LOG_PREFIX} analysis succeed`));
    } catch (error) {
      spinner.stop();
      // eslint-disable-next-line no-console
      console.log(chalk.red(`${LOG_PREFIX} error: \n ${error.message}`));
    }
  }
}
