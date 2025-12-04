# Audio Studio - Web Audio Player

Sleek music player web application for uploading, managing, and playing audio files with advanced audio processing capabilities. Built with Next.js and the Web Audio API.

## Features

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

- Node.js 20+
- npm or yarn package manager

**Local Development:**

- Full file upload functionality available
- Files stored in `data/` directory

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
