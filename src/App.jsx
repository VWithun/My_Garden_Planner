import { useState, useRef, useEffect, useMemo } from 'react';
import { Stage, Layer, Rect, Circle, Ellipse, Line, Transformer, Image as KonvaImage, Text } from 'react-konva';
import { SketchPicker } from 'react-color';
import useImage from 'use-image';
import jsPDF from 'jspdf';

// Transformer component for resizing
function TransformerComponent({ selectedId, onTransform }) {
  const transformerRef = useRef();

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    if (selectedId) {
      const stage = transformer.getStage();
      const selectedNode = stage.findOne('#' + selectedId);

      if (selectedNode) {
        transformer.nodes([selectedNode]);
        transformer.getLayer().batchDraw();

        selectedNode.on('transformend', (e) => {
          onTransform(selectedId, e);
        });
      }
    } else {
      transformer.nodes([]);
    }
  }, [selectedId, onTransform]);

  return <Transformer ref={transformerRef} />;
}

// Vegetable Icon Component
function VeggieIcon({ veggie, onDragEnd, onSelect }) {
  const [image] = useImage(veggie.icon);

  return (
    <KonvaImage
      id={veggie.id}
      x={veggie.x}
      y={veggie.y}
      width={veggie.width}
      height={veggie.height}
      image={image}
      draggable
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
    />
  );
}

// Text Label Component
function TextLabel({ label, onDragEnd, onSelect, onTextChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef();

  const handleDblClick = () => {
    setIsEditing(true);
  };

  useEffect(() => {
    if (isEditing && textRef.current) {
      const stage = textRef.current.getStage();
      const textPosition = textRef.current.getAbsolutePosition();
      
      // Create textarea
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      textarea.value = label.text;
      textarea.style.position = 'absolute';
      textarea.style.top = textPosition.y + stage.container().offsetTop + 'px';
      textarea.style.left = textPosition.x + stage.container().offsetLeft + 'px';
      textarea.style.width = label.width + 'px';
      textarea.style.fontSize = label.fontSize + 'px';
      textarea.style.border = '2px solid #4299e1';
      textarea.style.padding = '4px';
      textarea.style.margin = '0px';
      textarea.style.overflow = 'hidden';
      textarea.style.background = 'white';
      textarea.style.outline = 'none';
      textarea.style.resize = 'none';
      textarea.style.fontFamily = 'Arial';
      textarea.focus();

      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) {
          onTextChange(label.id, textarea.value);
          document.body.removeChild(textarea);
          setIsEditing(false);
        }
      });

      textarea.addEventListener('blur', () => {
        onTextChange(label.id, textarea.value);
        document.body.removeChild(textarea);
        setIsEditing(false);
      });
    }
  }, [isEditing]);

  return (
    <Text
      ref={textRef}
      id={label.id}
      x={label.x}
      y={label.y}
      text={label.text}
      fontSize={label.fontSize}
      fontFamily="Arial"
      fill="#000000"
      width={label.width}
      draggable
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
    />
  );
}

function App() {
  const [shapes, setShapes] = useState([]);
  const [veggies, setVeggies] = useState([]);
  const [labels, setLabels] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [copiedItem, setCopiedItem] = useState(null);
  const [currentColor, setCurrentColor] = useState('#22c55e');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showVeggiePicker, setShowVeggiePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  
  const stageRef = useRef();
  const gridSize = 20;

  // Canvas size presets
  const presetSizes = [
    { name: 'Small', width: 600, height: 400 },
    { name: 'Medium', width: 800, height: 600 },
    { name: 'Large', width: 1200, height: 800 },
    { name: 'Wide', width: 1400, height: 600 },
  ];

// Vegetable database
const veggieDatabase = {
  LeafyGreens: [
    { name: 'Lettuce (Romaine)', icon: 'https://em-content.zobj.net/source/apple/391/leafy-green_1f96c.png' },
    { name: 'Lettuce (Butterhead)', icon: 'https://www.svgrepo.com/show/475180/cabbage.svg' },
    { name: 'Lettuce (Leaf)', icon: 'https://www.svgrepo.com/show/416476/leaf-salad-seasoning.svg' },
    { name: 'Spinach', icon: 'https://www.svgrepo.com/show/513319/leaf.svg' },
    { name: 'Swiss Chard', icon: 'https://www.svgrepo.com/show/298959/plant-grass.svg' },
    { name: 'Arugula', icon: 'https://www.svgrepo.com/show/227721/oak-leaf-leaf.svg' },
    { name: 'Kale', icon: 'https://www.svgrepo.com/show/475180/cabbage.svg' },
    { name: 'Mustard Greens', icon: 'https://www.svgrepo.com/show/299025/plant-grass.svg' },
  ],

  Brassicas: [
    { name: 'Broccoli', icon: 'https://em-content.zobj.net/source/apple/391/broccoli_1f966.png' },
    { name: 'Broccoli Raab (Rapini)', icon: 'https://www.svgrepo.com/show/404889/broccoli.svg' },
    { name: 'Cabbage', icon: 'https://www.svgrepo.com/show/475180/cabbage.svg' },
    { name: 'Cauliflower', icon: 'https://www.svgrepo.com/show/111715/cauliflower.svg' },
    { name: 'Brussels Sprouts', icon: 'https://www.svgrepo.com/show/276190/brussels-sprouts.svg' },
    { name: 'Kohlrabi', icon: 'https://www.svgrepo.com/show/475180/cabbage.svg' },
  ],

  RootVegetables: [
    { name: 'Carrot', icon: 'https://em-content.zobj.net/source/apple/391/carrot_1f955.png' },
    { name: 'Beet', icon: 'https://www.svgrepo.com/show/475178/beet.svg' },
    { name: 'Radish', icon: 'https://www.svgrepo.com/show/475221/radish.svg' },
    { name: 'Turnip', icon: 'https://www.svgrepo.com/show/268898/turnip.svg' },
    { name: 'Parsnip', icon: 'https://www.svgrepo.com/show/356649/parsnip.svg' },
    { name: 'Rutabaga', icon: 'https://www.svgrepo.com/show/207770/turnip.svg' },
    { name: 'Sweet Potato', icon: 'https://www.svgrepo.com/show/407239/potato.svg' },
    { name: 'Potato', icon: 'https://www.svgrepo.com/show/475219/potato.svg' },
  ],

  Alliums: [
    { name: 'Onion', icon: 'https://em-content.zobj.net/source/apple/391/onion_1f9c5.png' },
    { name: 'Garlic', icon: 'https://em-content.zobj.net/source/apple/391/garlic_1f9c4.png' },
    { name: 'Leek', icon: 'https://www.svgrepo.com/show/356637/onion-02.svg' },
    { name: 'Shallot', icon: 'https://www.svgrepo.com/show/218393/onion.svg' },
    { name: 'Chives', icon: 'https://www.svgrepo.com/show/218391/onion.svg' },
    { name: 'Green Onion (Scallion)', icon: 'https://www.svgrepo.com/show/356637/onion-02.svg' },
  ],

  Legumes: [
    { name: 'Beans (Bush)', icon: 'https://www.svgrepo.com/show/66801/peas.svg' },
    { name: 'Beans (Pole)', icon: 'https://www.svgrepo.com/show/356643/green-bean.svg' },
    { name: 'Peas', icon: 'https://www.svgrepo.com/show/475212/peas.svg' },
    { name: 'Snap Peas', icon: 'https://www.svgrepo.com/show/263303/beans.svg' },
    { name: 'Lentils', icon: '' },
    { name: 'Chickpeas', icon: 'paste url here' },
  ],

  FruitingVegetables: [
    { name: 'Tomato', icon: 'https://em-content.zobj.net/source/apple/391/tomato_1f345.png' },
    { name: 'Cherry Tomato', icon: 'https://em-content.zobj.net/source/apple/391/tomato_1f345.png' },
    { name: 'Pepper (Sweet)', icon: 'https://em-content.zobj.net/source/apple/391/bell-pepper_1fad1.png' },
    { name: 'Pepper (Hot)', icon: 'https://em-content.zobj.net/source/apple/391/hot-pepper_1f336-fe0f.png' },
    { name: 'Eggplant', icon: 'https://em-content.zobj.net/source/apple/391/eggplant_1f346.png' },
    { name: 'Okra', icon: 'https://www.svgrepo.com/show/530439/potato.svg' },
  ],

  Cucurbits: [
    { name: 'Cucumber', icon: 'https://em-content.zobj.net/source/apple/391/cucumber_1f952.png' },
    { name: 'Zucchini', icon: 'https://em-content.zobj.net/source/apple/391/cucumber_1f952.png' },
    { name: 'Yellow Squash', icon: 'paste url here' },
    { name: 'Butternut Squash', icon: 'paste url here' },
    { name: 'Acorn Squash', icon: 'paste url here' },
    { name: 'Pumpkin', icon: 'https://em-content.zobj.net/source/apple/391/pumpkin_1f383.png' },
    { name: 'Watermelon', icon: 'https://www.svgrepo.com/show/530439/potato.svg' },
    { name: 'Cantaloupe', icon: 'https://em-content.zobj.net/source/apple/391/melon_1f348.png' },
    { name: 'Honeydew', icon: 'paste url here' },
  ],

  Herbs: [
    { name: 'Basil', icon: 'https://em-content.zobj.net/source/apple/391/leafy-green_1f96c.png' },
    { name: 'Parsley', icon: 'https://em-content.zobj.net/source/apple/391/leafy-green_1f96c.png' },
    { name: 'Cilantro', icon: 'https://em-content.zobj.net/source/apple/391/leafy-green_1f96c.png' },
    { name: 'Dill', icon: 'https://em-content.zobj.net/source/apple/391/leafy-green_1f96c.png' },
    { name: 'Sage', icon: 'https://em-content.zobj.net/source/apple/391/leafy-green_1f96c.png' },
    { name: 'Thyme', icon: 'https://em-content.zobj.net/source/apple/391/leafy-green_1f96c.png' },
    { name: 'Mint', icon: 'https://em-content.zobj.net/source/apple/391/leafy-green_1f96c.png' },
    { name: 'Oregano', icon: 'https://em-content.zobj.net/source/apple/391/leafy-green_1f96c.png' },
    { name: 'Lavender', icon: 'https://www.svgrepo.com/show/530439/potato.svg' },
    { name: 'Rosemary', icon: 'paste url here' },
  ],

  Flowers: [
    { name: 'Marigold', icon: 'https://em-content.zobj.net/source/apple/391/blossom_1f33c.png' },
    { name: 'Sunflower', icon: 'https://em-content.zobj.net/source/apple/391/sunflower_1f33b.png' },
    { name: 'Zinnia', icon: 'https://em-content.zobj.net/source/apple/391/blossom_1f33c.png' },
    { name: 'Nasturtium', icon: 'https://em-content.zobj.net/source/apple/391/hibiscus_1f33a.png' },
    { name: 'Cosmos', icon: 'https://em-content.zobj.net/source/apple/391/blossom_1f33c.png' },
    { name: 'Dahlia', icon: 'https://em-content.zobj.net/source/apple/391/blossom_1f33c.png' },
    { name: 'Lavender (Flower)', icon: 'https://www.svgrepo.com/show/530439/potato.svg' },
  ],
};

  // Memoized grid lines
  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= canvasWidth / gridSize; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridSize, 0, i * gridSize, canvasHeight]}
          stroke="#e5e7eb"
          strokeWidth={1}
          listening={false}
        />
      );
    }
    for (let i = 0; i <= canvasHeight / gridSize; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridSize, canvasWidth, i * gridSize]}
          stroke="#e5e7eb"
          strokeWidth={1}
          listening={false}
        />
      );
    }
    return lines;
  }, [canvasWidth, canvasHeight]);

  const addShape = (type) => {
    const baseShape = {
      id: 'shape-' + Date.now(),
      x: 100,
      y: 100,
      fill: currentColor,
      stroke: '#374151',
      strokeWidth: 3,
      type: type
    };

    let newShape;
    switch (type) {
      case 'rectangle':
        newShape = { ...baseShape, width: 150, height: 100 };
        break;
      case 'square':
        newShape = { ...baseShape, width: 120, height: 120 };
        break;
      case 'circle':
        newShape = { ...baseShape, radius: 60 };
        break;
      case 'oval':
        newShape = { ...baseShape, radiusX: 80, radiusY: 50 };
        break;
      case 'rounded-rect':
        newShape = { ...baseShape, width: 150, height: 100, cornerRadius: 20 };
        break;
      default:
        newShape = { ...baseShape, width: 150, height: 100 };
    }

    setShapes((prev) => [...prev, newShape]);
  };

  const addVeggie = (veggieName, iconUrl) => {
    const newVeggie = {
      id: 'veggie-' + Date.now(),
      name: veggieName,
      icon: iconUrl,
      x: 150,
      y: 150,
      width: 40,
      height: 40,
    };
    setVeggies((prev) => [...prev, newVeggie]);
    setShowVeggiePicker(false);
    setSelectedCategory(null);
  };

  const addLabel = () => {
    const newLabel = {
      id: 'label-' + Date.now(),
      x: 100,
      y: 100,
      text: 'Double-click to edit',
      fontSize: 16,
      width: 200,
    };
    setLabels((prev) => [...prev, newLabel]);
  };

  const handleDragEnd = (id, e) => {
    setShapes((prev) =>
      prev.map((shape) =>
        shape.id === id ? { ...shape, x: e.target.x(), y: e.target.y() } : shape
      )
    );
  };

  const handleVeggieDragEnd = (id, e) => {
    setVeggies((prev) =>
      prev.map((veggie) =>
        veggie.id === id ? { ...veggie, x: e.target.x(), y: e.target.y() } : veggie
      )
    );
  };

  const handleLabelDragEnd = (id, e) => {
    setLabels((prev) =>
      prev.map((label) =>
        label.id === id ? { ...label, x: e.target.x(), y: e.target.y() } : label
      )
    );
  };

  const handleTextChange = (id, newText) => {
    setLabels((prev) =>
      prev.map((label) =>
        label.id === id ? { ...label, text: newText } : label
      )
    );
  };

  const handleTransformEnd = (id, e) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    if (id.startsWith('veggie-')) {
      setVeggies((prev) =>
        prev.map((veggie) =>
          veggie.id === id
            ? {
                ...veggie,
                x: node.x(),
                y: node.y(),
                width: Math.max(20, veggie.width * scaleX),
                height: Math.max(20, veggie.height * scaleY),
              }
            : veggie
        )
      );
    } else if (id.startsWith('label-')) {
      setLabels((prev) =>
        prev.map((label) =>
          label.id === id
            ? {
                ...label,
                x: node.x(),
                y: node.y(),
                width: Math.max(50, label.width * scaleX),
                fontSize: Math.max(10, label.fontSize * scaleY),
              }
            : label
        )
      );
    } else {
      setShapes((prev) =>
        prev.map((shape) => {
          if (shape.id !== id) return shape;

          if (shape.type === 'circle') {
            return {
              ...shape,
              x: node.x(),
              y: node.y(),
              radius: Math.max(5, shape.radius * scaleX)
            };
          }

          if (shape.type === 'oval') {
            return {
              ...shape,
              x: node.x(),
              y: node.y(),
              radiusX: Math.max(5, shape.radiusX * scaleX),
              radiusY: Math.max(5, shape.radiusY * scaleY)
            };
          }

          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, shape.width * scaleX),
            height: Math.max(5, shape.height * scaleY)
          };
        })
      );
    }
  };

  const handleSelect = (id) => setSelectedId(id);

  const handleDeselect = (e) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  const handleDelete = () => {
    if (!selectedId) return;
    
    if (selectedId.startsWith('veggie-')) {
      setVeggies((prev) => prev.filter((veggie) => veggie.id !== selectedId));
    } else if (selectedId.startsWith('label-')) {
      setLabels((prev) => prev.filter((label) => label.id !== selectedId));
    } else {
      setShapes((prev) => prev.filter((shape) => shape.id !== selectedId));
    }
    
    setSelectedId(null);
  };

  // COPY FUNCTION
  const handleCopy = () => {
    if (!selectedId) return;

    if (selectedId.startsWith('veggie-')) {
      const veggie = veggies.find((v) => v.id === selectedId);
      if (veggie) setCopiedItem({ type: 'veggie', data: veggie });
    } else if (selectedId.startsWith('label-')) {
      const label = labels.find((l) => l.id === selectedId);
      if (label) setCopiedItem({ type: 'label', data: label });
    } else {
      const shape = shapes.find((s) => s.id === selectedId);
      if (shape) setCopiedItem({ type: 'shape', data: shape });
    }
  };

  // PASTE FUNCTION
  const handlePaste = () => {
    if (!copiedItem) return;

    if (copiedItem.type === 'veggie') {
      const newVeggie = {
        ...copiedItem.data,
        id: 'veggie-' + Date.now(),
        x: copiedItem.data.x + 20,
        y: copiedItem.data.y + 20,
      };
      setVeggies((prev) => [...prev, newVeggie]);
      setSelectedId(newVeggie.id);
    } else if (copiedItem.type === 'label') {
      const newLabel = {
        ...copiedItem.data,
        id: 'label-' + Date.now(),
        x: copiedItem.data.x + 20,
        y: copiedItem.data.y + 20,
      };
      setLabels((prev) => [...prev, newLabel]);
      setSelectedId(newLabel.id);
    } else {
      const newShape = {
        ...copiedItem.data,
        id: 'shape-' + Date.now(),
        x: copiedItem.data.x + 20,
        y: copiedItem.data.y + 20,
      };
      setShapes((prev) => [...prev, newShape]);
      setSelectedId(newShape.id);
    }
  };

  // EXPORT TO PDF
  const exportToPDF = () => {
    const stage = stageRef.current;
    const dataURL = stage.toDataURL({ pixelRatio: 2 });
    
    const pdf = new jsPDF({
      orientation: canvasWidth > canvasHeight ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvasWidth, canvasHeight]
    });
    
    pdf.addImage(dataURL, 'PNG', 0, 0, canvasWidth, canvasHeight);
    pdf.save('garden-plan.pdf');
  };

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        handleDelete();
      }
      
      // Copy (Ctrl+C or Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedId) {
        e.preventDefault();
        handleCopy();
      }
      
      // Paste (Ctrl+V or Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, copiedItem]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white p-4 shadow-lg overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-green-700">Garden Planner</h1>

        <div className="space-y-4">
          {/* Canvas Size Presets */}
          <div>
            <label className="block text-sm font-medium mb-2">Canvas Size</label>
            <div className="grid grid-cols-2 gap-2">
              {presetSizes.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setCanvasWidth(preset.width);
                    setCanvasHeight(preset.height);
                  }}
                  className={`px-3 py-2 rounded text-sm transition ${
                    canvasWidth === preset.width && canvasHeight === preset.height
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  {preset.name}
                  <div className="text-xs opacity-80">{preset.width}×{preset.height}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Current: {canvasWidth}×{canvasHeight}px</p>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium mb-2">Bed Color</label>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-12 h-12 rounded border-2 border-gray-300 cursor-pointer hover:border-gray-400"
                style={{ backgroundColor: currentColor }}
                aria-label="Pick color"
              />
              <span className="text-sm text-gray-600">{currentColor}</span>
            </div>
            {showColorPicker && (
              <div className="mt-2">
                <SketchPicker
                  color={currentColor}
                  onChange={(color) => setCurrentColor(color.hex)}
                />
              </div>
            )}
          </div>

          {/* Shape Buttons */}
          <div>
            <label className="block text-sm font-medium mb-2">Add Bed Shape</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => addShape('rectangle')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition">Rectangle</button>
              <button onClick={() => addShape('square')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition">Square</button>
              <button onClick={() => addShape('circle')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition">Circle</button>
              <button onClick={() => addShape('oval')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition">Oval</button>
              <button onClick={() => addShape('rounded-rect')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition col-span-2">Rounded Rectangle</button>
            </div>
          </div>

          {/* Veggie Picker */}
          <div>
            <label className="block text-sm font-medium mb-2">Add Vegetables</label>
            <button
              onClick={() => setShowVeggiePicker(!showVeggiePicker)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full transition"
            >
              {showVeggiePicker ? 'Close Veggie Picker' : 'Select Veggies'}
            </button>

            {showVeggiePicker && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {!selectedCategory && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 mb-2">Choose a category:</p>
                    {Object.keys(veggieDatabase).map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}

                {selectedCategory && (
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-xs text-blue-600 hover:underline mb-2"
                    >
                      ← Back to categories
                    </button>
                    {veggieDatabase[selectedCategory].map((veggie) => (
                      <button
                        key={veggie.name}
                        onClick={() => addVeggie(veggie.name, veggie.icon)}
                        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                      >
                        <img src={veggie.icon} alt={veggie.name} className="w-6 h-6" />
                        <span>{veggie.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add Text Label Button */}
          <div>
            <label className="block text-sm font-medium mb-2">Add Text Label</label>
            <button
              onClick={addLabel}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded w-full transition"
            >
              + Add Text Label
            </button>
            <p className="text-xs text-gray-500 mt-1">Double-click label to edit</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {selectedId && (
              <>
                <button
                  onClick={handleCopy}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full transition"
                >
                  📋 Copy (Ctrl+C)
                </button>
                
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full transition"
                >
                  🗑️ Delete (Del)
                </button>
              </>
            )}

            {copiedItem && (
              <button
                onClick={handlePaste}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full transition"
              >
                📄 Paste (Ctrl+V)
              </button>
            )}
          </div>

          {/* Export PDF */}
          <div className="pt-4 border-t">
            <button
              onClick={exportToPDF}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded w-full transition"
            >
              📄 Save as PDF
            </button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">Beds: {shapes.length}</p>
            <p className="text-sm text-gray-600">Plants: {veggies.length}</p>
            <p className="text-sm text-gray-600">Labels: {labels.length}</p>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 inline-block">
          <Stage
            ref={stageRef}
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={handleDeselect}
            onTouchStart={handleDeselect}
          >
            <Layer>{gridLines}</Layer>

            <Layer>
              {shapes.map((shape) => {
                const commonProps = {
                  key: shape.id,
                  id: shape.id,
                  x: shape.x,
                  y: shape.y,
                  fill: shape.fill,
                  stroke: shape.stroke,
                  strokeWidth: shape.strokeWidth,
                  draggable: true,
                  onDragEnd: (e) => handleDragEnd(shape.id, e),
                  onClick: () => handleSelect(shape.id),
                  onTap: () => handleSelect(shape.id),
                };

                if (shape.type === 'circle') {
                  return <Circle {...commonProps} radius={shape.radius} />;
                }

                if (shape.type === 'oval') {
                  return <Ellipse {...commonProps} radiusX={shape.radiusX} radiusY={shape.radiusY} />;
                }

                return (
                  <Rect
                    {...commonProps}
                    width={shape.width}
                    height={shape.height}
                    cornerRadius={shape.cornerRadius || 0}
                  />
                );
              })}

              {veggies.map((veggie) => (
                <VeggieIcon
                  key={veggie.id}
                  veggie={veggie}
                  onDragEnd={(e) => handleVeggieDragEnd(veggie.id, e)}
                  onSelect={() => handleSelect(veggie.id)}
                />
              ))}

              {labels.map((label) => (
                <TextLabel
                  key={label.id}
                  label={label}
                  onDragEnd={(e) => handleLabelDragEnd(label.id, e)}
                  onSelect={() => handleSelect(label.id)}
                  onTextChange={handleTextChange}
                />
              ))}

              <TransformerComponent
                selectedId={selectedId}
                onTransform={handleTransformEnd}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}

export default App;