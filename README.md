# Blue Noise Canvas

A web-based blue noise pattern generator built with React, TypeScript, and Tailwind CSS.

**[Try it live →](https://blue-noise-canvas.lovable.app)**

![Blue Noise Generator Screenshot](https://raw.githubusercontent.com/pRizz/blue-noise-canvas/main/screenshot.png)

## What is Blue Noise?

Blue noise is a type of noise pattern where the frequency distribution is concentrated in higher frequencies. Unlike white noise (completely random), blue noise has a more uniform spatial distribution without clumping, making it ideal for:

- **Dithering** – Creating smooth gradients with limited color palettes
- **Sampling** – Better coverage in Monte Carlo rendering
- **Texturing** – Natural-looking procedural patterns
- **Halftoning** – Print and display applications

## Features

- **Adjustable Dimensions** – Generate patterns from 128×128 to 1024×1024 pixels
- **Custom Pixel Size** – Control the size of individual noise points (1-8px)
- **Color Customization** – Pick any foreground and background colors
- **Intensity Control** – Adjust the density of the noise pattern
- **Reproducible Seeds** – Use specific seeds to regenerate the same pattern
- **Instant Download** – Export your pattern as a PNG file

## Algorithm

This generator uses **Mitchell's Best-Candidate Algorithm**, which produces high-quality blue noise by:

1. Generating multiple candidate points for each new sample
2. Selecting the candidate that is farthest from all existing points
3. This process naturally creates the even spacing characteristic of blue noise

## Tech Stack

- [React](https://react.dev/) – UI framework
- [TypeScript](https://www.typescriptlang.org/) – Type safety
- [Tailwind CSS](https://tailwindcss.com/) – Styling
- [Vite](https://vitejs.dev/) – Build tool
- [shadcn/ui](https://ui.shadcn.com/) – UI components

## Getting Started

```bash
# Clone the repository
git clone https://github.com/pRizz/blue-noise-canvas.git

# Navigate to the project
cd blue-noise-canvas

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Known Issues

- **High intensity fill** – At higher intensities, the canvas does not fill completely. This is likely due to the probabilistic nature of the best-candidate algorithm when searching for empty cells at high densities.

## License

This project is free and open source under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

Made with ❤️ using [Lovable](https://lovable.dev)
