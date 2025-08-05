// Exponential Blur Plugin for Figma
// The blur algorithm is implemented in ui.html due to Figma's sandbox limitations
// This file handles plugin logic, UI communication, and image creation

// Show the UI with default height (1:1 preview + basic controls + recolor)
figma.showUI(__html__, { width: 360, height: 740 });

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
figma.ui.onmessage = async (msg: {type: string, radius?: number, aprec?: number, zprec?: number, scale?: number, height?: number, fillTransparent?: boolean, recolorParams?: any, cropPercent?: number}) => {
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

    const radius = msg.radius !== undefined ? msg.radius : 5;
    const aprec = msg.aprec || 16;
    const zprec = msg.zprec || 7;
    const scalePercent = msg.scale || 33;
    const scale = scalePercent === 0 ? 0.01 : scalePercent / 100;
    const fillTransparent = msg.fillTransparent || false;
    const recolorParams = msg.recolorParams || { enabled: false };
    const cropPercent = msg.cropPercent || 100;
    
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
          let processedImageBytes: Uint8Array;
          
          if (radius === 0) {
            // For radius 0, just apply scaling and background processing without blur
            processedImageBytes = await new Promise<Uint8Array>((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('Processing timeout')), 30000);
              
              figma.ui.postMessage({
                type: 'process-no-blur',
                imageData: Array.from(imageBytes),
                scale: scale,
                fillTransparent: fillTransparent,
                recolorParams: recolorParams,
                cropPercent: cropPercent
              });
              
              const messageHandler = (response: {type: string, processedData?: number[], error?: string}) => {
                if (response.type === 'no-blur-processed' && response.processedData) {
                  clearTimeout(timeout);
                  figma.ui.off('message', messageHandler);
                  resolve(new Uint8Array(response.processedData));
                } else if (response.type === 'no-blur-error' && response.error) {
                  clearTimeout(timeout);
                  figma.ui.off('message', messageHandler);
                  reject(new Error(response.error));
                }
              };
              figma.ui.on('message', messageHandler);
            });
          } else {
            // Send image data to UI for processing with our exponential blur
            processedImageBytes = await new Promise<Uint8Array>((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('Processing timeout')), 30000);
              
              figma.ui.postMessage({
                type: 'process-exponential-blur',
                imageData: Array.from(imageBytes),
                radius: radius,
                aprec: aprec,
                zprec: zprec,
                scale: scale,
                fillTransparent: fillTransparent,
                recolorParams: recolorParams,
                cropPercent: cropPercent
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
          }
          
          // Create a new image with the processed data
          const newImage = figma.createImage(processedImageBytes);
          
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
          
          // Set 50% corner radius to create circular effect
          const cornerRadius = Math.min(node.width, node.height) / 2;
          blurredNode.cornerRadius = cornerRadius;
          
          // Name the new layer with blur parameters, recolor info, and crop info
          let layerName = `指数模糊 r=${radius} s=${scalePercent}%`;
          if (recolorParams.enabled) {
            layerName += ` 着色强度${recolorParams.opacity}`;
          }
          if (cropPercent > 100) {
            layerName += ` 整体放大${cropPercent}%`;
          }
          blurredNode.name = layerName;
          
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
