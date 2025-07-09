# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Figma plugin called "指数模糊" (Exponential Blur) that implements advanced blur effects using Cairo graphics library. The plugin currently contains template code for creating rectangles but is designed to be extended with blur functionality.

## Architecture

The project follows a typical Figma plugin architecture:

- **Frontend (UI)**: `ui.html` - Simple HTML interface for user interaction
- **Backend (Plugin Logic)**: `code.ts` - Main plugin code that runs in Figma's sandboxed environment
- **Graphics Engine**: `Cairo Graphics.cpp` - C++ implementation of Cairo-based graphics operations with exponential blur algorithms

### Key Components

1. **Plugin Entry Point**: `code.ts` handles Figma API communication via `figma.ui.onmessage`
2. **UI Layer**: `ui.html` provides user controls and communicates with plugin via `postMessage`
3. **Graphics Backend**: `Cairo Graphics.cpp` contains the core blur implementation:
   - `CairoGraphics` class for Cairo surface management
   - `_expblur()` function implementing exponential blur algorithm
   - `BlurSurface()` method for applying blur to Cairo surfaces
   - Support for ARGB32, RGB24, and A8 pixel formats

## Development Commands

```bash
# Build TypeScript to JavaScript
npm run build

# Watch mode for development (auto-rebuild on changes)
npm run watch

# Lint TypeScript code
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

## Plugin Configuration

- **Manifest**: `manifest.json` defines plugin metadata and permissions
- **TypeScript Config**: `tsconfig.json` targets ES6 with strict mode
- **Plugin Name**: "指数模糊" (Exponential Blur)
- **Plugin ID**: 1524576104568099855

## Cairo Graphics Implementation

The C++ component implements:
- Exponential blur using two-sided exponential impulse response
- In-place image processing for memory efficiency
- Support for different Cairo surface formats
- Radius-based blur with 90% kernel coverage
- State management with push/pop operations for graphics context

## Features

### Core Functionality
- **Exponential Blur Algorithm**: Direct port of Cairo Graphics `_expblur` function
- **Custom Precision Control**: Adjustable Alpha precision (8-24) and State precision (4-12)
- **Wide Radius Range**: Blur radius from 1 to 200 pixels
- **Performance Scaling**: Adjustable scale factor (0.1-1.0) for low-performance device optimization
- **Real-time Preview**: Live preview of blur effects while adjusting parameters
- **Non-destructive Workflow**: Creates new layers instead of modifying originals

### User Interface
- **Parameter Controls**: Sliders for radius, alpha precision, state precision, and performance scale
- **Live Preview Canvas**: 200x150px preview window with real-time updates
- **Parameter Display**: Real-time value display for all parameters
- **Preview Toggle**: Option to enable/disable live preview for performance
- **Performance Scale Control**: 0.1-1.0 scale factor for performance optimization

### Technical Implementation
- **Pixel-level Processing**: Full image export and pixel manipulation
- **Canvas-based Processing**: HTML5 Canvas for image processing in UI context
- **Performance Scaling**: Images are scaled down for processing, then stretched back to original size
- **Optimized Blur Radius**: Blur radius is automatically scaled to match image scale
- **Debounced Preview**: 100ms delay to prevent excessive processing
- **Selection Tracking**: Automatic preview updates when selection changes

### Performance Optimization Strategy
- **Scale-then-Blur**: Images are first scaled down by the performance scale factor
- **Scaled Radius**: Blur radius is proportionally reduced to maintain visual consistency
- **Stretch to Original**: Processed low-resolution image is stretched back to original dimensions
- **No Image Smoothing**: `imageSmoothingEnabled = false` preserves the performance characteristics
- **Memory Efficient**: Lower resolution processing reduces memory usage and computation time

## Development Notes

- The plugin uses Figma's plugin API v1.0.0
- UI runs in full browser environment while plugin code runs in restricted sandbox
- Communication between UI and plugin happens via postMessage
- TypeScript compilation is required before testing in Figma
- Both preview and final processing use the same scale-then-stretch workflow
- New layers are offset by 20px to show they're separate from originals
- Performance scale factor applies to both preview and final output for consistency
- Lower scale values dramatically improve performance but may reduce visual quality