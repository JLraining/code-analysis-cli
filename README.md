# code-analysis-cli
## Introduction
Dependency Management: Code Changed Impact Analysis
### Background Information
During the development process, it is common to modify shared code. For a simple modification, the impact can usually be manually controlled. However, if a large number of modifications are made at once or if this code is widely referenced in the project, it is difficult to determine its impact range through manual control or by using VSCode's search function. Therefore, a code analysis tool is needed.

This tool can help scan the code changes in files and where they are referenced in the project.
The analysis report is like this:
![image](https://user-images.githubusercontent.com/13096392/227495828-71facb42-47ce-469f-aebc-eec1b14b5f7b.png)


### Implementation
The general idea is to use `git diff` to obtain the modified code blocks, analyze the changed code through AST, and finally scan the referenced files to analyze where they are used.

Details: https://jlraining.github.io/code+analysis.html

## how to use
// to add doc here
