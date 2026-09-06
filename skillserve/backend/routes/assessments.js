const express = require('express');
const router = express.Router();
const SkillAssessment = require('../models/SkillAssessment');
const Worker = require('../models/Worker');
const Notification = require('../models/Notification');
const { protect, roleCheck } = require('../middleware/auth');

const assessmentTemplates = {
  electrician: {
    title: 'Electrician Skill Assessment',
    questions: [
      { question: 'What is the correct way to calculate load for a single phase residential connection?', type: 'theoretical', options: ['V x I x PF', 'V x I', 'V x I x 1.732', 'V^2 / R'], correctAnswer: 'V x I x PF', points: 10, rubric: 'Understanding of power factor in single phase calculations' },
      { question: 'A 1500W air conditioner trips the MCB repeatedly. What is the most likely cause?', type: 'scenario', options: ['Faulty MCB', 'Loose wiring connection', 'Overloading the circuit', 'All of the above'], correctAnswer: 'All of the above', points: 10, rubric: 'Diagnostic skills for common electrical problems' },
      { question: 'What is the safe earthing resistance value as per Indian Standards?', type: 'theoretical', options: ['1 ohm', '5 ohms', '10 ohms', '25 ohms'], correctAnswer: '1 ohm', points: 10, rubric: 'Knowledge of Indian electrical safety standards' },
      { question: 'Which type of wire is recommended for residential rewiring?', type: 'theoretical', options: ['Aluminum', 'Copper', 'Silver', 'Iron'], correctAnswer: 'Copper', points: 10, rubric: 'Material knowledge' },
      { question: 'A customer reports flickering lights. Walk through your diagnostic process.', type: 'scenario', options: ['Check main fuse, then MCBs, then individual circuits', 'Replace all bulbs first', 'Check voltage at the meter', 'Call the electricity board'], correctAnswer: 'Check main fuse, then MCBs, then individual circuits', points: 15, rubric: 'Systematic troubleshooting approach' },
      { question: 'What is the color code for the earth wire in Indian wiring?', type: 'theoretical', options: ['Red', 'Black', 'Green', 'Blue'], correctAnswer: 'Green', points: 5, rubric: 'Basic wiring knowledge' },
      { question: 'How do you test for phase presence without a tester?', type: 'practical', options: ['Use a multimeter', 'Touch the wire', 'Use water', 'Check the meter reading'], correctAnswer: 'Use a multimeter', points: 10, rubric: 'Safe testing practices' },
      { question: 'What is the recommended RCCB sensitivity for residential circuits?', type: 'theoretical', options: ['5mA', '15mA', '30mA', '100mA'], correctAnswer: '30mA', points: 10, rubric: 'Knowledge of safety device ratings' },
      { question: 'A motor is humming but not starting. What could be the issue?', type: 'scenario', options: ['Capacitor failure', 'Single phasing', 'Both A and B', 'Motor is fine'], correctAnswer: 'Both A and B', points: 15, rubric: 'Motor troubleshooting skills' },
      { question: 'What is the maximum voltage drop allowed as per IS standards for lighting?', type: 'theoretical', options: ['1%', '2.5%', '5%', '10%'], correctAnswer: '2.5%', points: 10, rubric: 'Knowledge of IS standards' }
    ]
  },
  plumber: {
    title: 'Plumber Skill Assessment',
    questions: [
      { question: 'What is the minimum gradient required for horizontal drainage pipes?', type: 'theoretical', options: ['1:50', '1:100', '1:200', '1:40'], correctAnswer: '1:50', points: 10, rubric: 'Knowledge of drainage standards' },
      { question: 'A customer complains of low water pressure. What are the possible causes?', type: 'scenario', options: ['Clogged pipes', 'Faulty pressure pump', 'Municipal supply issue', 'All of the above'], correctAnswer: 'All of the above', points: 10, rubric: 'Diagnostic skills' },
      { question: 'Which joint is most suitable for CPVC pipes?', type: 'theoretical', options: ['Threaded joint', 'Solvent cement joint', 'Flange joint', 'Socket joint'], correctAnswer: 'Solvent cement joint', points: 10, rubric: 'Material joining knowledge' },
      { question: 'What is the standard height for a washbasin installation?', type: 'theoretical', options: ['24 inches', '30 inches', '36 inches', '42 inches'], correctAnswer: '36 inches', points: 10, rubric: 'Installation standards knowledge' },
      { question: 'How do you detect a hidden pipe leak?', type: 'practical', options: ['Listen for sounds', 'Check water meter', 'Use thermal camera', 'All methods can work'], correctAnswer: 'All methods can work', points: 15, rubric: 'Leak detection skills' },
      { question: 'What is the correct way to connect a water heater?', type: 'scenario', options: ['Direct connection to cold water inlet', 'Connection through isolation valves', 'Parallel to existing taps', 'Direct connection without any valve'], correctAnswer: 'Connection through isolation valves', points: 10, rubric: 'Proper installation practices' },
      { question: 'Which type of pipe is recommended for hot water supply?', type: 'theoretical', options: ['PVC', 'CPVC', 'GI', 'HDPE'], correctAnswer: 'CPVC', points: 10, rubric: 'Material selection knowledge' },
      { question: 'What should be the minimum gap between two adjacent WC fixtures?', type: 'theoretical', options: ['15 inches', '18 inches', '24 inches', '30 inches'], correctAnswer: '18 inches', points: 10, rubric: 'Plumbing code knowledge' },
      { question: 'A kitchen sink drain is clogged. What is your first step?', type: 'scenario', options: ['Use chemical drain cleaner', 'Use a plunger', 'Disassemble the P-trap', 'Use a drain snake'], correctAnswer: 'Use a plunger', points: 10, rubric: 'Problem-solving approach' },
      { question: 'What is the purpose of a water hammer arrestor?', type: 'theoretical', options: ['To reduce water pressure', 'To prevent pipe banging noise', 'To filter water', 'To control temperature'], correctAnswer: 'To prevent pipe banging noise', points: 5, rubric: 'Component knowledge' }
    ]
  },
  carpenter: {
    title: 'Carpenter Skill Assessment',
    questions: [
      { question: 'Which type of wood is best for outdoor furniture in India?', type: 'theoretical', options: ['Pine', 'Teak', 'MDF', 'Plywood'], correctAnswer: 'Teak', points: 10, rubric: 'Material knowledge' },
      { question: 'What is the standard thickness for a kitchen countertop plywood base?', type: 'theoretical', options: ['12mm', '18mm', '25mm', '36mm'], correctAnswer: '18mm', points: 10, rubric: 'Installation standards' },
      { question: 'A door is sticking on one side. What is the cause and fix?', type: 'scenario', options: ['Hinges are loose - tighten them', 'Frame is warped - plane the door', 'Wood has expanded - sand the edge', 'All are possible solutions'], correctAnswer: 'All are possible solutions', points: 15, rubric: 'Diagnostic and repair skills' },
      { question: 'What joint is strongest for a table frame?', type: 'theoretical', options: ['Butt joint', 'Mortise and tenon', 'Dowel joint', 'Glue joint only'], correctAnswer: 'Mortise and tenon', points: 10, rubric: 'Joinery knowledge' },
      { question: 'How do you prevent wood from warping during construction?', type: 'practical', options: ['Use kiln-dried wood', 'Apply wood sealer', 'Store in dry place', 'All of the above'], correctAnswer: 'All of the above', points: 10, rubric: 'Best practices knowledge' },
      { question: 'What is the best finish for a bathroom vanity unit?', type: 'scenario', options: ['Lacquer', 'Plylaminate with edge banding', 'Paint only', 'No finish needed'], correctAnswer: 'Plylaminate with edge banding', points: 10, rubric: 'Material selection for moisture areas' },
      { question: 'What is the standard width of a bedroom door in India?', type: 'theoretical', options: ['24 inches', '28 inches', '32 inches', '36 inches'], correctAnswer: '32 inches', points: 10, rubric: 'Building standards knowledge' },
      { question: 'Which screw type is best for outdoor wooden structures?', type: 'theoretical', options: ['Wood screws', 'Stainless steel screws', 'Drywall screws', 'Sheet metal screws'], correctAnswer: 'Stainless steel screws', points: 5, rubric: 'Hardware knowledge' },
      { question: 'How do you ensure a built-in wardrobe is perfectly level?', type: 'practical', options: ['Use a spirit level on all surfaces', 'Measure from the floor', 'Use a laser level', 'Both A and C'], correctAnswer: 'Both A and C', points: 15, rubric: 'Precision and tool usage' },
      { question: 'What adhesive is best for bonding laminate to plywood?', type: 'theoretical', options: ['Fevicol SH', 'Fevicol MR', 'Wood glue', 'Super glue'], correctAnswer: 'Fevicol SH', points: 5, rubric: 'Adhesive knowledge' }
    ]
  },
  acTechnician: {
    title: 'AC Technician Skill Assessment',
    questions: [
      { question: 'What is the normal operating pressure for R410A refrigerant?', type: 'theoretical', options: ['50-80 PSI', '100-150 PSI', '200-300 PSI', '400-500 PSI'], correctAnswer: '200-300 PSI', points: 10, rubric: 'Refrigerant knowledge' },
      { question: 'An AC is cooling but consuming excess power. What to check?', type: 'scenario', options: ['Compressor capacitor', 'Condenser coils for dirt', 'Refrigerant level', 'All of the above'], correctAnswer: 'All of the above', points: 10, rubric: 'Energy efficiency troubleshooting' },
      { question: 'What is the correct method to check refrigerant charge?', type: 'theoretical', options: ['Weigh the cylinder', 'Check superheat/subcooling', 'Listen to the compressor', 'Feel the suction line'], correctAnswer: 'Check superheat/subcooling', points: 15, rubric: 'Proper charging methodology' },
      { question: 'How often should AC filters be cleaned in Indian conditions?', type: 'theoretical', options: ['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly'], correctAnswer: 'Bi-weekly', points: 5, rubric: 'Maintenance knowledge' },
      { question: 'A split AC shows E1 error. What does it indicate?', type: 'scenario', options: ['Indoor unit fault', 'Communication error', 'Outdoor unit fault', 'Temperature sensor issue'], correctAnswer: 'Communication error', points: 10, rubric: 'Error code interpretation' },
      { question: 'What is the minimum clearance required for outdoor AC unit?', type: 'theoretical', options: ['6 inches', '12 inches', '18 inches', '24 inches'], correctAnswer: '12 inches', points: 10, rubric: 'Installation standards' },
      { question: 'How do you detect a refrigerant leak?', type: 'practical', options: ['Soap solution test', 'Electronic leak detector', 'UV dye test', 'All methods work'], correctAnswer: 'All methods work', points: 15, rubric: 'Leak detection skills' },
      { question: 'What is the typical COP of a 5-star rated split AC?', type: 'theoretical', options: ['2.5', '3.5', '4.5', '5.5'], correctAnswer: '3.5', points: 10, rubric: 'Energy rating knowledge' },
      { question: 'Correct procedure for AC drain line installation?', type: 'scenario', options: ['Keep it horizontal always', 'Ensure continuous downward slope', 'Loop it like a P-trap', 'Connect directly to sewer'], correctAnswer: 'Ensure continuous downward slope', points: 10, rubric: 'Installation best practices' },
      { question: 'Purpose of a crankcase heater in a compressor?', type: 'theoretical', options: ['To heat the room', 'To prevent liquid slugging on startup', 'To maintain oil temperature', 'To prevent frost formation'], correctAnswer: 'To prevent liquid slugging on startup', points: 10, rubric: 'Component function knowledge' }
    ]
  },
  painter: {
    title: 'Painter Skill Assessment',
    questions: [
      { question: 'How many coats of primer for exterior walls?', type: 'theoretical', options: ['1 coat', '2 coats', '3 coats', 'No primer needed'], correctAnswer: '1 coat', points: 10, rubric: 'Surface preparation knowledge' },
      { question: 'Drying time between coats of emulsion paint?', type: 'theoretical', options: ['1 hour', '4 hours', '8 hours', '24 hours'], correctAnswer: '4 hours', points: 10, rubric: 'Paint application knowledge' },
      { question: 'Which paint type for a bathroom?', type: 'scenario', options: ['Distemper', 'Matt emulsion', 'Anti-fungal emulsion', 'Oil-based paint'], correctAnswer: 'Anti-fungal emulsion', points: 10, rubric: 'Product recommendation skills' },
      { question: 'Surface prep before painting over old oil paint?', type: 'practical', options: ['Just clean and paint', 'Sand and apply bonding primer', 'Apply two coats of primer', 'Strip all old paint first'], correctAnswer: 'Sand and apply bonding primer', points: 15, rubric: 'Surface preparation knowledge' },
      { question: 'Coverage area of 1 litre of emulsion paint?', type: 'theoretical', options: ['50-60 sq ft', '100-120 sq ft', '150-200 sq ft', '300+ sq ft'], correctAnswer: '100-120 sq ft', points: 10, rubric: 'Material estimation skills' },
      { question: 'How to achieve smooth finish on textured wall?', type: 'scenario', options: ['Apply more paint', 'Use roller with thicker nap', 'Apply wall putty first then paint', 'Use spray painting'], correctAnswer: 'Apply wall putty first then paint', points: 15, rubric: 'Surface finishing techniques' },
      { question: 'Ideal temperature range for exterior painting?', type: 'theoretical', options: ['5-10C', '10-35C', '35-45C', 'Any temperature'], correctAnswer: '10-35C', points: 10, rubric: 'Environmental conditions knowledge' },
      { question: 'Best brush for cutting in edges?', type: 'theoretical', options: ['2-inch angled brush', '4-inch flat brush', 'Foam brush', 'Spray gun'], correctAnswer: '2-inch angled brush', points: 5, rubric: 'Tool knowledge' },
      { question: 'How to handle paint peeling on damp wall?', type: 'scenario', options: ['Paint over with waterproof paint', 'Identify and fix moisture source, then treat and repaint', 'Use hair dryer and repaint', 'Apply wall putty over peeling area'], correctAnswer: 'Identify and fix moisture source, then treat and repaint', points: 15, rubric: 'Problem diagnosis and resolution' },
      { question: 'Recommended VOC level for interior paints?', type: 'theoretical', options: ['No limit', 'Below 50 g/L', 'Below 200 g/L', 'Below 500 g/L'], correctAnswer: 'Below 50 g/L', points: 10, rubric: 'Health and safety knowledge' }
    ]
  },
  beautician: {
    title: 'Beautician Skill Assessment',
    questions: [
      { question: 'Correct order for a facial treatment?', type: 'theoretical', options: ['Cleansing, toning, steaming, extraction, massage, mask', 'Steaming, cleansing, massage, extraction, mask, toning', 'Massage, cleansing, steaming, extraction, mask, toning', 'Cleansing, massage, steaming, extraction, toning, mask'], correctAnswer: 'Cleansing, toning, steaming, extraction, massage, mask', points: 10, rubric: 'Treatment sequence knowledge' },
      { question: 'Client has sensitive skin. Which wax to avoid?', type: 'scenario', options: ['Rica wax', 'Chocolate wax', 'Sugar wax with lemon', 'Hot strip wax'], correctAnswer: 'Hot strip wax', points: 10, rubric: 'Product knowledge for skin types' },
      { question: 'Recommended patch test time before hair color?', type: 'theoretical', options: ['5 minutes', '15 minutes', '24-48 hours', 'No test needed'], correctAnswer: '24-48 hours', points: 10, rubric: 'Safety protocols' },
      { question: 'How to treat a client experiencing waxing burn?', type: 'scenario', options: ['Apply ice immediately', 'Use aloe vera gel and avoid the area', 'Continue with a different wax', 'Apply cold water and aloe vera, advise to avoid sun'], correctAnswer: 'Apply cold water and aloe vera, advise to avoid sun', points: 15, rubric: 'Emergency treatment knowledge' },
      { question: 'Correct pH range for facial cleansers?', type: 'theoretical', options: ['3-4', '5-6', '7-8', '9-10'], correctAnswer: '5-6', points: 10, rubric: 'Chemical knowledge' },
      { question: 'Best facial for oily acne-prone skin?', type: 'scenario', options: ['Gold facial', 'Fruit facial with lemon', 'Anti-acne facial with salicylic acid', 'Diamond facial'], correctAnswer: 'Anti-acne facial with salicylic acid', points: 10, rubric: 'Treatment selection' },
      { question: 'Recommended time for henna on grey hair?', type: 'theoretical', options: ['30 minutes', '1 hour', '2-3 hours', '6 hours'], correctAnswer: '2-3 hours', points: 5, rubric: 'Application knowledge' },
      { question: 'How often to get a haircut to maintain split ends?', type: 'theoretical', options: ['Every 2 weeks', 'Every 6-8 weeks', 'Every 6 months', 'Once a year'], correctAnswer: 'Every 6-8 weeks', points: 5, rubric: 'Hair care knowledge' },
      { question: 'Contraindications for a chemical peel?', type: 'scenario', options: ['Pregnancy', 'Active cold sores', 'Recent sun exposure', 'All of the above'], correctAnswer: 'All of the above', points: 15, rubric: 'Safety awareness' },
      { question: 'Best technique for arched eyebrow shape?', type: 'practical', options: ['Upper lip technique only', 'Eyebrow threading with shaping guide', 'Free-hand threading only', 'Waxing instead'], correctAnswer: 'Eyebrow threading with shaping guide', points: 10, rubric: 'Technique precision' }
    ]
  },
  applianceRepair: {
    title: 'Appliance Repair Skill Assessment',
    questions: [
      { question: 'Washing machine not spinning. First things to check?', type: 'scenario', options: ['Lid switch, belt, motor coupler', 'Water supply only', 'Drain pump only', 'Timer knob'], correctAnswer: 'Lid switch, belt, motor coupler', points: 10, rubric: 'Diagnostic approach' },
      { question: 'Typical voltage for refrigerator compressor in India?', type: 'theoretical', options: ['110V', '220-240V', '380V', '12V'], correctAnswer: '220-240V', points: 10, rubric: 'Electrical knowledge' },
      { question: 'Microwave running but not heating. Likely issue?', type: 'scenario', options: ['Faulty door switch', 'Failed magnetron', 'Bad turntable motor', 'Faulty light bulb'], correctAnswer: 'Failed magnetron', points: 15, rubric: 'Component-level troubleshooting' },
      { question: 'How to check if refrigerator compressor is working?', type: 'practical', options: ['Feel if it vibrates', 'Check amp draw with clamp meter', 'Listen for clicking sounds', 'Check thermostat only'], correctAnswer: 'Check amp draw with clamp meter', points: 10, rubric: 'Proper diagnostic tools usage' },
      { question: 'Water leakage in front-loading washing machine causes?', type: 'scenario', options: ['Faulty door seal', 'Clogged drain filter', 'Damaged drain hose', 'All of the above'], correctAnswer: 'All of the above', points: 10, rubric: 'Leak diagnosis' },
      { question: 'Correct refrigerant for modern split AC?', type: 'theoretical', options: ['R22', 'R410A', 'R134a', 'R600a'], correctAnswer: 'R410A', points: 10, rubric: 'Refrigerant knowledge' },
      { question: 'Electric water heater trips MCB. What to check?', type: 'scenario', options: ['Heating element for short to ground', 'Thermostat', 'Wiring', 'All of the above'], correctAnswer: 'All of the above', points: 15, rubric: 'Safety-conscious diagnosis' },
      { question: 'How to test a microwave magnetron?', type: 'practical', options: ['Visual inspection only', 'Check resistance across terminals and continuity to ground', 'Use clamp meter', 'Listen for unusual sounds'], correctAnswer: 'Check resistance across terminals and continuity to ground', points: 10, rubric: 'Component testing skills' },
      { question: 'Normal amperage draw of a 1.5 ton split AC?', type: 'theoretical', options: ['2-3 amps', '5-7 amps', '10-15 amps', '20-25 amps'], correctAnswer: '5-7 amps', points: 10, rubric: 'Performance benchmarks' },
      { question: 'Ceiling fan runs slow. Possible causes?', type: 'scenario', options: ['Weak capacitor', 'Worn bearings', 'Voltage issue', 'All of the above'], correctAnswer: 'All of the above', points: 10, rubric: 'Common issue identification' }
    ]
  },
  cleaning: {
    title: 'Cleaning Service Skill Assessment',
    questions: [
      { question: 'Correct order for cleaning a house?', type: 'theoretical', options: ['Top to bottom, dry to wet', 'Bottom to top, wet to dry', 'Room by room randomly', 'Floors first then everything else'], correctAnswer: 'Top to bottom, dry to wet', points: 10, rubric: 'Cleaning methodology' },
      { question: 'Remove hard water stains from bathroom tiles?', type: 'scenario', options: ['Use vinegar or lemon solution', 'Use only commercial cleaners', 'Scrub with steel wool', 'Just use more soap'], correctAnswer: 'Use vinegar or lemon solution', points: 10, rubric: 'Stain removal knowledge' },
      { question: 'Recommended disinfectant concentration for kitchen surfaces?', type: 'theoretical', options: ['1% bleach solution', '5% bleach solution', '10% bleach solution', '25% bleach solution'], correctAnswer: '5% bleach solution', points: 10, rubric: 'Safety and effectiveness balance' },
      { question: 'Clean stainless steel without streaking?', type: 'practical', options: ['Use newspaper and glass cleaner', 'Use microfiber cloth with olive oil', 'Use only water', 'Use baking soda paste'], correctAnswer: 'Use microfiber cloth with olive oil', points: 10, rubric: 'Specialized surface cleaning' },
      { question: 'PPE for professional cleaner using chemicals?', type: 'theoretical', options: ['None needed', 'Gloves only', 'Gloves, mask, and eye protection', 'Just an apron'], correctAnswer: 'Gloves, mask, and eye protection', points: 10, rubric: 'Safety protocols' },
      { question: 'Client has marble floor. What to avoid?', type: 'scenario', options: ['pH-neutral cleaner', 'Vinegar or any acidic cleaner', 'Warm water', 'Marble-specific cleaner'], correctAnswer: 'Vinegar or any acidic cleaner', points: 15, rubric: 'Surface-specific knowledge' },
      { question: 'Recommended frequency for deep cleaning kitchen?', type: 'theoretical', options: ['Weekly', 'Monthly', 'Quarterly', 'Annually'], correctAnswer: 'Monthly', points: 5, rubric: 'Service recommendation' },
      { question: 'Remove grease from kitchen exhaust filters?', type: 'practical', options: ['Soak in hot water and degreaser', 'Scrub with dry cloth', 'Replace every time', 'Spray with air freshener'], correctAnswer: 'Soak in hot water and degreaser', points: 10, rubric: 'Deep cleaning techniques' },
      { question: 'Proper way to clean glass windows?', type: 'scenario', options: ['Clean in circular motions', 'Clean in S-pattern with squeegee', 'Clean top to bottom in straight lines', 'Spray and leave to air dry'], correctAnswer: 'Clean in S-pattern with squeegee', points: 10, rubric: 'Professional technique' },
      { question: 'How to handle biohazard waste during cleaning?', type: 'theoretical', options: ['Put in regular trash', 'Use labeled biohazard bags and follow disposal protocol', 'Burn it on site', 'Flush it down the drain'], correctAnswer: 'Use labeled biohazard bags and follow disposal protocol', points: 15, rubric: 'Hazardous waste handling' }
    ]
  },
  mechanic: {
    title: 'Mechanic Skill Assessment',
    questions: [
      { question: 'Engine oil change interval for Indian conditions?', type: 'theoretical', options: ['3000 km', '5000 km', '7500-10000 km', '20000 km'], correctAnswer: '5000 km', points: 10, rubric: 'Maintenance knowledge' },
      { question: 'Car engine overheating. Possible causes?', type: 'scenario', options: ['Low coolant level', 'Faulty thermostat', 'Radiator blockage', 'All of the above'], correctAnswer: 'All of the above', points: 10, rubric: 'Diagnostic approach' },
      { question: 'How to check brake pad thickness?', type: 'practical', options: ['Visual inspection through wheel spokes', 'Remove wheel and measure', 'Listen for squealing only', 'Check brake fluid level'], correctAnswer: 'Remove wheel and measure', points: 10, rubric: 'Proper inspection method' },
      { question: 'Correct tyre pressure for standard hatchback?', type: 'theoretical', options: ['20 PSI', '28-32 PSI', '40 PSI', '50 PSI'], correctAnswer: '28-32 PSI', points: 10, rubric: 'Basic maintenance knowledge' },
      { question: 'Car pulls to one side while braking. What to check?', type: 'scenario', options: ['Uneven brake pad wear', 'Stuck caliper', 'Wheel alignment issue', 'All of the above'], correctAnswer: 'All of the above', points: 15, rubric: 'Comprehensive diagnosis' },
      { question: 'What does a check engine light indicate?', type: 'theoretical', options: ['Low engine oil', 'Engine needs servicing', 'ECU has detected a fault', 'Battery is low'], correctAnswer: 'ECU has detected a fault', points: 10, rubric: 'OBD knowledge' },
      { question: 'How to diagnose a weak car battery?', type: 'practical', options: ['Use a multimeter', 'Check headlights brightness', 'Try self-starting', 'All methods can indicate battery health'], correctAnswer: 'All methods can indicate battery health', points: 10, rubric: 'Diagnostic skills' },
      { question: 'Purpose of a serpentine belt?', type: 'theoretical', options: ['Timing the engine', 'Driving accessories like AC and alternator', 'Connecting exhaust', 'Holding the battery'], correctAnswer: 'Driving accessories like AC and alternator', points: 10, rubric: 'Component knowledge' },
      { question: 'Vehicle makes grinding noise when shifting. What to check?', type: 'scenario', options: ['Clutch plate wear', 'Gear oil level', 'Synchronizer rings', 'All of the above'], correctAnswer: 'All of the above', points: 15, rubric: 'Transmission troubleshooting' },
      { question: 'How often should brake fluid be replaced?', type: 'theoretical', options: ['Every oil change', 'Every 2 years or 40000 km', 'Never', 'Every 5 years'], correctAnswer: 'Every 2 years or 40000 km', points: 10, rubric: 'Maintenance schedule knowledge' }
    ]
  },
  tutor: {
    title: 'Tutor Skill Assessment',
    questions: [
      { question: 'Most effective teaching method for mathematics?', type: 'theoretical', options: ['Lecture only', 'Problem-based learning with practice', 'Visual learning only', 'Memorization'], correctAnswer: 'Problem-based learning with practice', points: 10, rubric: 'Pedagogical knowledge' },
      { question: 'Student struggling with algebra. How to approach?', type: 'scenario', options: ['Give more problems to solve', 'Go back to basics and use real-life examples', 'Tell them to memorize formulas', 'Skip to next topic'], correctAnswer: 'Go back to basics and use real-life examples', points: 15, rubric: 'Student assessment and adaptation' },
      { question: 'Ideal student-to-teacher ratio for effective tutoring?', type: 'theoretical', options: ['1:1 only', '1:3 to 1:5', '1:10 to 1:15', '1:30'], correctAnswer: '1:3 to 1:5', points: 10, rubric: 'Class management knowledge' },
      { question: 'How to handle a student not paying attention?', type: 'scenario', options: ['Scold them publicly', 'Change teaching approach and engage them interactively', 'Ignore them', 'Ask them to leave'], correctAnswer: 'Change teaching approach and engage them interactively', points: 15, rubric: 'Classroom management' },
      { question: 'Assessment method that best evaluates critical thinking?', type: 'theoretical', options: ['Multiple choice tests', 'Problem-solving assignments', 'Oral recitation', 'Attendance records'], correctAnswer: 'Problem-solving assignments', points: 10, rubric: 'Assessment knowledge' },
      { question: 'How to prepare students for competitive exams like JEE?', type: 'scenario', options: ['Only solve previous year papers', 'Conceptual learning + practice + mock tests', 'Just cover the syllabus', 'Focus on easy topics only'], correctAnswer: 'Conceptual learning + practice + mock tests', points: 15, rubric: 'Exam preparation strategy' },
      { question: 'Best way to explain complex science concepts?', type: 'theoretical', options: ['Use textbook language only', 'Use analogies and real-world examples', 'Read directly from the book', 'Ask students to memorize'], correctAnswer: 'Use analogies and real-world examples', points: 10, rubric: 'Communication skills' },
      { question: 'How to track student progress over time?', type: 'practical', options: ['Just use test scores', 'Maintain progress records with regular assessments', 'Ask parents', 'Compare with other students'], correctAnswer: 'Maintain progress records with regular assessments', points: 10, rubric: 'Progress tracking methodology' },
      { question: 'Parent complains child is not improving. How to respond?', type: 'scenario', options: ['Blame the student', 'Review the teaching approach, share progress data, and create improvement plan', 'Suggest changing tutors', 'Ignore the complaint'], correctAnswer: 'Review the teaching approach, share progress data, and create improvement plan', points: 15, rubric: 'Professional communication' },
      { question: 'Importance of homework in learning?', type: 'theoretical', options: ['It is punishment', 'It reinforces learning and builds study habits', 'It is not important', 'It is only for extra marks'], correctAnswer: 'It reinforces learning and builds study habits', points: 5, rubric: 'Educational philosophy' }
    ]
  },
  graphicDesigner: {
    title: 'Graphic Designer Skill Assessment',
    questions: [
      { question: 'Standard resolution for print materials?', type: 'theoretical', options: ['72 DPI', '150 DPI', '300 DPI', '600 DPI'], correctAnswer: '300 DPI', points: 10, rubric: 'Print design knowledge' },
      { question: 'Color model used for web design?', type: 'theoretical', options: ['CMYK', 'RGB', 'Pantone', 'HSB'], correctAnswer: 'RGB', points: 10, rubric: 'Color theory' },
      { question: 'Logo needed for print and digital. Best format?', type: 'scenario', options: ['JPG only', 'PNG only', 'Vector (AI/EPS/SVG) + raster versions', 'PDF only'], correctAnswer: 'Vector (AI/EPS/SVG) + raster versions', points: 15, rubric: 'File format knowledge' },
      { question: 'What is the golden ratio in design?', type: 'theoretical', options: ['1:1.414', '1:1.618', '1:2', '1:3'], correctAnswer: '1:1.618', points: 10, rubric: 'Design principles' },
      { question: 'How to ensure accessibility in design?', type: 'scenario', options: ['Use large fonts only', 'High contrast, alt text, readable fonts', 'Use bright colors', 'No special considerations needed'], correctAnswer: 'High contrast, alt text, readable fonts', points: 15, rubric: 'Accessibility knowledge' },
      { question: 'Difference between vector and raster graphics?', type: 'theoretical', options: ['No difference', 'Vector uses paths, raster uses pixels', 'Raster is better quality', 'Vector is only for logos'], correctAnswer: 'Vector uses paths, raster uses pixels', points: 10, rubric: 'Technical knowledge' },
      { question: 'Best file format for web graphics with transparency?', type: 'theoretical', options: ['JPG', 'BMP', 'PNG', 'TIFF'], correctAnswer: 'PNG', points: 5, rubric: 'Format knowledge' },
      { question: 'How to handle client feedback during design revision?', type: 'scenario', options: ['Ignore it and present your design', 'Listen, clarify requirements, and iterate', 'Argue with the client', 'Do exactly what they say without thinking'], correctAnswer: 'Listen, clarify requirements, and iterate', points: 15, rubric: 'Client management' },
      { question: 'What is typography hierarchy?', type: 'theoretical', options: ['Using different fonts', 'Organizing text by importance using size, weight, and style', 'Making all text the same size', 'Using only one font'], correctAnswer: 'Organizing text by importance using size, weight, and style', points: 10, rubric: 'Typography knowledge' },
      { question: 'Purpose of white space in design?', type: 'theoretical', options: ['It is wasted space', 'It improves readability and visual hierarchy', 'It saves printing costs', 'It is only for minimalism'], correctAnswer: 'It improves readability and visual hierarchy', points: 10, rubric: 'Design principles' }
    ]
  },
  webDeveloper: {
    title: 'Web Developer Skill Assessment',
    questions: [
      { question: 'What does HTML stand for?', type: 'theoretical', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks Text Mark Language'], correctAnswer: 'Hyper Text Markup Language', points: 5, rubric: 'Basic knowledge' },
      { question: 'What is the box model in CSS?', type: 'theoretical', options: ['Content + Padding + Border + Margin', 'Width + Height', 'Display + Position', 'Font + Color'], correctAnswer: 'Content + Padding + Border + Margin', points: 10, rubric: 'CSS knowledge' },
      { question: 'Website slow on mobile. What optimizations?', type: 'scenario', options: ['Compress images, minify CSS/JS, lazy load', 'Add more JavaScript', 'Use larger images', 'Remove responsive design'], correctAnswer: 'Compress images, minify CSS/JS, lazy load', points: 15, rubric: 'Performance optimization' },
      { question: 'Difference between GET and POST methods?', type: 'theoretical', options: ['GET is faster', 'GET is for retrieving data, POST is for sending data', 'POST is insecure', 'No difference'], correctAnswer: 'GET is for retrieving data, POST is for sending data', points: 10, rubric: 'HTTP knowledge' },
      { question: 'How to make a website responsive?', type: 'practical', options: ['Fixed pixel widths', 'Media queries, flexible grids, relative units', 'Only use desktop view', 'Make everything smaller'], correctAnswer: 'Media queries, flexible grids, relative units', points: 15, rubric: 'Responsive design skills' },
      { question: 'What is the purpose of CORS?', type: 'theoretical', options: ['Styling websites', 'Allowing cross-origin requests securely', 'Database connections', 'File uploads'], correctAnswer: 'Allowing cross-origin requests securely', points: 10, rubric: 'Security knowledge' },
      { question: 'Best framework for real-time chat app?', type: 'scenario', options: ['React + Socket.io for real-time bidirectional communication', 'Only HTML forms', 'WordPress', 'Static HTML only'], correctAnswer: 'React + Socket.io for real-time bidirectional communication', points: 15, rubric: 'Technology selection' },
      { question: 'What is semantic HTML?', type: 'theoretical', options: ['Using div for everything', 'Using HTML tags that describe their meaning', 'Writing HTML with CSS', 'Using inline styles'], correctAnswer: 'Using HTML tags that describe their meaning', points: 10, rubric: 'Best practices' },
      { question: 'How to ensure website security?', type: 'scenario', options: ['Use HTTPS, input validation, XSS prevention, CSRF tokens', 'No security needed', 'Just use a password', 'Use HTTP only'], correctAnswer: 'Use HTTPS, input validation, XSS prevention, CSRF tokens', points: 15, rubric: 'Security best practices' },
      { question: 'Purpose of Git in web development?', type: 'theoretical', options: ['Designing websites', 'Version control and collaboration', 'Database management', 'File hosting'], correctAnswer: 'Version control and collaboration', points: 5, rubric: 'Tool knowledge' }
    ]
  },
  photographer: {
    title: 'Photographer Skill Assessment',
    questions: [
      { question: 'What is the exposure triangle?', type: 'theoretical', options: ['Aperture, Shutter Speed, ISO', 'Focus, Zoom, Flash', 'Light, Shadow, Contrast', 'Color, Tone, Saturation'], correctAnswer: 'Aperture, Shutter Speed, ISO', points: 10, rubric: 'Fundamental photography knowledge' },
      { question: 'Client wants blurred backgrounds in portraits. Settings?', type: 'scenario', options: ['Wide aperture (f/1.8-f/2.8), telephoto lens', 'Narrow aperture (f/16)', 'Wide angle lens', 'Flash photography'], correctAnswer: 'Wide aperture (f/1.8-f/2.8), telephoto lens', points: 15, rubric: 'Depth of field control' },
      { question: 'What is the rule of thirds?', type: 'theoretical', options: ['Dividing frame into 9 equal parts for balanced composition', 'Taking three photos', 'Using three lenses', 'Three second exposure'], correctAnswer: 'Dividing frame into 9 equal parts for balanced composition', points: 10, rubric: 'Composition knowledge' },
      { question: 'Best time for outdoor photography?', type: 'theoretical', options: ['Noon with direct sun', 'Golden hour (early morning/late afternoon)', 'Night only', 'Any time is the same'], correctAnswer: 'Golden hour (early morning/late afternoon)', points: 10, rubric: 'Lighting knowledge' },
      { question: 'Client photos are blurry. Possible causes?', type: 'scenario', options: ['Camera shake, slow shutter speed, missed focus', 'Wrong file format', 'Bad lighting', 'Wrong memory card'], correctAnswer: 'Camera shake, slow shutter speed, missed focus', points: 15, rubric: 'Troubleshooting skills' },
      { question: 'What is white balance?', type: 'theoretical', options: ['Brightness adjustment', 'Color temperature correction for accurate colors', 'Contrast setting', 'Sharpness control'], correctAnswer: 'Color temperature correction for accurate colors', points: 10, rubric: 'Technical knowledge' },
      { question: 'Best file format for professional photography?', type: 'theoretical', options: ['JPEG', 'RAW', 'BMP', 'GIF'], correctAnswer: 'RAW', points: 5, rubric: 'File format knowledge' },
      { question: 'How to photograph a dark indoor event?', type: 'scenario', options: ['Use flash only', 'Increase ISO, use wide aperture, steady hands or tripod', 'Use a timer', 'Take many photos'], correctAnswer: 'Increase ISO, use wide aperture, steady hands or tripod', points: 15, rubric: 'Low-light technique' },
      { question: 'What is depth of field?', type: 'theoretical', options: ['Distance between camera and subject', 'Zone of acceptable sharpness in an image', 'Camera height', 'Lens focal length'], correctAnswer: 'Zone of acceptable sharpness in an image', points: 10, rubric: 'Technical knowledge' },
      { question: 'How to price wedding photography packages?', type: 'scenario', options: ['Copy competitor prices', 'Calculate costs, time, experience, and value delivered', 'Charge minimum possible', 'Ask the client to decide'], correctAnswer: 'Calculate costs, time, experience, and value delivered', points: 10, rubric: 'Business knowledge' }
    ]
  }
};

router.get('/categories', (req, res) => {
  const categories = Object.keys(assessmentTemplates).map(key => ({
    category: key,
    title: assessmentTemplates[key].title,
    questionCount: assessmentTemplates[key].questions.length,
    totalPoints: assessmentTemplates[key].questions.reduce((sum, q) => sum + q.points, 0)
  }));
  res.json({ success: true, categories });
});

router.post('/start', protect, roleCheck('worker'), async (req, res, next) => {
  try {
    const { serviceCategory } = req.body;

    if (!serviceCategory || !assessmentTemplates[serviceCategory]) {
      return res.status(400).json({ success: false, message: 'Invalid service category' });
    }

    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    const template = assessmentTemplates[serviceCategory];
    const maxScore = template.questions.reduce((sum, q) => sum + q.points, 0);

    const assessment = await SkillAssessment.create({
      worker: worker._id,
      serviceCategory,
      assessmentTitle: template.title,
      questions: template.questions.map(q => ({
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
        rubric: q.rubric
      })),
      maxScore,
      attemptedAt: new Date()
    });

    const safeQuestions = assessment.questions.map(q => ({
      question: q.question,
      type: q.type,
      options: q.options,
      points: q.points
    }));

    res.status(201).json({
      success: true,
      assessment: {
        id: assessment._id,
        title: assessment.assessmentTitle,
        category: assessment.serviceCategory,
        questions: safeQuestions,
        maxScore: assessment.maxScore,
        attemptedAt: assessment.attemptedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/submit', protect, roleCheck('worker'), async (req, res, next) => {
  try {
    const { answers, timeSpent } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Please provide answers array' });
    }

    const assessment = await SkillAssessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker || assessment.worker.toString() !== worker._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (assessment.completedAt) {
      return res.status(400).json({ success: false, message: 'Assessment already submitted' });
    }

    let score = 0;
    assessment.questions.forEach((q, index) => {
      const answer = answers.find(a => a.questionIndex === index);
      if (answer && answer.answer === q.correctAnswer) {
        score += q.points;
      }
    });

    assessment.score = score;
    assessment.percentage = Math.round((score / assessment.maxScore) * 100);
    assessment.passed = assessment.percentage >= 60;
    assessment.completedAt = new Date();
    assessment.timeSpent = timeSpent || 0;

    if (assessment.percentage >= 88) assessment.level = 'master';
    else if (assessment.percentage >= 75) assessment.level = 'expert';
    else if (assessment.percentage >= 55) assessment.level = 'skilled';
    else assessment.level = 'basic';

    await assessment.save();

    const levelPoints = { basic: 0, skilled: 55, expert: 75, master: 88 };
    worker.skillScore.practicalTest = Math.max(worker.skillScore.practicalTest, assessment.percentage);
    worker.calculateSkillScore();
    await worker.save();

    await Notification.create({
      user: req.user._id,
      title: 'Assessment Completed',
      message: `You scored ${assessment.percentage}% in ${assessment.assessmentTitle}. Level: ${assessment.level}`,
      type: 'assessment',
      referenceId: assessment._id,
      referenceModel: 'SkillAssessment'
    });

    res.json({
      success: true,
      result: {
        score: assessment.score,
        maxScore: assessment.maxScore,
        percentage: assessment.percentage,
        passed: assessment.passed,
        level: assessment.level,
        timeSpent: assessment.timeSpent,
        newSkillScore: worker.skillScore.overall,
        newSkillLevel: worker.skillLevel
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/worker/:workerId', protect, async (req, res, next) => {
  try {
    const assessments = await SkillAssessment.find({
      worker: req.params.workerId,
      completedAt: { $exists: true }
    })
      .sort({ completedAt: -1 })
      .select('-questions.correctAnswer');

    const bestScores = {};
    assessments.forEach(a => {
      if (!bestScores[a.serviceCategory] || a.percentage > bestScores[a.serviceCategory].percentage) {
        bestScores[a.serviceCategory] = {
          percentage: a.percentage,
          level: a.level,
          completedAt: a.completedAt
        };
      }
    });

    res.json({
      success: true,
      count: assessments.length,
      assessments: assessments.map(a => ({
        id: a._id,
        title: a.assessmentTitle,
        category: a.serviceCategory,
        score: a.score,
        maxScore: a.maxScore,
        percentage: a.percentage,
        passed: a.passed,
        level: a.level,
        timeSpent: a.timeSpent,
        attemptedAt: a.attemptedAt,
        completedAt: a.completedAt
      })),
      bestScores
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const assessment = await SkillAssessment.findById(req.params.id)
      .select('-questions.correctAnswer')
      .populate({ path: 'worker', populate: { path: 'user', select: 'name avatar' } });

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    res.json({ success: true, assessment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
