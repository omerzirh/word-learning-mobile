# Kelime Kartı

A modern flashcard app for learning English words, built with React Native and Expo.

## Features

- 📝 Create and manage word cards
- 🔄 Study mode with spaced repetition
- 📊 Track your learning progress
- 🌓 Automatic dark mode support
- 📱 Works offline with local storage
- 🔄 Random card presentation
- ✨ Clean and intuitive UI

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kelime-karti.git
cd kelime-karti
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Running on Device

1. Install Expo Go on your device
2. Scan the QR code from the terminal
3. The app will load on your device

## Usage

### Adding Cards
- Tap the "+" button to add a new card
- Enter the English word and Turkish translation
- The card will be added to your learning deck

### Study Mode
- Choose between 5 or 10 cards per session
- Tap to flip cards
- Mark cards as "Known" or "Learning"
- Cards marked as known will be moved to the known deck
- Progress is automatically saved

### Statistics
- View your learning progress
- Track known and learning cards
- See success rates and study time

## Technical Details

- Built with React Native and Expo
- Uses AsyncStorage for local data persistence
- Implements spaced repetition algorithm
- Supports system-wide dark mode
- Version control for data migrations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to all contributors
- Built with Expo and React Native
- Uses React Navigation for routing
