// Exponential Blur Plugin for Figma
// Implements the exponential blur algorithm from Cairo Graphics

// JavaScript implementation of the exponential blur algorithm
class _ExponentialBlur {
  
  // Blur inner function - applies blur to a single pixel
  private static blurInner(
    pixels: Uint8ClampedArray,
    pixelIndex: number,
    zR: number[], zG: number[], zB: number[], zA: number[],
    alpha: number, aprec: number, zprec: number
  ): void {
    const R = pixels[pixelIndex];
    const G = pixels[pixelIndex + 1];
    const B = pixels[pixelIndex + 2];
    const A = pixels[pixelIndex + 3];

    zR[0] += (alpha * ((R << zprec) - zR[0])) >> aprec;
    zG[0] += (alpha * ((G << zprec) - zG[0])) >> aprec;
    zB[0] += (alpha * ((B << zprec) - zB[0])) >> aprec;
    zA[0] += (alpha * ((A << zprec) - zA[0])) >> aprec;

    pixels[pixelIndex] = zR[0] >> zprec;
    pixels[pixelIndex + 1] = zG[0] >> zprec;
    pixels[pixelIndex + 2] = zB[0] >> zprec;
    pixels[pixelIndex + 3] = zA[0] >> zprec;
  }

  // Blur row function - applies blur to a single row
  private static blurRow(
    pixels: Uint8ClampedArray,
    width: number, height: number, channels: number,
    line: number, alpha: number, aprec: number, zprec: number
  ): void {
    const scanlineStart = line * width * channels;
    
    const zR = [pixels[scanlineStart] << zprec];
    const zG = [pixels[scanlineStart + 1] << zprec];
    const zB = [pixels[scanlineStart + 2] << zprec];
    const zA = [pixels[scanlineStart + 3] << zprec];

    // Forward pass
    for (let index = 0; index < width; index++) {
      const pixelIndex = scanlineStart + index * channels;
      this.blurInner(pixels, pixelIndex, zR, zG, zB, zA, alpha, aprec, zprec);
    }

    // Backward pass
    for (let index = width - 2; index >= 0; index--) {
      const pixelIndex = scanlineStart + index * channels;
      this.blurInner(pixels, pixelIndex, zR, zG, zB, zA, alpha, aprec, zprec);
    }
  }

  // Blur column function - applies blur to a single column
  private static blurColumn(
    pixels: Uint8ClampedArray,
    width: number, height: number, channels: number,
    x: number, alpha: number, aprec: number, zprec: number
  ): void {
    const startIndex = x * channels;
    
    const zR = [pixels[startIndex] << zprec];
    const zG = [pixels[startIndex + 1] << zprec];
    const zB = [pixels[startIndex + 2] << zprec];
    const zA = [pixels[startIndex + 3] << zprec];

    // Forward pass
    for (let index = width; index < (height - 1) * width; index += width) {
      const pixelIndex = startIndex + index * channels;
      this.blurInner(pixels, pixelIndex, zR, zG, zB, zA, alpha, aprec, zprec);
    }

    // Backward pass
    for (let index = (height - 2) * width; index >= 0; index -= width) {
      const pixelIndex = startIndex + index * channels;
      this.blurInner(pixels, pixelIndex, zR, zG, zB, zA, alpha, aprec, zprec);
    }
  }

  // Main exponential blur function
  public static applyBlur(
    pixels: Uint8ClampedArray,
    width: number, height: number, channels: number,
    radius: number, aprec: number = 16, zprec: number = 7
  ): void {
    if (radius < 1) return;

    // Calculate alpha such that 90% of kernel is within radius
    const alpha = Math.floor((1 << aprec) * (1.0 - Math.exp(-2.3 / (radius + 1))));

    // Apply blur to all rows
    for (let row = 0; row < height; row++) {
      this.blurRow(pixels, width, height, channels, row, alpha, aprec, zprec);
    }

    // Apply blur to all columns
    for (let col = 0; col < width; col++) {
      this.blurColumn(pixels, width, height, channels, col, alpha, aprec, zprec);
    }
  }
}

// Helper function to convert Uint8Array to ImageData format
function _createImageDataFromBytes(bytes: Uint8Array, _width: number, _height: number): Uint8ClampedArray {
  return new Uint8ClampedArray(bytes);
}

// Helper function to create image from processed data
async function _createImageFromPixelData(pixels: Uint8ClampedArray, width: number, height: number): Promise<Uint8Array> {
  // Create a canvas in the UI context to process the image
  return new Promise((resolve) => {
    figma.ui.postMessage({
      type: 'process-image-data',
      pixels: Array.from(pixels),
      width: width,
      height: height
    });
    
    // Listen for processed image data
    const messageHandler = (msg: {type: string, imageData: number[]}) => {
      if (msg.type === 'image-processed') {
        figma.ui.off('message', messageHandler);
        resolve(new Uint8Array(msg.imageData));
      }
    };
    figma.ui.on('message', messageHandler);
  });
}

// Show the UI with default height (1:1 preview + basic controls)
figma.showUI(__html__, { width: 360, height: 620 });

// Keep track of current selection for preview
let currentSelection: readonly SceneNode[] = [];

// Check initial selection on startup
const initialSelection = figma.currentPage.selection;
currentSelection = initialSelection;

if (initialSelection.length === 1) {
  // Send initial selection for preview
  (async () => {
    try {
      const imageBytes = await initialSelection[0].exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 1.0 }
      });
      
      figma.ui.postMessage({
        type: 'update-preview',
        imageData: Array.from(imageBytes)
      });
    } catch (error) {
      console.error('Initial preview error:', error);
    }
  })();
}

// Update preview when selection changes
figma.on('selectionchange', async () => {
  const selection = figma.currentPage.selection;
  currentSelection = selection;
  
  if (selection.length === 1) {
    try {
      // Export the first selected node for preview
      const imageBytes = await selection[0].exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 1.0 } // Use original scale for preview
      });
      
      figma.ui.postMessage({
        type: 'update-preview',
        imageData: Array.from(imageBytes)
      });
    } catch (error) {
      console.error('Preview export error:', error);
    }
  } else {
    // No selection or multiple selections, hide preview
    figma.ui.postMessage({
      type: 'hide-preview'
    });
  }
});

// Handle messages from UI
figma.ui.onmessage = async (msg: {type: string, radius?: number, aprec?: number, zprec?: number, scale?: number, height?: number}) => {
  if (msg.type === 'request-preview') {
    // Send current selection for preview
    if (currentSelection.length === 1) {
      try {
        const imageBytes = await currentSelection[0].exportAsync({
          format: 'PNG',
          constraint: { type: 'SCALE', value: 1.0 } // Use original scale for preview
        });
        
        figma.ui.postMessage({
          type: 'update-preview',
          imageData: Array.from(imageBytes)
        });
      } catch (error) {
        console.error('Initial preview error:', error);
      }
    }
  }
  
  if (msg.type === 'resize-ui') {
    if (msg.height) {
      figma.ui.resize(360, msg.height);
    }
  }
  
  if (msg.type === 'apply-blur') {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      figma.notify('请选择至少一个对象');
      return;
    }

    const radius = msg.radius || 5;
    const aprec = msg.aprec || 16;
    const zprec = msg.zprec || 7;
    const scalePercent = msg.scale || 33;
    const scale = scalePercent === 0 ? 0.01 : scalePercent / 100;
    
    try {
      let processedCount = 0;
      const createdNodes: SceneNode[] = [];
      
      for (const node of selection) {
        // Export the node as image data - use original scale for processing
        const imageBytes = await node.exportAsync({
          format: 'PNG',
          constraint: { type: 'SCALE', value: 1.0 } // Use original scale, scaling handled in blur processing
        });
        
        try {
          // Send image data to UI for processing with our exponential blur
          const processedImageBytes = await new Promise<Uint8Array>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Processing timeout')), 30000);
            
            figma.ui.postMessage({
              type: 'process-exponential-blur',
              imageData: Array.from(imageBytes),
              radius: radius,
              aprec: aprec,
              zprec: zprec,
              scale: scale
            });
            
            const messageHandler = (response: {type: string, processedData?: number[], error?: string}) => {
              if (response.type === 'blur-processed' && response.processedData) {
                clearTimeout(timeout);
                figma.ui.off('message', messageHandler);
                resolve(new Uint8Array(response.processedData));
              } else if (response.type === 'blur-error' && response.error) {
                clearTimeout(timeout);
                figma.ui.off('message', messageHandler);
                reject(new Error(response.error));
              }
            };
            figma.ui.on('message', messageHandler);
          });
          
          // Create a new image with the processed data
          const newImage = figma.createImage(processedImageBytes);
          
          // Skip blur if radius is 0
          if (radius === 0) {
            figma.notify('模糊半径为0，跳过处理');
            continue;
          }
          
          // Create a new rectangle node for the blurred image
          const blurredNode = figma.createRectangle();
          blurredNode.resize(node.width, node.height);
          blurredNode.x = node.x; // No offset - place directly on top
          blurredNode.y = node.y;
          
          // Apply the processed image as a fill
          const imageFill: ImagePaint = {
            type: 'IMAGE',
            imageHash: newImage.hash,
            scaleMode: 'FILL',
            visible: true,
            opacity: 1,
            blendMode: 'NORMAL'
          };
          
          blurredNode.fills = [imageFill];
          
          // Name the new layer with blur parameters only
          blurredNode.name = `指数模糊 r=${radius} s=${scalePercent}%`;
          
          // Add to the same parent as the original to maintain frame position
          if (node.parent) {
            node.parent.appendChild(blurredNode);
          } else {
            figma.currentPage.appendChild(blurredNode);
          }
          
          // Add to created nodes array for selection
          createdNodes.push(blurredNode);
          processedCount++;
          
        } catch (processingError) {
          console.error('Processing error for node:', processingError);
          figma.notify(`处理对象时出错: ${processingError}`);
        }
      }
      
      if (processedCount > 0) {
        // Select all newly created blurred nodes
        figma.currentPage.selection = createdNodes;
        figma.notify(`创建了 ${processedCount} 个模糊图层 (半径: ${radius}, 缩放: ${scalePercent}%, Alpha精度: ${aprec}, 状态精度: ${zprec})`);
      } else {
        figma.notify('没有对象被处理，请检查选择的对象类型');
      }
      
    } catch (error) {
      figma.notify('应用模糊时出错: ' + error);
    }
  }

};
