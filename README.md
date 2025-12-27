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
- **Custom Pixel Size** – Control the size of individual noise points (1-16px)
- **Min Spacing Control** – Set minimum distance between points in pixels (1-32px)
- **Color Customization** – Pick any foreground and background colors
- **Reproducible Seeds** – Use specific seeds to regenerate the same pattern
- **Algorithm Selection** – Choose between two blue noise generation algorithms
- **Animated Rendering** – Watch points appear progressively with configurable chunk size
- **Instant Download** – Export your pattern as a PNG file

## Algorithms

This generator supports two blue noise generation algorithms:

### Bridson Poisson Disk Sampling (Default)

- **Time Complexity**: O(n) – much faster for large patterns
- Uses a background grid for efficient neighbor lookups
- Generates points within an annulus around existing points
- Great for real-time generation and larger canvases

### Mitchell's Best-Candidate Algorithm

- **Time Complexity**: O(n²) – slower but may produce slightly higher quality results
- Generates multiple candidate points for each new sample
- Selects the candidate that is farthest from all existing points
- Better for smaller patterns where quality is paramount

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
