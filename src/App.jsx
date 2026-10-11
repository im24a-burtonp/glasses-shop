import { useState } from 'react';
import ModelViewer from './ModelViewer.jsx';

const materials = [{ name: 'Titanium', price: 180 }, { name: 'Polymer', price: 140 }, { name: 'Recycled Plastic', price: 120 }];
const colors = [{ name: 'Black', value: '#090909' }, { name: 'Walnut', value: '#352218' }, { name: 'Olive', value: '#2d3423' }, { name: 'Deep Magenta', value: '#3f123b' }];
const lenses = [{ name: 'Clear', value: '#ffffff', transmission: 1 }, { name: 'Smoke', value: '#686b72', transmission: 0.78 }, { name: 'Amber', value: '#c58b42', transmission: 0.85 }, { name: 'Rose', value: '#cf8d9b', transmission: 0.85 }];

function Swatches({ items, selected, onChange, label }) {
  return <div className="swatches" role="group" aria-label={label}>{items.map((item) => <button key={item.name} type="button" className={`swatch-option ${selected.name === item.name ? 'selected' : ''}`} aria-pressed={selected.name === item.name} onClick={() => onChange(item)}><span className="swatch" style={{ backgroundColor: item.value }} /><span>{item.name}</span></button>)}</div>;
}

export default function App() {
  const [material, setMaterial] = useState(materials[0]);
  const [color, setColor] = useState(colors[0]);
  const [lens, setLens] = useState(lenses[0]);
  const price = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(material.price);
  return <div className="shop">
    <main className="product-layout">
      <section className="product-title" aria-labelledby="product-name"><h1 id="product-name">The Everyday</h1><p className="subtitle">Your frame. Your finish.</p></section>
      <section className="viewer-section" aria-label="Interactive glasses preview"><ModelViewer color={color.value} lens={lens} /><div className="viewer-caption"><span>360° preview</span><span>Drag to rotate · Scroll or pinch to zoom</span></div></section>
      <section className="configuration" aria-label="Customize your glasses">
        <div className="configuration-heading"><p className="eyebrow">Make it yours</p></div>
        <fieldset><legend>Material <span>{material.name}</span></legend><p className="option-note">Choose your material. Price varies by selection.</p><div className="material-options">{materials.map((item) => <button type="button" key={item.name} className={`material-option ${material.name === item.name ? 'selected' : ''}`} aria-pressed={material.name === item.name} onClick={() => setMaterial(item)}><span>{item.name}</span></button>)}</div></fieldset>
        <fieldset><legend>Frame color <span>{color.name}</span></legend><Swatches items={colors} selected={color} onChange={setColor} label="Frame color" /></fieldset>
        <fieldset><legend>Lens tint <span>{lens.name}</span></legend><Swatches items={lenses} selected={lens} onChange={setLens} label="Lens tint" /></fieldset>
      </section>
      <section className="description" aria-label="Product information">
        <details><summary>About this frame<span className="expand-icon" aria-hidden="true" /></summary><p>The Everyday pairs softly squared lenses with a gently curved brow and a clean, angular profile. Slim temples and curved tips give the silhouette a balanced finish. Choose your frame color and lens tint to make it your own, from understated black with clear lenses to a deeper color with a subtle tint.</p></details>
        <details><summary>Dimensions & fit<span className="expand-icon" aria-hidden="true" /></summary>
          <p>A 142 mm front with a 53 mm lens width, 18 mm bridge, and 145 mm temples. Compare these measurements with a pair you already wear to find a similar fit.</p>
          <dl className="dimensions">
            <div><dt>Overall frame width</dt><dd>142 mm</dd></div>
            <div><dt>Lens width</dt><dd>53 mm</dd></div>
            <div><dt>Lens height</dt><dd>43 mm</dd></div>
            <div><dt>Bridge width</dt><dd>18 mm</dd></div>
            <div><dt>Temple length</dt><dd>145 mm</dd></div>
            <div><dt>Inside width, temples open</dt><dd>136 mm</dd></div>
            <div><dt>Frame front thickness</dt><dd>6 mm</dd></div>
            <div><dt>Temple width at hinge</dt><dd>12 mm</dd></div>
            <div><dt>Temple tip width</dt><dd>9 mm</dd></div>
          </dl>
        </details>
      </section>
      <section className="purchase" aria-label="Price and purchase"><div className="price-row"><span>Your selection</span><strong aria-live="polite">{price}</strong></div><button type="button" className="buy-button" disabled>Buy now <span aria-hidden="true">↗</span></button></section>
    </main>
  </div>;
}
