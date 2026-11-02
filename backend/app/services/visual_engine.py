"""
GuruG Educational Visual Diagram & Picture Engine
Provides rich, interactive scientific illustrations, mathematical plots,
and labeled concept diagrams for every educational response.
"""

import os
import re
from pathlib import Path
from typing import Dict, Any, Optional, List

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
IMAGES_DIR = BASE_DIR / "frontend" / "images" / "concepts"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Pre-defined High Quality Visual Assets Catalog
# ---------------------------------------------------------------------------

VISUAL_CATALOG = [
    {
        "id": "respiratory_system",
        "file": "respiratory_system.svg",
        "title": "Human Respiratory System & Alveolar Gas Exchange",
        "badge": "Biology • Human Physiology",
        "subject": "Biology",
        "caption": "Air travels via the nasal cavity, trachea, and bronchi into the lungs. In millions of microscopic alveoli, oxygen ($O_2$) diffuses across thin capillaries into hemoglobin while carbon dioxide ($CO_2$) is exhaled. Diaphragm contraction powers pressure changes obeying Boyle's Law ($P_1V_1 = P_2V_2$).",
        "key_takeaway": "Inhalation: Diaphragm contracts downward, lung volume increases, internal pressure drops below atmospheric, drawing air inward.",
        "primary_terms": [
            "respiratory", "respiration", "lung", "lungs", "trachea", "bronchi",
            "bronchus", "alveoli", "alveolus", "diaphragm", "breathing", "inhalation",
            "exhalation", "gas exchange", "pulmonary", "saans", "shwasan", "phaphde", "respiratory system"
        ],
        "secondary_terms": ["larynx", "pleura", "bronchiole", "vital capacity", "boyle"],
        "negative_terms": ["plant leaf", "chlorophyll", "photosynthesis", "calvin cycle"]
    },
    {
        "id": "photosynthesis",
        "file": "photosynthesis.svg",
        "title": "Photosynthesis: Light & Dark Chemical Pathways in Plants",
        "badge": "Biology • Biochemical Process",
        "subject": "Biology",
        "caption": "Chlorophyll pigments inside plant chloroplasts capture sunlight photons to split water ($H_2O$) and fix carbon dioxide ($CO_2$), producing glucose sugar ($C_6H_{12}O_6$) and life-giving oxygen ($O_2$).",
        "key_takeaway": "$6CO_2 + 6H_2O + \\text{Sunlight} \\longrightarrow C_6H_{12}O_6 + 6O_2$.",
        "primary_terms": [
            "photosynthesis", "chlorophyll", "chloroplast", "calvin cycle",
            "thylakoid", "photolysis", "light reaction", "dark reaction",
            "prakash sanshleshan", "stomata"
        ],
        "secondary_terms": ["autotroph", "plant glucose", "grana", "rubisco"],
        "negative_terms": ["respiratory", "lungs", "human breathing", "diaphragm", "alveoli"]
    },
    {
        "id": "quadratic_parabola",
        "file": "quadratic_parabola.svg",
        "title": "Quadratic Function Parabola & Real Roots",
        "badge": "Mathematics • Graph Visualizer",
        "subject": "Mathematics",
        "caption": "A quadratic equation graphs as a symmetrical U-shaped curve called a parabola. Notice how the roots (solutions) occur where the curve intersects the horizontal x-axis ($y = 0$), with the vertex $(h, k)$ as the turning point.",
        "key_takeaway": "When $b^2 - 4ac > 0$, the parabola crosses the x-axis twice, giving two distinct real roots.",
        "primary_terms": [
            "quadratic equation", "quadratic formula", "parabola", "discriminant",
            "quadratic", "b^2 - 4ac", "b^2-4ac", "ax^2 + bx + c", "ax^2+bx+c",
            "vertex form", "two real roots", "vighat samikaran"
        ],
        "secondary_terms": ["vertex", "axis of symmetry", "u-shaped curve", "parabolic curve"],
        "negative_terms": ["linear equation", "geometry", "triangle", "pythagor", "french revolution", "chemistry"]
    },
    {
        "id": "pythagorean_theorem",
        "file": "pythagorean_theorem.svg",
        "title": "Pythagorean Theorem Geometric Proof ($a^2 + b^2 = c^2$)",
        "badge": "Geometry • Visual Proof",
        "subject": "Mathematics",
        "caption": "Visualizing Pythagoras: The area of the square built upon the hypotenuse ($c^2 = 25$) exactly equals the combined areas of the squares on the two perpendicular sides ($a^2 = 9$ and $b^2 = 16$).",
        "key_takeaway": "Always applies to $90^\\circ$ triangles: $\\text{Hypotenuse} = \\sqrt{a^2 + b^2}$.",
        "primary_terms": [
            "pythagor", "pythagorean", "pythagorean theorem", "hypotenuse",
            "right triangle", "right-angled triangle", "a^2 + b^2 = c^2", "a^2+b^2=c^2",
            "pythagorean triplet", "bodhayana", "samkon tribhuj"
        ],
        "secondary_terms": ["perpendicular", "legs of triangle", "hypotenuse side"],
        "negative_terms": ["parabola", "quadratic", "algebraic equation", "biology", "physics"]
    },
    {
        "id": "newton_second_law",
        "file": "newton_second_law.svg",
        "title": r"Newton's Second Law & Net Force Vectors ($\vec{F} = m \cdot \vec{a}$)",
        "badge": "Mechanics • Force Vectors",
        "subject": "Physics",
        "caption": "Force produces acceleration in the direction of the net force vector. When a cricket fielder draws their hands back, they increase the impact time $\\Delta t$, which decreases the peak impact force ($F = \\Delta p / \\Delta t$).",
        "key_takeaway": "Double the force doubles acceleration; double the mass halves acceleration.",
        "primary_terms": [
            "newton's second law", "newton 2nd law", "f=ma", "f = ma", "net force",
            "force and acceleration", "force equals mass times acceleration",
            "momentum change", "impulse force", "cricket catch force", "gati ka niyam"
        ],
        "secondary_terms": ["acceleration vector", "inertia of motion", "newton's laws of motion"],
        "negative_terms": ["air force", "police force", "brute force", "market force", "labor force", "sales force"]
    },
    {
        "id": "cell_structure",
        "file": "cell_structure.svg",
        "title": "Cell Anatomy: Key Organelles & Microscopic Architecture",
        "badge": "Biology • Cellular Structure",
        "subject": "Biology",
        "caption": "A cell functions like a miniature metropolis: the Nucleus stores the genetic library, Mitochondria generate cellular energy (ATP), and the selectively permeable Cell Membrane guards entry and exit.",
        "key_takeaway": "Mitochondria are the powerhouses of cellular respiration, producing ATP molecules.",
        "primary_terms": [
            "cell structure", "cell organelle", "cell organelles", "mitochondria",
            "endoplasmic reticulum", "golgi apparatus", "plant cell", "animal cell",
            "cytoplasm", "cell membrane", "cell wall", "koshika", "eukaryotic cell", "prokaryotic cell"
        ],
        "secondary_terms": ["ribosome", "vacuole", "lysosome", "organelle"],
        "negative_terms": ["cell phone", "fuel cell", "solar cell", "prison cell", "battery cell"]
    },
    {
        "id": "trigonometry_unit_circle",
        "file": "trigonometry_unit_circle.svg",
        "title": "Trigonometric Unit Circle & Sine Wave Projection",
        "badge": "Trigonometry • Wave Projection",
        "subject": "Mathematics",
        "caption": "As an angle $\\theta$ sweeps counter-clockwise around the unit circle ($r=1$), the vertical height represents $\\sin\\theta$ and the horizontal length represents $\\cos\\theta$. Unrolling this circle yields the continuous wave.",
        "key_takeaway": "Pythagoras on the unit circle yields the identity: $\\sin^2\\theta + \\cos^2\\theta = 1$.",
        "primary_terms": [
            "unit circle", "trigonometry", "trigonometric", "sin theta", "cos theta",
            "tan theta", "sine and cosine", "sine wave projection", "sin^2 + cos^2", "trikonmiti"
        ],
        "secondary_terms": ["radian", "sine curve", "cosine curve", "trig ratios"],
        "negative_terms": ["sinful", "religion", "moral", "why do people sin", "original sin", "theology"]
    },
    {
        "id": "calculus_derivative",
        "file": "calculus_derivative.svg",
        "title": "Calculus: The Derivative as an Instantaneous Tangent Slope",
        "badge": "Calculus • Rate of Change",
        "subject": "Mathematics",
        "caption": "A secant line between two points measures average speed over an interval. As $\\Delta x$ shrinks toward zero, the secant line pivots into the tangent line, giving the exact instantaneous rate of change.",
        "key_takeaway": "$\\frac{dy}{dx} = \\lim_{\\Delta x \\to 0} \\frac{f(x+\\Delta x) - f(x)}{\\Delta x}$ represents instantaneous velocity.",
        "primary_terms": [
            "derivative", "differentiation", "tangent line slope", "rate of change",
            "dy/dx", "df/dx", "calculus derivative", "instantaneous velocity", "secant line", "avakal"
        ],
        "secondary_terms": ["limit delta x", "slope of curve", "derivative calculus"],
        "negative_terms": ["financial derivative", "derived word"]
    },
    {
        "id": "chemical_bonding",
        "file": "chemical_bonding.svg",
        "title": "Ionic vs. Covalent Chemical Bonding Mechanisms",
        "badge": "Chemistry • Molecular Structure",
        "subject": "Chemistry",
        "caption": "Atoms bond to achieve stable outer electron shells: Ionic bonds transfer electrons creating electrostatic attraction ($Na^+ + Cl^-$), while Covalent bonds share electron pairs ($H_2O$).",
        "key_takeaway": "Electronegativity difference dictates whether electrons are transferred (ionic) or shared (covalent).",
        "primary_terms": [
            "chemical bond", "chemical bonding", "covalent bond", "ionic bond",
            "covalent bonding", "ionic bonding", "electron sharing", "valence electrons",
            "electronegativity bond", "rasayanik bandhan", "octet rule"
        ],
        "secondary_terms": ["polar covalent", "crystal lattice nacl"],
        "negative_terms": ["james bond", "financial bond", "government bond", "bond market", "stock", "yield", "municipal bond"]
    },
    {
        "id": "electric_circuit_ohms_law",
        "file": "electric_circuit_ohms_law.svg",
        "title": r"Ohm's Law & Closed Electrical Circuit Diagram ($V = I \cdot R$)",
        "badge": "Electricity • Circuit Schematic",
        "subject": "Physics",
        "caption": "Voltage acts like water pressure pushing electrons through a conductor, while resistance acts like a narrow pipe restricting flow. Current is directly proportional to voltage and inversely proportional to resistance.",
        "key_takeaway": "Current $I = \\frac{V}{R}$. Halving resistance doubles the current.",
        "primary_terms": [
            "ohm's law", "ohms law", "v = ir", "v=ir", "electric circuit",
            "electrical circuit", "resistor in circuit", "voltage and current",
            "electrical resistance", "ammeter and voltmeter", "vidyut paripath"
        ],
        "secondary_terms": ["current flow", "closed circuit", "potential difference", "battery voltage"],
        "negative_terms": ["current events", "current affairs", "history", "news", "politics", "financial", "economy"]
    },
    {
        "id": "optics_refraction",
        "file": "optics_refraction.svg",
        "title": "Optics: Light Refraction & Snell's Law Across Boundary",
        "badge": "Optics • Wave Behavior",
        "subject": "Physics",
        "caption": "When a ray of light transitions from air into denser water or glass, its velocity decreases, causing the wavefront to bend toward the normal line at angle $\\theta_2 < \\theta_1$.",
        "key_takeaway": "Snell's Law: $n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2$ governs light bending in lenses and prisms.",
        "primary_terms": [
            "refraction of light", "snell's law", "snells law", "light refraction",
            "bending of light", "refractive index", "angle of incidence and refraction",
            "light passing through prism", "prakash ka apavartan"
        ],
        "secondary_terms": ["optical medium", "normal line", "denser medium", "convex lens refraction"],
        "negative_terms": ["contact lenses", "camera reviews", "eye glasses review"]
    },
    {
        "id": "binary_search",
        "file": "binary_search.svg",
        "title": "Binary Search Algorithm: Divide-and-Conquer Visualization",
        "badge": "Computer Science • Algorithm Visualizer",
        "subject": "Computer Science",
        "caption": "Instead of checking items one by one ($O(n)$), binary search inspects the middle element of a sorted list. If the target is smaller, the entire right half is discarded instantly, finding any element in $O(\\log_2 n)$ steps.",
        "key_takeaway": "In a list of 1,000,000 items, binary search needs at most 20 comparisons!",
        "primary_terms": [
            "binary search", "binary search algorithm", "divide and conquer search",
            "o(log n)", "sorted array search", "search in sorted array", "middle element search"
        ],
        "secondary_terms": ["search space division", "logarithmic search"],
        "negative_terms": ["binary gender", "binary code", "binary numbers conversion"]
    },
    {
        "id": "gravity_orbit",
        "file": "gravity_orbit.svg",
        "title": r"Gravitational Attraction & Orbital Mechanics ($F = G \frac{Mm}{r^2}$)",
        "badge": "Astronomy • Orbital Mechanics",
        "subject": "Physics",
        "caption": "Planets stay in stable orbits because their high forward orbital velocity balances the inward gravitational pull of the Sun, resulting in a continuous circular or elliptical fall around the mass.",
        "key_takeaway": "Inverse-square law: Doubling the distance drops gravitational attraction to one-fourth.",
        "primary_terms": [
            "gravitational force", "gravity orbit", "orbital mechanics", "planetary orbit",
            "newton's law of gravitation", "universal gravitation", "inverse square law gravity",
            "satellite orbit", "gurtwakarshan"
        ],
        "secondary_terms": ["kepler's laws", "gravitational pull", "escape velocity"],
        "negative_terms": ["center of gravity", "gravity defier", "mass of an atom", "mass of a proton"]
    },
    {
        "id": "dna_double_helix",
        "file": "dna_double_helix.svg",
        "title": "DNA Double Helix: Complementary Base Pairing Structure",
        "badge": "Genetics • Molecular Biology",
        "subject": "Biology",
        "caption": "The genetic code of all living organisms is written in two intertwined strands connected by hydrogen bonds between complementary bases: Adenine pairs with Thymine (A-T), and Cytosine pairs with Guanine (C-G).",
        "key_takeaway": "Complementary pairing enables accurate DNA replication during cell division.",
        "primary_terms": [
            "dna", "dna double helix", "dna structure", "structure of dna", "double helix",
            "watson and crick", "complementary base pairing", "adenine thymine guanine cytosine",
            "dna replication", "nucleotide base pairs"
        ],
        "secondary_terms": ["hydrogen bonds dna", "genetic code structure", "chromosome dna"],
        "negative_terms": ["dna test kit", "ancestry dna test"]
    },
    {
        "id": "water_cycle",
        "file": "water_cycle.svg",
        "title": "The Global Hydrological Water Cycle",
        "badge": "Earth Science • Natural Cycle",
        "subject": "Geography / Science",
        "caption": "Solar radiation powers the continuous planetary water engine: solar heat evaporates surface water, moisture condenses into clouds, precipitation returns fresh water to rivers and soil.",
        "key_takeaway": "Water on Earth is constantly recycled; the water you drink was once rain millions of years ago!",
        "primary_terms": [
            "water cycle", "hydrological cycle", "evaporation and condensation",
            "precipitation water cycle", "water cycle diagram", "jal chakra",
            "transpiration evaporation precipitation"
        ],
        "secondary_terms": ["cloud formation", "groundwater runoff", "atmospheric moisture"],
        "negative_terms": ["water filter", "water bottle", "water bill"]
    },
    {
        "id": "atomic_structure",
        "file": "atomic_structure.svg",
        "title": "Bohr Model: Quantized Electron Energy Shells & Nucleus",
        "badge": "Atomic Physics • Bohr Model",
        "subject": "Chemistry / Physics",
        "caption": "The dense central nucleus packs positive protons and neutral neutrons, surrounded by electrons orbiting in discrete energy shells ($n=1, 2, 3$). When an electron jumps down a shell, it emits a photon packet of light.",
        "key_takeaway": r"Energy photon emitted: $\Delta E = h \nu = E_2 - E_1$.",
        "primary_terms": [
            "bohr model", "bohr's model", "atomic structure", "structure of atom",
            "electron shells", "protons neutrons electrons", "quantized energy levels",
            "parmanu sanrachna", "bohr atom"
        ],
        "secondary_terms": ["subatomic particles", "nucleus electron orbit", "energy shell n=1"],
        "negative_terms": ["atomic bomb", "atomic clock", "atomic mass unit calculation"]
    }
]

# ---------------------------------------------------------------------------
# SVG Generator Function
# Generates pristine, retina-crisp, beautiful educational SVG visual diagrams
# ---------------------------------------------------------------------------

def _write_svg_if_missing(filename: str, content: str):
    target = IMAGES_DIR / filename
    if not target.exists():
        target.write_text(content, encoding="utf-8")

def generate_all_catalog_svgs():
    """Generates all standalone educational SVGs into frontend/images/concepts/ only if missing."""
    catalog_files = [item["file"] for item in VISUAL_CATALOG if "file" in item] + ["concept_general_stem.svg"]
    if all((IMAGES_DIR / f).exists() for f in catalog_files):
        return
    
    # 1. Quadratic Parabola
    parabola_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
  <defs>
    <linearGradient id="qbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/>
      <stop offset="100%" stop-color="#141B2D"/>
    </linearGradient>
    <linearGradient id="parabolaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8B5CF6"/>
      <stop offset="50%" stop-color="#06B6D4"/>
      <stop offset="100%" stop-color="#10B981"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <!-- Background -->
  <rect width="640" height="400" rx="16" fill="url(#qbg)" stroke="#2A334A" stroke-width="1.5"/>
  <!-- Coordinate Grid -->
  <g stroke="#1F293D" stroke-width="1" stroke-dasharray="3,3">
    <line x1="60" y1="80" x2="580" y2="80"/>
    <line x1="60" y1="140" x2="580" y2="140"/>
    <line x1="60" y1="200" x2="580" y2="200"/>
    <line x1="60" y1="260" x2="580" y2="260"/>
    <line x1="60" y1="320" x2="580" y2="320"/>
    <line x1="140" y1="40" x2="140" y2="360"/>
    <line x1="220" y1="40" x2="220" y2="360"/>
    <line x1="300" y1="40" x2="300" y2="360"/>
    <line x1="380" y1="40" x2="380" y2="360"/>
    <line x1="460" y1="40" x2="460" y2="360"/>
    <line x1="540" y1="40" x2="540" y2="360"/>
  </g>
  <!-- X and Y Axes -->
  <line x1="60" y1="240" x2="580" y2="240" stroke="#64748B" stroke-width="2"/>
  <polyline points="575,235 585,240 575,245" fill="#64748B"/>
  <text x="590" y="244" fill="#94A3B8" font-family="sans-serif" font-size="12" font-weight="bold">x</text>

  <line x1="320" y1="360" x2="320" y2="40" stroke="#64748B" stroke-width="2"/>
  <polyline points="315,45 320,35 325,45" fill="#64748B"/>
  <text x="316" y="25" fill="#94A3B8" font-family="sans-serif" font-size="12" font-weight="bold">y</text>

  <!-- Axis of Symmetry (Dashed Line at x = 320) -->
  <line x1="320" y1="50" x2="320" y2="340" stroke="#A78BFA" stroke-width="1.5" stroke-dasharray="6,4"/>
  <text x="328" y="70" fill="#C4B5FD" font-family="sans-serif" font-size="11">Axis of Symmetry (x = h)</text>

  <!-- Parabola Curve (y = a(x-h)^2 + k) -->
  <path d="M 120 70 Q 320 440 520 70" fill="none" stroke="url(#parabolaGrad)" stroke-width="4.5" stroke-linecap="round" filter="url(#glow)"/>

  <!-- Roots (x-intercepts where y = 0) -->
  <circle cx="205" cy="240" r="7" fill="#06B6D4" stroke="#FFFFFF" stroke-width="2"/>
  <text x="175" y="225" fill="#67E8F9" font-family="sans-serif" font-size="12" font-weight="bold">Root 1 (x₁)</text>

  <circle cx="435" cy="240" r="7" fill="#06B6D4" stroke="#FFFFFF" stroke-width="2"/>
  <text x="445" y="225" fill="#67E8F9" font-family="sans-serif" font-size="12" font-weight="bold">Root 2 (x₂)</text>

  <!-- Vertex -->
  <circle cx="320" cy="285" r="7" fill="#F43F5E" stroke="#FFFFFF" stroke-width="2"/>
  <text x="332" y="295" fill="#FDA4AF" font-family="sans-serif" font-size="12" font-weight="bold">Vertex (h, k)</text>

  <!-- Formula Banner Badge -->
  <rect x="20" y="20" width="220" height="42" rx="10" fill="#1E1B4B" stroke="#4338CA" stroke-width="1.2"/>
  <text x="32" y="38" fill="#A5B4FC" font-family="sans-serif" font-size="10" font-weight="bold">STANDARD FORM</text>
  <text x="32" y="54" fill="#FFFFFF" font-family="sans-serif" font-size="13" font-weight="bold">y = ax² + bx + c</text>

  <!-- Discriminant Badge -->
  <rect x="420" y="20" width="200" height="42" rx="10" fill="#064E3B" stroke="#059669" stroke-width="1.2"/>
  <text x="432" y="38" fill="#6EE7B7" font-family="sans-serif" font-size="10" font-weight="bold">DISCRIMINANT (D > 0)</text>
  <text x="432" y="54" fill="#FFFFFF" font-family="sans-serif" font-size="13" font-weight="bold">Two Real Solutions</text>
</svg>"""
    _write_svg_if_missing("quadratic_parabola.svg", parabola_svg)

    # 2. Pythagorean Theorem
    pythagoras_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
  <defs>
    <linearGradient id="pythBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/>
      <stop offset="100%" stop-color="#141B2D"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="16" fill="url(#pythBg)" stroke="#2A334A" stroke-width="1.5"/>

  <!-- Right Triangle: vertices (220, 260), (380, 260), (220, 140) -->
  <!-- Side b = 160 (horizontal), Side a = 120 (vertical), Side c = 200 (hypotenuse) -->
  
  <!-- Square on Side a (Left, 120x120) -->
  <rect x="100" y="140" width="120" height="120" fill="rgba(139, 92, 246, 0.25)" stroke="#8B5CF6" stroke-width="2"/>
  <text x="135" y="195" fill="#DDD6FE" font-family="sans-serif" font-size="16" font-weight="bold">a² = 9</text>
  <text x="140" y="215" fill="#A78BFA" font-family="sans-serif" font-size="11">(side a = 3)</text>

  <!-- Square on Side b (Bottom, 160x160) -->
  <rect x="220" y="260" width="160" height="110" fill="rgba(6, 182, 212, 0.25)" stroke="#06B6D4" stroke-width="2"/>
  <text x="275" y="315" fill="#CFFAFE" font-family="sans-serif" font-size="16" font-weight="bold">b² = 16</text>
  <text x="280" y="335" fill="#67E8F9" font-family="sans-serif" font-size="11">(side b = 4)</text>

  <!-- Central Right Triangle -->
  <polygon points="220,260 380,260 220,140" fill="rgba(255, 255, 255, 0.08)" stroke="#FFFFFF" stroke-width="3"/>

  <!-- 90 degree right angle symbol -->
  <path d="M 220,240 L 240,240 L 240,260" fill="none" stroke="#F59E0B" stroke-width="2"/>
  <circle cx="228" cy="252" r="2.5" fill="#F59E0B"/>

  <!-- Square on Hypotenuse (Tilted c^2 = 25) -->
  <polygon points="220,140 380,260 460,153 300,33" fill="rgba(16, 185, 129, 0.25)" stroke="#10B981" stroke-width="2.5"/>
  <text x="330" y="145" fill="#D1FAE5" font-family="sans-serif" font-size="18" font-weight="bold">c² = 25</text>
  <text x="335" y="165" fill="#6EE7B7" font-family="sans-serif" font-size="12">(Hypotenuse c = 5)</text>

  <!-- Banner / Equation -->
  <rect x="20" y="20" width="220" height="60" rx="10" fill="#1E1B4B" stroke="#4338CA" stroke-width="1.2"/>
  <text x="32" y="42" fill="#A5B4FC" font-family="sans-serif" font-size="11" font-weight="bold">PYTHAGORAS THEOREM</text>
  <text x="32" y="65" fill="#38BDF8" font-family="sans-serif" font-size="18" font-weight="bold">a² + b² = c²</text>
  <text x="135" y="65" fill="#34D399" font-family="sans-serif" font-size="14" font-weight="bold">(9 + 16 = 25)</text>
</svg>"""
    _write_svg_if_missing("pythagorean_theorem.svg", pythagoras_svg)

    # 3. Newton's Second Law
    newton_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
  <defs>
    <linearGradient id="nBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/>
      <stop offset="100%" stop-color="#141B2D"/>
    </linearGradient>
    <linearGradient id="blockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="16" fill="url(#nBg)" stroke="#2A334A" stroke-width="1.5"/>

  <!-- Surface line -->
  <line x1="60" y1="280" x2="580" y2="280" stroke="#64748B" stroke-width="3"/>
  <g stroke="#334155" stroke-width="1.5">
    <line x1="80" y1="280" x2="60" y2="300"/>
    <line x1="140" y1="280" x2="120" y2="300"/>
    <line x1="200" y1="280" x2="180" y2="300"/>
    <line x1="260" y1="280" x2="240" y2="300"/>
    <line x1="320" y1="280" x2="300" y2="300"/>
    <line x1="380" y1="280" x2="360" y2="300"/>
    <line x1="440" y1="280" x2="420" y2="300"/>
    <line x1="500" y1="280" x2="480" y2="300"/>
    <line x1="560" y1="280" x2="540" y2="300"/>
  </g>

  <!-- Mass Block (m) -->
  <rect x="230" y="170" width="140" height="110" rx="12" fill="url(#blockGrad)" stroke="#A78BFA" stroke-width="2"/>
  <text x="282" y="225" fill="#FFFFFF" font-family="sans-serif" font-size="28" font-weight="bold">m</text>
  <text x="268" y="250" fill="#DDD6FE" font-family="sans-serif" font-size="12">Mass Block</text>

  <!-- Applied Force Vector F (Arrow pointing right) -->
  <line x1="370" y1="225" x2="520" y2="225" stroke="#06B6D4" stroke-width="6" stroke-linecap="round"/>
  <polygon points="515,213 540,225 515,237" fill="#06B6D4"/>
  <text x="410" y="205" fill="#67E8F9" font-family="sans-serif" font-size="16" font-weight="bold">Force (F)</text>

  <!-- Acceleration Vector a (Arrow pointing right above) -->
  <line x1="250" y1="120" x2="350" y2="120" stroke="#10B981" stroke-width="4" stroke-linecap="round"/>
  <polygon points="345,112 365,120 345,128" fill="#10B981"/>
  <text x="270" y="105" fill="#6EE7B7" font-family="sans-serif" font-size="14" font-weight="bold">Acceleration (a →)</text>

  <!-- Opposing Friction Force Vector (Arrow pointing left) -->
  <line x1="230" y1="280" x2="130" y2="280" stroke="#F43F5E" stroke-width="4" stroke-linecap="round"/>
  <polygon points="135,273 115,280 135,287" fill="#F43F5E"/>
  <text x="120" y="265" fill="#FDA4AF" font-family="sans-serif" font-size="12" font-weight="bold">Friction (f)</text>

  <!-- Top Banner Equation -->
  <rect x="30" y="20" width="220" height="60" rx="10" fill="#1E1B4B" stroke="#4338CA" stroke-width="1.2"/>
  <text x="42" y="42" fill="#A5B4FC" font-family="sans-serif" font-size="11" font-weight="bold">NEWTON'S 2ND LAW</text>
  <text x="42" y="65" fill="#38BDF8" font-family="sans-serif" font-size="20" font-weight="bold">F = m · a</text>

  <!-- Practical insight note -->
  <rect x="30" y="325" width="580" height="50" rx="10" fill="rgba(15, 23, 42, 0.8)" stroke="#334155" stroke-width="1"/>
  <text x="45" y="346" fill="#38BDF8" font-family="sans-serif" font-size="12" font-weight="bold">Cricket Ball Example:</text>
  <text x="180" y="346" fill="#CBD5E1" font-family="sans-serif" font-size="12">Pulling hands back increases impact time (Δt), lowering peak impact force (F = Δp / Δt).</text>
  <text x="45" y="364" fill="#94A3B8" font-family="sans-serif" font-size="11">Result: Safe, painless catch with zero rebound.</text>
</svg>"""
    _write_svg_if_missing("newton_second_law.svg", newton_svg)

    # 4. Photosynthesis
    photosynthesis_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
  <defs>
    <linearGradient id="photoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#061A14"/>
      <stop offset="100%" stop-color="#0B2E23"/>
    </linearGradient>
    <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="16" fill="url(#photoBg)" stroke="#10B981" stroke-width="1.5"/>

  <!-- Sun -->
  <circle cx="90" cy="80" r="45" fill="url(#sunGrad)" opacity="0.95"/>
  <g stroke="#F59E0B" stroke-width="2.5">
    <line x1="90" y1="20" x2="90" y2="5"/>
    <line x1="140" y1="40" x2="155" y2="28"/>
    <line x1="150" y1="80" x2="165" y2="80"/>
    <line x1="140" y1="120" x2="155" y2="132"/>
    <line x1="90" y1="140" x2="90" y2="155"/>
  </g>
  <text x="65" y="85" fill="#78350F" font-family="sans-serif" font-size="13" font-weight="bold">Sunlight</text>

  <!-- Photon Ray Arrows hitting leaf -->
  <line x1="145" y1="110" x2="230" y2="180" stroke="#FBBF24" stroke-width="3" stroke-dasharray="5,3"/>
  <polygon points="225,170 240,185 220,185" fill="#FBBF24"/>

  <!-- Plant Leaf (Centered) -->
  <path d="M 230 250 C 230 140, 390 140, 430 250 C 430 340, 230 340, 230 250 Z" fill="url(#leafGrad)" stroke="#10B981" stroke-width="2.5"/>
  <path d="M 230 250 Q 330 240 430 250" stroke="#064E3B" stroke-width="2.5" fill="none"/>

  <!-- Incoming Ingredients -->
  <!-- 1. Carbon Dioxide (CO2) -->
  <rect x="70" y="210" width="110" height="38" rx="8" fill="rgba(6, 182, 212, 0.2)" stroke="#06B6D4" stroke-width="1.5"/>
  <text x="82" y="234" fill="#67E8F9" font-family="sans-serif" font-size="14" font-weight="bold">6 CO₂ (Air)</text>
  <line x1="180" y1="230" x2="230" y2="245" stroke="#06B6D4" stroke-width="2.5"/>

  <!-- 2. Water (H2O from Roots) -->
  <rect x="70" y="290" width="110" height="38" rx="8" fill="rgba(59, 130, 246, 0.2)" stroke="#3B82F6" stroke-width="1.5"/>
  <text x="78" y="314" fill="#93C5FD" font-family="sans-serif" font-size="14" font-weight="bold">6 H₂O (Roots)</text>
  <line x1="180" y1="305" x2="250" y2="280" stroke="#3B82F6" stroke-width="2.5"/>

  <!-- Output Products -->
  <!-- 1. Glucose (Energy Sugar) -->
  <rect x="470" y="200" width="140" height="42" rx="8" fill="rgba(245, 158, 11, 0.2)" stroke="#F59E0B" stroke-width="1.5"/>
  <text x="480" y="226" fill="#FCD34D" font-family="sans-serif" font-size="14" font-weight="bold">C₆H₁₂O₆ (Sugar)</text>
  <line x1="420" y1="240" x2="470" y2="225" stroke="#F59E0B" stroke-width="2.5"/>

  <!-- 2. Oxygen (O2) Released -->
  <rect x="470" y="280" width="140" height="42" rx="8" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" stroke-width="1.5"/>
  <text x="480" y="306" fill="#6EE7B7" font-family="sans-serif" font-size="14" font-weight="bold">6 O₂ (Oxygen!)</text>
  <line x1="420" y1="265" x2="470" y2="295" stroke="#10B981" stroke-width="2.5"/>

  <!-- Top Equation Banner -->
  <rect x="250" y="25" width="360" height="50" rx="10" fill="rgba(0, 0, 0, 0.6)" stroke="#059669" stroke-width="1.5"/>
  <text x="265" y="47" fill="#6EE7B7" font-family="sans-serif" font-size="11" font-weight="bold">BALANCED CHEMICAL REACTION</text>
  <text x="265" y="65" fill="#FFFFFF" font-family="sans-serif" font-size="13" font-weight="bold">6CO₂ + 6H₂O + Sunlight ➔ C₆H₁₂O₆ + 6O₂</text>
</svg>"""
    _write_svg_if_missing("photosynthesis.svg", photosynthesis_svg)

    # 5. Cell Structure
    cell_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
  <defs>
    <linearGradient id="cellBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/>
      <stop offset="100%" stop-color="#141B2D"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="16" fill="url(#cellBg)" stroke="#2A334A" stroke-width="1.5"/>

  <!-- Cell Membrane / Cytoplasm -->
  <ellipse cx="320" cy="200" rx="240" ry="150" fill="rgba(56, 189, 248, 0.12)" stroke="#38BDF8" stroke-width="3"/>
  
  <!-- Nucleus -->
  <ellipse cx="280" cy="190" rx="60" ry="50" fill="rgba(168, 85, 247, 0.4)" stroke="#A855F7" stroke-width="2.5"/>
  <circle cx="270" cy="185" r="20" fill="#7E22CE"/>
  <text x="245" y="190" fill="#FFFFFF" font-family="sans-serif" font-size="10" font-weight="bold">DNA</text>

  <!-- Mitochondria 1 -->
  <ellipse cx="430" cy="140" rx="35" ry="20" fill="#F43F5E" stroke="#FDA4AF" stroke-width="1.5" transform="rotate(-20 430 140)"/>
  <path d="M 405 140 Q 430 130 455 140" stroke="#FFFFFF" stroke-width="1.5" fill="none"/>
  
  <!-- Mitochondria 2 -->
  <ellipse cx="200" cy="260" rx="35" ry="20" fill="#F43F5E" stroke="#FDA4AF" stroke-width="1.5" transform="rotate(30 200 260)"/>
  
  <!-- Ribosomes (Dots) -->
  <g fill="#FBBF24">
    <circle cx="170" cy="160" r="3"/>
    <circle cx="180" cy="180" r="3"/>
    <circle cx="380" cy="260" r="3"/>
    <circle cx="410" cy="230" r="3"/>
    <circle cx="360" cy="110" r="3"/>
  </g>

  <!-- Labels -->
  <!-- Nucleus Label -->
  <line x1="280" y1="140" x2="280" y2="80" stroke="#C084FC" stroke-width="1.5"/>
  <rect x="220" y="45" width="120" height="32" rx="6" fill="#581C87" stroke="#A855F7"/>
  <text x="232" y="66" fill="#F3E8FF" font-family="sans-serif" font-size="12" font-weight="bold">Nucleus (DNA)</text>

  <!-- Mitochondria Label -->
  <line x1="450" y1="130" x2="520" y2="90" stroke="#FB7185" stroke-width="1.5"/>
  <rect x="470" y="60" width="150" height="32" rx="6" fill="#881337" stroke="#F43F5E"/>
  <text x="478" y="81" fill="#FFE4E6" font-family="sans-serif" font-size="11" font-weight="bold">Mitochondria (ATP Power)</text>

  <!-- Cell Membrane Label -->
  <line x1="530" y1="260" x2="560" y2="300" stroke="#38BDF8" stroke-width="1.5"/>
  <rect x="470" y="300" width="150" height="32" rx="6" fill="#0C4A6E" stroke="#0284C7"/>
  <text x="480" y="321" fill="#E0F2FE" font-family="sans-serif" font-size="11" font-weight="bold">Cell Membrane</text>

  <!-- Ribosomes Label -->
  <line x1="175" y1="170" x2="100" y2="200" stroke="#FBBF24" stroke-width="1.5"/>
  <rect x="20" y="190" width="140" height="32" rx="6" fill="#78350F" stroke="#F59E0B"/>
  <text x="32" y="211" fill="#FEF3C7" font-family="sans-serif" font-size="11" font-weight="bold">Ribosomes (Proteins)</text>

  <!-- Heading -->
  <text x="25" y="35" fill="#38BDF8" font-family="sans-serif" font-size="14" font-weight="bold">BIOLOGY • CELL ARCHITECTURE</text>
</svg>"""
    _write_svg_if_missing("cell_structure.svg", cell_svg)

    # 6. Trigonometry Unit Circle
    trig_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
  <defs>
    <linearGradient id="trigBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/>
      <stop offset="100%" stop-color="#141B2D"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="16" fill="url(#trigBg)" stroke="#2A334A" stroke-width="1.5"/>
  
  <!-- Left Side: Unit Circle -->
  <g transform="translate(180, 200)">
    <!-- Axes -->
    <line x1="-130" y1="0" x2="130" y2="0" stroke="#64748B" stroke-width="1.5"/>
    <line x1="0" y1="-130" x2="0" y2="130" stroke="#64748B" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="100" fill="none" stroke="#8B5CF6" stroke-width="2.5"/>

    <!-- Angle theta = 36 deg -->
    <!-- cos(36) ~ 81, sin(36) ~ 59 -->
    <polygon points="0,0 81,0 81,-59" fill="rgba(6, 182, 212, 0.2)" stroke="none"/>
    <line x1="0" y1="0" x2="81" y2="0" stroke="#06B6D4" stroke-width="3"/>
    <line x1="81" y1="0" x2="81" y2="-59" stroke="#10B981" stroke-width="3"/>
    <line x1="0" y1="0" x2="81" y2="-59" stroke="#F59E0B" stroke-width="3"/>

    <circle cx="81" cy="-59" r="5" fill="#FFFFFF"/>
    <text x="88" y="-65" fill="#FFFFFF" font-family="sans-serif" font-size="11" font-weight="bold">(cos θ, sin θ)</text>
    <text x="35" y="16" fill="#06B6D4" font-family="sans-serif" font-size="11" font-weight="bold">cos θ</text>
    <text x="88" y="-25" fill="#10B981" font-family="sans-serif" font-size="11" font-weight="bold">sin θ</text>
    <text x="30" y="-35" fill="#F59E0B" font-family="sans-serif" font-size="11" font-weight="bold">r = 1</text>
  </g>

  <!-- Right Side: Sine Wave -->
  <g transform="translate(360, 200)">
    <line x1="0" y1="0" x2="240" y2="0" stroke="#64748B" stroke-width="1.5"/>
    <path d="M 0 0 Q 30 -60 60 0 T 120 0 T 180 0 T 240 0" fill="none" stroke="#10B981" stroke-width="3.5"/>
    <text x="20" y="-70" fill="#6EE7B7" font-family="sans-serif" font-size="12" font-weight="bold">y = sin(x) wave</text>
  </g>

  <!-- Banner -->
  <rect x="25" y="25" width="280" height="42" rx="8" fill="#1E1B4B" stroke="#4338CA"/>
  <text x="38" y="51" fill="#C4B5FD" font-family="sans-serif" font-size="14" font-weight="bold">sin²(θ) + cos²(θ) = 1</text>
</svg>"""
    _write_svg_if_missing("trigonometry_unit_circle.svg", trig_svg)

    # 7. Calculus Derivative
    calc_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
  <defs>
    <linearGradient id="cBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/>
      <stop offset="100%" stop-color="#141B2D"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="16" fill="url(#cBg)" stroke="#2A334A" stroke-width="1.5"/>
  <!-- Axes -->
  <line x1="60" y1="340" x2="580" y2="340" stroke="#64748B" stroke-width="2"/>
  <line x1="100" y1="340" x2="100" y2="60" stroke="#64748B" stroke-width="2"/>
  <!-- Function Curve f(x) -->
  <path d="M 120 310 Q 280 280 400 160 T 560 60" fill="none" stroke="#8B5CF6" stroke-width="4"/>
  <text x="510" y="80" fill="#A78BFA" font-family="sans-serif" font-size="14" font-weight="bold">y = f(x)</text>

  <!-- Point P -->
  <circle cx="340" cy="210" r="6" fill="#F43F5E"/>
  <text x="345" y="235" fill="#FDA4AF" font-family="sans-serif" font-size="12" font-weight="bold">Point P(x, f(x))</text>

  <!-- Tangent Line -->
  <line x1="200" y1="320" x2="480" y2="100" stroke="#06B6D4" stroke-width="3"/>
  <text x="440" y="125" fill="#67E8F9" font-family="sans-serif" font-size="13" font-weight="bold">Tangent (Slope = f'(x))</text>

  <!-- Formula Box -->
  <rect x="130" y="25" width="380" height="50" rx="10" fill="#0C4A6E" stroke="#0284C7"/>
  <text x="145" y="55" fill="#E0F2FE" font-family="sans-serif" font-size="15" font-weight="bold">f'(x) = lim [f(x+Δx) - f(x)] / Δx as Δx ➔ 0</text>
</svg>"""
    _write_svg_if_missing("calculus_derivative.svg", calc_svg)

    # 8. Chemical Bonding (Ionic vs Covalent)
    bonding_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bondBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/><stop offset="100%" stop-color="#141B2D"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="16" fill="url(#bondBg)" stroke="#2A334A" stroke-width="1.5"/>
  <!-- Ionic Side -->
  <rect x="30" y="80" width="270" height="280" rx="12" fill="rgba(244, 63, 94, 0.1)" stroke="#F43F5E" stroke-width="1.5"/>
  <text x="50" y="115" fill="#FDA4AF" font-family="sans-serif" font-size="16" font-weight="bold">1. IONIC BOND (Transfer)</text>
  <circle cx="100" cy="200" r="35" fill="#E11D48"/>
  <text x="88" y="206" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="bold">Na⁺</text>
  <line x1="140" y1="200" x2="200" y2="200" stroke="#FBBF24" stroke-width="3" stroke-dasharray="4,3"/>
  <circle cx="170" cy="190" r="5" fill="#FBBF24"/>
  <text x="145" y="180" fill="#FDE68A" font-family="sans-serif" font-size="10">e⁻ transfer</text>
  <circle cx="230" cy="200" r="42" fill="#0284C7"/>
  <text x="218" y="206" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="bold">Cl⁻</text>
  <text x="50" y="300" fill="#CBD5E1" font-family="sans-serif" font-size="12">Electrostatic attraction</text>
  <text x="50" y="325" fill="#94A3B8" font-family="sans-serif" font-size="11">e.g. Table Salt (NaCl)</text>

  <!-- Covalent Side -->
  <rect x="340" y="80" width="270" height="280" rx="12" fill="rgba(6, 182, 212, 0.1)" stroke="#06B6D4" stroke-width="1.5"/>
  <text x="360" y="115" fill="#67E8F9" font-family="sans-serif" font-size="16" font-weight="bold">2. COVALENT BOND (Sharing)</text>
  <circle cx="430" cy="200" r="36" fill="rgba(139, 92, 246, 0.4)" stroke="#8B5CF6" stroke-width="2"/>
  <circle cx="510" cy="200" r="36" fill="rgba(16, 185, 129, 0.4)" stroke="#10B981" stroke-width="2"/>
  <ellipse cx="470" cy="200" rx="18" ry="28" fill="rgba(6, 182, 212, 0.5)"/>
  <circle cx="465" cy="190" r="4" fill="#FFFFFF"/>
  <circle cx="475" cy="210" r="4" fill="#FFFFFF"/>
  <text x="445" y="160" fill="#A5F3FC" font-family="sans-serif" font-size="10">Shared Pair</text>
  <text x="420" y="205" fill="#EDE9FE" font-family="sans-serif" font-size="13" font-weight="bold">H</text>
  <text x="500" y="205" fill="#D1FAE5" font-family="sans-serif" font-size="13" font-weight="bold">H</text>
  <text x="360" y="300" fill="#CBD5E1" font-family="sans-serif" font-size="12">Shared electron cloud</text>
  <text x="360" y="325" fill="#94A3B8" font-family="sans-serif" font-size="11">e.g. Water (H₂O), Methane (CH₄)</text>

  <!-- Title -->
  <text x="30" y="45" fill="#FFFFFF" font-family="sans-serif" font-size="16" font-weight="bold">CHEMISTRY • CHEMICAL BONDING TYPES</text>
</svg>"""
    _write_svg_if_missing("chemical_bonding.svg", bonding_svg)

    # 9. Electric Circuit (Ohm's Law)
    circuit_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
  <defs>
    <linearGradient id="circBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/><stop offset="100%" stop-color="#141B2D"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="16" fill="url(#circBg)" stroke="#2A334A" stroke-width="1.5"/>
  <!-- Circuit Wires -->
  <rect x="120" y="100" width="400" height="200" fill="none" stroke="#64748B" stroke-width="3.5" rx="8"/>
  <!-- Battery on Left -->
  <rect x="100" y="170" width="40" height="60" fill="#0F172A" stroke="none"/>
  <line x1="100" y1="185" x2="140" y2="185" stroke="#38BDF8" stroke-width="4"/>
  <line x1="110" y1="215" x2="130" y2="215" stroke="#F43F5E" stroke-width="4"/>
  <text x="65" y="190" fill="#38BDF8" font-family="sans-serif" font-size="14" font-weight="bold">+ V</text>
  <text x="75" y="220" fill="#F43F5E" font-family="sans-serif" font-size="14" font-weight="bold">-</text>

  <!-- Resistor on Top -->
  <rect x="270" y="90" width="100" height="20" fill="#0F172A"/>
  <path d="M 270 100 L 285 85 L 300 115 L 315 85 L 330 115 L 345 85 L 360 115 L 370 100" fill="none" stroke="#F59E0B" stroke-width="3"/>
  <text x="290" y="70" fill="#FCD34D" font-family="sans-serif" font-size="14" font-weight="bold">Resistor (R)</text>

  <!-- Current Arrow on Bottom -->
  <line x1="380" y1="300" x2="260" y2="300" stroke="#10B981" stroke-width="4" stroke-linecap="round"/>
  <polygon points="270,292 250,300 270,308" fill="#10B981"/>
  <text x="280" y="335" fill="#6EE7B7" font-family="sans-serif" font-size="14" font-weight="bold">Current Flow (I ➔)</text>

  <!-- Ohm's Law Triangle Banner -->
  <rect x="420" y="25" width="190" height="60" rx="10" fill="#1E1B4B" stroke="#4338CA"/>
  <text x="435" y="48" fill="#A5B4FC" font-family="sans-serif" font-size="11" font-weight="bold">OHM'S LAW FORMULA</text>
  <text x="435" y="70" fill="#38BDF8" font-family="sans-serif" font-size="18" font-weight="bold">V = I · R</text>
</svg>"""
    _write_svg_if_missing("electric_circuit_ohms_law.svg", circuit_svg)

    # 10. Optics Refraction
    refraction_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
  <defs>
    <linearGradient id="optBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/><stop offset="100%" stop-color="#141B2D"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="16" fill="url(#optBg)" stroke="#2A334A" stroke-width="1.5"/>
  <!-- Lower Medium (Water/Glass, n2 = 1.5) -->
  <rect x="0" y="200" width="640" height="200" fill="rgba(6, 182, 212, 0.15)"/>
  <line x1="0" y1="200" x2="640" y2="200" stroke="#38BDF8" stroke-width="2"/>
  <text x="30" y="180" fill="#94A3B8" font-family="sans-serif" font-size="13" font-weight="bold">Medium 1: Air (n₁ = 1.0)</text>
  <text x="30" y="235" fill="#38BDF8" font-family="sans-serif" font-size="13" font-weight="bold">Medium 2: Water / Glass (n₂ = 1.5)</text>

  <!-- Normal Line -->
  <line x1="320" y1="40" x2="320" y2="360" stroke="#A78BFA" stroke-width="1.5" stroke-dasharray="6,4"/>
  <text x="328" y="70" fill="#C4B5FD" font-family="sans-serif" font-size="11">Normal Line</text>

  <!-- Incident Ray (θ1 = 45 deg) -->
  <line x1="160" y1="40" x2="320" y2="200" stroke="#F59E0B" stroke-width="4"/>
  <polygon points="245,115 255,128 238,125" fill="#F59E0B"/>
  <text x="210" y="110" fill="#FCD34D" font-family="sans-serif" font-size="12" font-weight="bold">Incident Ray (θ₁)</text>

  <!-- Refracted Ray (Bends toward normal, θ2 ~ 28 deg) -->
  <line x1="320" y1="200" x2="420" y2="360" stroke="#10B981" stroke-width="4"/>
  <polygon points="365,275 375,288 358,285" fill="#10B981"/>
  <text x="380" y="290" fill="#6EE7B7" font-family="sans-serif" font-size="12" font-weight="bold">Refracted Ray (θ₂ &lt; θ₁)</text>

  <!-- Snell's Law Banner -->
  <rect x="390" y="25" width="220" height="55" rx="10" fill="#064E3B" stroke="#059669"/>
  <text x="405" y="47" fill="#6EE7B7" font-family="sans-serif" font-size="10" font-weight="bold">SNELL'S LAW OF REFRACTION</text>
  <text x="405" y="67" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="bold">n₁ sin(θ₁) = n₂ sin(θ₂)</text>
</svg>"""
    _write_svg_if_missing("optics_refraction.svg", refraction_svg)

    # 11. Binary Search
    bin_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
  <defs>
    <linearGradient id="binBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/><stop offset="100%" stop-color="#141B2D"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="16" fill="url(#binBg)" stroke="#2A334A" stroke-width="1.5"/>
  <text x="30" y="45" fill="#38BDF8" font-family="sans-serif" font-size="15" font-weight="bold">BINARY SEARCH • O(log₂ n) HALVING</text>

  <!-- Array of sorted items: [2, 5, 8, 12, 16, 23, 38, 45, 56] -->
  <g transform="translate(45, 120)">
    <!-- 9 boxes -->
    <!-- Indices: 0, 1, 2, 3, 4, 5, 6, 7, 8 -->
    <!-- Values: 2, 5, 8, 12, 16, 23, 38, 45, 56 -->
    <!-- Low=0, Mid=4(16), High=8. Target=23 > 16 -> Discard Left! -->
    <rect x="0" y="0" width="60" height="60" rx="8" fill="rgba(244, 63, 94, 0.15)" stroke="#F43F5E"/>
    <text x="25" y="38" fill="#FDA4AF" font-family="sans-serif" font-size="18" font-weight="bold">2</text>
    <rect x="62" y="0" width="60" height="60" rx="8" fill="rgba(244, 63, 94, 0.15)" stroke="#F43F5E"/>
    <text x="87" y="38" fill="#FDA4AF" font-family="sans-serif" font-size="18" font-weight="bold">5</text>
    <rect x="124" y="0" width="60" height="60" rx="8" fill="rgba(244, 63, 94, 0.15)" stroke="#F43F5E"/>
    <text x="149" y="38" fill="#FDA4AF" font-family="sans-serif" font-size="18" font-weight="bold">8</text>
    <rect x="186" y="0" width="60" height="60" rx="8" fill="rgba(244, 63, 94, 0.15)" stroke="#F43F5E"/>
    <text x="205" y="38" fill="#FDA4AF" font-family="sans-serif" font-size="18" font-weight="bold">12</text>

    <!-- Mid = 16 -->
    <rect x="248" y="0" width="60" height="60" rx="8" fill="#8B5CF6" stroke="#C4B5FD" stroke-width="2"/>
    <text x="267" y="38" fill="#FFFFFF" font-family="sans-serif" font-size="18" font-weight="bold">16</text>
    <text x="257" y="85" fill="#A78BFA" font-family="sans-serif" font-size="12" font-weight="bold">MID (16)</text>

    <!-- Target Match = 23 -->
    <rect x="310" y="0" width="60" height="60" rx="8" fill="#10B981" stroke="#6EE7B7" stroke-width="2.5"/>
    <text x="329" y="38" fill="#FFFFFF" font-family="sans-serif" font-size="18" font-weight="bold">23</text>
    <text x="310" y="85" fill="#34D399" font-family="sans-serif" font-size="12" font-weight="bold">TARGET ✓</text>

    <rect x="372" y="0" width="60" height="60" rx="8" fill="rgba(255, 255, 255, 0.05)" stroke="#475569"/>
    <text x="391" y="38" fill="#94A3B8" font-family="sans-serif" font-size="18" font-weight="bold">38</text>
    <rect x="434" y="0" width="60" height="60" rx="8" fill="rgba(255, 255, 255, 0.05)" stroke="#475569"/>
    <text x="453" y="38" fill="#94A3B8" font-family="sans-serif" font-size="18" font-weight="bold">45</text>
    <rect x="496" y="0" width="60" height="60" rx="8" fill="rgba(255, 255, 255, 0.05)" stroke="#475569"/>
    <text x="515" y="38" fill="#94A3B8" font-family="sans-serif" font-size="18" font-weight="bold">56</text>
  </g>

  <!-- Explanation Footer -->
  <rect x="40" y="260" width="560" height="100" rx="12" fill="rgba(15, 23, 42, 0.8)" stroke="#334155"/>
  <text x="60" y="290" fill="#38BDF8" font-family="sans-serif" font-size="13" font-weight="bold">Step 1: Check Midpoint (16)</text>
  <text x="60" y="312" fill="#CBD5E1" font-family="sans-serif" font-size="12">Target (23) > Mid (16) ➔ Discard entire left half in 1 comparison!</text>
  <text x="60" y="334" fill="#34D399" font-family="sans-serif" font-size="12">Result: Search space reduced by 50% each step. Time Complexity: O(log n).</text>
</svg>"""
    _write_svg_if_missing("binary_search.svg", bin_svg)

    # 12. Gravity & Planetary Orbit
    grav_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
  <defs>
    <linearGradient id="gBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#05070D"/><stop offset="100%" stop-color="#0C1324"/>
    </linearGradient>
    <radialGradient id="sunRad">
      <stop offset="0%" stop-color="#FDE047"/><stop offset="70%" stop-color="#F59E0B"/><stop offset="100%" stop-color="#B45309"/>
    </radialGradient>
  </defs>
  <rect width="640" height="400" rx="16" fill="url(#gBg)" stroke="#2A334A" stroke-width="1.5"/>
  <!-- Central Sun (Mass M) -->
  <circle cx="280" cy="200" r="50" fill="url(#sunRad)"/>
  <text x="255" y="205" fill="#78350F" font-family="sans-serif" font-size="16" font-weight="bold">Mass M</text>

  <!-- Elliptical Orbit Track -->
  <ellipse cx="280" cy="200" rx="200" ry="120" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="6,4"/>

  <!-- Orbiting Planet (Mass m) at (450, 150) -->
  <circle cx="450" cy="150" r="16" fill="#06B6D4" stroke="#FFFFFF" stroke-width="2"/>
  <text x="475" y="155" fill="#67E8F9" font-family="sans-serif" font-size="13" font-weight="bold">Planet (m)</text>

  <!-- Gravitational Force Vector Fg pointing toward Sun -->
  <line x1="450" y1="150" x2="350" y2="179" stroke="#F43F5E" stroke-width="3.5" stroke-linecap="round"/>
  <polygon points="355,172 340,182 357,185" fill="#F43F5E"/>
  <text x="390" y="195" fill="#FDA4AF" font-family="sans-serif" font-size="11" font-weight="bold">Fg (Inward Pull)</text>

  <!-- Velocity Vector v Tangential to Orbit -->
  <line x1="450" y1="150" x2="490" y2="90" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>
  <polygon points="480,95 495,83 493,99" fill="#10B981"/>
  <text x="498" y="115" fill="#6EE7B7" font-family="sans-serif" font-size="11" font-weight="bold">Velocity (v)</text>

  <!-- Formula Banner -->
  <rect x="30" y="25" width="240" height="55" rx="10" fill="#1E1B4B" stroke="#4338CA"/>
  <text x="45" y="48" fill="#A5B4FC" font-family="sans-serif" font-size="10" font-weight="bold">NEWTON'S GRAVITATIONAL LAW</text>
  <text x="45" y="68" fill="#38BDF8" font-family="sans-serif" font-size="16" font-weight="bold">F = G · (M · m) / r²</text>
</svg>"""
    _write_svg_if_missing("gravity_orbit.svg", grav_svg)

    # 13. DNA Double Helix
    dna_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
  <defs>
    <linearGradient id="dnaBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/><stop offset="100%" stop-color="#141B2D"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="16" fill="url(#dnaBg)" stroke="#2A334A" stroke-width="1.5"/>
  <text x="30" y="45" fill="#A78BFA" font-family="sans-serif" font-size="16" font-weight="bold">GENETICS • DNA DOUBLE HELIX STRUCTURE</text>

  <!-- DNA Horizontal Strands -->
  <g transform="translate(60, 180)">
    <!-- Base pair ladder rungs -->
    <g stroke-width="4">
      <line x1="40" y1="-50" x2="40" y2="50" stroke="#EF4444"/>
      <line x1="80" y1="-30" x2="80" y2="30" stroke="#3B82F6"/>
      <line x1="120" y1="0" x2="120" y2="0" stroke="#10B981"/>
      <line x1="160" y1="-30" x2="160" y2="30" stroke="#F59E0B"/>
      <line x1="200" y1="-50" x2="200" y2="50" stroke="#EF4444"/>
      <line x1="240" y1="-30" x2="240" y2="30" stroke="#3B82F6"/>
      <line x1="280" y1="0" x2="280" y2="0" stroke="#10B981"/>
      <line x1="320" y1="-30" x2="320" y2="30" stroke="#F59E0B"/>
      <line x1="360" y1="-50" x2="360" y2="50" stroke="#EF4444"/>
      <line x1="400" y1="-30" x2="400" y2="30" stroke="#3B82F6"/>
      <line x1="440" y1="0" x2="440" y2="0" stroke="#10B981"/>
      <line x1="480" y1="-30" x2="480" y2="30" stroke="#F59E0B"/>
    </g>
    <!-- Two intertwining sin curves -->
    <path d="M 20 -60 Q 120 70 220 -60 T 420 -60 T 520 60" fill="none" stroke="#8B5CF6" stroke-width="5"/>
    <path d="M 20 60 Q 120 -70 220 60 T 420 60 T 520 -60" fill="none" stroke="#06B6D4" stroke-width="5"/>
  </g>

  <!-- Legend -->
  <rect x="50" y="310" width="540" height="55" rx="10" fill="rgba(15, 23, 42, 0.8)" stroke="#334155"/>
  <circle cx="90" cy="337" r="6" fill="#EF4444"/><text x="105" y="342" fill="#FCA5A5" font-family="sans-serif" font-size="12">Adenine (A)</text>
  <circle cx="210" cy="337" r="6" fill="#3B82F6"/><text x="225" y="342" fill="#93C5FD" font-family="sans-serif" font-size="12">Thymine (T)</text>
  <circle cx="330" cy="337" r="6" fill="#10B981"/><text x="345" y="342" fill="#6EE7B7" font-family="sans-serif" font-size="12">Guanine (G)</text>
  <circle cx="450" cy="337" r="6" fill="#F59E0B"/><text x="465" y="342" fill="#FCD34D" font-family="sans-serif" font-size="12">Cytosine (C)</text>
</svg>"""
    _write_svg_if_missing("dna_double_helix.svg", dna_svg)

    # 14. Water Cycle
    water_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
  <defs>
    <linearGradient id="wBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#082F49"/><stop offset="70%" stop-color="#0284C7"/><stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="16" fill="url(#wBg)" stroke="#0284C7" stroke-width="1.5"/>
  <!-- Sun -->
  <circle cx="90" cy="80" r="40" fill="#F59E0B"/>
  <text x="65" y="85" fill="#78350F" font-family="sans-serif" font-size="12" font-weight="bold">Sun Energy</text>

  <!-- Clouds (Condensation) -->
  <ellipse cx="340" cy="90" rx="60" ry="25" fill="#FFFFFF" opacity="0.9"/>
  <ellipse cx="380" cy="80" rx="45" ry="30" fill="#FFFFFF" opacity="0.95"/>
  <text x="325" y="95" fill="#0F172A" font-family="sans-serif" font-size="12" font-weight="bold">Condensation</text>

  <!-- Evaporation Arrow Up -->
  <line x1="160" y1="280" x2="250" y2="120" stroke="#FDE047" stroke-width="3.5" stroke-dasharray="6,4"/>
  <polygon points="245,110 258,118 240,128" fill="#FDE047"/>
  <text x="135" y="200" fill="#FEF08A" font-family="sans-serif" font-size="13" font-weight="bold">1. Evaporation ↑</text>

  <!-- Precipitation Arrow Down -->
  <line x1="450" y1="120" x2="490" y2="240" stroke="#38BDF8" stroke-width="3" stroke-dasharray="6,4"/>
  <polygon points="485,245 498,235 480,230" fill="#38BDF8"/>
  <text x="480" y="170" fill="#BAE6FD" font-family="sans-serif" font-size="13" font-weight="bold">2. Precipitation ↓</text>

  <!-- Mountain / Ocean Surface -->
  <polygon points="400,320 520,200 640,320" fill="#0F766E"/>
  <rect x="0" y="320" width="640" height="80" fill="#0C4A6E"/>
  <text x="80" y="360" fill="#E0F2FE" font-family="sans-serif" font-size="14" font-weight="bold">Ocean &amp; Rivers (Collection)</text>
</svg>"""
    _write_svg_if_missing("water_cycle.svg", water_svg)

    # 15. Atomic Structure Bohr Model
    atom_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
  <defs>
    <linearGradient id="aBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/><stop offset="100%" stop-color="#141B2D"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="16" fill="url(#aBg)" stroke="#2A334A" stroke-width="1.5"/>

  <!-- Concentric Orbit Shells -->
  <g transform="translate(320, 200)">
    <circle cx="0" cy="0" r="60" fill="none" stroke="#64748B" stroke-width="1.5" stroke-dasharray="4,4"/>
    <text x="45" y="-45" fill="#94A3B8" font-family="sans-serif" font-size="11">n=1 (K)</text>

    <circle cx="0" cy="0" r="110" fill="none" stroke="#8B5CF6" stroke-width="1.5" stroke-dasharray="5,5"/>
    <text x="85" y="-80" fill="#C4B5FD" font-family="sans-serif" font-size="11">n=2 (L)</text>

    <circle cx="0" cy="0" r="160" fill="none" stroke="#06B6D4" stroke-width="1.5" stroke-dasharray="6,6"/>
    <text x="120" y="-115" fill="#67E8F9" font-family="sans-serif" font-size="11">n=3 (M)</text>

    <!-- Nucleus -->
    <circle cx="0" cy="0" r="24" fill="#F43F5E" stroke="#FFFFFF" stroke-width="2"/>
    <text x="-12" y="5" fill="#FFFFFF" font-family="sans-serif" font-size="11" font-weight="bold">p⁺ n⁰</text>

    <!-- Orbiting Electrons (e-) -->
    <circle cx="60" cy="0" r="6" fill="#38BDF8"/>
    <circle cx="-60" cy="0" r="6" fill="#38BDF8"/>
    <circle cx="0" cy="110" r="6" fill="#38BDF8"/>
    <circle cx="-110" cy="0" r="6" fill="#38BDF8"/>
    <circle cx="113" cy="113" r="6" fill="#38BDF8"/>
  </g>

  <rect x="30" y="25" width="230" height="45" rx="8" fill="#1E1B4B" stroke="#4338CA"/>
  <text x="45" y="52" fill="#C4B5FD" font-family="sans-serif" font-size="14" font-weight="bold">ΔE = h·ν (Photon Emission)</text>
</svg>"""
    _write_svg_if_missing("atomic_structure.svg", atom_svg)

    # 8. Generic High-Tech STEM Concept Diagram (Fallback for any arbitrary query)
    generic_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="100%" height="100%">
  <defs>
    <linearGradient id="genBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19"/>
      <stop offset="100%" stop-color="#141B2D"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" rx="16" fill="url(#genBg)" stroke="#2A334A" stroke-width="1.5"/>
  <rect x="40" y="40" width="560" height="70" rx="12" fill="rgba(139, 92, 246, 0.15)" stroke="#8B5CF6"/>
  <text x="60" y="75" fill="#C4B5FD" font-family="sans-serif" font-size="12" font-weight="bold">ACADEMIC CONCEPT MODEL</text>
  <text x="60" y="95" fill="#FFFFFF" font-family="sans-serif" font-size="16" font-weight="bold">Step-by-Step Educational Conceptual Breakdown</text>

  <!-- 3 Flow Boxes -->
  <rect x="40" y="160" width="160" height="140" rx="12" fill="rgba(6, 182, 212, 0.15)" stroke="#06B6D4"/>
  <text x="55" y="195" fill="#67E8F9" font-family="sans-serif" font-size="13" font-weight="bold">1. Principle</text>
  <text x="55" y="225" fill="#94A3B8" font-family="sans-serif" font-size="11">Core definition and</text>
  <text x="55" y="245" fill="#94A3B8" font-family="sans-serif" font-size="11">fundamental laws</text>

  <line x1="205" y1="230" x2="235" y2="230" stroke="#64748B" stroke-width="3"/>

  <rect x="240" y="160" width="160" height="140" rx="12" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981"/>
  <text x="255" y="195" fill="#6EE7B7" font-family="sans-serif" font-size="13" font-weight="bold">2. Derivation</text>
  <text x="255" y="225" fill="#94A3B8" font-family="sans-serif" font-size="11">Mathematical formulation</text>
  <text x="255" y="245" fill="#94A3B8" font-family="sans-serif" font-size="11">&amp; logical deduction</text>

  <line x1="405" y1="230" x2="435" y2="230" stroke="#64748B" stroke-width="3"/>

  <rect x="440" y="160" width="160" height="140" rx="12" fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B"/>
  <text x="455" y="195" fill="#FCD34D" font-family="sans-serif" font-size="13" font-weight="bold">3. Application</text>
  <text x="455" y="225" fill="#94A3B8" font-family="sans-serif" font-size="11">Real-life examples</text>
  <text x="455" y="245" fill="#94A3B8" font-family="sans-serif" font-size="11">&amp; exam problems</text>

  <text x="50" y="350" fill="#A5B4FC" font-family="sans-serif" font-size="12">GuruG Visual Pedagogical Framework • Continuous Concept Clarity</text>
</svg>"""
    _write_svg_if_missing("concept_general_stem.svg", generic_svg)

# Initialize SVGs on module import
try:
    generate_all_catalog_svgs()
except Exception as e:
    print(f"[VisualEngine] Notice during initial SVG write: {e}")

# ---------------------------------------------------------------------------
# Visual Matching & Enrichment Logic
# ---------------------------------------------------------------------------

def find_visual_aid(user_query: str, tutor_response: str = "", subject: str = "General") -> Optional[Dict[str, Any]]:
    """
    Finds the best educational diagram for the student's topic with strict relevance verification.
    Guarantees only genuine, high-confidence topical matches are returned.
    If no diagram matches the user's specific topic, returns None (preventing misleading or unrelated images).
    """
    q_clean = user_query.strip().lower()
    resp_clean = tutor_response.strip().lower()

    best_match = None
    max_score = 0

    for item in VISUAL_CATALOG:
        # 1. Negative Term Gate: if any negative term is in the query, skip this diagram
        if any(re.search(r'\b' + re.escape(neg) + r'\b', q_clean) for neg in item.get("negative_terms", [])):
            continue

        query_score = 0
        resp_score = 0

        # Primary terms: Must match with whole-word regex
        for term in item.get("primary_terms", []):
            term_regex = r'\b' + re.escape(term) + r'\b' if ' ' in term or len(term) > 3 else r'(?<![a-zA-Z0-9])' + re.escape(term) + r'(?![a-zA-Z0-9])'
            if re.search(term_regex, q_clean):
                query_score += 12
            elif re.search(term_regex, resp_clean):
                resp_score += 2

        # Secondary terms
        for term in item.get("secondary_terms", []):
            term_regex = r'\b' + re.escape(term) + r'\b'
            if re.search(term_regex, q_clean):
                query_score += 6
            elif re.search(term_regex, resp_clean):
                resp_score += 1

        # Cap response boost to avoid long tutor explanations hijacking the match
        capped_resp_score = min(resp_score, 6)
        total_score = query_score + capped_resp_score

        # Strict Matching Requirement:
        # A diagram is ONLY returned if the user's query itself specifically asks for or mentions the concept
        if query_score >= 12 or (query_score >= 6 and capped_resp_score >= 3):
            if total_score > max_score:
                max_score = total_score
                best_match = item

    if best_match and max_score >= 12:
        return {
            "id": best_match["id"],
            "title": best_match["title"],
            "image_url": f"/images/concepts/{best_match['file']}",
            "badge": best_match["badge"],
            "caption": best_match["caption"],
            "key_takeaway": best_match["key_takeaway"]
        }

    # If no high-confidence topic match, return None!
    # DO NOT attach random or generic flowchart diagrams!
    return None

def strip_visuals(text: str) -> str:
    """
    Strips all visual card HTML blocks, <img> tags, Markdown images,
    and visual card placeholder tokens from message text.
    """
    if not text:
        return ""

    # Strip concept-visual-card div blocks (handles arbitrarily nested divs)
    while True:
        m = re.search(r'<div[^>]*class=["\'][^"\']*concept-visual-card[^"\']*["\']', text, re.IGNORECASE)
        if not m:
            break
        start = m.start()
        depth = 0
        pos = start
        found_end = False
        tag_pattern = re.compile(r'<\s*(/)?\s*div\b[^>]*>', re.IGNORECASE)
        for tm in tag_pattern.finditer(text, pos):
            if tm.group(1):  # closing </div>
                depth -= 1
                if depth == 0:
                    text = text[:start] + text[tm.end():]
                    found_end = True
                    break
            else:  # opening <div ...>
                depth += 1
        if not found_end:
            # Fallback if unmatched/malformed: strip from start to end of string
            text = text[:start]
            break

    # Strip standalone <img> tags
    text = re.sub(r'<img[^>]*>', '', text, flags=re.IGNORECASE)
    # Strip markdown images: ![alt](url) or ![alt](url "title")
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)
    # Strip visual card placeholders (e.g. @@@VISUAL_CARD_0@@@)
    text = re.sub(r'@@@VISUAL_CARD_?\d*@@@', '', text)
    # Clean up excess whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def format_visual_aid_markdown(visual: Optional[Dict[str, Any]]) -> str:
    """Formats visual aid into rich HTML/Markdown block stored directly in message content."""
    if not visual:
        return ""

    # Escape any single quotes or special characters in strings to avoid JS onclick syntax errors
    title_esc = visual["title"].replace("'", "\\'").replace('"', '&quot;')
    caption_esc = visual.get("caption", "").replace("'", "\\'").replace('"', '&quot;')
    url_esc = visual["image_url"].replace("'", "\\'")

    return (
        f'\n\n<div class="concept-visual-card my-4 p-4 rounded-2xl glass-panel-elevated border border-purple-500/30 shadow-xl space-y-3">\n'
        f'  <div class="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs">\n'
        f'    <div class="flex items-center gap-2">\n'
        f'      <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>\n'
        f'      <span class="font-bold text-white text-xs sm:text-sm">{visual["title"]}</span>\n'
        f'    </div>\n'
        f'    <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">{visual.get("badge", "Visual Aid")}</span>\n'
        f'  </div>\n'
        f'  <div class="relative rounded-xl overflow-hidden bg-black/40 border border-white/10 text-center cursor-pointer group visual-lightbox-trigger" data-lightbox-src="{visual["image_url"]}" data-lightbox-title="{title_esc}" data-lightbox-caption="{caption_esc}" onclick="openImageLightbox(\'{url_esc}\', \'{title_esc}\', \'{caption_esc}\')">\n'
        f'    <img src="{visual["image_url"]}" alt="{visual["title"]}" class="w-full max-h-80 object-contain mx-auto py-2 transition-transform duration-300 group-hover:scale-[1.02]" loading="lazy" />\n'
        f'    <div class="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">\n'
        f'      <span>🔍 Click to Zoom</span>\n'
        f'    </div>\n'
        f'  </div>\n'
        f'  <div class="text-xs text-gray-300 leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/5">\n'
        f'    <p class="font-medium text-purple-200">💡 <strong>Visual Concept Insight:</strong> {visual["caption"]}</p>\n'
        f'  </div>\n'
        f'</div>\n'
    )

def enrich_tutor_response(
    text: str,
    user_query: str,
    subject: str = "General",
    recent_image_ids: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Enriches an educational response by attaching relevant pictures and diagrams.
    Always strips any visuals from LLM output, matches visuals from user query,
    enforces anti-repeat rules, and returns visual_aid as structured data.
    """
    clean_text = strip_visuals(text)

    visual = find_visual_aid(user_query=user_query, tutor_response=clean_text, subject=subject)

    # Anti-repeat check:
    # If the matched visual was shown in the recent tutor messages of the session,
    # skip attaching it unless the student's current query explicitly names that concept.
    if visual and recent_image_ids and visual["id"] in recent_image_ids:
        cat_item = next((item for item in VISUAL_CATALOG if item["id"] == visual["id"]), None)
        explicitly_named = False
        if cat_item:
            q_clean = user_query.strip().lower()
            for term in cat_item.get("primary_terms", []):
                term_regex = r'\b' + re.escape(term) + r'\b' if ' ' in term or len(term) > 3 else r'(?<![a-zA-Z0-9])' + re.escape(term) + r'(?![a-zA-Z0-9])'
                if re.search(term_regex, q_clean):
                    explicitly_named = True
                    break
        if not explicitly_named:
            visual = None

    return {
        "content": clean_text,
        "visual_aid": visual,
        "has_visual": bool(visual)
    }
