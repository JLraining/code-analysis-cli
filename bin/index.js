#! /usr/bin/env node
import { program } from 'commander';
import { CodeAnalysis } from '../src/Analysis.js';

const codeAnalysis = new CodeAnalysis();

program
  .command('run')
  .description(
    "Analyze dependency relationship of git changed files, can check output '/tmp/changedDependencyMap.json'",
  )
  .action(codeAnalysis.run.bind(codeAnalysis));

program.parse();
