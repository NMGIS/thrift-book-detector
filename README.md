# Thrift Book Finder

Thrift Book Finder helps you quickly identify valuable or interesting books on unsorted thrift store shelves. Instead of scanning titles one by one, just upload a photo and the app highlights books from your personal list using OCR and fuzzy matching.

## 🔗 Live App
https://nmgis.github.io/thrift-book-detector

## 🚀 What It Does

- Upload a photo of a bookshelf
- Extracts text using Google Cloud Vision OCR
- Matches text against your custom list of authors or titles
- Highlights the matches directly in the image
- Displays all matched phrases in a clean results table

## 💻 Tech Stack

- **React** – frontend UI
- **RESTful Flask API** – backend OCR and matching logic
- **Google Cloud Vision API** – OCR engine
- **RapidFuzz** – fuzzy matching
- **GitHub Pages** – frontend hosting
- **Render** – backend hosting

## 📂 Upload Format

Optional list upload:  
- File types: `.csv`, `.txt`  
- Format: comma-separated list, no header required  
  Example:  
  `Cormac McCarthy, Lord of the Rings, JRR Tolkien, Lonesome Dove`