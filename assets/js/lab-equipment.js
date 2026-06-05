/* ============================================================
   HMG Academy Virtual Lab v7 — Lab Equipment SVG Library
   Author: Adewale Samson Adeagbo · HMG Concepts

   Every function returns an SVG string. Equipment is rendered
   with realistic colors, shading and labels so students can
   recognise apparatus they will see in the school laboratory.
   All animations are SVG/CSS based — no external assets.
   ============================================================ */
var LAB = (function () {
  'use strict';

  /* Shared gradients/defs used by many pieces */
  var DEFS = ''
    + '<defs>'
    + '<linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#d9e8f0" stop-opacity=".55"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".8"/><stop offset="1" stop-color="#a8c2d3" stop-opacity=".55"/></linearGradient>'
    + '<linearGradient id="metal" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e8e8ec"/><stop offset=".4" stop-color="#b9bcc3"/><stop offset="1" stop-color="#7d8388"/></linearGradient>'
    + '<linearGradient id="brass" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f5d27a"/><stop offset=".5" stop-color="#caa14e"/><stop offset="1" stop-color="#8a6726"/></linearGradient>'
    + '<linearGradient id="wood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#a87148"/><stop offset="1" stop-color="#6b4326"/></linearGradient>'
    + '<linearGradient id="flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff8a00"/><stop offset=".5" stop-color="#ffd900"/><stop offset="1" stop-color="#a4dfff"/></linearGradient>'
    + '<radialGradient id="bulbOn" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7a3"/><stop offset=".6" stop-color="#ffd54a"/><stop offset="1" stop-color="#b88207" stop-opacity="0"/></radialGradient>'
    + '<radialGradient id="bulbOff" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e0e0e0"/><stop offset="1" stop-color="#8a8a8a"/></radialGradient>'
    + '<linearGradient id="liquidBlue" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#5dade2"/><stop offset="1" stop-color="#1f618d"/></linearGradient>'
    + '<linearGradient id="liquidRed" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ec7063"/><stop offset="1" stop-color="#922b21"/></linearGradient>'
    + '<linearGradient id="liquidGreen" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#52be80"/><stop offset="1" stop-color="#1e8449"/></linearGradient>'
    + '<linearGradient id="liquidYellow" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f7dc6f"/><stop offset="1" stop-color="#b7950b"/></linearGradient>'
    + '<linearGradient id="liquidPurple" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#bb8fce"/><stop offset="1" stop-color="#6c3483"/></linearGradient>'
    + '<filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="2"/><feOffset dx="0" dy="2"/><feComponentTransfer><feFuncA type="linear" slope=".35"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    + '</defs>';

  function liquidColor(name) {
    var m = { blue: 'url(#liquidBlue)', red: 'url(#liquidRed)', green: 'url(#liquidGreen)', yellow: 'url(#liquidYellow)', purple: 'url(#liquidPurple)', clear: 'rgba(180,210,225,.55)' };
    return m[name] || m.clear;
  }

  /* === Beaker === */
  function beaker(opts) {
    opts = opts || {};
    var fill = opts.fill || 'blue', level = opts.level || 0.7, label = opts.label || '250 ml', vol = opts.vol || '250 mL';
    var y = 200 - level * 140; var liq = liquidColor(fill);
    return '<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<path d="M50 60 L50 210 Q50 220 60 220 L140 220 Q150 220 150 210 L150 60 L160 60 L160 50 L40 50 L40 60 Z" fill="url(#glass)" stroke="#7e94a5" stroke-width="1.5"/>'
      + '<rect x="51" y="' + y + '" width="98" height="' + (210 - y) + '" fill="' + liq + '" opacity=".88"/>'
      + '<ellipse cx="100" cy="' + y + '" rx="49" ry="6" fill="' + liq + '" opacity=".92"/>'
      // tick marks
      + '<g stroke="#4a637a" stroke-width="1">'
      + '<line x1="55" y1="90" x2="65" y2="90"/><line x1="55" y1="120" x2="65" y2="120"/><line x1="55" y1="150" x2="65" y2="150"/><line x1="55" y1="180" x2="65" y2="180"/>'
      + '</g>'
      + '<text x="70" y="93" font-size="8" fill="#4a637a">200</text>'
      + '<text x="70" y="123" font-size="8" fill="#4a637a">150</text>'
      + '<text x="70" y="153" font-size="8" fill="#4a637a">100</text>'
      + '<text x="70" y="183" font-size="8" fill="#4a637a">50</text>'
      + '<text x="100" y="240" font-size="11" text-anchor="middle" fill="#333" font-weight="600">' + label + '</text>'
      + '</g></svg>';
  }

  /* === Conical / Erlenmeyer Flask === */
  function flask(opts) {
    opts = opts || {};
    var fill = opts.fill || 'red', level = opts.level || 0.65;
    var liq = liquidColor(fill);
    var topY = 200 - level * 100;
    return '<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<path d="M85 30 L85 100 L40 220 Q40 240 60 240 L140 240 Q160 240 160 220 L115 100 L115 30 Z" fill="url(#glass)" stroke="#7e94a5" stroke-width="1.5"/>'
      // liquid: fill bottom triangle
      + '<path d="M' + (60 + (topY - 100) * 0.42) + ' ' + topY + ' L' + (140 - (topY - 100) * 0.42) + ' ' + topY + ' L150 220 Q150 235 138 235 L62 235 Q50 235 50 220 Z" fill="' + liq + '" opacity=".88"/>'
      + '<rect x="85" y="20" width="30" height="12" rx="3" fill="#9aa5af"/>'
      + '<text x="100" y="258" font-size="11" text-anchor="middle" fill="#333" font-weight="600">' + (opts.label || 'Conical Flask') + '</text>'
      + '</g></svg>';
  }

  /* === Test tube === */
  function testTube(opts) {
    opts = opts || {};
    var fill = opts.fill || 'green', level = opts.level || 0.6;
    var liq = liquidColor(fill);
    var y = 220 - level * 150;
    return '<svg viewBox="0 0 80 260" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<rect x="20" y="10" width="40" height="10" rx="2" fill="#9aa5af"/>'
      + '<path d="M22 20 L22 220 Q22 245 40 245 Q58 245 58 220 L58 20 Z" fill="url(#glass)" stroke="#7e94a5" stroke-width="1.5"/>'
      + '<path d="M23 ' + y + ' L23 220 Q23 244 40 244 Q57 244 57 220 L57 ' + y + ' Z" fill="' + liq + '" opacity=".88"/>'
      + '<ellipse cx="40" cy="' + y + '" rx="17" ry="3" fill="' + liq + '"/>'
      + (opts.label ? '<text x="40" y="258" font-size="10" text-anchor="middle" fill="#333">' + opts.label + '</text>' : '')
      + '</g></svg>';
  }

  /* === Bunsen Burner with flame === */
  function bunsenBurner(opts) {
    opts = opts || {};
    var lit = opts.lit !== false;
    return '<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      // base
      + '<ellipse cx="100" cy="245" rx="65" ry="9" fill="#3b3f44"/>'
      + '<rect x="50" y="210" width="100" height="35" rx="4" fill="url(#metal)"/>'
      // chimney
      + '<rect x="88" y="80" width="24" height="135" fill="url(#metal)" stroke="#555" stroke-width="1"/>'
      + '<rect x="84" y="74" width="32" height="10" rx="2" fill="#666"/>'
      // air hole
      + '<circle cx="100" cy="160" r="4" fill="#222"/>'
      // gas pipe
      + '<rect x="148" y="220" width="40" height="10" rx="3" fill="#8a6726"/>'
      // flame
      + (lit
        ? '<g><path d="M75 80 Q100 -10 125 80 Q115 65 100 70 Q85 65 75 80 Z" fill="url(#flame)" opacity=".95"><animate attributeName="d" values="M75 80 Q100 -10 125 80 Q115 65 100 70 Q85 65 75 80 Z; M77 80 Q100 -5 123 80 Q113 60 100 67 Q87 60 77 80 Z; M75 80 Q100 -10 125 80 Q115 65 100 70 Q85 65 75 80 Z" dur="0.6s" repeatCount="indefinite"/></path>'
          + '<ellipse cx="100" cy="68" rx="9" ry="20" fill="#3498db" opacity=".85"/></g>'
        : '')
      + '<text x="100" y="258" font-size="11" text-anchor="middle" fill="#333" font-weight="600">Bunsen Burner</text>'
      + '</g></svg>';
  }

  /* === Microscope === */
  function microscope() {
    return '<svg viewBox="0 0 240 280" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<ellipse cx="120" cy="265" rx="80" ry="10" fill="#3a4148"/>'
      + '<path d="M60 245 L180 245 L170 200 L70 200 Z" fill="url(#metal)" stroke="#666"/>'
      // arm
      + '<path d="M120 200 Q160 170 165 130 L165 60 L130 60 L130 130 Q130 160 110 175 Z" fill="url(#metal)" stroke="#555"/>'
      // tube
      + '<rect x="125" y="40" width="40" height="80" rx="3" fill="#222"/>'
      // eyepiece
      + '<rect x="130" y="15" width="30" height="28" rx="2" fill="#111"/>'
      + '<ellipse cx="145" cy="15" rx="14" ry="4" fill="#444"/>'
      // objective
      + '<rect x="125" y="120" width="40" height="20" rx="2" fill="#222"/>'
      + '<circle cx="135" cy="135" r="6" fill="#aaa"/>'
      + '<circle cx="150" cy="135" r="6" fill="#aaa"/>'
      // stage
      + '<rect x="70" y="155" width="100" height="14" fill="#222"/>'
      // light
      + '<circle cx="120" cy="190" r="10" fill="#fffbcc" opacity=".9"/>'
      // focus knob
      + '<circle cx="170" cy="160" r="10" fill="#444"/>'
      + '<text x="120" y="278" font-size="11" text-anchor="middle" fill="#333" font-weight="600">Compound Microscope</text>'
      + '</g></svg>';
  }

  /* === Thermometer === */
  function thermometer(opts) {
    opts = opts || {};
    var t = (opts.temp === undefined) ? 25 : opts.temp;   // -10 to 110
    var pct = Math.max(0, Math.min(1, (t + 10) / 120));
    var h = pct * 170;
    return '<svg viewBox="0 0 80 280" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<rect x="34" y="20" width="12" height="200" rx="6" fill="url(#glass)" stroke="#7e94a5"/>'
      + '<rect x="36" y="' + (220 - h) + '" width="8" height="' + h + '" fill="#e74c3c"/>'
      + '<circle cx="40" cy="235" r="14" fill="#e74c3c"/>'
      + '<g font-size="7" fill="#444">'
      + '<text x="50" y="40">100</text><text x="50" y="80">75</text><text x="50" y="120">50</text><text x="50" y="160">25</text><text x="50" y="200">0</text>'
      + '</g>'
      + '<text x="40" y="270" font-size="11" text-anchor="middle" fill="#333" font-weight="600">' + t.toFixed(0) + '°C</text>'
      + '</g></svg>';
  }

  /* === Balance / Triple-beam scale === */
  function balance(opts) {
    opts = opts || {};
    var m = opts.mass || 0;
    return '<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<rect x="20" y="160" width="240" height="30" rx="4" fill="url(#metal)"/>'
      + '<rect x="40" y="120" width="200" height="40" fill="#222"/>'
      + '<rect x="60" y="130" width="160" height="22" fill="#9bf2c0"/>'
      + '<text x="140" y="148" font-size="18" font-family="monospace" text-anchor="middle" fill="#0e3b1e" font-weight="700">' + m.toFixed(2) + ' g</text>'
      + '<rect x="110" y="80" width="60" height="40" rx="3" fill="url(#metal)"/>'
      + '<text x="140" y="195" font-size="11" text-anchor="middle" fill="#333" font-weight="600">Digital Balance</text>'
      + '</g></svg>';
  }

  /* === Voltmeter / Ammeter (analogue dial) === */
  function meter(opts) {
    opts = opts || {};
    var value = opts.value || 0, max = opts.max || 10, label = opts.label || 'V', name = opts.name || 'Voltmeter';
    var ang = -90 + (value / max) * 180;
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<rect x="10" y="10" width="180" height="180" rx="14" fill="#1c1c20" stroke="#000"/>'
      + '<circle cx="100" cy="100" r="80" fill="#f3f4ee" stroke="#888"/>'
      + '<path d="M30 120 A 80 80 0 0 1 170 120" stroke="#444" stroke-width="2" fill="none"/>'
      // ticks
      + (function(){var s='';for(var i=0;i<=10;i++){var a=(-90+i*18)*Math.PI/180;var x1=100+72*Math.cos(a),y1=100+72*Math.sin(a),x2=100+80*Math.cos(a),y2=100+80*Math.sin(a);s+='<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#333"/>';}return s;})()
      + '<g transform="translate(100 100) rotate(' + ang + ')"><line x1="0" y1="0" x2="0" y2="-72" stroke="#e94560" stroke-width="2.5"/><circle r="6" fill="#222"/></g>'
      + '<text x="100" y="155" text-anchor="middle" font-size="14" font-weight="700" fill="#222">' + value.toFixed(2) + ' ' + label + '</text>'
      + '<text x="100" y="195" text-anchor="middle" font-size="11" fill="#fff" font-weight="600">' + name + '</text>'
      + '</g></svg>';
  }

  /* === Battery (cell) === */
  function battery(opts) {
    opts = opts || {};
    var v = opts.volts || 1.5;
    return '<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" class="lab-svg">'
      + '<g filter="url(#softShadow)">'
      + '<rect x="20" y="30" width="150" height="40" rx="4" fill="#e74c3c" stroke="#7a1c10"/>'
      + '<rect x="170" y="40" width="12" height="20" fill="#999" stroke="#555"/>'
      + '<text x="95" y="56" text-anchor="middle" fill="#fff" font-size="16" font-weight="700">' + v + ' V</text>'
      + '<text x="95" y="92" text-anchor="middle" font-size="11" fill="#333" font-weight="600">Dry Cell</text>'
      + '</g></svg>';
  }

  /* === Bulb (lit/unlit) === */
  function bulb(opts) {
    opts = opts || {};
    var on = !!opts.on;
    return '<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<circle cx="60" cy="65" r="45" fill="' + (on ? 'url(#bulbOn)' : 'url(#bulbOff)') + '" stroke="#444"/>'
      + '<rect x="45" y="105" width="30" height="10" fill="#aaa"/>'
      + '<rect x="48" y="115" width="24" height="35" rx="3" fill="#555"/>'
      + '<rect x="48" y="118" width="24" height="4" fill="#777"/><rect x="48" y="128" width="24" height="4" fill="#777"/><rect x="48" y="138" width="24" height="4" fill="#777"/>'
      // filament
      + '<path d="M48 60 Q50 75 55 60 Q60 75 65 60 Q70 75 72 60" stroke="' + (on ? '#ffb000' : '#888') + '" stroke-width="1.5" fill="none"/>'
      + (on ? '<circle cx="60" cy="65" r="55" fill="#fff7a3" opacity=".25"/>' : '')
      + '<text x="60" y="175" text-anchor="middle" font-size="11" fill="#333" font-weight="600">Lamp</text>'
      + '</g></svg>';
  }

  /* === Switch === */
  function switchSym(opts) {
    opts = opts || {};
    var on = !!opts.on;
    return '<svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg" class="lab-svg">'
      + '<g filter="url(#softShadow)">'
      + '<circle cx="30" cy="40" r="8" fill="#333"/><circle cx="130" cy="40" r="8" fill="#333"/>'
      + '<line x1="30" y1="40" x2="' + (on ? 130 : 110) + '" y2="' + (on ? 40 : 15) + '" stroke="#222" stroke-width="4"/>'
      + '<text x="80" y="72" text-anchor="middle" font-size="11" fill="#333" font-weight="600">Switch (' + (on ? 'closed' : 'open') + ')</text>'
      + '</g></svg>';
  }

  /* === Resistor === */
  function resistor(opts) {
    opts = opts || {};
    var R = opts.R || 100;
    return '<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" class="lab-svg">'
      + '<g filter="url(#softShadow)">'
      + '<rect x="20" y="42" width="160" height="16" fill="#d3a07a" stroke="#7a4d2a"/>'
      + '<rect x="40" y="40" width="6" height="20" fill="#222"/>'
      + '<rect x="55" y="40" width="6" height="20" fill="#e74c3c"/>'
      + '<rect x="70" y="40" width="6" height="20" fill="#f1c40f"/>'
      + '<rect x="85" y="40" width="6" height="20" fill="#27ae60"/>'
      + '<line x1="0" y1="50" x2="20" y2="50" stroke="#333" stroke-width="2"/>'
      + '<line x1="180" y1="50" x2="200" y2="50" stroke="#333" stroke-width="2"/>'
      + '<text x="100" y="92" text-anchor="middle" font-size="12" fill="#333" font-weight="600">Resistor ' + R + ' Ω</text>'
      + '</g></svg>';
  }

  /* === Burette === */
  function burette(opts) {
    opts = opts || {};
    var level = opts.level === undefined ? 0.7 : opts.level;
    var fill = opts.fill || 'blue';
    var y = 40 + (1 - level) * 180;
    return '<svg viewBox="0 0 100 280" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<rect x="38" y="20" width="24" height="220" rx="3" fill="url(#glass)" stroke="#7e94a5"/>'
      + '<rect x="38" y="' + y + '" width="24" height="' + (220 - (y - 20)) + '" fill="' + liquidColor(fill) + '" opacity=".88"/>'
      + '<g stroke="#4a637a" stroke-width=".5">'
      + (function(){var s='';for(var i=0;i<=20;i++){s+='<line x1="38" y1="'+(40+i*9)+'" x2="42" y2="'+(40+i*9)+'"/>';}return s;})()
      + '</g>'
      + '<rect x="35" y="240" width="30" height="12" fill="#222"/>'
      + '<polygon points="42,252 58,252 50,275" fill="#3a4148"/>'
      + '<text x="50" y="278" text-anchor="middle" font-size="10" fill="#333" font-weight="600">Burette</text>'
      + '</g></svg>';
  }

  /* === Magnet === */
  function magnet() {
    return '<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" class="lab-svg">'
      + '<g filter="url(#softShadow)">'
      + '<path d="M30 30 L80 30 L80 90 L30 90 Q15 90 15 60 Q15 30 30 30 Z" fill="#e74c3c"/>'
      + '<path d="M170 30 L120 30 L120 90 L170 90 Q185 90 185 60 Q185 30 170 30 Z" fill="#3498db"/>'
      + '<rect x="80" y="30" width="40" height="60" fill="#bdc3c7"/>'
      + '<text x="55" y="65" text-anchor="middle" fill="#fff" font-size="22" font-weight="700">N</text>'
      + '<text x="145" y="65" text-anchor="middle" fill="#fff" font-size="22" font-weight="700">S</text>'
      + '<text x="100" y="112" text-anchor="middle" font-size="11" fill="#333" font-weight="600">Bar Magnet</text>'
      + '</g></svg>';
  }

  /* === Compass === */
  function compass(opts) {
    opts = opts || {};
    var ang = opts.angle || 0;
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="lab-svg">'
      + '<g filter="url(#softShadow)">'
      + '<circle cx="100" cy="100" r="85" fill="#f8f3e6" stroke="#6b4326" stroke-width="4"/>'
      + '<text x="100" y="30" text-anchor="middle" font-size="14" font-weight="700" fill="#333">N</text>'
      + '<text x="100" y="180" text-anchor="middle" font-size="14" font-weight="700" fill="#333">S</text>'
      + '<text x="30" y="105" text-anchor="middle" font-size="14" font-weight="700" fill="#333">W</text>'
      + '<text x="170" y="105" text-anchor="middle" font-size="14" font-weight="700" fill="#333">E</text>'
      + '<g transform="translate(100 100) rotate(' + ang + ')">'
      + '<polygon points="0,-60 -10,0 0,5 10,0" fill="#e74c3c"/>'
      + '<polygon points="0,60 -10,0 0,-5 10,0" fill="#fff" stroke="#333"/>'
      + '<circle r="6" fill="#333"/></g>'
      + '</g></svg>';
  }

  /* === Pendulum === */
  function pendulum(opts) {
    opts = opts || {};
    var ang = opts.angle || 25;
    var len = opts.length || 140;
    var bx = 150 + len * Math.sin(ang * Math.PI / 180);
    var by = 30 + len * Math.cos(ang * Math.PI / 180);
    return '<svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<rect x="40" y="20" width="220" height="14" fill="url(#wood)"/>'
      + '<rect x="40" y="34" width="6" height="200" fill="url(#wood)"/>'
      + '<rect x="254" y="34" width="6" height="200" fill="url(#wood)"/>'
      + '<circle cx="150" cy="30" r="5" fill="#333"/>'
      + '<line x1="150" y1="30" x2="' + bx + '" y2="' + by + '" stroke="#444" stroke-width="2"/>'
      + '<circle cx="' + bx + '" cy="' + by + '" r="15" fill="#c0392b" stroke="#600" stroke-width="1.5"/>'
      + '</g></svg>';
  }

  /* === Tripod stand === */
  function tripod() {
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<ellipse cx="100" cy="60" rx="60" ry="6" fill="url(#metal)" stroke="#555"/>'
      + '<line x1="60" y1="60" x2="30" y2="180" stroke="#777" stroke-width="6"/>'
      + '<line x1="140" y1="60" x2="170" y2="180" stroke="#777" stroke-width="6"/>'
      + '<line x1="100" y1="60" x2="100" y2="180" stroke="#777" stroke-width="6"/>'
      + '<rect x="55" y="55" width="90" height="6" fill="#888"/>'
      + '<text x="100" y="195" text-anchor="middle" font-size="11" fill="#333" font-weight="600">Tripod Stand</text>'
      + '</g></svg>';
  }

  /* === Petri dish === */
  function petriDish(opts) {
    opts = opts || {};
    var contents = opts.contents || 0;  // 0-5 spots
    var s = '<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<ellipse cx="100" cy="100" rx="80" ry="22" fill="url(#glass)" stroke="#7e94a5"/>'
      + '<ellipse cx="100" cy="95" rx="80" ry="22" fill="rgba(255,255,255,.5)"/>';
    for (var i = 0; i < contents; i++) {
      var x = 60 + Math.random() * 80, y = 88 + Math.random() * 14, r = 4 + Math.random() * 6;
      s += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#7fb069" opacity=".75"/>';
    }
    s += '<text x="100" y="150" text-anchor="middle" font-size="11" fill="#333" font-weight="600">Petri Dish</text></g></svg>';
    return s;
  }

  /* === Telescope === */
  function telescope() {
    return '<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<rect x="20" y="80" width="240" height="30" rx="6" fill="url(#metal)" stroke="#555"/>'
      + '<rect x="260" y="70" width="50" height="50" rx="6" fill="#1c1c20"/>'
      + '<rect x="270" y="82" width="30" height="26" rx="3" fill="#333"/>'
      + '<polyline points="140,110 130,160 170,160 160,110" fill="#444"/>'
      + '<text x="160" y="195" text-anchor="middle" font-size="11" fill="#333" font-weight="600">Refracting Telescope</text>'
      + '</g></svg>';
  }

  /* === Pipette === */
  function pipette(opts) {
    opts = opts || {};
    return '<svg viewBox="0 0 60 280" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<rect x="22" y="10" width="16" height="20" rx="3" fill="#e94560"/>'
      + '<rect x="25" y="30" width="10" height="190" fill="url(#glass)" stroke="#7e94a5"/>'
      + '<polygon points="25,220 35,220 30,260" fill="url(#glass)" stroke="#7e94a5"/>'
      + '<rect x="25" y="120" width="10" height="80" fill="' + liquidColor(opts.fill || 'blue') + '" opacity=".88"/>'
      + '<text x="30" y="278" text-anchor="middle" font-size="10" fill="#333">Pipette</text>'
      + '</g></svg>';
  }

  /* === Funnel === */
  function funnel() {
    return '<svg viewBox="0 0 160 220" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<path d="M20 30 L140 30 L95 130 L95 200 L65 200 L65 130 Z" fill="url(#glass)" stroke="#7e94a5"/>'
      + '<text x="80" y="215" text-anchor="middle" font-size="11" fill="#333" font-weight="600">Filter Funnel</text>'
      + '</g></svg>';
  }

  /* === Plant === */
  function plant() {
    return '<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" class="lab-svg">'
      + '<g filter="url(#softShadow)">'
      + '<rect x="65" y="170" width="70" height="55" rx="4" fill="#a0522d"/>'
      + '<rect x="60" y="165" width="80" height="10" rx="2" fill="#7a3d1f"/>'
      + '<line x1="100" y1="170" x2="100" y2="60" stroke="#27ae60" stroke-width="4"/>'
      + '<ellipse cx="60" cy="100" rx="28" ry="14" fill="#27ae60" transform="rotate(-35 60 100)"/>'
      + '<ellipse cx="140" cy="100" rx="28" ry="14" fill="#27ae60" transform="rotate(35 140 100)"/>'
      + '<ellipse cx="60" cy="140" rx="28" ry="14" fill="#1e8449" transform="rotate(-20 60 140)"/>'
      + '<ellipse cx="140" cy="140" rx="28" ry="14" fill="#1e8449" transform="rotate(20 140 140)"/>'
      + '<circle cx="100" cy="60" r="14" fill="#f1c40f"/>'
      + '<circle cx="100" cy="60" r="6" fill="#d35400"/>'
      + '</g></svg>';
  }

  /* === Atom (Bohr style) === */
  function atom(opts) {
    opts = opts || {};
    var p = opts.protons || 6, n = opts.neutrons || 6, e = opts.electrons || 6;
    var shells = [2, 8, 8, 2];
    var s = '<svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg" class="lab-svg">'
      + '<g filter="url(#softShadow)">'
      // nucleus
      + '<g transform="translate(130 130)">';
    for (var i = 0; i < Math.min(8, p + n); i++) {
      var ang = (i / 8) * 2 * Math.PI, r = 8;
      var nx = r * Math.cos(ang), ny = r * Math.sin(ang);
      s += '<circle cx="' + nx + '" cy="' + ny + '" r="6" fill="' + (i < p ? '#e74c3c' : '#7d8590') + '"/>';
    }
    s += '</g>';
    var rem = e;
    for (var sh = 0; sh < shells.length && rem > 0; sh++) {
      var radius = 30 + sh * 28;
      s += '<circle cx="130" cy="130" r="' + radius + '" fill="none" stroke="#3498db" stroke-width="1" stroke-dasharray="4 3"/>';
      var put = Math.min(rem, shells[sh]);
      for (var j = 0; j < put; j++) {
        var a = (j / put) * 2 * Math.PI;
        s += '<circle cx="' + (130 + radius * Math.cos(a)) + '" cy="' + (130 + radius * Math.sin(a)) + '" r="4" fill="#3498db"><animateTransform attributeName="transform" type="rotate" from="0 130 130" to="360 130 130" dur="' + (4 + sh * 2) + 's" repeatCount="indefinite"/></circle>';
      }
      rem -= put;
    }
    s += '<text x="130" y="252" text-anchor="middle" font-size="11" fill="#333" font-weight="600">Atom · p=' + p + ' n=' + n + ' e=' + e + '</text>'
      + '</g></svg>';
    return s;
  }

  /* === Spring (Hooke) === */
  function spring(opts) {
    opts = opts || {};
    var ext = opts.extension || 0; // px
    var coils = 12;
    var s = '<svg viewBox="0 0 100 260" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<rect x="20" y="10" width="60" height="10" fill="#333"/>'
      + '<path d="';
    var yStart = 20, yEnd = 150 + ext;
    var step = (yEnd - yStart) / coils;
    s += 'M50 ' + yStart;
    for (var i = 0; i < coils; i++) {
      s += ' L30 ' + (yStart + i * step + step / 4) + ' L70 ' + (yStart + i * step + 3 * step / 4) + ' L50 ' + (yStart + (i + 1) * step);
    }
    s += '" stroke="#0f3460" stroke-width="2.5" fill="none"/>'
      + '<rect x="30" y="' + yEnd + '" width="40" height="30" fill="#e74c3c" stroke="#6e1410"/>'
      + '</g></svg>';
    return s;
  }

  /* === Trolley with wheels === */
  function trolley(opts) {
    opts = opts || {};
    var color = opts.color || '#e94560';
    return '<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" class="lab-svg">'
      + '<g filter="url(#softShadow)">'
      + '<rect x="20" y="30" width="160" height="40" rx="4" fill="' + color + '" stroke="#333"/>'
      + '<circle cx="50" cy="80" r="14" fill="#333"/><circle cx="50" cy="80" r="6" fill="#999"/>'
      + '<circle cx="150" cy="80" r="14" fill="#333"/><circle cx="150" cy="80" r="6" fill="#999"/>'
      + '</g></svg>';
  }

  /* === Inclined plane === */
  function inclinedPlane(opts) {
    opts = opts || {};
    var ang = opts.angle || 30;
    var len = 200; var h = len * Math.sin(ang * Math.PI / 180);
    return '<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" class="lab-svg">'
      + '<g filter="url(#softShadow)">'
      + '<polygon points="40,' + (170 - h) + ' 240,170 40,170" fill="#a87148" stroke="#6b4326"/>'
      + '<text x="120" y="190" font-size="12" fill="#333">' + ang + '°</text>'
      + '</g></svg>';
  }

  /* === DNA helix === */
  function dnaHelix() {
    var s = '<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" class="lab-svg"><g filter="url(#softShadow)">';
    for (var i = 0; i < 14; i++) {
      var y = 20 + i * 16, phase = i * 0.6;
      var x1 = 100 + 35 * Math.sin(phase), x2 = 100 - 35 * Math.sin(phase);
      s += '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" stroke="#999" stroke-width="1.5"/>';
      s += '<circle cx="' + x1 + '" cy="' + y + '" r="6" fill="' + (i % 2 ? '#e74c3c' : '#3498db') + '"/>';
      s += '<circle cx="' + x2 + '" cy="' + y + '" r="6" fill="' + (i % 2 ? '#3498db' : '#e74c3c') + '"/>';
    }
    s += '<text x="100" y="255" text-anchor="middle" font-size="11" fill="#333" font-weight="600">DNA Double Helix</text></g></svg>';
    return s;
  }

  /* === Heart === */
  function heart(opts) {
    opts = opts || {};
    var beat = opts.beat || 1;
    return '<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" class="lab-svg">'
      + '<g filter="url(#softShadow)" transform="translate(100 100) scale(' + beat + ') translate(-100 -100)">'
      + '<path d="M100 180 C70 150 30 120 30 80 C30 50 55 30 80 40 C90 45 100 55 100 65 C100 55 110 45 120 40 C145 30 170 50 170 80 C170 120 130 150 100 180 Z" fill="#c0392b" stroke="#6e1410"/>'
      + '<text x="100" y="210" text-anchor="middle" font-size="11" fill="#333" font-weight="600">Heart</text>'
      + '</g></svg>';
  }

  /* === Brain === */
  function brain() {
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="lab-svg">'
      + '<g filter="url(#softShadow)">'
      + '<path d="M40 100 C30 70 50 40 80 40 C90 30 110 30 120 40 C150 40 170 70 160 100 C170 130 150 160 120 160 C110 170 90 170 80 160 C50 160 30 130 40 100 Z" fill="#f4cccc" stroke="#a06464"/>'
      + '<path d="M100 40 L100 160" stroke="#a06464" stroke-width="1.5"/>'
      + '<path d="M60 70 Q80 85 60 100 Q80 115 60 130" fill="none" stroke="#a06464"/>'
      + '<path d="M140 70 Q120 85 140 100 Q120 115 140 130" fill="none" stroke="#a06464"/>'
      + '<text x="100" y="195" text-anchor="middle" font-size="11" fill="#333" font-weight="600">Brain</text>'
      + '</g></svg>';
  }

  /* === Pulley === */
  function pulley() {
    return '<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<rect x="40" y="10" width="120" height="10" fill="url(#wood)"/>'
      + '<circle cx="100" cy="50" r="25" fill="url(#metal)" stroke="#444" stroke-width="2"/>'
      + '<circle cx="100" cy="50" r="6" fill="#222"/>'
      + '<line x1="80" y1="55" x2="80" y2="200" stroke="#333" stroke-width="2"/>'
      + '<line x1="120" y1="55" x2="120" y2="160" stroke="#333" stroke-width="2"/>'
      + '<rect x="65" y="200" width="30" height="30" fill="#e94560"/>'
      + '<rect x="105" y="160" width="30" height="30" fill="#27ae60"/>'
      + '</g></svg>';
  }

  /* === Convex lens === */
  function convexLens(opts) {
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="lab-svg">' + DEFS
      + '<g filter="url(#softShadow)">'
      + '<ellipse cx="100" cy="100" rx="20" ry="80" fill="url(#glass)" stroke="#7e94a5"/>'
      + '<line x1="0" y1="100" x2="200" y2="100" stroke="#999" stroke-dasharray="4 3"/>'
      + '<circle cx="60" cy="100" r="4" fill="#f39c12"/>'
      + '<circle cx="140" cy="100" r="4" fill="#f39c12"/>'
      + '<text x="60" y="120" font-size="10" text-anchor="middle">F</text>'
      + '<text x="140" y="120" font-size="10" text-anchor="middle">F</text>'
      + '</g></svg>';
  }

  /* === Concave/Convex mirrors === */
  function mirror(opts) {
    opts = opts || {};
    var type = opts.type || 'concave';
    var path = type === 'concave'
      ? 'M120 30 Q70 100 120 170'
      : 'M80 30 Q130 100 80 170';
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="lab-svg">'
      + '<g filter="url(#softShadow)">'
      + '<path d="' + path + '" stroke="#3498db" stroke-width="4" fill="none"/>'
      + '<path d="' + path + '" stroke="#7e94a5" stroke-width="1.5" fill="none" transform="translate(2 0)"/>'
      + '<text x="100" y="195" text-anchor="middle" font-size="11" fill="#333" font-weight="600">' + (type === 'concave' ? 'Concave' : 'Convex') + ' Mirror</text>'
      + '</g></svg>';
  }

  /* === Stopwatch === */
  function stopwatch(opts) {
    opts = opts || {};
    var sec = opts.seconds || 0;
    var ang = (sec % 60) * 6;
    return '<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" class="lab-svg">'
      + '<g filter="url(#softShadow)">'
      + '<rect x="85" y="10" width="30" height="14" fill="#aaa"/>'
      + '<rect x="92" y="2" width="16" height="12" fill="#888"/>'
      + '<circle cx="100" cy="120" r="80" fill="#fff" stroke="#222" stroke-width="4"/>'
      + (function(){var s='';for(var i=0;i<60;i++){var a=i*6*Math.PI/180,x1=100+72*Math.sin(a),y1=120-72*Math.cos(a),x2=100+78*Math.sin(a),y2=120-78*Math.cos(a);s+='<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#333" stroke-width="'+(i%5==0?2:0.5)+'"/>';}return s;})()
      + '<g transform="translate(100 120) rotate(' + ang + ')"><line x1="0" y1="10" x2="0" y2="-65" stroke="#e94560" stroke-width="2"/><circle r="5" fill="#222"/></g>'
      + '<text x="100" y="200" text-anchor="middle" font-size="13" font-weight="700">' + sec.toFixed(1) + 's</text>'
      + '</g></svg>';
  }

  /* === Galaxy / planet system shortcut === */
  function planet(opts) {
    opts = opts || {};
    var color = opts.color || '#3498db', ring = opts.ring;
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="lab-svg">'
      + '<g filter="url(#softShadow)">'
      + (ring ? '<ellipse cx="100" cy="100" rx="85" ry="25" fill="none" stroke="' + ring + '" stroke-width="4"/>' : '')
      + '<circle cx="100" cy="100" r="50" fill="' + color + '"/>'
      + '<circle cx="85" cy="85" r="20" fill="rgba(255,255,255,.2)"/>'
      + '</g></svg>';
  }

  /* === Volcano === */
  function volcano(opts) {
    opts = opts || {};
    var erupt = opts.erupt;
    return '<svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" class="lab-svg">'
      + '<g filter="url(#softShadow)">'
      + '<polygon points="20,180 90,60 170,60 240,180" fill="#7d6048"/>'
      + '<polygon points="90,60 170,60 175,40 85,40" fill="#3a3a3a"/>'
      + '<rect x="100" y="40" width="60" height="6" fill="#1a1a1a"/>'
      + (erupt
          ? '<g><polygon points="100,40 130,-10 160,40" fill="#e74c3c" opacity=".85"/><circle cx="115" cy="20" r="5" fill="#f39c12"/><circle cx="140" cy="10" r="6" fill="#e67e22"/><circle cx="155" cy="25" r="4" fill="#c0392b"/></g>'
          : '')
      + '<path d="M100 50 Q120 100 80 180" fill="#e67e22" opacity=".8"/>'
      + '<text x="130" y="195" text-anchor="middle" font-size="11" fill="#333" font-weight="600">Volcano</text>'
      + '</g></svg>';
  }

  /* === Water tap / drop === */
  function waterDrop() {
    return '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" class="lab-svg">'
      + '<g filter="url(#softShadow)">'
      + '<path d="M50 10 Q20 50 20 85 Q20 120 50 130 Q80 120 80 85 Q80 50 50 10 Z" fill="#3498db"/>'
      + '<ellipse cx="40" cy="60" rx="10" ry="20" fill="rgba(255,255,255,.4)"/>'
      + '</g></svg>';
  }

  /* === Tool index for the gallery page === */
  var GALLERY = [
    { id: 'beaker', name: 'Beaker', desc: 'Cylindrical glass container with spout for mixing & heating liquids.', subjects: ['Chemistry', 'Biology'], render: function () { return beaker({ fill: 'blue', label: '250 mL Beaker' }); } },
    { id: 'flask', name: 'Conical (Erlenmeyer) Flask', desc: 'Used to swirl liquids; narrow neck reduces splashing.', subjects: ['Chemistry'], render: function () { return flask({ fill: 'red' }); } },
    { id: 'testtube', name: 'Test Tube', desc: 'Small reactions, qualitative analysis, holding samples.', subjects: ['Chemistry', 'Biology'], render: function () { return testTube({ fill: 'green', label: 'Test Tube' }); } },
    { id: 'bunsen', name: 'Bunsen Burner', desc: 'Provides a controlled flame for heating and combustion experiments.', subjects: ['Chemistry'], render: function () { return bunsenBurner({ lit: true }); } },
    { id: 'microscope', name: 'Compound Microscope', desc: 'Magnifies cells, microorganisms; objective × eyepiece magnification.', subjects: ['Biology'], render: function () { return microscope(); } },
    { id: 'thermometer', name: 'Thermometer', desc: 'Measures temperature; based on thermal expansion of mercury or alcohol.', subjects: ['Physics', 'Chemistry'], render: function () { return thermometer({ temp: 60 }); } },
    { id: 'balance', name: 'Digital Balance', desc: 'Accurate mass measurement to 0.01 g.', subjects: ['Chemistry', 'Physics'], render: function () { return balance({ mass: 25.43 }); } },
    { id: 'voltmeter', name: 'Voltmeter', desc: 'Measures potential difference across a component.', subjects: ['Physics'], render: function () { return meter({ value: 6.2, max: 10, label: 'V', name: 'Voltmeter' }); } },
    { id: 'ammeter', name: 'Ammeter', desc: 'Measures current flowing through a circuit (connected in series).', subjects: ['Physics'], render: function () { return meter({ value: 1.5, max: 5, label: 'A', name: 'Ammeter' }); } },
    { id: 'battery', name: 'Dry Cell', desc: 'Source of EMF for circuit experiments.', subjects: ['Physics'], render: function () { return battery({ volts: 1.5 }); } },
    { id: 'bulb', name: 'Lamp / Bulb', desc: 'Converts electrical energy to light. Glows when current flows.', subjects: ['Physics'], render: function () { return bulb({ on: true }); } },
    { id: 'switch', name: 'Switch', desc: 'Opens or closes a circuit.', subjects: ['Physics'], render: function () { return switchSym({ on: true }); } },
    { id: 'resistor', name: 'Resistor', desc: 'Restricts the flow of electric current. Color bands encode resistance.', subjects: ['Physics'], render: function () { return resistor({ R: 220 }); } },
    { id: 'burette', name: 'Burette', desc: 'Delivers precise volumes of titrant in titration.', subjects: ['Chemistry'], render: function () { return burette({ fill: 'blue', level: 0.75 }); } },
    { id: 'magnet', name: 'Bar Magnet', desc: 'Two-pole permanent magnet for magnetism experiments.', subjects: ['Physics'], render: function () { return magnet(); } },
    { id: 'compass', name: 'Magnetic Compass', desc: 'Points to magnetic north — used to detect magnetic fields.', subjects: ['Physics', 'Gen Sci'], render: function () { return compass({ angle: 30 }); } },
    { id: 'pendulum', name: 'Simple Pendulum', desc: 'Mass on a string — basic SHM apparatus.', subjects: ['Physics'], render: function () { return pendulum({ angle: 25 }); } },
    { id: 'tripod', name: 'Tripod Stand', desc: 'Holds beakers above a Bunsen burner during heating.', subjects: ['Chemistry'], render: function () { return tripod(); } },
    { id: 'petri', name: 'Petri Dish', desc: 'Shallow dish for culturing microorganisms.', subjects: ['Biology'], render: function () { return petriDish({ contents: 5 }); } },
    { id: 'telescope', name: 'Refracting Telescope', desc: 'Objective lens + eyepiece for astronomy.', subjects: ['Physics', 'Gen Sci'], render: function () { return telescope(); } },
    { id: 'pipette', name: 'Graduated Pipette', desc: 'Accurate small-volume liquid transfer (≤ 25 mL).', subjects: ['Chemistry', 'Biology'], render: function () { return pipette({ fill: 'blue' }); } },
    { id: 'funnel', name: 'Filter Funnel', desc: 'Holds filter paper for filtration separations.', subjects: ['Chemistry'], render: function () { return funnel(); } },
    { id: 'plant', name: 'Potted Plant', desc: 'Used in photosynthesis, transpiration & growth experiments.', subjects: ['Biology'], render: function () { return plant(); } },
    { id: 'spring', name: 'Helical Spring', desc: "Hooke's Law experiments — extension proportional to load.", subjects: ['Physics'], render: function () { return spring({ extension: 30 }); } },
    { id: 'trolley', name: 'Dynamics Trolley', desc: 'Low-friction wheeled cart for motion & force experiments.', subjects: ['Physics'], render: function () { return trolley({}); } },
    { id: 'incline', name: 'Inclined Plane', desc: 'Ramp used to study forces, friction and energy.', subjects: ['Physics'], render: function () { return inclinedPlane({ angle: 30 }); } },
    { id: 'pulley', name: 'Pulley System', desc: 'Simple machine that changes the direction of force.', subjects: ['Physics'], render: function () { return pulley(); } },
    { id: 'lens', name: 'Convex Lens', desc: 'Converges parallel rays to a focal point.', subjects: ['Physics'], render: function () { return convexLens(); } },
    { id: 'mirror', name: 'Concave Mirror', desc: 'Curved mirror used to form real and virtual images.', subjects: ['Physics'], render: function () { return mirror({ type: 'concave' }); } },
    { id: 'stopwatch', name: 'Stopwatch', desc: 'Times the duration of events to the nearest 0.1 s.', subjects: ['Physics', 'Chemistry', 'Biology'], render: function () { return stopwatch({ seconds: 12.3 }); } },
    { id: 'atom', name: 'Bohr Atom Model', desc: 'Electrons orbit a nucleus of protons & neutrons in fixed shells.', subjects: ['Chemistry', 'Physics'], render: function () { return atom({ protons: 6, neutrons: 6, electrons: 6 }); } },
    { id: 'dna', name: 'DNA Double Helix', desc: 'Two complementary nucleotide strands wound around each other.', subjects: ['Biology'], render: function () { return dnaHelix(); } },
    { id: 'heart', name: 'Human Heart', desc: 'Four-chambered pump that circulates blood.', subjects: ['Biology'], render: function () { return heart(); } },
    { id: 'brain', name: 'Human Brain', desc: 'Central organ of the nervous system.', subjects: ['Biology'], render: function () { return brain(); } },
    { id: 'volcano', name: 'Volcano', desc: 'Vent through which molten rock erupts onto the surface.', subjects: ['Gen Sci'], render: function () { return volcano({ erupt: true }); } },
    { id: 'planet', name: 'Ringed Planet', desc: 'Saturn-like gas giant with ring system.', subjects: ['Gen Sci'], render: function () { return planet({ color: '#e0a951', ring: '#f5d27a' }); } }
  ];

  return {
    DEFS: DEFS,
    beaker: beaker, flask: flask, testTube: testTube, bunsenBurner: bunsenBurner,
    microscope: microscope, thermometer: thermometer, balance: balance,
    meter: meter, battery: battery, bulb: bulb, switchSym: switchSym, resistor: resistor,
    burette: burette, magnet: magnet, compass: compass, pendulum: pendulum,
    tripod: tripod, petriDish: petriDish, telescope: telescope, pipette: pipette,
    funnel: funnel, plant: plant, atom: atom, spring: spring, trolley: trolley,
    inclinedPlane: inclinedPlane, dnaHelix: dnaHelix, heart: heart, brain: brain,
    pulley: pulley, convexLens: convexLens, mirror: mirror, stopwatch: stopwatch,
    planet: planet, volcano: volcano, waterDrop: waterDrop,
    GALLERY: GALLERY, liquidColor: liquidColor
  };
})();
