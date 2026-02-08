# 🧱 Brickify

Generate custom building instructions for QR codes and mosaics using bricks! Brickify helps you convert WiFi credentials or images into scannable QR codes and mosaics made from standard brick parts.

![Nuxt.js](https://img.shields.io/badge/Nuxt.js-3-00DC82?logo=nuxt.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## ✨ Features

- **QR code builder**: encode your WiFi network, get a parts list and instructions
- **Mosaic builder**: turn any image into a brick mosaic (coming soon)
- Optimized for real brick parts and colors
- Deployable to GitHub Pages
- Modern Nuxt UI components with Tailwind CSS

## 🚀 Live Demo

Visit the live application: [https://robokozo.github.io/brickify/](https://robokozo.github.io/brickify/)

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

The GitHub Actions workflow will automatically build and deploy your site to:

`https://robokozo.github.io/brickify/`

### Manual Deployment

To deploy manually:

```bash
npm run generate
```

Then upload the contents of `.output/public/` to your hosting provider.

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
