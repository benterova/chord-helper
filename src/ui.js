window.ChordApp = window.ChordApp || {};

(function () {
    const { CIRCLE_OF_FIFTHS, MODE_DISPLAY_NAMES, PROGRESSIONS } = ChordApp.Constants;
    const { generateProgression, applyRhythm, STYLES } = ChordApp.Engine;



    function initControls(notes, initialRoot, initialMode, onRootChange, onModeChange) {
        const keySelect = document.getElementById('key-select');
        const scaleSelect = document.getElementById('scale-type-select');

        // Populate Keys
        notes.forEach(note => {
            const option = document.createElement('option');
            option.value = note;
            option.textContent = note;
            keySelect.appendChild(option);
        });

        // Populate Scales with Groups
        const { MODE_DISPLAY_NAMES } = ChordApp.Constants;

        const standardModes = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'natural_minor', 'locrian'];
        const otherScales = ['harmonic_minor', 'melodic_minor', 'major_pentatonic', 'minor_pentatonic', 'blues'];

        const createGroup = (label, keys) => {
            const group = document.createElement('optgroup');
            group.label = label;
            keys.forEach(key => {
                const opt = document.createElement('option');
                opt.value = key;
                opt.textContent = MODE_DISPLAY_NAMES[key];
                group.appendChild(opt);
            });
            return group;
        };

        scaleSelect.appendChild(createGroup('Standard Modes', standardModes));
        scaleSelect.appendChild(createGroup('Other Scales', otherScales));

        keySelect.value = initialRoot;
        scaleSelect.value = initialMode;

        keySelect.onchange = (e) => onRootChange(e.target.value);
        scaleSelect.onchange = (e) => onModeChange(e.target.value);

        // Create Tooltip Element if not exists
        if (!document.getElementById('chord-tooltip')) {
            const tooltip = document.createElement('div');
            tooltip.id = 'chord-tooltip';
            document.body.appendChild(tooltip);
        }

        // Init Generator UI
        initGeneratorControls(initialRoot, initialMode);
    }

    function initGeneratorControls(root, mode) {
        // Find a place to inject. Let's look for 'progressions-list' parent or similar.
        const progContainer = document.getElementById('progressions-list');
        if (!progContainer) return;

        // Create Container for Generator
        const genContainer = document.createElement('div');
        genContainer.className = 'generator-container';
        genContainer.style.marginTop = '40px';
        genContainer.style.padding = '20px';
        genContainer.style.background = 'var(--bg-secondary)';
        genContainer.style.borderRadius = '12px';
        genContainer.innerHTML = `
            <h3 style="margin-top:0;">Generative Engine</h3>
            <div class="controls" style="display:flex; gap:15px; margin-bottom:15px;">
                <label>
                    Style:
                    <select id="gen-style">
                        ${Object.values(STYLES).map(style => {
            let label = style.charAt(0).toUpperCase() + style.slice(1);
            if (style === 'rnb') label = 'R&B';
            if (style === 'lofi') label = 'Lo-Fi';
            if (style === 'bossa') label = 'Bossa Nova';
            return `<option value="${style}">${label}</option>`;
        }).join('')}
                    </select>
                </label>
                <label>
                    Length:
                    <select id="gen-length">
                        <option value="4">4 Bars</option>
                        <option value="8">8 Bars</option>
                    </select>
                </label>
                <button id="btn-generate" class="midi-btn" style="background:var(--accent-color);">Generate New</button>
            </div>
            <div id="gen-result" style="margin-bottom:15px; min-height:50px;"></div>
            <button id="btn-download-gen" class="midi-btn" disabled>Download Generated MIDI</button>
        `;

        progContainer.parentNode.insertBefore(genContainer, progContainer.nextSibling);

        // Bind Events
        document.getElementById('btn-generate').onclick = () => {
            const style = document.getElementById('gen-style').value;
            const length = parseInt(document.getElementById('gen-length').value, 10);

            // Get current global state (from UI closure or passed args? Args are initial only...)
            // We need current root/mode. 
            // HACK: Read from DOM or exposing state? 
            // Ideally explicit state passing. But 'render' receives state.
            // Let's store latest state in a closure var or read DOM.
            const currentRoot = document.getElementById('key-select').value;
            const currentMode = document.getElementById('scale-type-select').value;

            const progression = generateProgression(currentRoot, currentMode, { style, length });
            const events = applyRhythm(progression, style);

            renderGeneratedResult(progression, events, style, currentRoot, currentMode);
        };
    }

    function renderGeneratedResult(progression, events, style, root, mode) {
        const resultDiv = document.getElementById('gen-result');
        const downloadBtn = document.getElementById('btn-download-gen');

        const chordNames = progression.map(c => c.chordName).join(' - ');
        const romanNames = progression.map(c => c.roman).join(' - ');

        resultDiv.innerHTML = `
            <div style="font-size:1.1em; font-weight:bold; margin-bottom:5px;">${chordNames}</div>
            <div style="color:var(--text-secondary); font-size:0.9em;">${romanNames}</div>
        `;

        downloadBtn.disabled = false;
        downloadBtn.onclick = () => {
            const progString = progression.map(c => c.chordName).join('-');
            ChordApp.Midi.downloadGeneratedMidi(progString, events, root, mode, style);
        };
    }

    function render(state, chords, onMidiDownload) {
        if (!chords || !Array.isArray(chords)) {
            console.warn("Render called with invalid chords", chords);
            return;
        }
        renderCircle(state, chords);
        renderScaleDegrees(chords);
        renderChordsList(chords);
        renderProgressions(state, chords, onMidiDownload);
    }

    function renderCircle(state, chords) {
        const container = document.getElementById('circle-container');
        container.innerHTML = '';

        if (!chords) return;

        const size = 500;
        const center = size / 2;
        const radius = 200;
        const thickness = 80;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
        svg.style.width = "100%";
        svg.style.height = "100%";

        const angleStep = 360 / 12;

        CIRCLE_OF_FIFTHS.forEach((note, index) => {
            const startAngle = (index * angleStep) - 90 - (angleStep / 2);
            const endAngle = startAngle + angleStep;

            const chordData = chords.find(c => c.root === note);

            let color = 'var(--inactive-color)';
            if (chordData) {
                if (chordData.quality === 'major') color = 'var(--major-color)';
                else if (chordData.quality === 'minor') color = 'var(--minor-color)';
                else if (chordData.quality === 'dim') color = 'var(--dim-color)';
                else if (chordData.quality === 'aug') color = 'var(--aug-color)';
            }

            const path = createSectorPath(center, center, radius, radius - thickness, startAngle, endAngle);

            const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathEl.setAttribute("d", path);
            pathEl.setAttribute("fill", color);
            pathEl.setAttribute("stroke", "var(--bg-color)");
            pathEl.setAttribute("stroke-width", "2");
            pathEl.classList.add("sector");

            // Interaction for Tooltip
            if (chordData) {
                pathEl.style.cursor = 'pointer'; // Show it's interactive

                pathEl.addEventListener('mouseenter', (e) => {
                    const tooltip = document.getElementById('chord-tooltip');
                    if (!tooltip) return;

                    const notes = ChordApp.Theory.getChordNotes(chordData);
                    tooltip.innerHTML = `<div style="font-weight:bold; margin-bottom:2px;">${chordData.chordName}</div>
                                         <div style="color:var(--text-secondary); font-size:0.85em;">${notes.join(' - ')}</div>`;

                    tooltip.style.display = 'block';
                });

                pathEl.addEventListener('mousemove', (e) => {
                    const tooltip = document.getElementById('chord-tooltip');
                    if (!tooltip) return;

                    // Position just above/right of cursor using fixed positioning
                    // Add small offset so mouse isn't covering it
                    tooltip.style.left = (e.clientX + 15) + 'px';
                    tooltip.style.top = (e.clientY + 15) + 'px';
                });

                pathEl.addEventListener('mouseleave', () => {
                    const tooltip = document.getElementById('chord-tooltip');
                    if (tooltip) tooltip.style.display = 'none';
                });
            }

            svg.appendChild(pathEl);

            // Text Label
            const midAngle = (startAngle + endAngle) / 2;
            const textRadius = radius - (thickness / 2);
            const textX = center + textRadius * Math.cos(midAngle * Math.PI / 180);
            const textY = center + textRadius * Math.sin(midAngle * Math.PI / 180);

            const textGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

            const noteText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            noteText.setAttribute("x", textX);
            noteText.setAttribute("y", textY);
            noteText.setAttribute("text-anchor", "middle");
            noteText.setAttribute("dominant-baseline", "middle");
            noteText.setAttribute("fill", chordData ? "#000" : "var(--text-secondary)");
            noteText.setAttribute("font-weight", "bold");
            noteText.setAttribute("font-size", "18");
            noteText.textContent = note;

            textGroup.appendChild(noteText);

            if (chordData) {
                const romanText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                romanText.setAttribute("x", textX);
                romanText.setAttribute("y", textY + 20);
                romanText.setAttribute("text-anchor", "middle");
                romanText.setAttribute("dominant-baseline", "middle");
                romanText.setAttribute("fill", "#000");
                romanText.setAttribute("font-size", "14");
                romanText.textContent = chordData.roman;
                textGroup.appendChild(romanText);

                noteText.setAttribute("y", textY - 10);
            }

            svg.appendChild(textGroup);
        });

        const centerText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        centerText.setAttribute("x", center);
        centerText.setAttribute("y", center);
        centerText.setAttribute("text-anchor", "middle");
        centerText.setAttribute("dominant-baseline", "middle");
        centerText.setAttribute("fill", "var(--text-primary)");
        centerText.setAttribute("font-size", "24");

        const { MODE_DISPLAY_NAMES } = ChordApp.Constants;
        const modeName = MODE_DISPLAY_NAMES[state.mode] || state.mode;

        centerText.textContent = `${state.root} ${modeName}`;
        svg.appendChild(centerText);

        container.appendChild(svg);
    }

    function createSectorPath(cx, cy, rOuter, rInner, startAngle, endAngle) {
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = cx + rOuter * Math.cos(startRad);
        const y1 = cy + rOuter * Math.sin(startRad);
        const x2 = cx + rOuter * Math.cos(endRad);
        const y2 = cy + rOuter * Math.sin(endRad);

        const x3 = cx + rInner * Math.cos(endRad);
        const y3 = cy + rInner * Math.sin(endRad);
        const x4 = cx + rInner * Math.cos(startRad);
        const y4 = cy + rInner * Math.sin(startRad);

        return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 0 0 ${x4} ${y4} Z`;
    }

    function renderScaleDegrees(chords) {
        const container = document.getElementById('scale-degrees');
        container.innerHTML = '';

        chords.forEach(chord => {
            const div = document.createElement('div');
            div.className = 'note-badge';
            div.innerHTML = `
                <span class="note-name">${chord.root}</span>
                <span class="note-degree">${chord.degree}</span>
            `;
            container.appendChild(div);
        });
    }

    function renderChordsList(chords) {
        const container = document.getElementById('chords-list');
        container.innerHTML = '';

        chords.forEach(chord => {
            const div = document.createElement('div');
            div.className = `chord-item ${chord.quality}`;
            div.innerHTML = `
                <div class="chord-info">
                    <span class="chord-name">${chord.chordName}</span>
                </div>
                <span class="chord-roman">${chord.roman}</span>
            `;
            container.appendChild(div);
        });
    }

    function renderProgressions(state, chords, onMidiDownload) {
        const container = document.getElementById('progressions-list');
        container.innerHTML = '';

        const progs = PROGRESSIONS[state.mode] || [];

        if (progs.length === 0) {
            container.innerHTML = '<div class="no-progs">No example progressions for this mode yet.</div>';
            return;
        }

        // Check global toggle state
        const toggleVariation = document.getElementById('variation-toggle');
        const isVariation = toggleVariation ? toggleVariation.checked : false;

        const toggleExtension = document.getElementById('extension-toggle');
        const isExtension = toggleExtension ? toggleExtension.checked : false;

        const toggleVoicing = document.getElementById('voicing-toggle');
        const isVoicing = toggleVoicing ? toggleVoicing.checked : false;

        // Re-attach listeners
        if (toggleVariation) {
            toggleVariation.onchange = () => renderProgressions(state, chords, onMidiDownload);
        }
        if (toggleExtension) {
            toggleExtension.onchange = () => renderProgressions(state, chords, onMidiDownload);
        }
        if (toggleVoicing) {
            toggleVoicing.onchange = () => renderProgressions(state, chords, onMidiDownload);
        }

        progs.forEach(prog => {
            // Use Theory to get the display sequence
            const sequence = ChordApp.Theory.generateVariationSequence(prog.indices, chords, isVariation, isExtension, isVoicing);

            // Format for display
            // If variation is long, maybe truncate or show in a nice grid? 
            // For now, let's just list them nicely. If > 8 chords, maybe create a grid.

            let displayChords = sequence.map(c => c.chordName);

            // If it's the standard loop (not variation), we just show the base progression once to keep it clean
            // If it IS variation, show the interesting parts (maybe the last 4 bars?)
            // Actually user asked: "show what the extended version's progression looks like".
            // So we should show all of them, or a representative set.

            let chordsHtml = '';
            if (isVariation) {
                // Show "Bar 1: ... | Bar 2: ..."
                const half = Math.ceil(displayChords.length / 2);
                const bar1 = displayChords.slice(0, half).join(' - ');
                const bar2 = displayChords.slice(half).join(' - ');

                chordsHtml = `
                    <div style="font-size: 0.9em; opacity: 0.8;">Bar 1: ${bar1}</div>
                    <div style="font-weight: 600;">Bar 2: ${bar2}</div>
                `;
            } else {
                chordsHtml = `<div class="prog-chords">${displayChords.join(' - ')}</div>`;
            }

            const div = document.createElement('div');
            div.className = 'progression-item';
            div.innerHTML = `
                <div class="prog-info">
                    <div class="prog-header" style="display: flex; gap: 10px; align-items: center; margin-bottom: 0.5rem;">
                         <div class="prog-name" style="margin:0">${prog.name}</div>
                         ${prog.genre ? `<span class="genre-badge">${prog.genre}</span>` : ''}
                    </div>
                    ${chordsHtml}
                </div>
            `;

            const btn = document.createElement('button');
            btn.className = 'midi-btn';
            btn.textContent = 'Download MIDI';

            btn.onclick = () => {
                onMidiDownload(prog.name, sequence, {
                    isVariation,
                    isExtension,
                    isVoicing
                });
            };

            div.appendChild(btn);
            container.appendChild(div);
        });
    }

    ChordApp.UI = {
        initControls,
        render
    };
})();
