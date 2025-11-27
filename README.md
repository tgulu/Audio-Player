# Audio Studio - Web Audio Player

Sleek music player web application for uploading, managing, and playing audio files with advanced audio processing capabilities. Built with Next.js and the Web Audio API.

## 🎵 Features

### **Audio Library Management**

- Upload and store audio files permanently
- Rename and delete files from your personal library
- View file metadata (size, upload date)
- Persistent storage across sessions

### **Advanced Audio Player**

- Play, pause, and stop audio playback
- Adjust playback speed (0.5x to 2x)
- Real-time audio filtering with high-pass and low-pass filters
- Frequency control for fine-tuning audio effects
- Settings persistence between sessions

### **Modern UI/UX**

- Spotify-inspired dark theme design
- Smooth animations and hover effects
- Responsive design for all devices
- Intuitive file management interface

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd audio-studio

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Deployment Notes

**Netlify Deployment:**

- File uploads work locally but have limitations on Netlify
- Netlify serverless functions have read-only filesystem access
- For production, consider using cloud storage services like:
  - AWS S3 for file storage
  - Cloudinary for media management
  - Supabase for database and file storage

**Local Development:**

- Full file upload functionality available
- Files stored in `data/` directory
- All features work as expected

## 🏗️ Architecture

### **Frontend**

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **CSS Modules** - Scoped styling
- **Web Audio API** - Real-time audio processing

### **Backend APIs**

- **File Storage API** - Server-side file management
- **User Data API** - Persistent user settings and library
- **Audio Processing** - Real-time audio manipulation

## Audio Processing

### **AudioBufferSourceNode**

The core component for audio playback and manipulation:

```javascript
// Create audio source from buffer
const source = context.createBufferSource();
source.buffer = audioBuffer;

// Control playback speed
source.playbackRate.value = 1.5; // 1.5x speed

// Start playback
source.start();
```

**Key Features:**

- **Playback Rate Control**: Adjust speed without affecting audio quality
- **Real-time Manipulation**: Change settings during playback
- **Buffer Management**: Efficient memory usage for large audio files

### **BiquadFilterNode**

Advanced audio filtering for professional sound processing:

```javascript
// Create filter node
const filter = context.createBiquadFilter();
filter.type = "highpass"; // or 'lowpass'
filter.frequency.value = 1000; // Hz

// Connect audio chain
source.connect(filter);
filter.connect(context.destination);
```

**Filter Types:**

- **High-Pass Filter**: Removes low frequencies, keeps high frequencies
- **Low-Pass Filter**: Removes high frequencies, keeps low frequencies
- **Real-time Adjustment**: Change frequency during playback

## Storage APIs

### **File Storage (`app/storage/files.ts`)**

Handles binary file storage and retrieval:

- Store audio files as byte streams
- Read files as readable streams
- Automatic directory management
- File deduplication

### **User Data (`app/storage/user-data.ts`)**

Persistent user data with type safety:

- Audio playback settings
- Library management
- User preferences
- Zod schema validation

```typescript
// User data schema
const USER_DATA = z.object({
  audioPlaybackSettings: z.object({
    playbackRate: z.number().default(1),
    filterType: z.enum(["none", "highpass", "lowpass"]),
    highpassFrequency: z.number().default(1000),
    lowpassFrequency: z.number().default(1000),
  }),
  library: z.array(AudioFile).default([]),
});
```

## Design System

### **Color Palette**

- **Primary Green**: `#1db954` (Spotify-inspired)
- **Background**: `#121212` to `#1e1e1e` gradient
- **Text**: `#ffffff` with `#b3b3b3` for secondary text

### **Components**

- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Icons**: Music-themed emojis (🎛️, 🎧)
- **Animations**: Smooth transitions and micro-interactions

## Pages

### **Home (`/`)**

- Navigation to Audio Player and Library
- Clean, minimal landing page

### **Audio Player (`/player`)**

- File upload and playback interface
- Real-time audio controls
- Progress bar with time display
- Settings persistence

### **Library (`/library`)**

- File management interface
- Upload, rename, and delete files
- File metadata display
- Empty state handling

## Technical Implementation

### **Audio Context Management**

```typescript
// Create and manage audio context
const context = new AudioContext();
const source = context.createBufferSource();
const filter = context.createBiquadFilter();
const gain = context.createGain();

// Audio routing
source → filter → gain → destination
```

### **State Management**

- React hooks for local state
- Custom hooks for audio processing
- Persistent storage for user preferences
- Real-time audio parameter updates

### **Performance Optimizations**

- Debounced settings saves
- Efficient audio buffer handling
- Optimized re-renders
- Memory leak prevention

## Development

### **Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### **File Structure**

```
app/
├── components/      # React components
├── storage/         # Backend APIs
├── hooks/           # Custom React hooks
├── library/         # Library page
├── player/          # Player page
└── globals.css      # Global styles
```

## Future Enhancements

- **Playlist Support**: Create and manage playlists
- **Audio Visualization**: Real-time waveform display
- **Advanced Filters**: EQ, reverb, delay effects
- **Collaboration**: Share libraries with other users

## Resources

- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Next.js Documentation](https://nextjs.org/docs)
- [Audio Filtering Guide](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode)

## License

This project is open source and available under the [MIT License](LICENSE).
