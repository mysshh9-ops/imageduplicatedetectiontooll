# imageduplicatedetectiontooll

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-h4zw4tbe)
# HashLens 🔍

**HashLens** is an intelligent image duplicate detection tool that identifies exact duplicates and visually similar images using advanced image hashing techniques. Instead of comparing pixels directly, HashLens generates perceptual fingerprints of images and measures similarity using Hamming Distance.

## 🚀 Live Demo

Add your deployed application link here:

**Demo:** [Your Deployment URL]

---

## ✨ Features

### Image Upload

* Drag-and-drop image upload
* Multiple image support
* Instant image preview
* Browser-based processing

### Duplicate Detection

* Detects exact duplicate images
* Finds visually similar images
* Adjustable similarity threshold
* Side-by-side image comparison

### Advanced Image Hashing

* Average Hash (aHash)
* Difference Hash (dHash)
* Perceptual Hash (pHash)

### Analytics Dashboard

* Total images analyzed
* Matches detected
* Exact duplicates found
* Similarity scoring

### Modern User Experience

* Responsive design
* Glassmorphism-inspired UI
* Dark mode aesthetic
* Interactive visualizations
* Real-time processing feedback

---

## 🧠 How It Works

Traditional image comparison methods rely on pixel-by-pixel matching, which often fails when images are resized, compressed, or slightly modified.

HashLens uses image hashing techniques to generate compact visual fingerprints.

### Step 1: Image Hash Generation

For every uploaded image, the application computes:

#### aHash (Average Hash)

Converts the image to grayscale, resizes it, and compares each pixel against the average brightness.

#### dHash (Difference Hash)

Measures differences between neighboring pixels to capture image structure.

#### pHash (Perceptual Hash)

Uses Discrete Cosine Transform (DCT) to extract low-frequency visual features that represent the overall appearance of the image.

---

### Step 2: Similarity Measurement

Hashes are compared using **Hamming Distance**, which counts the number of differing bits between two hashes.

Formula:

Similarity (%) = (1 − Hamming Distance / Hash Length) × 100

---

### Step 3: Combined Similarity Score

HashLens combines the results from all three hashing techniques:

* aHash → 20%
* dHash → 30%
* pHash → 50%

This weighted approach improves robustness and reduces false positives.

---

## 🛠 Tech Stack

### Frontend

* React
* TypeScript
* Vite

### Styling

* Tailwind CSS

### Algorithms

* Average Hash (aHash)
* Difference Hash (dHash)
* Perceptual Hash (pHash)
* Hamming Distance

### Icons

* Lucide React

---

## 📂 Project Structure

```text
src/
├── components/
│   ├── ComparisonView
│   ├── HashVisualization
│   └── UI Components
│
├── lib/
│   └── imageHash.ts
│
├── App.tsx
└── main.tsx
```

---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/mysshh9-ops/imageduplicatedetectiontooll.git
```

Navigate into the project:

```bash
cd imageduplicatedetectiontooll
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

## 🎯 Use Cases

* Photo library cleanup
* Duplicate image detection
* Digital asset management
* Dataset preprocessing
* Content moderation workflows
* Media organization

---

## 🔬 Technical Highlights

* Fully client-side image processing
* No image data leaves the user's device
* Custom implementation of image hashing algorithms
* DCT-based perceptual hashing
* Hamming Distance similarity analysis
* Near-duplicate image detection

---

## 🏆 Hackathon Submission

This project was built as a solution for a challenge requiring the use of **image hashing techniques** to detect duplicate and visually similar images.

### Requirements Fulfilled

✅ Image upload support

✅ Duplicate image detection

✅ Visual similarity detection

✅ Image hashing techniques implemented

✅ Similarity percentage calculation

✅ Side-by-side comparison of matching images

---

## 🔒 Privacy

All image processing occurs locally within the browser.

No uploaded images are transmitted to external servers.

---

## 👨‍💻 Author

**Misshu**

GitHub: https://github.com/mysshh9-ops

---

## 📜 License

MIT License
