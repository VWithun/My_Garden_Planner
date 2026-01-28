# 🌱 Garden Planner

A visual, drag-and-drop garden planning tool built with React and Konva. Design your perfect garden layout with customizable beds, vegetables, and labels.

![Garden Planner Screenshot](https://vanessawithun.com/wp-content/uploads/2026/01/Garden-App-Screenshot.png)
<!-- Add your screenshot here -->

## ✨ Features

- **🎨 Visual Design**: Drag-and-drop interface for easy garden planning
- **📐 Multiple Bed Shapes**: Rectangle, square, circle, oval, and rounded rectangle
- **🥕 Vegetable Database**: 70+ vegetables, herbs, and flowers organized by category
- **🎯 Customizable**: Change bed colors, resize elements, and add custom labels
- **📏 Flexible Canvas**: Choose from 4 preset canvas sizes (Small, Medium, Large, Wide)
- **💾 PDF Export**: Save your garden plan as a high-quality PDF
- **⌨️ Keyboard Shortcuts**: 
  - `Ctrl/Cmd + C` - Copy selected item
  - `Ctrl/Cmd + V` - Paste copied item
  - `Delete/Backspace` - Delete selected item
- **📝 Text Labels**: Double-click to edit labels for notes and plant names
- **📊 20px Grid**: Consistent grid layout for precise planning

## 🚀 Live Demo

[View Live Demo](https://vwithun.github.io/My_Garden_Planner/)

## 🛠️ Built With

- **React** - UI Framework
- **Vite** - Build Tool
- **Konva** - Canvas Drawing Library
- **Tailwind CSS** - Styling
- **jsPDF** - PDF Generation
- **react-color** - Color Picker

## 📦 Installation
```bash
# Clone the repository
git clone https://github.com/VWithun/My_Garden_Planner.git

# Navigate to project directory
cd My_Garden_Planner

# Install dependencies
npm install

# Run development server
npm run dev
```

## 🎮 How to Use

1. **Choose Canvas Size**: Select your preferred canvas size from the presets
2. **Pick a Color**: Use the color picker to choose your bed color
3. **Add Garden Beds**: Click shape buttons to add beds to your canvas
4. **Add Vegetables**: Browse categories and click vegetables to add them
5. **Add Labels**: Click "Add Text Label" and double-click to edit
6. **Arrange**: Drag elements to position them, resize using corner handles
7. **Copy/Paste**: Select an item and use Ctrl+C/Ctrl+V to duplicate
8. **Export**: Click "Save as PDF" to download your garden plan

## 📸 Screenshots

_Add more screenshots here showing different features_

## 🌿 Vegetable Categories

- Leafy Greens (Lettuce, Spinach, Kale, etc.)
- Brassicas (Broccoli, Cabbage, Cauliflower, etc.)
- Root Vegetables (Carrots, Beets, Radishes, etc.)
- Alliums (Onions, Garlic, Leeks, etc.)
- Legumes (Beans, Peas)
- Fruiting Vegetables (Tomatoes, Peppers, Eggplant, etc.)
- Cucurbits (Cucumbers, Squash, Melons, etc.)
- Herbs (Basil, Parsley, Cilantro, etc.)
- Flowers (Marigolds, Sunflowers, Zinnias, etc.)

## 🚧 Future Enhancements

- [ ] Save/Load projects to continue editing later
- [ ] Companion planting suggestions
- [ ] Season planning (Spring/Summer/Fall/Winter)
- [ ] Plant spacing guidelines
- [ ] Mobile-responsive design
- [ ] Undo/Redo functionality

## 📄 License

MIT License - feel free to use this project for your garden planning needs!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
