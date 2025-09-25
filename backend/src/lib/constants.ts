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
}`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My HTML Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>Welcome to HTML! Try editing this code.</p>
    
    <button onclick="alert('HTML is awesome!')">Click Me!</button>
</body>
</html>`,

    css: `/* Welcome to CSS! */
body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    margin: 0;
    padding: 20px;
}

h1 {
    color: #333;
    text-align: center;
}

.container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Try editing these styles! */`
};

export { SAMPLE_CODES };