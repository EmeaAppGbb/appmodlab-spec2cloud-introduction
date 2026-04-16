---
title: "Intro to Spec2Cloud"
description: "Learn spec-driven development with OpenShelf Library - generate specs from code and build modern apps"
authors: ["marconsilva"]
category: "Spec-Driven Development"
industry: "Education"
services: []
languages: ["JavaScript"]
frameworks: ["Node.js", "Express.js"]
modernizationTools: ["Spec2Cloud"]
agenticTools: []
tags: ["spec-driven", "specification", "architecture", "api-contracts", "methodology"]
extensions: ["github.copilot"]
thumbnail: ""
video: ""
version: "1.0.0"
---

## Overview

This lab introduces spec-driven development using the OpenShelf Library application. You'll learn how to generate specifications from existing code and use them to build modern applications with Spec2Cloud.

## Understanding the Legacy Application

The OpenShelf Library is a Node.js Express application with SQLite storage, Bootstrap UI, and EJS templates. Below is what the legacy application looks like when running (`npm start` on port 3000).

The homepage serves as the main entry point to the library system:

![Homepage](assets/screenshots/01-homepage.png)

### Book Management

The book catalog displays all books in the library with search and filter capabilities:

![Book Catalog](assets/screenshots/02-book-catalog.png)

New books can be added through a structured form with fields for title, author, ISBN, and category:

![Add Book Form](assets/screenshots/03-add-book-form.png)

### Member & Loan Management

The members list shows all registered library members and their borrowing status:

![Members List](assets/screenshots/04-members-list.png)

The loans overview tracks all active and historical book loans across the library:

![Loans Overview](assets/screenshots/05-loans-overview.png)

The checkout form handles the book lending process, linking a member to a book:

![Checkout Form](assets/screenshots/06-checkout-form.png)

## Screenshots Reference

| Screenshot | Description |
|---|---|
| ![Homepage](assets/screenshots/01-homepage.png) | Library homepage |
| ![Book Catalog](assets/screenshots/02-book-catalog.png) | Book catalog listing |
| ![Add Book Form](assets/screenshots/03-add-book-form.png) | New book entry form |
| ![Members List](assets/screenshots/04-members-list.png) | Library members list |
| ![Loans Overview](assets/screenshots/05-loans-overview.png) | Book loans tracking |
| ![Checkout Form](assets/screenshots/06-checkout-form.png) | Book checkout form |
