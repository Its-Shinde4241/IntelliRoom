const SAMPLE_CODES = {
    txt: `                          Welcome to IntelliRoom!`,
    js: `// Welcome to JavaScript!
console.log("Hello, World!");

// Try editing this code and click Run
const message = "JavaScript is awesome!";
console.log(message);`,

    ts: `// Welcome to TypeScript!
console.log("Hello, World!");

// TypeScript adds types to JavaScript
const message: string = "TypeScript is awesome!";
const count: number = 42;

console.log(message);
console.log(\`Count: \${count}\`);`,

    py: `# Welcome to Python!
print("Hello, World!")

# Try editing this code and click Run
message = "Python is awesome!"
print(message)`,

    java: `// Welcome to Java!
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Try editing this code and click Run
        String message = "Java is awesome!";
        System.out.println(message);
    }
}`,

    cpp: `// Welcome to C++!
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    
    // Try editing this code and click Run
    string message = "C++ is awesome!";
    cout << message << endl;
    
    return 0;
}`,

    c: `// Welcome to C!
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    // Try editing this code and click Run
    char message[] = "C is awesome!";
    printf("%s\\n", message);
    
    return 0;
}`


};

export { SAMPLE_CODES };