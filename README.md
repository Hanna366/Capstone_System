# Smart Drying Rack System

A solar-powered IoT drying solution with weather monitoring capabilities.

## Project Overview

This is a Smart Drying Rack system built with React and TypeScript that integrates with various hardware components including ESP32, DHT22 temperature/humidity sensors, YL-83 rain sensors, and L298N motor drivers. The system monitors environmental conditions and automatically controls the drying rack position based on weather data.

## Features

- Real-time weather monitoring
- Automatic rack control based on weather conditions
- Solar power management
- Rain detection and automatic retraction
- Temperature and humidity monitoring
- UV index tracking
- Wind speed monitoring
- Manual and automatic operation modes

## Technologies Used

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Hooks
- **Routing**: React Router DOM
- **API Integration**: RESTful services

## How to Run the Application

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   ```

2. **Navigate to the project directory**:
   ```bash
   cd Helioxis_Capstone_System
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## Development Workflow

- **IDE Development**: Use your preferred IDE for local development
- **GitHub Integration**: Clone, make changes, and push directly to GitHub
- **Codespaces**: Use GitHub Codespaces for cloud-based development

## Hardware Integration

The system is designed to integrate with:

- **ESP32 Microcontroller**: Main control unit with Wi-Fi connectivity
- **DHT22 Sensor**: Temperature and humidity measurements
- **YL-83 Rain Sensor**: Precipitation detection
- **L298N Motor Driver**: Controls DC gear motor for rack positioning
- **Solar Power System**: 12V/10W solar panel with battery backup

## Architecture

The system follows a component-based architecture with separate modules for:

- Hardware integration
- Weather monitoring
- User interface
- Data processing
- Motor control
- System configuration

## Deployment

This is a client-side application that can be deployed using various platforms:

- Static site hosting (Vercel, Netlify, etc.)
- Traditional web servers
- Container-based deployment (Docker)

## Contributing

For development contributions, please ensure your changes follow the project's coding standards and update the documentation accordingly.

## License

This project is for educational and demonstration purposes.
