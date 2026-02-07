# 🧱 LEGO WiFi QR Code Builder

Generate LEGO building instructions for creating WiFi QR codes! This application helps you convert your WiFi credentials into a scannable QR code made entirely from LEGO bricks.

![LEGO WiFi QR Code Builder](https://img.shields.io/badge/Nuxt.js-3-00DC82?logo=nuxt.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## ✨ Features

### 🎯 **NEW: Intelligent Brick Optimization**
- **Automatic optimization** using standard LEGO brick sizes
- **53% fewer pieces** compared to 1×1-only builds (typical savings)
- Supports 2×8, 2×6, 2×4, 2×3, 2×2, 1×4, 1×3, 1×2, and 1×1 bricks
- **Greedy algorithm** prioritizes larger bricks for stability
- Detailed breakdown showing quantity needed per brick size
- **Real-time savings calculation** displayed in parts list

### 🔐 WiFi QR Code Generation
- Input form for WiFi credentials (SSID, Password, Security Type)
- Support for WPA/WPA2, WEP, and open networks
- Hidden network option
- Automatic QR code generation with high error correction (Level H)

### 📐 Baseplate Configuration
- Choose from common baseplate sizes (16×16, 32×32, 48×48 studs)
- Custom dimensions support
- Automatic scale calculation to fit your baseplate
- Real-time validation

### 🎨 Color Selection with Contrast Guidance
- Color picker for foreground and background bricks
- Real-time contrast ratio calculation
- WCAG accessibility ratings (AAA, AA)
- Pre-configured high-contrast color combinations
- Visual preview of your color choices

### 🧩 Brick Layout & Arrangement
- Visual grid display of the complete build
- Interactive scaling options (1×, 2×, 3×, 4×)
- Hover effects to identify individual bricks
- Coordinate labels for easy building
- Automatic fit validation

### 📋 Optimized Parts List
- **Detailed breakdown by brick size** (NEW!)
- **Percentage savings** vs 1×1-only build
- Separate counts for foreground and background colors
- Shopping tips and recommendations
- Print and copy functionality with optimized format
- Visual color previews for each brick type

### 🎯 User Experience
- **Modern Nuxt UI components** with Tailwind CSS
- Clean, step-by-step workflow
- Responsive design (mobile and desktop)
- Real-time updates
- No page reloads required (SPA)
- Beautiful gradient UI

## 🚀 Live Demo

Visit the live application: [https://robokozo.github.io/lego-wifi-qr-builder/](https://robokozo.github.io/lego-wifi-qr-builder/)

## 🛠️ Technology Stack

- **Framework**: Nuxt.js 3 (SPA mode)
- **Language**: TypeScript
- **UI Library**: Nuxt UI (Tailwind CSS + Headless UI)
- **QR Generation**: qrcode library
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## 📦 Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/robokozo/lego-wifi-qr-builder.git
   cd lego-wifi-qr-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:3000`

4. **Build for production**
   ```bash
   npm run generate
   ```
   
   The static files will be generated in `.output/public/`

## 🌐 Deployment

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages.

1. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Source: Select "GitHub Actions"

2. **Push to main branch**
   ```bash
   git push origin main
   ```

The GitHub Actions workflow will automatically build and deploy your site.

### Manual Deployment

To deploy manually:

```bash
npm run generate
```

Then upload the contents of `.output/public/` to your hosting provider.

## 📖 Usage Guide

### Step 1: Enter WiFi Credentials
1. Enter your network name (SSID)
2. Select security type (WPA/WPA2, WEP, or None)
3. Enter password (if applicable)
4. Check "Hidden Network" if needed

### Step 2: Configure Baseplate
1. Select a preset baseplate size or choose "Custom"
2. For custom, enter width and height in studs
3. Review the maximum scale that fits your baseplate

### Step 3: Choose Colors
1. Select foreground color (dark modules) using color picker
2. Select background color (light modules)
3. Review the contrast ratio
4. Aim for "Good" or "Excellent" ratings
5. Try suggested color combinations for best results

### Step 4: Generate Instructions
1. Click "Generate LEGO Instructions"
2. Choose your preferred scale factor
3. Review the brick arrangement grid

### Step 5: Build Your QR Code
1. Review the parts list
2. Print or copy the parts list
3. Order the required bricks
4. Follow the grid to build your QR code
5. Test scanning with a smartphone!

## 🎨 Project Structure

```
lego-wifi-qr-builder/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages deployment
├── app/
│   └── app.vue                 # Root application component
├── components/
│   ├── WifiForm.vue            # WiFi credential input
│   ├── BaseplateConfig.vue     # Baseplate dimension selector
│   ├── ColorPicker.vue         # Color selection with contrast
│   ├── BrickArrangement.vue    # Visual grid display
│   └── BrickList.vue           # Parts list
├── composables/
│   ├── useQRCode.ts            # QR code generation logic
│   ├── useLegoConverter.ts     # QR to LEGO conversion
│   └── useContrastChecker.ts   # Contrast ratio calculation
├── pages/
│   └── index.vue               # Main application page
├── public/
│   ├── .nojekyll               # GitHub Pages configuration
│   └── favicon.ico
├── nuxt.config.ts              # Nuxt configuration (SPA mode)
├── tsconfig.json
├── package.json
└── README.md
```

## 🧪 Technical Details

### Brick Optimization Algorithm

The application uses an intelligent **greedy algorithm** to optimize brick placement:

#### Supported Brick Sizes
- **Large bricks**: 2×8, 2×6, 2×4 plates
- **Medium bricks**: 2×3, 2×2, 1×4, 1×3 plates
- **Small bricks**: 1×2, 1×1 plates/tiles

#### Algorithm Workflow
1. **Scan** the QR grid from top-left to bottom-right
2. **Try largest bricks first** at each position
3. **Test both orientations** (horizontal and vertical)
4. **Place brick** if all cells match color and are unused
5. **Mark cells as used** and continue
6. **Fallback to smaller bricks** if large ones don't fit

#### Performance
- **Time Complexity**: O(n × m × k) where:
  - n = grid height
  - m = grid width  
  - k = number of brick types (9)
- **Space Complexity**: O(n × m) for tracking used cells
- **Typical Savings**: 40-60% reduction in pieces

#### Example Results
For a 37×37 QR code (1,369 studs):
- **Before**: 1,369 pieces (all 1×1)
- **After**: 643 pieces (optimized)
- **Breakdown**: 28× 2×4, 24× 1×4, 104× 2×2, 75× 1×2, 62× 1×1
- **Savings**: 53% (726 fewer pieces)

### QR Code Format
WiFi QR codes follow this format:
```
WIFI:T:WPA;S:mynetwork;P:mypassword;H:true;;
```

Where:
- `T` = Security type (WPA, WEP, or nopass)
- `S` = SSID (network name)
- `P` = Password
- `H` = Hidden network (optional)

### Error Correction
The application uses Level H (High) error correction, which allows for:
- Up to 30% of the QR code to be damaged/obscured
- Best for physical builds where some bricks might be misaligned

### Contrast Calculation
Uses the WCAG 2.1 contrast ratio formula:
- **Excellent**: 7:1 or higher (WCAG AAA)
- **Good**: 4.5:1 or higher (WCAG AA)
- **Poor**: Below 4.5:1 (may be difficult to scan)

### Scaling
- 1× scale: Each QR pixel = 1×1 stud
- 2× scale: Each QR pixel = 2×2 studs
- 3× scale: Each QR pixel = 3×3 studs
- 4× scale: Each QR pixel = 4×4 studs

Larger scales are easier to build but require more bricks.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- QR code generation powered by [qrcode](https://www.npmjs.com/package/qrcode)
- Built with [Nuxt.js 3](https://nuxt.com/)
- WCAG contrast guidelines from [W3C](https://www.w3.org/WAI/WCAG21/)

## 💡 Tips for Best Results

1. **Color Selection**: Use high-contrast colors for reliable scanning
   - Black on white is always a safe choice
   - Avoid light-on-light or dark-on-dark combinations

2. **Baseplate Size**: Larger baseplates allow for bigger QR codes
   - Start with 32×32 for most networks
   - Use 48×48 for complex passwords or higher scales

3. **Building Tips**:
   - Use 1×1 tiles for a smooth finish
   - Use 1×1 plates if tiles aren't available
   - Build on a flat baseplate for best results
   - Double-check alignment before scanning

4. **Testing**: Always test your QR code with multiple devices before committing to a large build!

## 🐛 Troubleshooting

### QR Code Won't Scan
- Check contrast ratio (should be "Good" or "Excellent")
- Ensure all bricks are properly aligned
- Try increasing the scale factor
- Test in good lighting conditions
- Make sure camera is perpendicular to the build

### Build Doesn't Fit Baseplate
- Choose a larger baseplate
- Reduce the scale factor
- Use a shorter SSID or password if possible

## 📧 Contact

For questions, suggestions, or issues, please open an issue on GitHub.

---

**Happy Building! 🧱📱**
