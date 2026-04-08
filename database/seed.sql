-- OpenShelf Library Seed Data

-- Insert 20 Books (Classic Literature and Tech Books)
INSERT INTO books (title, author, isbn, genre, published_year, available_copies, total_copies) VALUES
('To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 'Fiction', 1960, 3, 5),
('1984', 'George Orwell', '978-0-452-28423-4', 'Dystopian', 1949, 2, 4),
('Pride and Prejudice', 'Jane Austen', '978-0-14-143951-8', 'Romance', 1813, 4, 4),
('The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 'Fiction', 1925, 1, 3),
('Moby Dick', 'Herman Melville', '978-0-14-243724-7', 'Adventure', 1851, 2, 2),
('Clean Code', 'Robert C. Martin', '978-0-13-235088-4', 'Technology', 2008, 2, 3),
('The Pragmatic Programmer', 'Andrew Hunt', '978-0-13-511963-2', 'Technology', 2019, 1, 2),
('Design Patterns', 'Gang of Four', '978-0-20-163361-0', 'Technology', 1994, 2, 3),
('JavaScript: The Good Parts', 'Douglas Crockford', '978-0-596-51774-8', 'Technology', 2008, 3, 3),
('You Don''t Know JS', 'Kyle Simpson', '978-1-491-95077-6', 'Technology', 2015, 2, 4),
('The Catcher in the Rye', 'J.D. Salinger', '978-0-316-76948-0', 'Fiction', 1951, 3, 3),
('Brave New World', 'Aldous Huxley', '978-0-06-085052-4', 'Dystopian', 1932, 2, 2),
('The Hobbit', 'J.R.R. Tolkien', '978-0-547-92822-7', 'Fantasy', 1937, 1, 5),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', '978-0-590-35340-3', 'Fantasy', 1997, 0, 4),
('The Lord of the Rings', 'J.R.R. Tolkien', '978-0-618-64561-6', 'Fantasy', 1954, 2, 3),
('Introduction to Algorithms', 'Thomas H. Cormen', '978-0-262-03384-8', 'Technology', 2009, 2, 2),
('Effective Java', 'Joshua Bloch', '978-0-13-468599-1', 'Technology', 2017, 3, 3),
('The Mythical Man-Month', 'Frederick Brooks', '978-0-201-83595-3', 'Technology', 1975, 2, 2),
('Jane Eyre', 'Charlotte Brontë', '978-0-14-144114-6', 'Romance', 1847, 3, 3),
('Wuthering Heights', 'Emily Brontë', '978-0-14-143955-6', 'Romance', 1847, 2, 2);

-- Insert 10 Members
INSERT INTO members (name, email, phone, membership_date, status) VALUES
('Alice Johnson', 'alice.johnson@email.com', '555-0101', '2023-01-15', 'active'),
('Bob Smith', 'bob.smith@email.com', '555-0102', '2023-02-20', 'active'),
('Carol White', 'carol.white@email.com', '555-0103', '2023-03-10', 'active'),
('David Brown', 'david.brown@email.com', '555-0104', '2023-04-05', 'active'),
('Emma Davis', 'emma.davis@email.com', '555-0105', '2023-05-12', 'active'),
('Frank Miller', 'frank.miller@email.com', '555-0106', '2023-06-18', 'active'),
('Grace Wilson', 'grace.wilson@email.com', '555-0107', '2023-07-22', 'inactive'),
('Henry Taylor', 'henry.taylor@email.com', '555-0108', '2023-08-30', 'active'),
('Iris Anderson', 'iris.anderson@email.com', '555-0109', '2023-09-14', 'active'),
('Jack Thomas', 'jack.thomas@email.com', '555-0110', '2023-10-25', 'active');

-- Insert 15 Loans (mix of active, returned, and overdue)
INSERT INTO loans (book_id, member_id, loan_date, due_date, return_date, status) VALUES
-- Active loans
(1, 1, date('now', '-7 days'), date('now', '+7 days'), NULL, 'active'),
(2, 2, date('now', '-5 days'), date('now', '+9 days'), NULL, 'active'),
(6, 3, date('now', '-3 days'), date('now', '+11 days'), NULL, 'active'),
(7, 4, date('now', '-2 days'), date('now', '+12 days'), NULL, 'active'),
(13, 5, date('now', '-1 days'), date('now', '+13 days'), NULL, 'active'),
-- Overdue loans
(4, 6, date('now', '-20 days'), date('now', '-6 days'), NULL, 'overdue'),
(14, 8, date('now', '-25 days'), date('now', '-11 days'), NULL, 'overdue'),
(14, 9, date('now', '-18 days'), date('now', '-4 days'), NULL, 'overdue'),
(14, 10, date('now', '-22 days'), date('now', '-8 days'), NULL, 'overdue'),
-- Returned loans
(1, 1, date('now', '-30 days'), date('now', '-16 days'), date('now', '-18 days'), 'returned'),
(2, 2, date('now', '-28 days'), date('now', '-14 days'), date('now', '-15 days'), 'returned'),
(3, 3, date('now', '-25 days'), date('now', '-11 days'), date('now', '-12 days'), 'returned'),
(8, 4, date('now', '-35 days'), date('now', '-21 days'), date('now', '-22 days'), 'returned'),
(10, 5, date('now', '-40 days'), date('now', '-26 days'), date('now', '-27 days'), 'returned'),
(15, 6, date('now', '-45 days'), date('now', '-31 days'), date('now', '-30 days'), 'returned');
