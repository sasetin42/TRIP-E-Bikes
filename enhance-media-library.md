# Plan: Enhance Media Library

This document outlines the plan to enhance the user interface, design, and functionality of the Media Library page (`src/pages/admin/AdminMedia.tsx`).

---

## 1. Objectives & Features to Implement

### A. Sorting Functions
- **Options**:
  - Date Uploaded (Newest first / Oldest first)
  - File Size (Largest first / Smallest first)
  - File Name (A to Z / Z to A)
- **Implementation**:
  - Add a state variable `sortBy`:
    ```typescript
    const [sortBy, setSortBy] = useState<"date-newest" | "date-oldest" | "size-largest" | "size-smallest" | "name-az" | "name-za">("date-newest");
    ```
  - Apply the sorting logic dynamic computed property inside or after the `filteredMedia` filtering step.
  - Render a styled sorting selection dropdown next to the search bar.

### B. Grid vs. List View Toggle
- **Options**:
  - **Grid View**: The standard responsive square card layout.
  - **List View**: A sleek tabular layout showing:
    - Mini thumbnail / icon representation
    - File name, tag/type
    - Upload date
    - File size
    - Uploader name
    - Inline quick-actions (Preview, Copy URL, Delete)
- **Implementation**:
  - Add a state variable `viewMode`:
    ```typescript
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    ```
  - Render a View Toggle control bar element using Lucide icons `Grid` and `List` next to the search and sort filters.

### C. Bulk Actions & Multiselect
- **Functions**:
  - Select/deselect individual files via checkboxes.
  - "Select All" checkbox.
  - Floating Bulk Actions Bar showing:
    - Number of items selected.
    - **Bulk Delete**: Deletes all selected files from both Firestore and Firebase Storage.
    - **Bulk Copy Links**: Concatenates selected download URLs separated by newlines and copies them to the clipboard.
    - **Deselect All** button.
- **Implementation**:
  - Add a state variable `selectedIds`:
    ```typescript
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    ```
  - Embed Checkbox components on each card (top-left) in Grid View and as the first column in List View.
  - Provide a floating control overlay at the bottom of the viewport when `selectedIds.length > 0`.

### D. Fullscreen Modal Enhancements
- **Enhancements**:
  - **Pagination Controls**: Previous (<) and Next (>) buttons on the modal overlay to cycle through currently filtered/sorted media assets.
  - **Keyboard Navigation**: ArrowLeft/ArrowRight to paginate, Escape to close.
  - **Direct Download Button**: Download the original asset using browser blobs.
- **Implementation**:
  - Track current preview index based on `sortedAndFilteredMedia`.
  - Add `handlePrev()` and `handleNext()` methods.
  - Add a `useEffect` listener for keyboard interactions when `previewItem` is open.
  - Implement a direct blob-download helper to bypass standard browser tab redirection.

### E. Modernized Glassmorphism & Neon Visuals
- **Design Tokens**:
  - **Borders**: Thin elegant borders with high-contrast active neon highlights (using Trip E-Bikes signature colors like `#39FF14`).
  - **Card Hover Effects**: Smooth scaling (`duration-300`), backdrop blur/glassmorphic quick action menus, and glowing cyan/neon shadow drops (`shadow-[0_0_15px_rgba(57,255,20,0.15)]`).
  - **Badges**: Neon capsule tags for media types (e.g., `bg-cyan-500/10 text-cyan-400 border border-cyan-500/20` for videos, and `bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20` for images).

### F. Drag and Drop Upload Support
- **Interface**:
  - Dragging files over the page displays an interactive overlay covering the library area, urging the user to drop files to upload.
- **Implementation**:
  - Manage dragging state:
    ```typescript
    const [isDragging, setIsDragging] = useState(false);
    ```
  - Bind custom `onDragOver`, `onDragEnter`, `onDragLeave`, and `onDrop` events on the main page wrapper, feeding incoming files to `handleFileUpload`.

---

## 2. File to Modify

- `src/pages/admin/AdminMedia.tsx`

---

## 3. Detailed Component Structure Changes

### A. State Additions
```typescript
const [sortBy, setSortBy] = useState<"date-newest" | "date-oldest" | "size-largest" | "size-smallest" | "name-az" | "name-za">("date-newest");
const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [isDragging, setIsDragging] = useState(false);
```

### B. Sorting & Filtering Engine
```typescript
const sortedAndFilteredMedia = [...media]
  .filter((item) => {
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "images" && item.type === "image") || 
      (activeTab === "videos" && item.type === "video");
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  })
  .sort((a, b) => {
    switch (sortBy) {
      case "date-newest":
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case "date-oldest":
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      case "size-largest":
        return b.size - a.size;
      case "size-smallest":
        return a.size - b.size;
      case "name-az":
        return a.name.localeCompare(b.name);
      case "name-za":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });
```

### C. Download Utility
```typescript
const handleDownload = async (item: MediaItem) => {
  try {
    const response = await fetch(item.url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    toast.success("Download started!");
  } catch (err) {
    window.open(item.url, "_blank");
  }
};
```

---

## 4. Verification & Testing Steps

1. **Upload Testing**:
   - Drag and drop image/video files anywhere in the Media Library container to verify the drop zone triggers overlay and uploads files properly.
2. **Filtering & Sorting Verification**:
   - Change dropdown option to "Size (Largest)" to check if elements re-order.
   - Switch active tab to "Images" or "Videos" and type search queries to verify combined filter state matches expectations.
3. **Bulk Actions Verification**:
   - Check multiple cards. Ensure the Bulk Action Bar rises from the bottom of the screen.
   - Test "Copy Selected Links" and verify clipboard values.
   - Test "Delete Selected" to verify multiple documents are removed from Firestore and files are cleaned up from Firebase storage.
4. **Modal Lightbox Controls**:
   - Open a media item preview.
   - Press right/left arrows to slide through pages, verifying visual slide transition states.
   - Click the "Download" button to verify files download directly.
