# code-analysis-cli
## Introduction
Dependency Management: Code Changed Impact Analysis
### Background Information
During the development process, it is common to modify shared code. If a simple modification, the impact can usually be manually controlled. However, if a large number of modifications are made at once or if this code is widely referenced in the project, it is difficult to determine its impact range through manual control or by using VSCode's search function. Therefore, a code analysis tool is needed.

### Implementation
The general idea is to use `git diff` to obtain the modified code blocks, analyze the changed code through AST, and finally scan the referenced files to analyze where they are used.

Details: https://jlraining.github.io/code+analysis.html

## how to use
// to add doc here
