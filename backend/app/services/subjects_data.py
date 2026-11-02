"""
Curated academic taxonomy for GuruG:
Mathematics, Physics, Chemistry, Biology, Computer Science, English, History, Geography.
"""

SUBJECTS_TAXONOMY = [
    {
        "id": "mathematics",
        "name": "Mathematics",
        "icon": "calculator",
        "color": "from-purple-500 to-indigo-600",
        "description": "Algebra, Geometry, Trigonometry, Calculus, and Statistics made intuitive.",
        "grade_levels": ["Class 6–8", "Class 9–10", "Class 11–12", "College"],
        "topics": [
            {
                "id": "pythagorean-theorem",
                "name": "Pythagorean Theorem",
                "grade": "Class 9–10",
                "summary": "In a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.",
                "formula": "a^2 + b^2 = c^2",
                "sample_question": "How do you find the hypotenuse if the two legs are 3 cm and 4 cm?"
            },
            {
                "id": "quadratic-equations",
                "name": "Quadratic Equations",
                "grade": "Class 9–10",
                "summary": "Second-degree polynomial equations solved by factoring, completing the square, or the quadratic formula.",
                "formula": "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
                "sample_question": "Solve the quadratic equation x^2 - 5x + 6 = 0 step-by-step."
            },
            {
                "id": "trigonometric-ratios",
                "name": "Trigonometric Ratios",
                "grade": "Class 10–11",
                "summary": "Sine, Cosine, and Tangent relationships between angles and side lengths in right triangles.",
                "formula": "\\sin(\\theta) = \\frac{\\text{Opposite}}{\\text{Hypotenuse}}, \\cos(\\theta) = \\frac{\\text{Adjacent}}{\\text{Hypotenuse}}",
                "sample_question": "Why is sin^2(x) + cos^2(x) always equal to 1?"
            },
            {
                "id": "calculus-derivatives",
                "name": "Derivatives & Rate of Change",
                "grade": "Class 11–12",
                "summary": "Measuring the instantaneous rate of change of a function with respect to its variable.",
                "formula": "\\frac{d}{dx}[x^n] = n x^{n-1}",
                "sample_question": "Explain the physical meaning of a derivative using a speeding car example."
            }
        ]
    },
    {
        "id": "physics",
        "name": "Physics",
        "icon": "atom",
        "color": "from-blue-500 to-cyan-500",
        "description": "Mechanics, Optics, Thermodynamics, Electromagnetism, and Modern Physics.",
        "grade_levels": ["Class 6–8", "Class 9–10", "Class 11–12", "College"],
        "topics": [
            {
                "id": "newtons-laws",
                "name": "Newton's Laws of Motion",
                "grade": "Class 9–10",
                "summary": "Three fundamental physical laws describing the relationship between the motion of an object and the forces acting upon it.",
                "formula": "F = m \\cdot a",
                "sample_question": "Why do passengers jerk backward when a stationary bus suddenly moves forward?"
            },
            {
                "id": "work-energy-power",
                "name": "Work, Energy, and Power",
                "grade": "Class 9–10",
                "summary": "Energy conservation principle: energy cannot be created or destroyed, only transformed.",
                "formula": "W = F \\cdot d \\cdot \\cos(\\theta), \\quad KE = \\frac{1}{2}m v^2",
                "sample_question": "What is the difference between potential energy and kinetic energy?"
            },
            {
                "id": "ohms-law",
                "name": "Ohm's Law & Electric Circuits",
                "grade": "Class 10–12",
                "summary": "The electric current through a conductor between two points is directly proportional to the voltage across the two points.",
                "formula": "V = I \\cdot R",
                "sample_question": "If voltage is doubled and resistance is halved, what happens to the electric current?"
            },
            {
                "id": "optics-refraction",
                "name": "Refraction of Light & Snell's Law",
                "grade": "Class 10–12",
                "summary": "The bending of light as it passes from one transparent medium to another of different optical density.",
                "formula": "n_1 \\sin(\\theta_1) = n_2 \\sin(\\theta_2)",
                "sample_question": "Why does a pencil look bent when dipped in a glass of water?"
            }
        ]
    },
    {
        "id": "chemistry",
        "name": "Chemistry",
        "icon": "flask-conical",
        "color": "from-emerald-500 to-teal-600",
        "description": "Chemical reactions, Periodic Table, Chemical Bonding, Acids & Bases, and Organic Chemistry.",
        "grade_levels": ["Class 6–8", "Class 9–10", "Class 11–12", "College"],
        "topics": [
            {
                "id": "chemical-reactions",
                "name": "Balancing Chemical Equations",
                "grade": "Class 9–10",
                "summary": "Applying the Law of Conservation of Mass: number of atoms of each element must remain constant.",
                "formula": "2H_2 + O_2 \\rightarrow 2H_2O",
                "sample_question": "Balance this chemical reaction: Fe + O2 -> Fe2O3 step-by-step."
            },
            {
                "id": "acids-bases-salts",
                "name": "Acids, Bases, and pH Scale",
                "grade": "Class 9–10",
                "summary": "Arrhenius and Brønsted-Lowry definitions; pH measuring hydrogen ion concentration.",
                "formula": "\\text{pH} = -\\log_{10}[H^+]",
                "sample_question": "Why does baking soda soothe an ant sting, which contains formic acid?"
            },
            {
                "id": "periodic-trends",
                "name": "Periodic Classification & Trends",
                "grade": "Class 10–11",
                "summary": "Electronegativity, atomic radius, and ionization energy trends across periods and down groups.",
                "formula": "\\text{Atomic Radius decreases across a period, increases down a group}",
                "sample_question": "Why are noble gases chemically unreactive?"
            },
            {
                "id": "mole-concept",
                "name": "The Mole Concept & Stoichiometry",
                "grade": "Class 10–11",
                "summary": "Avogadro's number: 6.022 x 10^23 particles in one mole of any pure substance.",
                "formula": "n = \\frac{\\text{Mass}}{\\text{Molar Mass}} = \\frac{N}{N_A}",
                "sample_question": "How many molecules of water are present in 36 grams of pure water?"
            }
        ]
    },
    {
        "id": "biology",
        "name": "Biology",
        "icon": "dna",
        "color": "from-green-500 to-emerald-600",
        "description": "Cell Biology, Genetics, Human Physiology, Plant Anatomy, and Ecology.",
        "grade_levels": ["Class 6–8", "Class 9–10", "Class 11–12", "College"],
        "topics": [
            {
                "id": "photosynthesis",
                "name": "Photosynthesis & Plant Energy",
                "grade": "Class 6–10",
                "summary": "Green plants and certain organisms use sunlight to synthesize nutrients from carbon dioxide and water.",
                "formula": "6CO_2 + 6H_2O \\xrightarrow{\\text{Light + Chlorophyll}} C_6H_{12}O_6 + 6O_2",
                "sample_question": "Why are leaves generally green, and what happens during the light-independent Calvin cycle?"
            },
            {
                "id": "cell-structure",
                "name": "Cell Structure & Organelles",
                "grade": "Class 8–10",
                "summary": "The fundamental unit of life. Plant vs Animal cells, Mitochondria, Nucleus, and Ribosomes.",
                "formula": "\\text{Mitochondria} = \\text{Powerhouse of the Cell (ATP synthesis)}",
                "sample_question": "Why is the cell membrane called a 'selectively permeable' membrane?"
            },
            {
                "id": "genetics-mendel",
                "name": "Mendelian Genetics & Heredity",
                "grade": "Class 10–12",
                "summary": "Dominant and recessive alleles, Punnett squares, and laws of segregation and independent assortment.",
                "formula": "\\text{Phenotypic Ratio in Monohybrid Cross} = 3:1",
                "sample_question": "If both parents are heterozygous carriers for a recessive trait (Aa), what is the chance their child shows it?"
            }
        ]
    },
    {
        "id": "computer-science",
        "name": "Computer Science",
        "icon": "code-2",
        "color": "from-cyan-500 to-blue-600",
        "description": "Python, Data Structures, Algorithms, Web Technologies, and Database Systems.",
        "grade_levels": ["Class 9–10", "Class 11–12", "College"],
        "topics": [
            {
                "id": "python-basics",
                "name": "Python Loops & Control Flow",
                "grade": "Class 9–11",
                "summary": "Conditional statements (if-else) and loops (for, while) to automate repetitive logic.",
                "formula": "\\text{Time Complexity of single loop} = O(n)",
                "sample_question": "How do you check if a number is a prime number in Python?"
            },
            {
                "id": "binary-search",
                "name": "Binary Search Algorithm",
                "grade": "Class 11–College",
                "summary": "Divide-and-conquer algorithm that finds position of a target value within a sorted array.",
                "formula": "T(n) = O(\\log_2 n)",
                "sample_question": "Why does binary search require a sorted list, and how does it halve search space?"
            },
            {
                "id": "recursion",
                "name": "Recursion & Base Cases",
                "grade": "Class 11–College",
                "summary": "A function calling itself to solve a smaller subproblem until reaching a terminating base condition.",
                "formula": "F(n) = F(n-1) + F(n-2) \\quad [F(0)=0, F(1)=1]",
                "sample_question": "Explain the call stack behavior when computing factorial(4) recursively."
            }
        ]
    },
    {
        "id": "english",
        "name": "English & Grammar",
        "icon": "book-a",
        "color": "from-rose-500 to-pink-600",
        "description": "Grammar, Reading Comprehension, Essay Writing, Vocabulary, and Literary Devices.",
        "grade_levels": ["Class 6–8", "Class 9–10", "Class 11–12"],
        "topics": [
            {
                "id": "active-passive-voice",
                "name": "Active vs. Passive Voice",
                "grade": "Class 8–10",
                "summary": "Active voice emphasizes the doer of the action; passive voice emphasizes the recipient of the action.",
                "formula": "\\text{Active: Subject + Verb + Object} \\rightarrow \\text{Passive: Object + be + Past Participle + by Subject}",
                "sample_question": "Convert 'The chef prepared an exquisite meal' into passive voice."
            },
            {
                "id": "tenses-mastery",
                "name": "Tenses & Subject-Verb Agreement",
                "grade": "Class 8–10",
                "summary": "Rules governing verb forms for past, present, and future timelines, plus singular/plural rules.",
                "formula": "\\text{Singular Subject takes Singular Verb; Plural Subject takes Plural Verb}",
                "sample_question": "Why is it 'Neither the teacher nor the students were present'?"
            }
        ]
    },
    {
        "id": "history",
        "name": "History & Civics",
        "icon": "landmark",
        "color": "from-amber-500 to-orange-600",
        "description": "Indian History, World Civilizations, Freedom Struggle, and Constitutional Framework.",
        "grade_levels": ["Class 6–8", "Class 9–10", "Class 11–12"],
        "topics": [
            {
                "id": "indian-freedom-struggle",
                "name": "Indian National Movement (1857–1947)",
                "grade": "Class 9–10",
                "summary": "Key milestones: 1857 Revolt, Non-Cooperation Movement, Dandi March, and Quit India Movement.",
                "formula": "\\text{Satyagraha: Soul force and non-violent resistance advocated by Mahatma Gandhi}",
                "sample_question": "What was the significance of the Salt Satyagraha (Dandi March) in 1930?"
            },
            {
                "id": "indian-constitution",
                "name": "The Constitution of India & Fundamental Rights",
                "grade": "Class 9–10",
                "summary": "The supreme legal document crafted by the Constituent Assembly under Dr. B.R. Ambedkar.",
                "formula": "\\text{Preamble: Sovereign, Socialist, Secular, Democratic Republic}",
                "sample_question": "Explain the six Fundamental Rights guaranteed to Indian citizens."
            }
        ]
    },
    {
        "id": "geography",
        "name": "Geography & Earth Sciences",
        "icon": "globe-2",
        "color": "from-teal-500 to-blue-500",
        "description": "Physical Geography, Climate, Plate Tectonics, Resources, and Indian Geography.",
        "grade_levels": ["Class 6–8", "Class 9–10", "Class 11–12"],
        "topics": [
            {
                "id": "plate-tectonics",
                "name": "Plate Tectonics & Earthquakes",
                "grade": "Class 9–10",
                "summary": "Convergent, divergent, and transform boundaries forming mountains, rifts, and seismic zones.",
                "formula": "\\text{Himalayas: Formed by the collision of the Indian Plate and Eurasian Plate}",
                "sample_question": "How are fold mountains like the Himalayas formed?"
            },
            {
                "id": "monsoon-climate",
                "name": "Indian Monsoon System & Rainfall",
                "grade": "Class 9–10",
                "summary": "Seasonal reversal of wind direction caused by differential heating of land and sea.",
                "formula": "\\text{South-West Monsoon (June to Sept) + North-East Retreating Monsoon (Oct to Nov)}",
                "sample_question": "What causes the onset of the Southwest Monsoon in the Indian subcontinent?"
            }
        ]
    }
]

def get_all_subjects():
    return SUBJECTS_TAXONOMY

def get_subject_by_id(subject_id: str):
    for subj in SUBJECTS_TAXONOMY:
        if subj["id"] == subject_id.lower() or subj["name"].lower() == subject_id.lower():
            return subj
    return None

def get_topic_by_id(topic_id: str):
    for subj in SUBJECTS_TAXONOMY:
        for topic in subj["topics"]:
            if topic["id"] == topic_id or topic["name"].lower() == topic_id.lower():
                return topic, subj
    return None, None
