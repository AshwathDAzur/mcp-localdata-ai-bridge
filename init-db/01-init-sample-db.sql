-- Create sample database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SampleDB')
BEGIN
    CREATE DATABASE SampleDB;
END
GO

USE SampleDB;
GO

-- Create sample tables
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Customers')
BEGIN
    CREATE TABLE Customers (
        CustomerID INT PRIMARY KEY IDENTITY(1,1),
        FirstName NVARCHAR(50) NOT NULL,
        LastName NVARCHAR(50) NOT NULL,
        Email NVARCHAR(100) UNIQUE NOT NULL,
        Phone NVARCHAR(20),
        Address NVARCHAR(200),
        City NVARCHAR(50),
        Country NVARCHAR(50) DEFAULT 'USA',
        CreatedDate DATETIME DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
BEGIN
    CREATE TABLE Products (
        ProductID INT PRIMARY KEY IDENTITY(1,1),
        ProductName NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500),
        Category NVARCHAR(50),
        Price DECIMAL(10,2) NOT NULL,
        StockQuantity INT DEFAULT 0,
        CreatedDate DATETIME DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Orders')
BEGIN
    CREATE TABLE Orders (
        OrderID INT PRIMARY KEY IDENTITY(1,1),
        CustomerID INT NOT NULL,
        OrderDate DATETIME DEFAULT GETDATE(),
        TotalAmount DECIMAL(10,2) NOT NULL,
        Status NVARCHAR(20) DEFAULT 'Pending',
        FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OrderItems')
BEGIN
    CREATE TABLE OrderItems (
        OrderItemID INT PRIMARY KEY IDENTITY(1,1),
        OrderID INT NOT NULL,
        ProductID INT NOT NULL,
        Quantity INT NOT NULL,
        UnitPrice DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
        FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
    );
END
GO

-- Insert sample data
IF NOT EXISTS (SELECT * FROM Customers WHERE CustomerID = 1)
BEGIN
    INSERT INTO Customers (FirstName, LastName, Email, Phone, Address, City, Country)
    VALUES
        ('John', 'Doe', 'john.doe@email.com', '555-0101', '123 Main St', 'New York', 'USA'),
        ('Jane', 'Smith', 'jane.smith@email.com', '555-0102', '456 Oak Ave', 'Los Angeles', 'USA'),
        ('Bob', 'Johnson', 'bob.johnson@email.com', '555-0103', '789 Pine Rd', 'Chicago', 'USA'),
        ('Alice', 'Williams', 'alice.williams@email.com', '555-0104', '321 Elm St', 'Houston', 'USA'),
        ('Charlie', 'Brown', 'charlie.brown@email.com', '555-0105', '654 Maple Dr', 'Phoenix', 'USA');
END
GO

IF NOT EXISTS (SELECT * FROM Products WHERE ProductID = 1)
BEGIN
    INSERT INTO Products (ProductName, Description, Category, Price, StockQuantity)
    VALUES
        ('Laptop Pro', 'High-performance laptop with 16GB RAM', 'Electronics', 1299.99, 50),
        ('Wireless Mouse', 'Ergonomic wireless mouse', 'Electronics', 29.99, 200),
        ('Mechanical Keyboard', 'RGB mechanical keyboard', 'Electronics', 149.99, 75),
        ('Office Chair', 'Comfortable ergonomic office chair', 'Furniture', 299.99, 30),
        ('Desk Lamp', 'LED desk lamp with adjustable brightness', 'Furniture', 49.99, 100),
        ('Coffee Maker', 'Programmable coffee maker', 'Appliances', 89.99, 40),
        ('USB-C Cable', 'Fast charging USB-C cable', 'Electronics', 19.99, 300),
        ('Monitor Stand', 'Adjustable monitor stand', 'Furniture', 79.99, 60);
END
GO

IF NOT EXISTS (SELECT * FROM Orders WHERE OrderID = 1)
BEGIN
    INSERT INTO Orders (CustomerID, OrderDate, TotalAmount, Status)
    VALUES
        (1, GETDATE(), 1329.98, 'Completed'),
        (2, GETDATE(), 179.98, 'Processing'),
        (3, GETDATE(), 449.98, 'Pending'),
        (1, DATEADD(day, -5, GETDATE()), 89.99, 'Completed'),
        (4, DATEADD(day, -3, GETDATE()), 299.99, 'Completed');
    
    INSERT INTO OrderItems (OrderID, ProductID, Quantity, UnitPrice)
    VALUES
        (1, 1, 1, 1299.99),
        (1, 2, 1, 29.99),
        (2, 3, 1, 149.99),
        (2, 2, 1, 29.99),
        (3, 4, 1, 299.99),
        (3, 5, 3, 49.99),
        (4, 6, 1, 89.99),
        (5, 4, 1, 299.99);
END
GO

PRINT 'Sample database and tables created successfully!';
GO

