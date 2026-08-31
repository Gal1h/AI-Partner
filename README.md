# AI-Partner

Your AI Companion that can See (Screen/Camera), Hear (Microphone/Audio), and Speak (Text-to-Speech).

## Features

- **Screen Capture**: Real-time screen monitoring with configurable FPS, quality, and region selection
- **Camera Access**: Support for V4L2 cameras with configurable resolution and frame rate
- **Audio Input**: Microphone and system audio capture with level visualization
- **Text-to-Speech**: Multiple voices, adjustable rate, volume, and pitch
- **Credentials Manager**: Secure storage using system keyring with UI management
- **Cross-platform**: Built with Tauri 2, runs natively on Linux (CachyOS/Arch), macOS, and Windows

## Prerequisites

### CachyOS / Arch Linux

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install system dependencies
sudo pacman -S webkit2gtk-4.1 librsvg libv4l alsa-lib pulseaudio \
  gst-plugins-base gst-plugins-good gst-plugins-bad gst-plugins-ugly \
  libappindicator-gtk3 libayatana-appindicator \
  base-devel pkg-config

# Install Node.js
sudo pacman -S nodejs npm

# Or use a version manager like fnm/nvm
```

### Other Linux Distributions

```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-dev librsvg2-dev libv4l-dev \
  libasound2-dev libpulse-dev libgtk-3-dev \
  gstreamer1.0-plugins-base gstreamer1.0-plugins-good \
  gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly \
  libappindicator3-dev libayatana-appindicator3-dev \
  build-essential pkg-config

# Fedora
sudo dnf install webkit2gtk4.1-devel librsvg2-devel libv4l-devel \
  alsa-lib-devel pulseaudio-libs-devel gtk3-devel \
  gstreamer1-plugins-base gstreamer1-plugins-good \
  gstreamer1-plugins-bad-free gstreamer1-plugins-ugly \
  libappindicator-gtk3-devel libayatana-appindicator-gtk3-devel \
  @development-tools pkgconf-pkg-config
```

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-partner.git
cd ai-partner

# Install frontend dependencies
npm install

# Build the application
npm run build

# Development mode
npm run tauri dev
```

## Building for Distribution

```bash
# Build for current platform
npm run tauri build

# The built application will be in:
# src-tauri/target/release/bundle/
```

## Usage

### Screen Capture
1. Navigate to the **Screen Capture** tab
2. Select a monitor from the dropdown
3. Adjust FPS and quality settings
4. Optionally enable custom region
5. Click **Start Capture**

### Camera
1. Navigate to the **Camera** tab
2. Select a camera device
3. Configure resolution and FPS
4. Click **Start Camera**

### Audio Recording
1. Navigate to the **Audio** tab
2. Select an input device
3. Configure sample rate, channels, and format
4. Optionally specify output file path
5. Click **Start Recording**

### Text-to-Speech
1. Navigate to the **Text-to-Speech** tab
2. Enter text to speak
3. Select a voice from available system voices
4. Adjust rate, volume, and pitch
5. Click **Speak**

### Credentials
1. Navigate to the **Credentials** tab
2. Click **Add Credential**
3. Fill in service name, username, password
4. Add any additional metadata (JSON)
5. Click **Add Credential** (passwords stored in system keyring)

## Configuration

Settings are automatically persisted and include:
- Auto-start on login
- Minimize to tray
- Theme (Light/Dark/System)
- Default capture settings for screen, camera, audio
- TTS defaults (voice, rate, volume, pitch)

## Architecture

```
src/
├── components/       # React components
│   ├── layout/       # Layout components (Sidebar, Header, Layout)
│   └── common/       # Shared components
├── contexts/         # React contexts (AppContext)
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── services/         # API services (Tauri commands)
├── types/            # TypeScript type definitions
└── main.tsx          # Entry point

src-tauri/
├── src/
│   ├── screen/       # Screen capture (scrap/xcap)
│   ├── camera/       # Camera access (v4l/camera crate)
│   ├── audio/        # Audio input (cpal/hound)
│   ├── tts/          # Text-to-speech (tts crate)
│   ├── credentials/  # Credentials management (keyring)
│   ├── commands/     # Tauri command handlers
│   ├── types/        # Shared Rust types
│   └── utils/        # Utility functions
├── Cargo.toml        # Rust dependencies
└── tauri.conf.json   # Tauri configuration
```

## Technologies

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Rust, Tauri 2
- **Screen Capture**: scrap (Wayland/X11), xcap
- **Camera**: v4l, camera crate
- **Audio**: cpal, hound (WAV), rubato (resampling)
- **TTS**: tts crate (Piper, System)
- **Storage**: tauri-plugin-store, keyring
- **Styling**: CSS Variables, CSS Modules

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Troubleshooting

### Screen capture not working on Wayland
Ensure you have the proper permissions and are running on a Wayland compositor that supports screen capture (GNOME, KDE, wlroots-based).

### Camera not detected
Check that your user is in the `video` group:
```bash
sudo usermod -a -G video $USER
```

### Audio input not working
Ensure PulseAudio/PipeWire is running and your user has audio permissions:
```bash
sudo usermod -a -G audio $USER
```

### TTS voices not available
On Linux, install espeak-ng or festival for system voices, or download Piper voice models.

## Support

For issues and feature requests, please open a GitHub issue.