# HNS Browser

A modern, cross-platform browser for browsing Handshake (HNS) domains with a sleek dark interface.

![HNS Browser](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Version](https://img.shields.io/github/v/release/yourusername/hns-browser)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

- **Handshake Domain Support**: Browse decentralized websites using HNS protocol
- **Modern UI**: Sleek dark theme with smooth animations
- **Cross-Platform**: Available for Windows, macOS, and Linux
- **DNS-over-HTTPS**: Secure domain resolution with multiple fallback servers
- **Gateway Fallback**: Automatic fallback to public gateways when needed
- **SSL Bypass**: Handles self-signed certificates gracefully

## 📥 Download

### Latest Release

Download the latest version for your platform:

| Platform | Download Link | File Size |
|----------|---------------|-----------|
| **Windows** | [HNS-Browser-Setup.exe](https://github.com/yourusername/hns-browser/releases/latest/download/HNS-Browser-Setup.exe) | ~150MB |
| **macOS** | [HNS-Browser.dmg](https://github.com/yourusername/hns-browser/releases/latest/download/HNS-Browser.dmg) | ~150MB |
| **Linux** | [HNS-Browser.AppImage](https://github.com/yourusername/hns-browser/releases/latest/download/HNS-Browser.AppImage) | ~150MB |

### System Requirements

#### Windows
- Windows 10 or Windows 11 (64-bit)
- 4GB RAM minimum, 8GB recommended
- 200MB free disk space

#### macOS
- macOS 10.15 Catalina or later
- Intel or Apple Silicon processor
- 4GB RAM minimum, 8GB recommended
- 200MB free disk space

#### Linux
- 64-bit Linux distribution
- GLIBC 2.17 or later
- 4GB RAM minimum, 8GB recommended
- 200MB free disk space

## 🛠️ Installation Instructions

### Windows
1. Download `HNS-Browser-Setup.exe`
2. Run the installer as administrator
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

### macOS
1. Download `HNS-Browser.dmg`
2. Open the DMG file
3. Drag "HNS Browser" to Applications folder
4. Launch from Applications or Spotlight

⚠️ **macOS Security Note**: You may need to right-click and select "Open" for first launch, or go to System Preferences > Security & Privacy to allow the app.

### Linux
1. Download `HNS-Browser.AppImage`
2. Make it executable: `chmod +x HNS-Browser.AppImage`
3. Run: `./HNS-Browser.AppImage`
4. Optionally integrate with system: Right-click → "Integrate AppImage"

## 🌐 Usage

### Basic Navigation
1. Launch HNS Browser
2. Enter a Handshake domain in the address bar (e.g., `mahadev/`)
3. Press Enter or click the arrow button
4. Browse the decentralized web!

### Popular Handshake Domains to Try
- `mahadev/` - Handshake community site
- `shakeshift/` - Handshake tools and services
- `australia/` - Australian HNS community
- `impervious/` - Decentralized infrastructure
- `freedom/` - Free speech platform

### Browser Features
- **Back/Forward**: Navigate through page history
- **Reload**: Refresh current page
- **Home**: Return to welcome screen
- **Address Bar**: Enter HNS domains or navigate with suggestions

## 🔧 Advanced Configuration

### DNS Resolvers
The browser uses multiple DNS-over-HTTPS resolvers in order:
1. `hnsdoh.com` (primary HNS resolver)
2. Regional HNS resolvers (AU, EU, NA, AS, AP)
3. Cloudflare & Google (fallback)

### Gateway Servers
If direct resolution fails, the browser uses:
1. `hns.to` (primary gateway)
2. `rsvr.xyz` (backup gateway)

## 🛡️ Security & Privacy

- **No Tracking**: HNS Browser doesn't track your browsing
- **Local DNS Cache**: Faster subsequent visits
- **SSL Certificate Handling**: Graceful handling of self-signed certificates
- **No Data Collection**: Your browsing data stays on your device

## 📋 Troubleshooting

### Common Issues

**"All gateways failed" Error**
- Check your internet connection
- Try different HNS domains
- Restart the browser

**Website Not Loading**
- Verify the domain spelling
- Check if the domain is active
- Try again later (domain might be temporarily down)

**Installation Issues (Windows)**
- Run installer as administrator
- Disable antivirus temporarily during installation
- Check Windows Defender exclusions

**Installation Issues (macOS)**
- Allow unsigned applications in Security Preferences
- Try downloading again if DMG is corrupted

**Installation Issues (Linux)**
- Ensure AppImage has execute permissions
- Install required dependencies: `sudo apt install libfuse2`

## 📞 Support

For support and bug reports:
- **Issues**: [GitHub Issues](https://github.com/yourusername/hns-browser/issues)
- **Email**: sutariyar@gmail.com
- **Discord**: Join our community server

## 🤝 Contributing

This project is currently closed source for the main application logic, but we welcome:
- Bug reports and feature requests
- Documentation improvements
- Translation contributions
- UI/UX suggestions

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Electron](https://electronjs.org/)
- Handshake protocol by [Handshake](https://handshake.org/)
- DNS-over-HTTPS resolvers by the HNS community
- Icons by [Lucide](https://lucide.dev/)

## 🔄 Updates

The browser includes automatic update checking. When a new version is available, you'll be notified and can download the latest release.

### Version History
- **v1.0.0** - Initial release with core HNS browsing functionality

---

Made with ❤️ by **Rahul Sutariya**

[⭐ Star this repo](https://github.com/yourusername/hns-browser) | [🐛 Report Bug](https://github.com/yourusername/hns-browser/issues) | [💡 Request Feature](https://github.com/yourusername/hns-browser/issues)