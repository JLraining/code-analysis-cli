# code-analysis-cli
## Introduction
Dependency Management: Code Changed Impact Analysis
### Background Information
During the development process, it is common to modify shared code. For a simple modification, the impact can usually be manually controlled. However, if a large number of modifications are made at once or if this code is widely referenced in the project, it is difficult to determine its impact range through manual control or by using VSCode's search function. Therefore, a code analysis tool is needed.

This tool can help scan the code changes in files and where they are referenced in the project.

config
![image](https://user-images.githubusercontent.com/13096392/227775908-150d05ee-479c-4bf4-80e2-e402d396366f.png)


for example, as the simple demo shows in project, if we changed [Person, Address] in shared file (IMPORT_FILE_PATH),  in project we imported and used [Person, Address] from shared dir, we need to scan all the places where used these two changes, and output the report (as below), we can get which files imported the changed files, and which line used the changed code.

output

![image](https://user-images.githubusercontent.com/13096392/227775914-29964dd3-17cd-4779-a080-f72a544920b2.png)




### Implementation
The general idea is to use `git diff` to obtain the modified code blocks, analyze the changed code through AST, and finally scan the referenced files to analyze where they are used.

Details: https://jlraining.github.io/code+analysis.html

## Try it with demo 
* change demo/shared code
* `code-analysis-cli run`


