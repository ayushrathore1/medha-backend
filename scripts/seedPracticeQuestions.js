/**
 * Seed script to add OOP Practice Coding Questions from PYQs
 * Years: 2019, 2022, 2024, 2025
 * Each question includes year, question number, and ChatGPT solution link placeholder
 */
require("dotenv").config();
const mongoose = require("mongoose");
const PracticeQuestion = require("../models/PracticeQuestion");

const pyqCodingQuestions = [
  // ========================================
  // YEAR: 2019 (3E1139, Dec 2019)
  // ========================================
  // Part B Questions (8 marks)
  {
    title: "Swap Two Integers Using Reference Variables",
    description: "Write a function using reference variables to swap the values of two integers.",
    difficulty: "easy",
    category: "functions",
    tags: ["reference", "swap", "pass-by-reference", "functions"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

// Write your swap function here using reference variables
void swap(int &a, int &b) {
    // Your code here
}

int main() {
    int x, y;
    cin >> x >> y;
    swap(x, y);
    cout << x << " " << y;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

void swap(int &a, int &b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x, y;
    cin >> x >> y;
    swap(x, y);
    cout << x << " " << y;
    return 0;
}`,
    testCases: [
      { input: "5 10", expectedOutput: "10 5", description: "Basic swap" },
      { input: "0 100", expectedOutput: "100 0", description: "Zero swap" },
    ],
    hints: ["Use a temporary variable", "References allow direct modification"],
    explanation: "Reference variables create aliases to the original variables, allowing direct modification without pointers.",
    pyqInfo: { year: 2019, examDate: "Dec 2019", paperCode: "3E1139", part: "B", questionNumber: 1, marks: 8 },
    chatgptSolutionLink: "",
    concepts: ["References", "Pass by Reference", "Swap Algorithm"],
    order: 1,
  },
  {
    title: "Copy Contents of One Text File to Another",
    description: "Write a Program to copy contents of one text file to another.",
    difficulty: "medium",
    category: "file-handling",
    tags: ["file-handling", "ifstream", "ofstream", "streams"],
    language: "cpp",
    starterCode: `#include <iostream>
#include <fstream>
using namespace std;

int main() {
    // Copy contents from source.txt to destination.txt
    // Your code here
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <fstream>
using namespace std;

int main() {
    ifstream source("source.txt");
    ofstream destination("destination.txt");
    
    if(!source || !destination) {
        cout << "Error opening file!";
        return 1;
    }
    
    char ch;
    while(source.get(ch)) {
        destination.put(ch);
    }
    
    source.close();
    destination.close();
    
    cout << "File copied successfully!";
    return 0;
}`,
    testCases: [
      { input: "", expectedOutput: "File copied successfully!", description: "Successful copy" },
    ],
    hints: ["Use ifstream for reading", "Use ofstream for writing", "Read character by character"],
    explanation: "File handling in C++ uses stream classes. ifstream reads from files, ofstream writes to files.",
    pyqInfo: { year: 2019, examDate: "Dec 2019", paperCode: "3E1139", part: "B", questionNumber: 5, marks: 8 },
    chatgptSolutionLink: "",
    concepts: ["File Handling", "ifstream", "ofstream", "Streams"],
    order: 2,
  },
  {
    title: "Multiple Catch Statements Demo",
    description: "Write a program to show the application of multiple catch statements.",
    difficulty: "medium",
    category: "exception-handling",
    tags: ["exception", "try-catch", "multiple-catch", "error-handling"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int choice;
    cin >> choice;
    
    try {
        // Throw different types based on choice
        // Your code here
    }
    // Add multiple catch blocks
    
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int choice;
    cin >> choice;
    
    try {
        if(choice == 1)
            throw 10;           // int exception
        else if(choice == 2)
            throw 3.14;         // double exception
        else if(choice == 3)
            throw 'a';          // char exception
        else
            throw "Unknown";    // string exception
    }
    catch(int e) {
        cout << "Caught int: " << e;
    }
    catch(double e) {
        cout << "Caught double: " << e;
    }
    catch(char e) {
        cout << "Caught char: " << e;
    }
    catch(...) {
        cout << "Caught unknown exception";
    }
    
    return 0;
}`,
    testCases: [
      { input: "1", expectedOutput: "Caught int: 10", description: "Integer exception" },
      { input: "2", expectedOutput: "Caught double: 3.14", description: "Double exception" },
    ],
    hints: ["Each catch block handles one type", "Use catch(...) for unknown types"],
    explanation: "Multiple catch blocks allow handling different exception types separately.",
    pyqInfo: { year: 2019, examDate: "Dec 2019", paperCode: "3E1139", part: "B", questionNumber: 6, marks: 8 },
    chatgptSolutionLink: "",
    concepts: ["Exception Handling", "Multiple Catch", "try-catch"],
    order: 3,
  },
  {
    title: "Friend Function Implementation",
    description: "What is friend function? Write code to explain it.",
    difficulty: "medium",
    category: "functions",
    tags: ["friend-function", "access-specifiers", "encapsulation"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

class Box {
private:
    int length;
public:
    Box(int l) : length(l) {}
    // Declare friend function here
};

// Define friend function to print length

int main() {
    Box b(10);
    // Call friend function
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

class Box {
private:
    int length;
public:
    Box(int l) : length(l) {}
    friend void printLength(Box b);
};

void printLength(Box b) {
    cout << "Length: " << b.length;
}

int main() {
    Box b(10);
    printLength(b);
    return 0;
}`,
    testCases: [
      { input: "", expectedOutput: "Length: 10", description: "Access private member" },
    ],
    hints: ["Friend functions can access private members", "Declare with 'friend' keyword inside class"],
    explanation: "Friend functions are non-member functions that can access private and protected members of a class.",
    pyqInfo: { year: 2019, examDate: "Dec 2019", paperCode: "3E1139", part: "B", questionNumber: 7, marks: 8 },
    chatgptSolutionLink: "",
    concepts: ["Friend Functions", "Access Specifiers", "Encapsulation"],
    order: 4,
  },
  // Part C Questions (15 marks)
  {
    title: "Multiple Inheritance with Ambiguity Resolution",
    description: "What is Multiple Inheritance? How Ambiguities can be resolved in Multiple Inheritance. Show by suitable code.",
    difficulty: "hard",
    category: "inheritance",
    tags: ["multiple-inheritance", "ambiguity", "virtual-base-class", "diamond-problem"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

// Create classes A, B, C where C inherits from both A and B
// Show ambiguity and resolve it

int main() {
    // Demonstrate ambiguity resolution
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

class A {
public:
    void display() { cout << "Class A" << endl; }
};

class B {
public:
    void display() { cout << "Class B" << endl; }
};

class C : public A, public B {
public:
    void show() {
        A::display();  // Resolving ambiguity
        B::display();  // Using scope resolution
    }
};

int main() {
    C obj;
    obj.A::display();  // Explicit call to A's display
    obj.B::display();  // Explicit call to B's display
    obj.show();
    return 0;
}`,
    testCases: [
      { input: "", expectedOutput: "Class A\nClass B\nClass A\nClass B", description: "Ambiguity resolved" },
    ],
    hints: ["Use scope resolution operator ::", "Virtual base class can also help"],
    explanation: "Ambiguity in multiple inheritance occurs when same function exists in multiple base classes. Use scope resolution to resolve.",
    pyqInfo: { year: 2019, examDate: "Dec 2019", paperCode: "3E1139", part: "C", questionNumber: 1, marks: 15 },
    chatgptSolutionLink: "",
    concepts: ["Multiple Inheritance", "Ambiguity", "Scope Resolution"],
    order: 5,
  },
  {
    title: "Online Shopping List Class",
    description: "Define a class to create, update & manage online shopping list of a customer. Take your own assumptions for Data & Member Functions.",
    difficulty: "medium",
    category: "classes-objects",
    tags: ["class", "object", "real-world", "shopping"],
    language: "cpp",
    starterCode: `#include <iostream>
#include <string>
using namespace std;

class ShoppingList {
    // Define data members and member functions
};

int main() {
    // Create and manage shopping list
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

class ShoppingList {
private:
    string items[100];
    float prices[100];
    int quantities[100];
    int count;
    
public:
    ShoppingList() : count(0) {}
    
    void addItem(string name, float price, int qty) {
        items[count] = name;
        prices[count] = price;
        quantities[count] = qty;
        count++;
        cout << "Item added!" << endl;
    }
    
    void updateQuantity(int index, int newQty) {
        if(index >= 0 && index < count) {
            quantities[index] = newQty;
            cout << "Updated!" << endl;
        }
    }
    
    void displayList() {
        float total = 0;
        cout << "Shopping List:" << endl;
        for(int i = 0; i < count; i++) {
            cout << items[i] << " x" << quantities[i] << " = " << prices[i] * quantities[i] << endl;
            total += prices[i] * quantities[i];
        }
        cout << "Total: " << total << endl;
    }
};

int main() {
    ShoppingList cart;
    cart.addItem("Apple", 50, 2);
    cart.addItem("Milk", 30, 1);
    cart.displayList();
    return 0;
}`,
    testCases: [
      { input: "", expectedOutput: "Item added!\nItem added!\nShopping List:\nApple x2 = 100\nMilk x1 = 30\nTotal: 130", description: "Shopping cart" },
    ],
    hints: ["Use arrays for multiple items", "Include add, update, display functions"],
    explanation: "Real-world class implementation demonstrating encapsulation and member functions.",
    pyqInfo: { year: 2019, examDate: "Dec 2019", paperCode: "3E1139", part: "C", questionNumber: 2, marks: 15 },
    chatgptSolutionLink: "",
    concepts: ["Classes", "Objects", "Encapsulation", "Real-world Application"],
    order: 6,
  },
  {
    title: "Overload + Operator for String Concatenation",
    description: "Write a C++ Program to overload '+' operator for string concatenation.",
    difficulty: "medium",
    category: "operator-overloading",
    tags: ["operator-overloading", "string", "concatenation"],
    language: "cpp",
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

class String {
    char str[100];
public:
    // Constructor, operator+ overload, display
};

int main() {
    String s1("Hello ");
    String s2("World");
    String s3 = s1 + s2;
    s3.display();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

class String {
    char str[100];
public:
    String() { str[0] = '\\0'; }
    String(const char* s) { strcpy(str, s); }
    
    String operator+(String &s) {
        String temp;
        strcpy(temp.str, str);
        strcat(temp.str, s.str);
        return temp;
    }
    
    void display() {
        cout << str;
    }
};

int main() {
    String s1("Hello ");
    String s2("World");
    String s3 = s1 + s2;
    s3.display();
    return 0;
}`,
    testCases: [
      { input: "", expectedOutput: "Hello World", description: "String concatenation" },
    ],
    hints: ["Use strcpy and strcat", "Return a new String object"],
    explanation: "Binary operator overloading allows custom types to use operators like +.",
    pyqInfo: { year: 2019, examDate: "Dec 2019", paperCode: "3E1139", part: "C", questionNumber: 3, marks: 15 },
    chatgptSolutionLink: "",
    concepts: ["Operator Overloading", "Binary Operator", "String Class"],
    order: 7,
  },
  {
    title: "Runtime Polymorphism Demo",
    description: "With the help of suitable code explain Runtime Polymorphism.",
    difficulty: "hard",
    category: "polymorphism",
    tags: ["polymorphism", "virtual-function", "runtime", "dynamic-binding"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

class Base {
public:
    // Virtual function
};

class Derived : public Base {
public:
    // Override function
};

int main() {
    // Demonstrate runtime polymorphism using base class pointer
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

class Base {
public:
    virtual void show() {
        cout << "Base class" << endl;
    }
};

class Derived : public Base {
public:
    void show() override {
        cout << "Derived class" << endl;
    }
};

int main() {
    Base *ptr;
    Base b;
    Derived d;
    
    ptr = &b;
    ptr->show();  // Base class
    
    ptr = &d;
    ptr->show();  // Derived class (dynamic binding)
    
    return 0;
}`,
    testCases: [
      { input: "", expectedOutput: "Base class\nDerived class", description: "Dynamic binding" },
    ],
    hints: ["Use virtual keyword", "Use base class pointer pointing to derived object"],
    explanation: "Runtime polymorphism is achieved through virtual functions and base class pointers.",
    pyqInfo: { year: 2019, examDate: "Dec 2019", paperCode: "3E1139", part: "C", questionNumber: 4, marks: 15 },
    chatgptSolutionLink: "",
    concepts: ["Runtime Polymorphism", "Virtual Functions", "Dynamic Binding"],
    order: 8,
  },
  {
    title: "Function Template for Swap",
    description: "Prepare a Swap Function Containing template arguments to swap the content of two variables of type 'int', 'char' & 'float'.",
    difficulty: "medium",
    category: "templates",
    tags: ["templates", "function-template", "generic-programming", "swap"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

// Write template swap function

int main() {
    int a = 5, b = 10;
    char c1 = 'A', c2 = 'B';
    float f1 = 1.5, f2 = 2.5;
    
    // Swap and display all
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

template <typename T>
void swapValues(T &a, T &b) {
    T temp = a;
    a = b;
    b = temp;
}

int main() {
    int a = 5, b = 10;
    swapValues(a, b);
    cout << "Int: " << a << " " << b << endl;
    
    char c1 = 'A', c2 = 'B';
    swapValues(c1, c2);
    cout << "Char: " << c1 << " " << c2 << endl;
    
    float f1 = 1.5, f2 = 2.5;
    swapValues(f1, f2);
    cout << "Float: " << f1 << " " << f2 << endl;
    
    return 0;
}`,
    testCases: [
      { input: "", expectedOutput: "Int: 10 5\nChar: B A\nFloat: 2.5 1.5", description: "All types swapped" },
    ],
    hints: ["Use template <typename T>", "Same logic works for all types"],
    explanation: "Function templates allow writing generic functions that work with any data type.",
    pyqInfo: { year: 2019, examDate: "Dec 2019", paperCode: "3E1139", part: "C", questionNumber: 5, marks: 15 },
    chatgptSolutionLink: "",
    concepts: ["Function Templates", "Generic Programming", "Type Parameters"],
    order: 9,
  },

  // ========================================
  // YEAR: 2022 (April/May 2022)
  // ========================================
  {
    title: "Define Class with Member Functions Inside and Outside",
    description: "Define class? How can we define member function inside and outside the class in C++? Explain with suitable example.",
    difficulty: "easy",
    category: "classes-objects",
    tags: ["class", "member-function", "scope-resolution"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

class Student {
    // Define data members
public:
    // Declare functions - define inside and outside
};

int main() {
    Student s;
    // Use the object
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

class Student {
    int rollNo;
    string name;
    
public:
    // Function defined INSIDE the class (implicit inline)
    void setData(int r, string n) {
        rollNo = r;
        name = n;
    }
    
    // Function DECLARED inside, DEFINED outside
    void display();
};

// Function defined OUTSIDE using scope resolution
void Student::display() {
    cout << "Roll: " << rollNo << ", Name: " << name;
}

int main() {
    Student s;
    s.setData(101, "John");
    s.display();
    return 0;
}`,
    testCases: [
      { input: "", expectedOutput: "Roll: 101, Name: John", description: "Inside and outside definition" },
    ],
    hints: ["Use :: for outside definition", "Inside definition is implicit inline"],
    explanation: "Member functions can be defined inside class (inline) or outside using scope resolution operator.",
    pyqInfo: { year: 2022, examDate: "April/May 2022", part: "C", questionNumber: 1, marks: 10 },
    chatgptSolutionLink: "",
    concepts: ["Classes", "Member Functions", "Scope Resolution"],
    order: 10,
  },
  {
    title: "new/delete Operators and Inline Functions",
    description: "Explain: (a) new and delete operators. (b) inline function.",
    difficulty: "medium",
    category: "functions",
    tags: ["new", "delete", "dynamic-memory", "inline-function"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

// Demonstrate new, delete and inline function

int main() {
    // Dynamic allocation and inline usage
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

// Inline function for addition
inline int add(int a, int b) {
    return a + b;
}

int main() {
    // Dynamic memory allocation with new
    int *ptr = new int;
    *ptr = 100;
    cout << "Dynamic value: " << *ptr << endl;
    delete ptr;  // Free memory
    
    // Dynamic array
    int *arr = new int[3]{10, 20, 30};
    cout << "Array: ";
    for(int i = 0; i < 3; i++)
        cout << arr[i] << " ";
    cout << endl;
    delete[] arr;  // Free array
    
    // Inline function call
    cout << "Sum: " << add(5, 3);
    
    return 0;
}`,
    testCases: [
      { input: "", expectedOutput: "Dynamic value: 100\nArray: 10 20 30 \nSum: 8", description: "new/delete and inline" },
    ],
    hints: ["new allocates, delete frees", "inline replaces function call with body"],
    explanation: "new/delete for dynamic memory, inline for faster small functions.",
    pyqInfo: { year: 2022, examDate: "April/May 2022", part: "C", questionNumber: 2, marks: 10 },
    chatgptSolutionLink: "",
    concepts: ["Dynamic Memory", "new operator", "delete operator", "Inline Functions"],
    order: 11,
  },
  {
    title: "Types of Inheritance with Multiple Inheritance Example",
    description: "What is inheritance? Explain the types of inheritance? Write a program to add two numbers using multiple inheritance in C++?",
    difficulty: "hard",
    category: "inheritance",
    tags: ["inheritance", "multiple-inheritance", "types"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

// Create classes for multiple inheritance to add two numbers

int main() {
    // Use multiple inheritance
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

class Number1 {
protected:
    int num1;
public:
    void getNum1() {
        cout << "Enter first number: ";
        cin >> num1;
    }
};

class Number2 {
protected:
    int num2;
public:
    void getNum2() {
        cout << "Enter second number: ";
        cin >> num2;
    }
};

class Sum : public Number1, public Number2 {
public:
    void add() {
        cout << "Sum = " << num1 + num2;
    }
};

int main() {
    Sum s;
    s.getNum1();
    s.getNum2();
    s.add();
    return 0;
}`,
    testCases: [
      { input: "10\n20", expectedOutput: "Enter first number: Enter second number: Sum = 30", description: "Multiple inheritance sum" },
    ],
    hints: ["Each base class provides one number", "Derived class combines both"],
    explanation: "Multiple inheritance allows a class to inherit from multiple base classes.",
    pyqInfo: { year: 2022, examDate: "April/May 2022", part: "C", questionNumber: 3, marks: 10 },
    chatgptSolutionLink: "",
    concepts: ["Inheritance", "Multiple Inheritance", "Types of Inheritance"],
    order: 12,
  },
  {
    title: "Unary and Binary Operator Overloading",
    description: "What is operator overloading? Explain unary and binary operator overloading in C++ with suitable example?",
    difficulty: "hard",
    category: "operator-overloading",
    tags: ["operator-overloading", "unary", "binary"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

class Counter {
    int value;
public:
    // Implement ++ (unary) and + (binary)
};

int main() {
    // Demonstrate unary and binary overloading
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

class Counter {
    int value;
public:
    Counter(int v = 0) : value(v) {}
    
    // Unary operator ++ (prefix)
    Counter operator++() {
        ++value;
        return *this;
    }
    
    // Binary operator +
    Counter operator+(Counter &c) {
        Counter temp;
        temp.value = value + c.value;
        return temp;
    }
    
    void display() {
        cout << "Value: " << value << endl;
    }
};

int main() {
    Counter c1(5), c2(10);
    
    // Unary
    ++c1;
    c1.display();  // 6
    
    // Binary
    Counter c3 = c1 + c2;
    c3.display();  // 16
    
    return 0;
}`,
    testCases: [
      { input: "", expectedOutput: "Value: 6\nValue: 16", description: "Unary and binary operators" },
    ],
    hints: ["Unary has no parameters", "Binary has one object parameter"],
    explanation: "Unary operators work on single operand, binary on two operands.",
    pyqInfo: { year: 2022, examDate: "April/May 2022", part: "C", questionNumber: 4, marks: 10 },
    chatgptSolutionLink: "",
    concepts: ["Operator Overloading", "Unary Operators", "Binary Operators"],
    order: 13,
  },
  {
    title: "Exception Handling with Program",
    description: "How exception are handled in C++ programming explain with program?",
    difficulty: "medium",
    category: "exception-handling",
    tags: ["exception", "try-catch", "throw"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Demonstrate exception handling with division by zero
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

double divide(int a, int b) {
    if(b == 0)
        throw "Division by zero error!";
    return (double)a / b;
}

int main() {
    int num, den;
    cout << "Enter numerator and denominator: ";
    cin >> num >> den;
    
    try {
        double result = divide(num, den);
        cout << "Result: " << result;
    }
    catch(const char* msg) {
        cout << "Exception: " << msg;
    }
    
    return 0;
}`,
    testCases: [
      { input: "10 2", expectedOutput: "Enter numerator and denominator: Result: 5", description: "Normal division" },
      { input: "10 0", expectedOutput: "Enter numerator and denominator: Exception: Division by zero error!", description: "Division by zero" },
    ],
    hints: ["Use try-catch-throw", "throw from function, catch in main"],
    explanation: "Exception handling uses try-catch blocks to handle runtime errors gracefully.",
    pyqInfo: { year: 2022, examDate: "April/May 2022", part: "C", questionNumber: 5, marks: 10 },
    chatgptSolutionLink: "",
    concepts: ["Exception Handling", "try-catch-throw"],
    order: 14,
  },

  // ========================================
  // YEAR: 2024 (Jan/Feb 2024)
  // ========================================
  {
    title: "Generic Vector Class Template",
    description: "Write a class template to represent generic vector. Include member functions to: (a) create the vector (b) modify element (c) multiply by scalar (d) display the vector.",
    difficulty: "hard",
    category: "templates",
    tags: ["class-template", "vector", "generic-programming"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

template <class T>
class Vector {
    // Implement generic vector
};

int main() {
    // Test with different types
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

template <class T>
class Vector {
    T *arr;
    int size;
public:
    Vector(int s) {
        size = s;
        arr = new T[size];
    }
    
    void create() {
        cout << "Enter " << size << " elements: ";
        for(int i = 0; i < size; i++)
            cin >> arr[i];
    }
    
    void modify(int index, T value) {
        if(index >= 0 && index < size)
            arr[index] = value;
    }
    
    void multiply(T scalar) {
        for(int i = 0; i < size; i++)
            arr[i] *= scalar;
    }
    
    void display() {
        cout << "(";
        for(int i = 0; i < size; i++) {
            cout << arr[i];
            if(i < size - 1) cout << ", ";
        }
        cout << ")" << endl;
    }
    
    ~Vector() { delete[] arr; }
};

int main() {
    Vector<int> v(3);
    v.create();
    v.display();
    v.multiply(2);
    v.display();
    return 0;
}`,
    testCases: [
      { input: "10 20 30", expectedOutput: "Enter 3 elements: (10, 20, 30)\n(20, 40, 60)", description: "Vector operations" },
    ],
    hints: ["Use template <class T>", "Dynamic array allocation"],
    explanation: "Class templates allow creating generic container classes.",
    pyqInfo: { year: 2024, examDate: "Jan/Feb 2024", part: "C", questionNumber: 1, marks: 10 },
    chatgptSolutionLink: "",
    concepts: ["Class Templates", "Generic Programming", "Dynamic Arrays"],
    order: 15,
  },
  {
    title: "Nested Function Exception Handling",
    description: "Write a main program that calls a deeply nested function containing an exception incorporate necessary exception handling mechanism?",
    difficulty: "hard",
    category: "exception-handling",
    tags: ["exception", "nested-functions", "stack-unwinding"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

// Create nested functions with exception

int main() {
    // Handle exception from nested calls
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

void level3() {
    cout << "In level 3" << endl;
    throw "Exception from level 3!";
}

void level2() {
    cout << "In level 2" << endl;
    level3();
    cout << "Back in level 2";  // Never executed
}

void level1() {
    cout << "In level 1" << endl;
    level2();
    cout << "Back in level 1";  // Never executed
}

int main() {
    try {
        level1();
    }
    catch(const char* msg) {
        cout << "Caught in main: " << msg;
    }
    return 0;
}`,
    testCases: [
      { input: "", expectedOutput: "In level 1\nIn level 2\nIn level 3\nCaught in main: Exception from level 3!", description: "Nested exception" },
    ],
    hints: ["Exception propagates up the call stack", "Stack unwinding occurs"],
    explanation: "Exceptions propagate up through nested function calls until caught.",
    pyqInfo: { year: 2024, examDate: "Jan/Feb 2024", part: "C", questionNumber: 2, marks: 10 },
    chatgptSolutionLink: "",
    concepts: ["Exception Propagation", "Stack Unwinding", "Nested Functions"],
    order: 16,
  },
  {
    title: "Print Table of e^x",
    description: "Write a program to print a table of values of the function y = e^x.",
    difficulty: "easy",
    category: "basic-syntax",
    tags: ["math", "loops", "cmath"],
    language: "cpp",
    starterCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    // Print table of e^x for x = 0 to 5
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;

int main() {
    cout << "Table of y = e^x" << endl;
    cout << "----------------" << endl;
    cout << setw(5) << "x" << setw(15) << "e^x" << endl;
    cout << "----------------" << endl;
    
    for(double x = 0; x <= 5; x += 0.5) {
        cout << setw(5) << x << setw(15) << fixed << setprecision(4) << exp(x) << endl;
    }
    
    return 0;
}`,
    testCases: [
      { input: "", expectedOutput: "Table of y = e^x\n----------------\n    x          e^x\n----------------\n    0         1.0000", description: "e^x table (partial)" },
    ],
    hints: ["Use exp() from cmath", "Use iomanip for formatting"],
    explanation: "Mathematical function tables using exp() and formatted output.",
    pyqInfo: { year: 2024, examDate: "Jan/Feb 2024", part: "C", questionNumber: 3, marks: 10 },
    chatgptSolutionLink: "",
    concepts: ["Mathematical Functions", "Loops", "Formatted Output"],
    order: 17,
  },
  {
    title: "Matrix Class with Operations",
    description: "Create a class MAT of size m*n. Define all possible matrix operations for MAT type objects?",
    difficulty: "hard",
    category: "classes-objects",
    tags: ["matrix", "class", "operator-overloading"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

class MAT {
    int arr[10][10];
    int m, n;
public:
    // Matrix operations: input, display, add, multiply
};

int main() {
    // Test matrix operations
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

class MAT {
    int arr[10][10];
    int m, n;
public:
    MAT(int r = 0, int c = 0) : m(r), n(c) {}
    
    void read() {
        cout << "Enter " << m*n << " elements:" << endl;
        for(int i = 0; i < m; i++)
            for(int j = 0; j < n; j++)
                cin >> arr[i][j];
    }
    
    void display() {
        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++)
                cout << arr[i][j] << " ";
            cout << endl;
        }
    }
    
    MAT operator+(MAT &b) {
        MAT temp(m, n);
        for(int i = 0; i < m; i++)
            for(int j = 0; j < n; j++)
                temp.arr[i][j] = arr[i][j] + b.arr[i][j];
        return temp;
    }
};

int main() {
    MAT a(2, 2), b(2, 2);
    a.read();
    b.read();
    cout << "Sum:" << endl;
    MAT c = a + b;
    c.display();
    return 0;
}`,
    testCases: [
      { input: "1 2 3 4\n5 6 7 8", expectedOutput: "Enter 4 elements:\nEnter 4 elements:\nSum:\n6 8 \n10 12", description: "Matrix addition" },
    ],
    hints: ["Use 2D array", "Overload + operator"],
    explanation: "Matrix class with operator overloading for mathematical operations.",
    pyqInfo: { year: 2024, examDate: "Jan/Feb 2024", part: "C", questionNumber: 4, marks: 10 },
    chatgptSolutionLink: "",
    concepts: ["Classes", "2D Arrays", "Operator Overloading"],
    order: 18,
  },
  {
    title: "String Concatenation using + Operator",
    description: "Write a program that reads 'Rajasthan Technical University' from keyboard into three separate string objects and concatenate them using + operator.",
    difficulty: "medium",
    category: "operator-overloading",
    tags: ["string", "operator-overloading", "concatenation"],
    language: "cpp",
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

class String {
    char str[50];
public:
    // Implement input, + operator, display
};

int main() {
    // Read "Rajasthan", "Technical", "University" and concatenate
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

class String {
    char str[100];
public:
    String() { str[0] = '\\0'; }
    
    void read() {
        cin >> str;
    }
    
    String operator+(String &s) {
        String temp;
        strcpy(temp.str, str);
        strcat(temp.str, " ");
        strcat(temp.str, s.str);
        return temp;
    }
    
    void display() {
        cout << str;
    }
};

int main() {
    String s1, s2, s3;
    cout << "Enter three words: ";
    s1.read();  // Rajasthan
    s2.read();  // Technical
    s3.read();  // University
    
    String result = s1 + s2;
    result = result + s3;
    
    cout << "Concatenated: ";
    result.display();
    return 0;
}`,
    testCases: [
      { input: "Rajasthan Technical University", expectedOutput: "Enter three words: Concatenated: Rajasthan Technical University", description: "RTU concatenation" },
    ],
    hints: ["Overload + to add space and string", "Chain concatenation"],
    explanation: "Custom string class with + operator for concatenation.",
    pyqInfo: { year: 2024, examDate: "Jan/Feb 2024", part: "C", questionNumber: 5, marks: 10 },
    chatgptSolutionLink: "",
    concepts: ["String Class", "Operator Overloading", "Concatenation"],
    order: 19,
  },

  // ========================================
  // YEAR: 2025 (Jan 2025)
  // ========================================
  {
    title: "Types of Inheritance with Examples",
    description: "What do you mean by inheritance? Describe the various types of inheritance with examples. Write the difference between single and multilevel inheritance.",
    difficulty: "hard",
    category: "inheritance",
    tags: ["inheritance", "single", "multilevel", "types"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

// Demonstrate Single and Multilevel inheritance

int main() {
    // Show both types
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

// SINGLE INHERITANCE
class Animal {
public:
    void eat() { cout << "Eating..." << endl; }
};

class Dog : public Animal {
public:
    void bark() { cout << "Barking..." << endl; }
};

// MULTILEVEL INHERITANCE
class Vehicle {
public:
    void start() { cout << "Vehicle started" << endl; }
};

class Car : public Vehicle {
public:
    void drive() { cout << "Car driving" << endl; }
};

class SportsCar : public Car {
public:
    void turbo() { cout << "Turbo mode!" << endl; }
};

int main() {
    cout << "SINGLE INHERITANCE:" << endl;
    Dog d;
    d.eat();
    d.bark();
    
    cout << "\\nMULTILEVEL INHERITANCE:" << endl;
    SportsCar sc;
    sc.start();
    sc.drive();
    sc.turbo();
    
    return 0;
}`,
    testCases: [
      { input: "", expectedOutput: "SINGLE INHERITANCE:\nEating...\nBarking...\n\nMULTILEVEL INHERITANCE:\nVehicle started\nCar driving\nTurbo mode!", description: "Both types" },
    ],
    hints: ["Single: one parent", "Multilevel: chain of classes"],
    explanation: "Single inheritance has one parent, multilevel creates a chain.",
    pyqInfo: { year: 2025, examDate: "Jan 2025", part: "C", questionNumber: 1, marks: 10 },
    chatgptSolutionLink: "",
    concepts: ["Inheritance Types", "Single Inheritance", "Multilevel Inheritance"],
    order: 20,
  },
  {
    title: "File Read and Write Operations",
    description: "What is a file? Write steps of file operations. Write a program to write and read text in a file using ofstream and ifstream classes.",
    difficulty: "medium",
    category: "file-handling",
    tags: ["file-handling", "ofstream", "ifstream", "read-write"],
    language: "cpp",
    starterCode: `#include <iostream>
#include <fstream>
using namespace std;

int main() {
    // Write to file, then read from file
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int main() {
    // WRITE to file
    ofstream outFile("data.txt");
    if(outFile) {
        outFile << "Hello, World!" << endl;
        outFile << "File handling in C++" << endl;
        outFile.close();
        cout << "Data written successfully!" << endl;
    }
    
    // READ from file
    ifstream inFile("data.txt");
    string line;
    cout << "Reading file:" << endl;
    while(getline(inFile, line)) {
        cout << line << endl;
    }
    inFile.close();
    
    return 0;
}`,
    testCases: [
      { input: "", expectedOutput: "Data written successfully!\nReading file:\nHello, World!\nFile handling in C++", description: "Read and write" },
    ],
    hints: ["ofstream for writing", "ifstream for reading", "Use getline for reading lines"],
    explanation: "File operations: open, write/read, close using stream classes.",
    pyqInfo: { year: 2025, examDate: "Jan 2025", part: "C", questionNumber: 2, marks: 10 },
    chatgptSolutionLink: "",
    concepts: ["File Handling", "ofstream", "ifstream", "Stream Classes"],
    order: 21,
  },
  {
    title: "Find Elder Person using this Pointer",
    description: "What is this pointer? Write a program to enter name and age of two persons. Find the elder person using this pointer.",
    difficulty: "medium",
    category: "pointers",
    tags: ["this-pointer", "comparison", "objects"],
    language: "cpp",
    starterCode: `#include <iostream>
#include <string>
using namespace std;

class Person {
    string name;
    int age;
public:
    // Use this pointer to compare and find elder
};

int main() {
    // Create two persons and find elder
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

class Person {
    string name;
    int age;
public:
    void getData() {
        cout << "Enter name and age: ";
        cin >> name >> age;
    }
    
    Person& elder(Person &p) {
        if(this->age > p.age)
            return *this;
        else
            return p;
    }
    
    void display() {
        cout << "Elder: " << name << " (Age: " << age << ")";
    }
};

int main() {
    Person p1, p2;
    p1.getData();
    p2.getData();
    
    Person &e = p1.elder(p2);
    e.display();
    
    return 0;
}`,
    testCases: [
      { input: "John 25\nAlice 30", expectedOutput: "Enter name and age: Enter name and age: Elder: Alice (Age: 30)", description: "Find elder" },
    ],
    hints: ["this points to current object", "Return reference for comparison"],
    explanation: "The this pointer refers to the current object, enabling self-comparison.",
    pyqInfo: { year: 2025, examDate: "Jan 2025", part: "C", questionNumber: 3, marks: 10 },
    chatgptSolutionLink: "",
    concepts: ["this Pointer", "Object Comparison", "References"],
    order: 22,
  },
  {
    title: "Overload < Operator to Find Smallest",
    description: "What is the difference between operator overloading and function overloading? Write a program to overload < operator and display the smallest number out of two objects.",
    difficulty: "medium",
    category: "operator-overloading",
    tags: ["operator-overloading", "comparison", "relational-operator"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

class Number {
    int value;
public:
    // Overload < operator
};

int main() {
    // Compare two objects and find smallest
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

class Number {
    int value;
public:
    Number(int v = 0) : value(v) {}
    
    void read() {
        cout << "Enter value: ";
        cin >> value;
    }
    
    bool operator<(Number &n) {
        return this->value < n.value;
    }
    
    void display() {
        cout << "Value: " << value;
    }
};

int main() {
    Number n1, n2;
    n1.read();
    n2.read();
    
    cout << "Smallest: ";
    if(n1 < n2)
        n1.display();
    else
        n2.display();
    
    return 0;
}`,
    testCases: [
      { input: "25\n15", expectedOutput: "Enter value: Enter value: Smallest: Value: 15", description: "Find smallest" },
    ],
    hints: ["< returns bool", "Compare internal values"],
    explanation: "Relational operator overloading enables object comparison.",
    pyqInfo: { year: 2025, examDate: "Jan 2025", part: "C", questionNumber: 4, marks: 10 },
    chatgptSolutionLink: "",
    concepts: ["Operator Overloading", "Relational Operators", "Comparison"],
    order: 23,
  },
  {
    title: "Copy Constructor Demonstration",
    description: "What is copy constructor? Write a program to demonstrate the use of copy constructor.",
    difficulty: "medium",
    category: "constructors-destructors",
    tags: ["copy-constructor", "constructor", "object-copy"],
    language: "cpp",
    starterCode: `#include <iostream>
using namespace std;

class Sample {
    int value;
public:
    // Define copy constructor
};

int main() {
    // Demonstrate copy constructor
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

class Sample {
    int value;
public:
    // Default constructor
    Sample(int v = 0) : value(v) {
        cout << "Default constructor called" << endl;
    }
    
    // Copy constructor
    Sample(const Sample &s) {
        value = s.value;
        cout << "Copy constructor called" << endl;
    }
    
    void display() {
        cout << "Value: " << value << endl;
    }
};

int main() {
    Sample s1(100);      // Default constructor
    Sample s2(s1);       // Copy constructor
    Sample s3 = s1;      // Copy constructor
    
    cout << "s1: "; s1.display();
    cout << "s2: "; s2.display();
    cout << "s3: "; s3.display();
    
    return 0;
}`,
    testCases: [
      { input: "", expectedOutput: "Default constructor called\nCopy constructor called\nCopy constructor called\ns1: Value: 100\ns2: Value: 100\ns3: Value: 100", description: "Copy constructor" },
    ],
    hints: ["Takes const reference parameter", "Creates copy of object"],
    explanation: "Copy constructor creates a new object as a copy of an existing object.",
    pyqInfo: { year: 2025, examDate: "Jan 2025", part: "C", questionNumber: 5, marks: 10 },
    chatgptSolutionLink: "",
    concepts: ["Copy Constructor", "Object Copying", "Constructors"],
    order: 24,
  },
];

async function seedPYQCodingQuestions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Insert all questions
    let inserted = 0;
    let updated = 0;

    for (const q of pyqCodingQuestions) {
      // Check if question already exists (by title and year)
      const existing = await PracticeQuestion.findOne({
        title: q.title,
        "pyqInfo.year": q.pyqInfo.year
      });

      if (existing) {
        await PracticeQuestion.updateOne({ _id: existing._id }, q);
        updated++;
      } else {
        await PracticeQuestion.create(q);
        inserted++;
      }
    }

    console.log(`\n✅ PYQ Coding Questions seeded successfully!`);
    console.log(`   📝 Inserted: ${inserted} new questions`);
    console.log(`   🔄 Updated: ${updated} existing questions`);
    console.log(`   📊 Total: ${pyqCodingQuestions.length} questions`);

    // Summary by year
    console.log("\n📊 QUESTIONS BY YEAR:");
    console.log("═══════════════════════════════════════════");
    const years = [2019, 2022, 2024, 2025];
    for (const year of years) {
      const count = pyqCodingQuestions.filter(q => q.pyqInfo.year === year).length;
      console.log(`   ${year}: ${count} questions`);
    }

    mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB. Seeding complete!");
  } catch (error) {
    console.error("❌ Error seeding questions:", error);
    process.exit(1);
  }
}

seedPYQCodingQuestions();
